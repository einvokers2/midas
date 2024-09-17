import { Project } from "@/models/project";
import { defineStore } from "pinia";
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

export const useProjectStore = defineStore('project', () => {
    const project = ref<Project[]>([] as Project[])
    const currentProject = ref<Project>({} as Project)
    const loadProject = async () => {
        await window.ipcRenderer.invoke('get-table', `SELECT * FROM Projects`).then(
            (result) => {
                if (result.success) {
                    project.value = result.data as Project[]
                } else {
                    console.log(result.error)
                    ElMessage.error({
                        message: '获取项目列表失败',
                        duration: 2500,
                    })
                }
                
            }
        )
    }
    const getProjectById = async (id: number) => {
        await window.ipcRenderer.invoke('get-table', `SELECT * FROM Projects WHERE projectId = ${id}`).then(
            (result) => {
                if (result.success) {
                    currentProject.value = result.data[0] as Project
                } else {
                    console.log(result.error)
                    ElMessage.error({
                        message: '获取项目失败',
                        duration: 2500,
                    })
                }
                
            }
        )
    }
    const updateProjectById = async (id: number | string, project: Project) => {
        await window.ipcRenderer.invoke('run-table', 
        `UPDATE Projects 
        SET name = '${project.name}', 
            description = '${project.description}', 
            status = '${project.status}', 
            priority = '${project.priority}', 
            startDate = '${project.startDate}',
            endDate = '${project.endDate}'
        WHERE projectId = ${id};`).then(
            (result) => {
                if (!result.success) {
                    console.log(result.error)
                    ElMessage.error({
                        message: '更新项目失败',
                        duration: 2500,
                    })
                }
            }
        )
    }
    return {project, currentProject, loadProject, getProjectById, updateProjectById}
})

