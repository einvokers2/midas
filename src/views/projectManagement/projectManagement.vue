<template>
    <div class="add-project-button">
        <el-button type="primary" :icon="Plus" @click="modalVisible = true">新建项目</el-button>
    </div>
    <div class="card-container" v-if="projectStore.project.length > 0">
        <el-card v-for="project in projectStore.project" class="card-item">
            <template #header>
                <div class="card-header">
                    <div class="card-header-left">
                        <div class="card-title">
                            <span>{{ project.name }}</span>
                        </div>
                        <div>
                            <span style="font-size: 12px; color: #909399;">{{ project.createdAt }}</span>
                        </div>
                    </div>
                    <div class="card-header-right">
                        <el-tag type="primary" v-if="project.status == '进行中'">{{ project.status }}</el-tag>
                        <el-tag type="success" v-if="project.status == '已结束'">{{ project.status }}</el-tag>
                        <el-tag type="info" v-if="project.status == '未开始'">{{ project.status }}</el-tag>
                        <el-tag type="warning" v-if="project.status == '暂停'">{{ project.status }}</el-tag>
                        <el-tag type="danger" v-if="project.status == '失败'">{{ project.status }}</el-tag>
                        <el-button type="primary" :icon="Edit" circle size="small" @click="router.push({name: 'projectDetail',params: {id: project.projectId}})"/>
                        <el-button type="danger" :icon="Delete" circle size="small" @click="onProjectDelete(project)"/>
                    </div>
                </div>
            </template>
            <div class="card-content">{{ project.description }}</div>
        </el-card>
    </div>
    <!-- <div class="pagination">
        <el-pagination size="small" layout="prev, pager, next" :total="50" />
    </div> -->
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
</template>

<script setup lang="ts">
import { ref, onBeforeMount, reactive } from 'vue'
import { useProjectStore } from '../../store/Project'
import {
  Delete,
  Edit,
  Plus
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
.add-project-button {
    display: flex;
    margin: 0 15px;
    justify-content: flex-end;
}
.card-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
}
.card-item {
    height: 250px;
    margin-top: 10px;
}
.card-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 45px;

}
.card-header-left {
    display: flex;
    flex-direction: column;
}
.card-header-right {
    display: flex;
    flex-direction: row;
    gap: 3px;
}
.card-title {
    white-space: nowrap; /* 防止文字换行 */
    overflow: hidden;    /* 隐藏超出部分 */
    text-overflow: ellipsis; /* 显示省略号 */
    max-width: 160px;
}
.card-content {
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
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
</style>