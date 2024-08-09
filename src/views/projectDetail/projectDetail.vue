<template>
    <div v-if="projectStore.currentProject" class="project-detail-container">
        <div class="project-detail-header">
            <el-card>
                <template #header>
                    <div style="display: flex;flex-direction: column;gap: 10px;">
                        <div class="project-detail-header-header">
                            <div style="align-items: center;">                        
                                <span v-if="editProjectName == false" style="font-size: 18px;" @dblclick="editProjectName = true">{{ projectStore.currentProject.name }}</span>
                                <el-button v-if="editProjectName == false" text :icon="Edit" circle @click="editProjectName = true"/>
                                <el-input v-if="editProjectName == true" v-model="tempProjectName" 
                                    @blur="onProjectNameChange" 
                                    autofocus style="width: 240px;" clearable ></el-input>
                                <el-button v-if="editProjectName == true" text :icon="Check" circle @click="onProjectNameChange"/>
                                
                            </div>
                            <div>
                                <el-tag type="danger" style="margin-right: 5px;">状态</el-tag>
                                <el-select v-model="projectStore.currentProject.status" style="width: 120px;" size="small">
                                    <el-option v-for="status in statuses" :key="status" :label="status" :value="status"/>
                                </el-select>
                            </div>

                        </div>
                        <div>
                            <span style="font-size: 12px; color: #909399;margin-top: 5px;">创建时间：{{ projectStore.currentProject.createdAt }}</span>
                        </div>         
                        <div class="project-detail-header-header-content">
                            <div style="flex: 1;">
                                <el-tag>项目周期</el-tag>
                                <el-date-picker
                                    v-model="projectStore.currentProject.startDate"
                                    type="date"
                                    placeholder="请选择开始日期"
                                    size="small"
                                    style="margin-left: 5px; width: 150px;"
                                    format="YYYY-MM-DD"
                                    value-format="YYYY-MM-DD"
                                />
                                -
                                <el-date-picker
                                    v-model="projectStore.currentProject.endDate"
                                    type="date"
                                    placeholder="请选择结束日期"
                                    size="small"
                                    style="width: 150px;"
                                    format="YYYY-MM-DD"
                                    value-format="YYYY-MM-DD"
                                />
                            </div>
                            <div style="flex: 1;">
                                <el-tag>优先级</el-tag>
                                <el-select v-model="projectStore.currentProject.priority" style="width: 80px; margin-left: 5px;" size="small">
                                    <el-option v-for="prior in priorities" :key="prior" :label="prior" :value="prior"/>
                                </el-select>
                            </div>
                        </div>
                    </div>
                    
                </template>
                <div style="justify-content: space-between; align-items: center;">
                    <span>项目描述</span>
                    <el-button v-if="editProjectDescription === false" text :icon="Edit" circle @click="editProjectDescription = true"/>
                    <el-button v-if="editProjectDescription === true" text :icon="Check" circle @click="onProjectDescriptionChange"/>
                </div>
                <div class="project-detail-header-content">
                    <div class="project-detail-header-content-description">
                        <span v-if="editProjectDescription == false" @dblclick="editProjectDescription=true">{{ projectStore.currentProject.description }}</span>
                        <el-input v-model="tempProjectDescription" v-if="editProjectDescription == true" 
                        type="textarea" @blur="onProjectDescriptionChange" autosize></el-input>
                    </div>
                </div>
            </el-card>
        </div>

        <div></div>
    </div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, watch, onBeforeMount } from 'vue'
import { useProjectStore } from '../../store/Project'
import { Project } from '@/models/project'
import {
  Edit, Check
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus';


defineProps({id: String})
const route = useRoute()

const projectStore = useProjectStore()
const statuses = ['未开始', '进行中', '已结束', '暂停', '失败']
const priorities = ['P0', 'P1', 'P2']

const editProjectName = ref(false)
const editProjectDescription = ref(false)


onBeforeMount(
     async () => {
        await projectStore.getProjectById(parseInt(route.params.id as string))
    }
    
)

const tempProjectName = ref(projectStore.currentProject.name)
const onProjectNameChange = () => {
    editProjectName.value = false;
    
    if (tempProjectName.value === '') {
        tempProjectName.value = projectStore.currentProject.name;
        ElMessage.error('项目名称不能为空');
        return false;
    }
    projectStore.currentProject.name = tempProjectName.value
    return true;
};

const tempProjectDescription = ref(projectStore.currentProject.description)
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

</script>

<style scoped>
.project-detail-header-header {
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
}
.project-detail-header-header-content {
    display: flex;
    flex-direction: row;
}
.project-detail-header-content-description {
    font-size: 14px;
    line-height: 1.6em;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    color: #606266;
    letter-spacing: 1.2px;
}

</style>