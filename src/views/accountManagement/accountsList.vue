<template>
    <div class="accounts-container">
        <div class="search-area">
            <el-input v-model="filter" style="width: 30%;" clearable>
                <template #prefix>
                    <el-icon><Search /></el-icon>
                </template>
            </el-input>
            <el-button @click="createAccModalVisible = true">新增账号</el-button>
        </div>
        <el-scrollbar style="padding-top: 15px;">
            <el-collapse accordion class="collapse">
                <el-collapse-item v-for="account in filteredData" >
                    <template #title>
                        <div class="collapse-title">{{ account.app }}</div>
                    </template>
                    <template #default>
                        <div class="collapse-expand">
                            <div style="flex: 1; display: flex; flex-direction: row; gap: 15px;">
                                <el-input class="inputs" v-model="account.username" @blur="onAccountChange(account)" clearable>
                                    <template #prepend><el-icon style="font-size: 18px;"><User /></el-icon></template>
                                </el-input>
                                <el-input class="inputs" v-model="account.password" type="password" show-password
                                @blur="onAccountChange(account)" clearable>
                                    <template #prepend><el-icon style="font-size: 18px;"><Lock /></el-icon></template>
                                </el-input>
                            </div>
                            
                            <div style="display: flex; flex-direction: row">
                                <el-button @click="account.password = generateRandomPassword(randomPasswordLength);onAccountChange(account)">随机密码</el-button>
                                <el-popconfirm title="确定要删除该账号吗？" @confirm="deleteAccount(account.app)" confirm-button-text="确认" cancel-button-text="取消" width="200">
                                    <template #reference>
                                        <el-button style="font-size: 16px;" round><el-icon><Delete /></el-icon></el-button>
                                    </template>
                                </el-popconfirm>
                            </div>
                        </div>
                    </template>
                </el-collapse-item>
            </el-collapse>
        </el-scrollbar>

        
    </div>

    <el-dialog v-model="createAccModalVisible" title="新增账号" width="500" :before-close="cancelCreate" align-center>
        <el-form :data="createForm" label-position="right" label-width="auto">
            <el-form-item label="App">
                <el-input v-model="createForm.app" autocomplete="off" clearable/>
            </el-form-item>
            <el-form-item label="用户名">
                <el-input v-model="createForm.username" autocomplete="off" clearable/>
            </el-form-item>
            <el-form-item label="密码">
                <div style="display: flex;flex-direction: row;justify-content: space-between;width: 100%;gap: 5px;">
                    <el-input v-model="createForm.password" autocomplete="off" style="flex: 1;" clearable/>
                    <el-button @click="createForm.password = generateRandomPassword(randomPasswordLength)">随机密码</el-button>
                </div>
            </el-form-item>
        </el-form>
        <div style="justify-content: center;width: 100%;display: flex;flex-direction: row;">
            <el-button @click="cancelCreate">取消</el-button>
            <el-button @click="createAccount">新增</el-button>
        </div>
    </el-dialog>
</template>
<script setup lang="ts">
import { Search, Delete, User, Lock } from '@element-plus/icons-vue'
import { ref, onBeforeMount, reactive, toRaw, watch } from 'vue'
import { Accounts } from '@/models/accounts';
import { ElMessage, ElMessageBox } from 'element-plus'
import { generateRandomPassword } from '@/utils/functions';

const randomPasswordLength = ref(12)

const filter = ref('')
const accountsData = ref<Accounts[]>([])
const filteredData = ref<Accounts[]>([])
const createAccModalVisible = ref(false)
interface Form {
    app: string;
    username: string;
    password: string;
}
const createForm = reactive<Form>({
    app: '',
    username: '',
    password: ''
})
var secretKey: string
async function loadAccount(secretKey: string) {
    await window.ipcRenderer.invoke('get-acc', secretKey).then(
        async (result) => {
            if (result.success) {
                accountsData.value = result.data as Accounts[]
                filteredData.value = accountsData.value
            } else {
                console.log(result.error)
                ElMessage.error({
                    message: '加载密码失败',
                    duration: 2500,
                })
            }
        }
    )
}
onBeforeMount(
    async () => {
        const response = await window.ipcRenderer.invoke('get-table', `SELECT * FROM masterPasswords`)
        if (response.success) {
            secretKey = response.data[0]['hashedPassword']
            loadAccount(secretKey)
        } else {
            ElMessage.error({
                message: '加载失败',
                duration: 2500,
            })
        }
        
    }
)

const onAccountChange = async (row: any) => {
    const account = toRaw(row)
    const response = await window.ipcRenderer.invoke('update-acc', account, secretKey)

    if (!response.success) {
        ElMessage.error({
            message: '账号修改失败',
            duration: 2500,
        })
    }
}

const createAccount = async () => {
    if (!createForm.app) {
        ElMessage.error({
            message: 'App不得为空',
            duration: 2500,
        })
        return
    }
    if (!createForm.username) {
        ElMessage.error({
            message: '用户名不得为空',
            duration: 2500,
        })
        return
    }
    if (!createForm.password) {
        ElMessage.error({
            message: '密码不得为空',
            duration: 2500,
        })
        return
    }
    const response = await window.ipcRenderer.invoke('set-acc', toRaw(createForm), secretKey)
    if (response.success) {
        createAccModalVisible.value = false;
        (Object.keys(createForm) as Array<keyof typeof createForm>).forEach(key => {
            createForm[key] = '';
        });
        loadAccount(secretKey)

    } else {
        console.log(response.error)
        ElMessage.error({
            message: '新增时发生错误',
            duration: 2500,
        })
    }
}

const cancelCreate = () => {
    createAccModalVisible.value = false;
    (Object.keys(createForm) as Array<keyof typeof createForm>).forEach(key => {
        createForm[key] = '';
    });
}

const deleteAccount = async (acc: any) => {
    const response = await window.ipcRenderer.invoke('delete-acc', acc)
    if (response.success) {
        loadAccount(secretKey)
    } else {
        console.log(response.error)
        ElMessage.error({
            message: '删除时发生错误',
            duration: 2500,
        })
    }
}

const searchAccount = () => {
    filteredData.value = accountsData.value.filter(account =>
        account.app.toLowerCase().includes(filter.value.toLowerCase())
    );
};

watch(filter, () => {
    searchAccount();
});

</script>

<style lang="css" scoped>
.accounts-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    box-sizing: border-box;
    overflow: hidden;
}
.search-area {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.inputs {
    flex: 1;
}
.collapse {
    flex: 1;
    box-sizing: border-box;
}
.collapse-expand {
    display: flex;
    flex-direction: row;
    padding: 5px 15px 15px 15px;
    gap: 30px;
    box-sizing: border-box;
    justify-content: space-between;
}
.collapse-title {
    font-size: 16px;
    padding-left: 25px;
}
</style>