<template>
    <div class="project-container">
        <div class="project-header">
            <div class="project-header-title">
                <span style="font-size: 28px;line-height: 40px;color: #32324D; font-weight: 300;">项目管理</span>
                <span style="font-size: 14px;line-height: 24px;color: #666687;">{{ projectStore.project.length || 0 }}个项目</span>
            </div>
            <div class="add-project-button">
                <el-button type="primary" :icon="Plus" @click="modalVisible = true">新建项目</el-button>
            </div>
        </div>

        <div class="table-container">
            <el-table :data="projectStore.project" style="width: 100%">
                <el-table-column property="name" label="项目名称" width="200" show-overflow-tooltip/>
                <el-table-column property="status" label="状态" width="80">
                    <template #default="project">
                        <el-tag type="primary" v-if="project.row.status == '进行中'">{{ project.row.status }}</el-tag>
                        <el-tag type="success" v-if="project.row.status == '已结束'">{{ project.row.status }}</el-tag>
                        <el-tag type="info" v-if="project.row.status == '未开始'">{{ project.row.status }}</el-tag>
                        <el-tag type="warning" v-if="project.row.status == '暂停'">{{ project.row.status }}</el-tag>
                        <el-tag type="danger" v-if="project.row.status == '失败'">{{ project.row.status }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column property="priority" label="优先级" width="80">
                    <template #default="project">
                        <el-tag type="danger" v-if="project.row.priority == 'P0'">{{ project.row.priority }}</el-tag>
                        <el-tag type="warning" v-if="project.row.priority == 'P1'">{{ project.row.priority }}</el-tag>
                        <el-tag type="info" v-if="project.row.priority == 'P2'">{{ project.row.priority }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column property="description" label="项目描述" show-overflow-tooltip min-width="300"/>
                <el-table-column label="操作">
                    <template #default="project">
                        <div style="font-size: 16px;">
                            <el-button link @click="onProjectEdit(project.row.projectId)"><el-icon><EditPen /></el-icon></el-button>
                            <el-button link @click="onProjectDelete(project.row)"><el-icon><Delete /></el-icon></el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="createModal">
            <el-dialog v-model="modalVisible" title="新建项目" width="500">
                <el-form :model="form" label-position="right" label-width="auto" class="create-form">
                    <el-form-item label="项目名称" required>
                        <el-input v-model="form.name" autocomplete="off" placeholder="请输入项目名称" />
                    </el-form-item>
                    <el-form-item label="项目描述">
                        <el-input v-model="form.description" type="textarea" placeholder="请输入项目描述" 
                        :autosize="{ minRows: 3, maxRows: 10 }"></el-input>
                    </el-form-item>
                    <el-form-item label="优先级">
                        <el-select v-model="form.priority" placeholder="请选择优先级">
                            <el-option v-for="prior in priorities" :key="prior" :label="prior" :value="prior"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="开始日期">
                        <el-date-picker v-model="form.startDate" type="date" placeholder="请选择开始日期"
                        value-format="YYYY-MM-DD" format="YYYY-MM-DD"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="结束日期">
                        <el-date-picker v-model="form.endDate" type="date" placeholder="请选择结束日期"
                        value-format="YYYY-MM-DD" format="YYYY-MM-DD"></el-date-picker>
                    </el-form-item>

                </el-form>
                <div class="create-form-button">
                    <el-button @click="modalVisible=false">取消</el-button>
                    <el-button type="primary" @click="onProjectCreate(form)">创建</el-button>
                </div>
            </el-dialog>
        </div>
    </div>
    
</template>

<script setup lang="ts">
import { ref, onBeforeMount, reactive } from 'vue'
import { useProjectStore } from '../../store/Project'
import {
  Delete,
  Edit,
  Plus,
  Setting,
  EditPen
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Project } from '@/models/project'

const projectStore = useProjectStore()
const router = useRouter()

// 定义一个响应式对象，用于存储表单数据
const form = reactive({
    name: '',
    description: '',
    priority: '',
    startDate: '',
    endDate: ''
})
const modalVisible = ref(false)
const priorities = ['P0', 'P1', 'P2']

// 使用 onMounted 确保组件挂载后再加载数据
onBeforeMount(
    async () => {
        await projectStore.loadProject()
    }
    
)

const onProjectCreate = async (data:any) => {

    await window.ipcRenderer.invoke('run-table', `
        INSERT INTO Projects (name, description, status, priority, startDate, endDate) VALUES
         ('${data.name}', '${data.description}', '未开始', '${data.priority}', '${data.startDate}', '${data.endDate}');
    `).then(() => {
        projectStore.loadProject().then(() => {
            modalVisible.value=false
            form.name = ''
            form.description = ''
            form.priority = '';
            form.startDate = '';
            form.endDate = '';
        })
    }).then(() => ElMessage.success({
        message: '创建成功',
        type: 'success',
        duration: 1000,
    })).catch((error) => {
        console.log(error)
        ElMessage.error({
            message: '创建失败',
            type: 'error',
            duration: 1000,
        })
    })
}

const onProjectEdit = (projectId: any) => {
    router.push({name: 'projectDetail',params: {id: projectId}})
}

const onProjectDelete = (project: any) => {
    ElMessageBox.confirm(
        '确定要删除该项目吗？',
        '删除项目',
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        window.ipcRenderer.invoke('run-table', `
            DELETE FROM Projects WHERE projectId = '${project.projectId}';
        `).then(() => projectStore.loadProject()).then(() => {
            ElMessage.success({
                message: '删除成功',
                type: 'success',
                duration: 1000,
            })
        })
    }).catch(() => {
        ElMessage({
            type: 'info',
            message: '取消删除',
        })
    })


}

</script>

<style scoped>
.project-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}
.project-header {
    display: flex;
    flex-direction: row;
    margin: 15px 0px 25px 0px;
    justify-content: space-between;
}
.add-project-button {
    display: flex;
    margin: 0 15px;
    justify-content: flex-end;
}
.create-form {
    margin: 12px;
}
.create-form-button {
    justify-content: center;
    display: flex;
    align-items: center;
    gap: 5px;
}

:deep(.el-table) {
  box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.1);
  border-radius: 5px;
}
.project-header-title {
    display: flex;
    flex-direction: column;
    
}
</style>