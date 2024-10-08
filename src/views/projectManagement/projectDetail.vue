<template>
    <div v-if="projectStore.currentProject" class="project-detail-container">
        <div class="project-header">
            <div class="project-header-title">
                <div style="align-items: center;">                        
                    <span v-if="editProjectName == false" style="font-size: 18px;" @dblclick="editProjectName = true">{{ projectStore.currentProject.name }}</span>
                    <el-button v-if="editProjectName == false" link :icon="Edit" circle @click="editProjectName = true"/>
                    <el-input v-if="editProjectName == true" v-model="tempProjectName" 
                        @blur="onProjectNameChange" 
                        autofocus style="width: 240px;" clearable ></el-input>
                    <el-button v-if="editProjectName == true" link :icon="Check" circle @click="onProjectNameChange"/>
                </div>
                <div>
                    <span style="font-size: 12px; color: #909399;margin-top: 5px;">
                        创建时间：{{ formatTimestampToDateString(projectStore.currentProject.createdAt, true) }}
                    </span>
                </div> 
            </div>
            <div>
                <el-tag type="danger" style="margin-right: 5px;">状态</el-tag>
                <el-select v-model="projectStore.currentProject.status" style="width: 120px;" size="small">
                    <el-option v-for="status in statuses" :key="status" :label="status" :value="status"/>
                </el-select>
            </div>
        </div>
        <div class="project-detail">
            <div style="flex: 1;">
                <el-tag>项目周期</el-tag>
                <el-date-picker
                    v-model="projectStore.currentProject.startDate"
                    type="date"
                    placeholder="请选择开始日期"
                    size="small"
                    style="margin-left: 5px; width: 150px;"
                    format="YYYY-MM-DD"
                    value-format="x"
                />
                -
                <el-date-picker
                    v-model="projectStore.currentProject.endDate"
                    type="date"
                    placeholder="请选择结束日期"
                    size="small"
                    style="width: 150px;"
                    format="YYYY-MM-DD"
                    value-format="x"
                />
            </div>
            <div style="flex: 1;">
                <el-tag>优先级</el-tag>
                <el-select v-model="projectStore.currentProject.priority" style="width: 80px; margin-left: 5px;" size="small">
                    <el-option v-for="prior in priorities" :key="prior" :label="prior" :value="prior"/>
                </el-select>
            </div>
        </div>
        <el-divider></el-divider>

        <el-tabs class="project-tabs">
            <el-tab-pane label="任务列表">
                <template #default>
                    <div class="project-tasks">
                        <div style="justify-content: space-between; width: 100%; display: flex;">
                            <el-input v-model="taskFilter" style="width: 25%;" clearable>
                                <template #prefix>
                                    <el-icon><Search /></el-icon>
                                </template>
                            </el-input>
                            <el-button type="primary" :icon="Plus" @click="createTaskModalVisible = true">新增任务</el-button>
                        </div>
                        <el-table :data="filteredTask" style="width: 100%;margin-top: 20px" 
                        border :max-height="taskTableHeight" :row-style="{height: '45px'}">
                            <el-table-column prop="name" label="任务名称" width="200" />
                            <el-table-column property="status" label="状态" width="100">
                                <template #default="task">
                                    <el-tag type="primary" v-if="task.row.status == '进行中'">{{ task.row.status }}</el-tag>
                                    <el-tag type="success" v-if="task.row.status == '已结束'">{{ task.row.status }}</el-tag>
                                    <el-tag type="info" v-if="task.row.status == '未开始'">{{ task.row.status }}</el-tag>
                                    <el-tag type="warning" v-if="task.row.status == '暂停'">{{ task.row.status }}</el-tag>
                                    <el-tag type="danger" v-if="task.row.status == '失败'">{{ task.row.status }}</el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column property="priority" label="优先级" width="100">
                                <template #default="task">
                                    <el-tag type="danger" v-if="task.row.priority == 'P0'">{{ task.row.priority }}</el-tag>
                                    <el-tag type="warning" v-if="task.row.priority == 'P1'">{{ task.row.priority }}</el-tag>
                                    <el-tag type="info" v-if="task.row.priority == 'P2'">{{ task.row.priority }}</el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column property="startDate" label="开始时间" width="180" sortable>
                                <template #default="task">
                                    <span>{{ formatTimestampToDateString(task.row.startDate, true) }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column property="description" label="项目描述"/>
                            <el-table-column label="操作" fixed="right" width="100">
                                <template #default="task">
                                    <div style="font-size: 16px;">
                                        <el-button link @click="openEditTaskModal(task.row)"><el-icon><EditPen /></el-icon></el-button>
                                        <el-button link @click="onTaskDelete(task.row.taskId)"><el-icon><Delete /></el-icon></el-button>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </template>
            </el-tab-pane>
            <el-tab-pane label="项目描述">
                <template #default>
                    <el-scrollbar view-class="project-tab-desc"> 
                        <div class="project-tab-desc-buttons">
                            <span style="font-size: 12px; color: #909399; margin-top: 3px">最大500字</span>
                            <el-button v-if="editProjectDescription === false" link :icon="Edit" circle @click="editProjectDescription = true" style="font-size: 18px;"/>
                            <el-button v-if="editProjectDescription === true" link :icon="Check" circle @click="onProjectDescriptionChange" style="font-size: 18px;"/>
                        </div>
                        <div @dblclick="editProjectDescription=true" class="desc-content" v-if="editProjectDescription == false">
                            {{ projectStore.currentProject.description }}
                        </div>
                        <el-input v-model="tempProjectDescription" v-if="editProjectDescription == true"  class="desc-content"
                        type="textarea" @blur="onProjectDescriptionChange" resize="none" maxlength="500" autosize></el-input>
                    </el-scrollbar>
                </template>
            </el-tab-pane>
            <el-tab-pane label="项目进度"></el-tab-pane>
        </el-tabs>

        
    </div>
    <div class="create-task-modal">
        <el-dialog v-model="createTaskModalVisible" title="新建任务" width="500">
            <el-form :model="taskForm" label-position="right" label-width="auto" class="create-form">
                <el-form-item label="任务名称" required>
                    <el-input v-model="taskForm.name" autocomplete="off" placeholder="请输入任务名称" />
                </el-form-item>
                <el-form-item label="优先级" required>
                    <el-select v-model="taskForm.priority" placeholder="请选择优先级">
                        <el-option v-for="prior in priorities" :key="prior" :label="prior" :value="prior"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="任务描述">
                    <el-input v-model="taskForm.description" type="textarea" placeholder="请输入任务描述" 
                    :autosize="{ minRows: 3, maxRows: 10 }"></el-input>
                </el-form-item>
                <el-form-item label="开始时间">
                    <el-date-picker v-model="taskForm.startDate" type="datetime" placeholder="请选择开始时间"
                    value-format="x" format="YYYY-MM-DD HH:mm:ss"></el-date-picker>
                </el-form-item>
                <el-form-item label="结束时间">
                    <el-date-picker v-model="taskForm.endDate" type="datetime" placeholder="请选择结束时间"
                    value-format="x" format="YYYY-MM-DD HH:mm:ss"></el-date-picker>
                </el-form-item>

            </el-form>
            <div class="create-form-button">
                <el-button @click="createTaskModalVisible=false">取消</el-button>
                <el-button type="primary" @click="onTaskCreate(taskForm)">创建</el-button>
            </div>
        </el-dialog>
    </div>
    <div class="edit-task-modal">
        <el-dialog v-model="editTaskModalVisible" title="修改任务" width="500">
            <el-form :model="editTaskForm" label-position="right" label-width="auto" class="create-form">
                <el-form-item label="任务名称" required>
                    <el-input v-model="editTaskForm.name" autocomplete="off" placeholder="请输入任务名称" />
                </el-form-item>
                <el-form-item label="状态" required>
                    <el-select v-model="editTaskForm.status" style="width: 120px;">
                        <el-option v-for="status in statuses" :key="status" :label="status" :value="status"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="优先级" required>
                    <el-select v-model="editTaskForm.priority" placeholder="请选择优先级">
                        <el-option v-for="prior in priorities" :key="prior" :label="prior" :value="prior"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="任务描述">
                    <el-input v-model="editTaskForm.description" type="textarea" placeholder="请输入任务描述" 
                    :autosize="{ minRows: 3, maxRows: 10 }"></el-input>
                </el-form-item>
                <el-form-item label="开始时间">
                    <el-date-picker v-model="editTaskForm.startDate" type="datetime" placeholder="请选择开始时间"
                    value-format="x" format="YYYY-MM-DD HH:mm:ss"></el-date-picker>
                </el-form-item>
                <el-form-item label="结束时间">
                    <el-date-picker v-model="editTaskForm.endDate" type="datetime" placeholder="请选择结束时间"
                    value-format="x" format="YYYY-MM-DD HH:mm:ss"></el-date-picker>
                </el-form-item>

            </el-form>
            <div class="create-form-button">
                <el-button @click="editTaskModalVisible=false">取消</el-button>
                <el-button type="primary" @click="onTaskEdit(editTaskForm)">修改</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, watch, onBeforeMount, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useProjectStore } from '../../store/Project'
import { Project } from '@/models/project'
import { useTaskStore } from '../../store/Task'
import {
  Edit, Check, Plus
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus';
import { Task } from '@/models/task'
import { formatTimestampToDateString } from '@/utils/functions'

defineProps({id: String})
const route = useRoute()
const currentProjectId = parseInt(route.params.id as string)

const projectStore = useProjectStore()
const taskStore = useTaskStore()
const statuses = ['未开始', '进行中', '已结束', '暂停', '失败']
const priorities = ['P0', 'P1', 'P2']

const editProjectName = ref(false)
const editProjectDescription = ref(false)

const tempProjectName = ref('')
const tempProjectDescription = ref('')

const taskFilter = ref('')
const filteredTask = ref<Task[]>()
onBeforeMount(
      async () => {
        await projectStore.getProjectById(currentProjectId).then(()=> {
            tempProjectName.value = projectStore.currentProject.name
            tempProjectDescription.value = projectStore.currentProject.description
        })
        await taskStore.loadTasksByProjectId(currentProjectId).then(() => {
            filteredTask.value = taskStore.tasks
        })

    }
    
)


const onProjectNameChange = () => {
    editProjectName.value = false;
    
    if (!tempProjectName.value) {
        tempProjectName.value = projectStore.currentProject.name;
        ElMessage.error('项目名称不能为空');
        return false;
    }
    projectStore.currentProject.name = tempProjectName.value
    return true;
};


const onProjectDescriptionChange = () => {
    editProjectDescription.value = false;
    projectStore.currentProject.description = tempProjectDescription.value
    return true;
};

watch(
    () => projectStore.currentProject,
    () => {
        projectStore.updateProjectById(projectStore.currentProject.projectId, projectStore.currentProject)
    },
    {deep: true}
)

// task部分
const createTaskModalVisible = ref(false)
const editTaskModalVisible = ref(false)
const taskForm = reactive({
    name: '',
    description: '',
    status: '',    // 任务状态
    priority: '',    // 任务优先级
    startDate: '',
    endDate: ''
})
const taskTableHeight = ref(0)
const updateTableHeight = () => {
    taskTableHeight.value = window.innerHeight - 325
};

onMounted(() => {
    updateTableHeight();
    window.addEventListener('resize', updateTableHeight); // 监听窗口尺寸变化
});

// 组件销毁前移除事件监听器
onBeforeUnmount(() => {
    window.removeEventListener('resize', updateTableHeight);
});

const editTaskForm = reactive({
    taskId: -1,
    name: '',
    description: '',
    status: '',    // 任务状态
    priority: '',    // 任务优先级
    startDate: '',
    endDate: ''
})

const searchTask = () => {
    filteredTask.value = taskStore.tasks.filter(task =>
        task.name.toLowerCase().includes(taskFilter.value.toLowerCase())
    );
};

const validateForm = (data:any) => {
    if (!data.name) {
        return { validated: false, item: '任务名称'}
    } else if (!data.priority) {
        return { validated: false, item: '优先级'}
    } else {
        return { validated: true }
    }
}

const onTaskCreate = async (data:any) => {
    const validateResult = validateForm(data)
    if (!validateResult.validated) {
        ElMessage.error({
            message: `请输入${validateResult.item}`,
            duration: 1000,
        })
        return
    }

    try {
        const currentTimeStamp = Date.now()
        const response = await window.ipcRenderer.invoke('run-table', `
            INSERT INTO Tasks (name, description, status, priority, startDate, endDate, projectId, createdAt) VALUES
            ('${data.name}', '${data.description}', '未开始', '${data.priority}', '${data.startDate}', '${data.endDate}', '${route.params.id as string}', '${currentTimeStamp}');
        `)

        if (response.success) {
            taskStore.loadTasksByProjectId(currentProjectId).then(() => {
                createTaskModalVisible.value=false
                taskForm.name = ''
                taskForm.description = ''
                taskForm.priority = '';
                taskForm.startDate = '';
                taskForm.endDate = '';
                filteredTask.value = taskStore.tasks
            }).then(
                () => ElMessage.success({
                    message: '创建成功',
                    type: 'success',
                    duration: 1000,
                })
            )
        } else {
            console.log(response.error)
            ElMessage.error({
                message: '创建失败',
                type: 'error',
                duration: 2500,
            })
        }
    } catch (error) {
        console.error('请求过程中发生错误:', error);
        alert(`请求过程中发生错误:\n${error}`);
    }
}

watch(taskFilter, () => {
    searchTask()
});

const onTaskDelete = (taskId: any) => {
    ElMessageBox.confirm(
        '确定要删除该任务吗？',
        '删除项目',
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(async () => {
        const response = await window.ipcRenderer.invoke('run-table', `
            DELETE FROM Tasks WHERE taskId = ${taskId};
        `)
        if (response.success) {
            await taskStore.loadTasksByProjectId(currentProjectId).then(() => {
                filteredTask.value = taskStore.tasks
                ElMessage.success({
                    message: '删除成功',
                    type: 'success',
                    duration: 1000,
                })
            })
        } else {
            console.log(response.error)
            ElMessage.error({
                message: '删除失败',
                type: 'error',
                duration: 1000,
            })
        }
    }).catch((err) => {
        console.log(err)
        ElMessage({
            type: 'info',
            message: '请求时发生错误',
        })
    })
}

const openEditTaskModal = (data: any) => {
    editTaskForm.taskId = data.taskId
    editTaskForm.name = data.name
    editTaskForm.priority = data.priority
    editTaskForm.description = data.description
    editTaskForm.status = data.status
    editTaskForm.startDate = data.startDate
    editTaskForm.endDate = data.endDate
    editTaskModalVisible.value = true
}

const onTaskEdit = async (data: any) => {
    const validateResult = validateForm(data)
    if (!validateResult.validated) {
        ElMessage.error({
            message: `请输入${validateResult.item}`,
            duration: 1000,
        })
        return
    }
    await taskStore.updateTaskByTaskId(data.taskId, data).then(async ()=> {
        await taskStore.loadTasksByProjectId(currentProjectId).then(() => filteredTask.value = taskStore.tasks)
        editTaskModalVisible.value = false
    })
    
}

</script>

<style scoped>
.project-detail-container {
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
    box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    box-sizing: border-box;
    overflow: hidden;
    padding: 15px;
    flex: 1;

}
.project-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}
.project-header-title {
    display: flex;
    flex-direction: column;
}
.project-detail {
    display: flex;
    flex-direction: row;
    margin-top: 10px;
}
.el-tab-pane {
    height: 100%;
    display: flex;
    flex-direction: column;
}
.project-tabs {
    flex: 1;

}
.project-tab-desc-buttons {
    justify-content: flex-end;
    display: flex;
    font-size: 24px;
    margin-bottom: 5px;
    margin-right: 20px;
}

.project-tab-desc {
    display: flex;
    flex-direction: column; /* 垂直排列子元素 */
    height: 100vh; /* 父元素高度 */
    overflow: hidden; /* 防止内容超出父元素 */
    flex: 1;
}

.desc-content {
    font-size: 14px;
    line-height: 1.6em;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    color: #606266;
    letter-spacing: 1px;
    height: 50vh;

}

.project-tasks {
    display: flex;
    flex-direction: column;
}
.create-form-button {
    justify-content: center;
    display: flex;
    align-items: center;
    gap: 5px;
}

</style>