import sqlite3 from 'sqlite3';
import path from 'node:path';
import { app } from 'electron';
import * as fs from 'fs';
sqlite3.verbose()

let dbPath = path.join(app.getAppPath(), 'database.db');
if (app.isPackaged) {
    dbPath = path.join(app.getPath('exe'), 'database.db');
}


const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error connecting to SQL:', err.message);
    } else {
      console.log('Connected to SQLite database sucessfully');
    }
  });

// db.run(
//   `
//   DROP TABLE IF EXISTS Projects; 
//   `
// )
// db.run(
//     `
//     DROP TABLE IF EXISTS Tasks; 
//     `
//   )

db.run(`
CREATE TABLE IF NOT EXISTS Projects (
    projectId INTEGER PRIMARY KEY, -- 假定使用整数主键, SQLite自动递增
    name TEXT NOT NULL,          -- 项目名称, 不能为空
    description TEXT,             -- 项目描述
    status TEXT CHECK(status IN ('未开始', '进行中', '已结束', '暂停', '失败')), -- 项目状态, 限定可选值
    priority TEXT CHECK(priority IN ('P0', 'P1', 'P2')),   -- 项目优先级, 限定可选值
    startDate INTEGER,               -- 项目开始时间, 这里使用TEXT存储日期字符串, 实际生产中可能需要更精确的日期时间处理
    endDate INTEGER,                  -- 项目结束时间, 同上
    createdAt INTEGER -- 创建时间, 默认为当前时间
)
`, (err) => {
    if (err) {
        console.error('Error occured when creating Projects:', err.message);
    } else {
        console.log('create Projects table sucessfully');
    }
});

// db.run(
//   `
//   INSERT INTO Projects (name, description, status, priority) VALUES ('用于测试名称长度的项目2', '这是一个非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常长的描述', '未开始', 'P0')
//   `
// )

// 创建Tasks表
db.run(`
CREATE TABLE IF NOT EXISTS Tasks (
    taskId INTEGER PRIMARY KEY,     -- 假定使用整数主键, SQLite自动递增
    name TEXT NOT NULL,              -- 任务名称, 不能为空
    description TEXT,                -- 任务描述
    projectId INTEGER,               -- 所属项目ID, 外键约束需手动添加或在应用层处理
    status TEXT CHECK(status IN ('未开始', '进行中', '已结束', '暂停', '失败')), -- 项目状态, 限定可选值
    priority TEXT CHECK(priority IN ('P0', 'P1', 'P2')),   -- 任务优先级, 限定可选值
    startDate INTEGER,               -- 任务开始时间, 这里使用TIMESTAMP存储日期字符串
    endDate INTEGER,                  -- 任务结束时间, 同上
    createdAt INTEGER               -- 创建时间, 默认为当前时间
)
`, (err) => {
    if (err) {
        console.error('Error occured when creating Tasks:', err.message);
    } else {
        console.log('create Tasks table sucessfully');
    }
});

// 创建masterPasswords表
db.run(`
    CREATE TABLE IF NOT EXISTS masterPasswords (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hashedPassword TEXT NOT NULL
    )
    `, (err) => {
        if (err) {
            console.error('Error occured when creating masterPasswords:', err.message);
        } else {
            console.log('create masterPasswords table sucessfully');
        }
    });


// 创建Passwords表
db.run(`
    CREATE TABLE IF NOT EXISTS Passwords (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        app TEXT NOT NULL,
        username TEXT NOT NULL,
        password TEXT NOT NULL
    )
    `, (err) => {
        if (err) {
            console.error('Error occured when creating Passwords:', err.message);
        } else {
            console.log('create Passwords table sucessfully');
        }
    });

// db.run(
//   `
//   INSERT INTO Passwords (app, username, password) VALUES ('A', 'B', 'C')
//   `
// )

export default db;
