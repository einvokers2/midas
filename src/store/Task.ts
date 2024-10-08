import { Task } from '@/models/task'
import { defineStore } from "pinia";
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

export const useTaskStore = defineStore('task', () => {
    const tasks = ref<Task[]>([] as Task[])
    const loadTasksByProjectId = async (id:any) => {
        await window.ipcRenderer.invoke('get-table', `SELECT * FROM Tasks WHERE projectId = ${id}`).then(
            (result: any) => {
                if (result.success) {
                    tasks.value = result.data as Task[]
                } else {
                    console.log(result.error)
                    ElMessage.error({
                        message: '获取任务列表失败',
                        duration: 2500,
                    })
                }
                
            }
        ).catch(
            (error: any) => {ElMessage(`获取任务列表失败:${error}`)}
        )
    }
    const deleteTaskByTaskId = async (id:any) => {
        await window.ipcRenderer.invoke('run-table', `
            DELETE FROM Tasks WHERE taskId = ${id}
        `)
    }

    const updateTaskByTaskId = async (id: any, task: Task) => {
        await window.ipcRenderer.invoke('run-table', 
        `UPDATE Tasks 
        SET name = '${task.name}', 
            description = '${task.description}', 
            status = '${task.status}', 
            priority = '${task.priority}', 
            startDate = ${task.startDate},
            endDate = ${task.endDate}
        WHERE taskId = ${id};`).then(
            (result: any) => {
                if (!result.success) {
                    console.log(result.error)
                    ElMessage.error({
                        message: '更新项目失败',
                        duration: 2500,
                    })
                }
            }
        ).catch(
            (error: any) => {ElMessage(`更新任务失败:${error}`)}
        )
    }
    return {tasks, loadTasksByProjectId, deleteTaskByTaskId, updateTaskByTaskId}
})