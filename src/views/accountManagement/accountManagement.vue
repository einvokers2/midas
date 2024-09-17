<template>
    <div class="account-container">
        <div class="account-header">
            <div class="account-header-title">
                <span style="font-size: 28px;line-height: 40px;color: #32324D; font-weight: 300;">账号管理</span>
                <span style="font-size: 14px;line-height: 24px;color: #666687;">{{ pwdNum }}个密码</span>
            </div>
            <div class="delete-button">
                <el-button type="danger" :icon="Delete" v-if="masterPasswordsExist === true" @click="deleteDialogVisible=true">删除密码库</el-button>
            </div>
        </div>
        <div class="account-main">
            <el-card shadow="hover" body-class="account-content">
                <template #default>
                    <div class="account-master">
                        <span style="width: 100px;">主密码</span>
                        <el-input type="password" placeholder="请输入主密码" v-model="masterPwd" show-password></el-input>
                        <el-button @click="handleSubmit">{{ masterPasswordsExist ? "提交" : "设置" }}</el-button>
                        <el-button v-if="masterPasswordsExist === true" @click="modifyDialogVisible=true">修改</el-button>
                    </div>
                    <p class="notes">说明:</p>
                    <p class="notes">1. 首次使用需设置主密码</p>
                    <p class="notes">2. 用户只需要记忆一个主密码就可以查看其它所有密码</p>
                    <p class="notes">3. 所有密码本地数据库加密保存</p>
                    <p class="notes">4. 切勿忘记主密码！否则只能删库了</p>
                </template>
            </el-card>
            
        </div>

        <el-dialog v-model="deleteDialogVisible" title="删除密码库" width="500" align-center>
            <span>确认要删除此密码库吗？此操作不可逆！</span>
            <template #footer>
            <div class="dialog-footer">
                <el-button @click="deleteDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleDelete">确定</el-button>
            </div>
            </template>
        </el-dialog>
        <el-dialog v-model="modifyDialogVisible" title="修改主密码" width="500" align-center>
            <el-form :model="modifyForm" label-position="right" label-width="auto">
                <el-form-item label="原密码">
                    <el-input v-model="modifyForm.oldPwd" type="password" show-password/>
                </el-form-item>
                <el-form-item label="新密码">
                    <el-input v-model="modifyForm.newPwd" type="password" show-password/>
                </el-form-item>
                <el-form-item label="确认密码">
                    <el-input v-model="modifyForm.newPwd2" type="password" show-password/>
                </el-form-item>
                <el-form-item>
                    <el-button @click="modifyDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleModify()">确认修改</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, reactive } from 'vue'
import {
    Delete
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

const masterPasswordsExist = ref(false)
const deleteDialogVisible = ref(false)
const modifyDialogVisible = ref(false)
const pwdNum = ref(0)

const masterPwd = ref('')
interface modifyFormInstance {
    oldPwd: string,
    newPwd: string, 
    newPwd2: string
}
const modifyForm = reactive<modifyFormInstance>({oldPwd: '', newPwd: '', newPwd2: ''})
// const modifyFormRules = reactive<FormRules<modifyFormInstance>>({
//     oldPwd: [{required: true, message: '请输入原密码', trigger: 'blur'}],
//     newPwd: [{required: true, message: '请输入新密码', trigger: 'blur'}, {min: 6, message: '请至少输入6个字符', trigger: 'blur'}],
//     newPwd2: [{required: true, message: '请输入确认密码', trigger: 'blur'}, {min: 6, message: '请至少输入6个字符', trigger: 'blur'}]
// })

onBeforeMount(
    async () => {
        await window.ipcRenderer.invoke('get-table', `SELECT count(*) FROM masterPasswords`).then(
            (result) => {
                if (result.success) {
                    if (result.data[0]["count(*)"] === 0) {
                        masterPasswordsExist.value = false
                    } else {
                        masterPasswordsExist.value = true
                    }
                } else {
                    console.log(result.error)
                    ElMessage.error({
                        message: '加载密码失败',
                        duration: 2500,
                    })
                }
                
            }
        )
        const response =  await window.ipcRenderer.invoke('get-table', `SELECT count(*) FROM Passwords`)
        if (response.success) {
            pwdNum.value = response.data[0]['count(*)']
        } else {
            console.log(response.error)
            ElMessage.error({
                message: '读取密码数量失败',
                duration: 2500,
            })
        }
           
    }
)


const handleSubmit = async () => {
    if (masterPasswordsExist.value) {
        const response = await window.ipcRenderer.invoke('check-master-pwd', masterPwd.value);

        if (response.success) {
            router.push({ name: 'accountsList' });
        } else {
            console.log(response.error)
            ElMessage.error({
                message: '密码错误',
                duration: 2500,
            })
        }
    } else {
        if (masterPwd.value.length < 6) {
            ElMessage.error({
                message: '密码过短',
                duration: 2500,
            })
            return
        }
        try {
            // 使用 ipcRenderer.invoke 来发送请求并等待响应
            const response = await window.ipcRenderer.invoke('set-master-pwd', masterPwd.value);

            if (response.success) {
                // 密码成功插入，处理成功后的逻辑
                ElMessage.success({
                    message: '设置成功',
                    type: 'success',
                    duration: 1000,
                    onClose: () => router.push({ name: 'accountsList' })
                })
            } else {
                // 处理错误，显示错误信息给用户
                console.error('设置密码失败:', response.error);
                alert('密码设置失败，请重试。');
            }
        } catch (error) {
            console.error('请求过程中发生错误:', error);
            alert(`请求过程中发生错误:\n${error}`);
    }}
}

const handleDelete = async () => {
    try {
        await window.ipcRenderer.invoke('run-table', `
            DELETE FROM Passwords
        `)
        const response = await window.ipcRenderer.invoke('run-table', `
            DELETE FROM masterPasswords
        `)
        if (response.success) {
            masterPasswordsExist.value = false
            deleteDialogVisible.value = false
            ElMessage.success({
                message: '删除成功',
                type: 'success',
                duration: 1000,
            })
        } else {
            deleteDialogVisible.value = false
            console.log(response.error)
            ElMessage.error({
                message: '删除失败',
                type: 'error',
                duration: 1000,
            })
        }
    } catch (error) {
        console.log(error)
        ElMessage.error({
            message: '请求时发生错误',
            type: 'error',
            duration: 1000,
        })
    }
}

const handleModify = async () => {
    // 校验
    if (modifyForm.newPwd.length < 6 || modifyForm.newPwd2.length < 6) {
        ElMessage.error({
            message: '密码过短',
            duration: 2500,
        })
        return
    }
    if (modifyForm.newPwd !== modifyForm.newPwd2) {
        ElMessage.error({
            message: '两次输入的密码不一致',
            duration: 2500,
        })
        return
    }
    const response = await window.ipcRenderer.invoke('check-master-pwd', modifyForm.oldPwd);
    if (response.success) {
        const updates = await window.ipcRenderer.invoke('update-master-pwd', modifyForm.newPwd)
        if (updates.success) {
            modifyDialogVisible.value = false
            ElMessage.success({
                message: '修改成功',
                type: 'success',
                duration: 1000,
            })
        } else {
            console.log(updates.error)
            ElMessage.error({
                message: '修改失败',
                duration: 2500,
            })
        }
    } else {
        ElMessage.error({
            message: '原密码错误',
            duration: 2500,
        })
    }
}

</script>

<style scoped>
.account-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    box-sizing: border-box;
    gap: 30px;
    overflow: hidden;
}
.account-header {
    display: flex;
    flex-direction: row; 
    justify-content: space-between;
}
.account-header-title {
    display: flex;
    flex-direction: column; 
}
.account-main {
    justify-content: center;
    align-items: center;
    flex: 1;
    margin-top: 15px;
    padding-bottom: 20px;
}
.el-card {
    margin: 0 auto;
    height:100%
    /* max-width: 80% */
}
.account-content {
    display: flex;
    flex-direction: column;
}
.account-master {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
}
.notes {
    font-size: 14px;
    color: #909399
}
</style>