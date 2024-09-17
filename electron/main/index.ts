import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import db from './database'
import { hashPassword, verifyPassword, encryptPassword, decryptPassword } from './accounts'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    title: 'Main window',
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    width: 1280,
    height: 720,
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) { // #298
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  // win.webContents.on('will-navigate', (event, url) => { }) #344

}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

ipcMain.handle('get-table', async (_, sql) => {
  try {
    // 使用 promise 化的 db.all 方法，或者手动将回调转换为 promise
    const result = await new Promise((resolve, reject) => {
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err); // 当有错误时，reject 错误对象
        } else {
          resolve({
            success: true,
            data: rows
          }); // 成功时，resolve 结果
        }
      });
    });
    return result;
  } catch (error) {
    console.error(error.message);
    return { 
      success: false,   // 返回 success: false
      error: error.message 
    }; // 返回给调用方的错误信息
  }
})

ipcMain.handle('run-table', async (_, sql, params) => {
  try {
    const response = await new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) {
          return reject(err.message); // 返回错误信息
        }

        // 根据SQL操作类型返回不同的信息，并且添加 success: true
        resolve({
          success: true,
          lastID: this.lastID,  // 对于INSERT操作
          changes: this.changes // 对于UPDATE/DELETE操作
        });
      });
    });

    return response; // 返回成功结果，包括 success: true
  } catch (error) {
    console.error("Error running SQL:", error);
    return { 
      success: false,   // 返回 success: false
      error: error.message 
    }; // 返回给调用方的错误信息
  }
});



ipcMain.handle('set-master-pwd', async (event, pwd) => {
  try {
    // 使用 bcrypt 对密码进行加密
    const finalEncryptedPassword = await hashPassword(pwd)

    // 将加密后的密码插入到数据库中，并返回一个 Promise 以处理异步逻辑
    const insertPassword = new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO masterPasswords (hashedPassword) VALUES (?)`,
        [finalEncryptedPassword],
        function (err) {
          if (err) {
            reject(err); // 插入失败，返回错误
          } else {
            resolve(this.lastID); // 插入成功，返回最后插入行的 ID
          }
        }
      );
    });

    // 等待插入操作完成
    const lastId = await insertPassword;

    // 处理成功后可以返回一些反馈
    return { success: true, lastId };
  } catch (error) {
    console.error('密码设置过程中发生错误:', error);
    return { success: false, error: error.message }; // 返回错误信息
  }
});

ipcMain.handle('check-master-pwd', async (_, pwd) => {
  try {
    const getPassword = new Promise((resolve, reject) => {
      db.get(`SELECT hashedPassword FROM masterPasswords ORDER BY id DESC LIMIT 1`, [], (err, row:any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row.hashedPassword : null);
        }
      });
    });

    const storedHashedPassword = await getPassword;

    if (!storedHashedPassword) {
      return { success: false, error: '主密码未设置' };
    }

    // 使用 verifyPassword 函数来验证输入的密码
    const isMatch = await verifyPassword(pwd, storedHashedPassword);

    if (isMatch) {
      return { success: true }; // 密码匹配
    } else {
      return { success: false, error: '密码错误' }; // 密码不匹配
    }
  } catch (error) {
    console.error('校验密码时发生错误:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-master-pwd', async (_, pwd) => {
  try {
    // 使用 bcrypt 对密码进行加密
    const finalEncryptedPassword = await hashPassword(pwd)

    // 将加密后的密码插入到数据库中，并返回一个 Promise 以处理异步逻辑
    const updatePassword = new Promise((resolve, reject) => {
      db.run(
        `UPDATE masterPasswords SET hashedPassword = '${finalEncryptedPassword}' WHERE ID = 1`,
        [],
        function (err) {
          if (err) {
            reject(err); // 插入失败，返回错误
          } else {
            resolve(this.lastID); // 插入成功，返回最后插入行的 ID
          }
        }
      );
    });

    // 等待插入操作完成
    const lastId = await updatePassword;

    // 处理成功后可以返回一些反馈
    return { success: true, lastId };
  } catch (error) {
    console.error('密码更新过程中发生错误:', error);
    return { success: false, error: error.message }; // 返回错误信息
  }
});

ipcMain.handle('get-acc', async (event, secretKey) => {
  try {
    // 使用 promise 化的 db.all 方法，或者手动将回调转换为 promise
    const result = await new Promise((resolve, reject) => {
      db.all(`SELECT * FROM Passwords`, [], (err, rows) => {
        if (err) {
          reject(err); // 当有错误时，reject 错误对象
        } else {
          if (rows) {
            (rows as Array<any>).forEach(row => {
              row.password = decryptPassword(row.password, secretKey)
            })
          }
          resolve({
            success: true,
            data: rows
          }); // 成功时，resolve 结果
        }
      });
    });
    return result;
  } catch (error) {
    console.error(error.message);
    return { 
      success: false,   // 返回 success: false
      error: error.message 
    }; // 返回给调用方的错误信息
  }
})

ipcMain.handle('set-acc', async (event, acc, secretKey) => {
  try {
    // 使用 bcrypt 对密码进行加密
    const finalEncryptedPassword = encryptPassword(acc.password, secretKey)

    // 将加密后的密码插入到数据库中，并返回一个 Promise 以处理异步逻辑
    const insertPassword = new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO Passwords (app, username, password) VALUES (?,?,?)`,
        [acc.app, acc.username, finalEncryptedPassword],
        function (err) {
          if (err) {
            reject(err); // 插入失败，返回错误
          } else {
            resolve(this.lastID); // 插入成功，返回最后插入行的 ID
          }
        }
      );
    });

    // 等待插入操作完成
    const lastId = await insertPassword;

    // 处理成功后可以返回一些反馈
    return { success: true, lastId };
  } catch (error) {
    console.error('账号设置过程中发生错误:', error);
    return { success: false, error: error.message }; // 返回错误信息
  }
});

ipcMain.handle('update-acc', async (_, acc, secretKey) => {
  try {
    // 使用 bcrypt 对密码进行加密
    const finalEncryptedPassword = await encryptPassword(acc.password, secretKey)

    // 将加密后的密码插入到数据库中，并返回一个 Promise 以处理异步逻辑
    const updatePassword = new Promise((resolve, reject) => {
      db.run(
        `UPDATE Passwords SET username = '${acc.username}', password = '${finalEncryptedPassword}' WHERE app = '${acc.app}'`,
        [],
        function (err) {
          if (err) {
            reject(err); // 插入失败，返回错误
          } else {
            resolve(this.lastID); // 插入成功，返回最后插入行的 ID
          }
        }
      );
    });

    // 等待插入操作完成
    const lastId = await updatePassword;

    // 处理成功后可以返回一些反馈
    return { success: true, lastId };
  } catch (error) {
    console.error('账号更新过程中发生错误:', error);
    return { success: false, error: error.message }; // 返回错误信息
  }
});

ipcMain.handle('delete-acc', async (_, app) => {
  try {
    const deleteAccount = new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM Passwords WHERE app = '${app}'`,
        [],
        function (err) {
          if (err) {
            reject(err); // 插入失败，返回错误
          } else {
            resolve(this.changes); // 插入成功，返回最后插入行的 ID
          }
        }
      );
    });

    // 等待插入操作完成
    const changes = await deleteAccount;

    // 处理成功后可以返回一些反馈
    return { success: true, changes };
  } catch (error) {
    console.error('账号删除过程中发生错误:', error);
    return { success: false, error: error.message }; // 返回错误信息
  }
})