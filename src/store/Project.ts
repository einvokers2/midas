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
                project.value = result as Project[]
            }
        ).catch(
            (error) => {ElMessage(`获取项目列表失败:${error}`)}
        )
    }
    const getProjectById = async (id: number) => {
        await window.ipcRenderer.invoke('get-table', `SELECT * FROM Projects WHERE projectId = ${id}`).then(
            (result) => {
                currentProject.value = result[0] as Project
            }
        ).catch(
            (error) => {ElMessage(`获取项目失败:${error}`)}
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
        WHERE projectId = ${id};`).catch(
            (error) => {ElMessage(`更新项目失败:${error}`)}
        )
    }
    return {project, currentProject, loadProject, getProjectById, updateProjectById}
})

