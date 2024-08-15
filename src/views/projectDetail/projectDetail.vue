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
                    <span style="font-size: 12px; color: #909399;margin-top: 5px;">创建时间：{{ projectStore.currentProject.createdAt }}</span>
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
        <el-divider></el-divider>
        <div class="project-tabs">
            <el-tabs style="height: 100%;">
                <el-tab-pane label="项目描述">
                    <template #default>
                        <div class="project-tab">
                            <div class="project-tab-desc-buttons">
                                <el-button v-if="editProjectDescription === false" link :icon="Edit" circle @click="editProjectDescription = true" style="font-size: 18px;"/>
                                <el-button v-if="editProjectDescription === true" link :icon="Check" circle @click="onProjectDescriptionChange" style="font-size: 18px;"/>
                            </div>
                            <div class="project-tab-desc-content">
                                <div v-if="editProjectDescription == false" @dblclick="editProjectDescription=true" class="desc-content">
                                    {{ projectStore.currentProject.description }}
                                </div>
                                <el-input v-model="tempProjectDescription" v-if="editProjectDescription == true"  class="desc-content"
                                type="textarea" @blur="onProjectDescriptionChange" :rows="16" resize="none" maxlength="200" show-word-limit></el-input>
                            </div>
                        </div>
                    </template>
                </el-tab-pane>
                <el-tab-pane label="任务列表"></el-tab-pane>
                <el-tab-pane label="项目进度"></el-tab-pane>
            </el-tabs>
        </div>
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
// TODO: 项目描述中的文本不能overflow

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
.project-detail-container {
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
    box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    padding: 15px;
    height: 100%;
    max-height: 100%;
    box-sizing: border-box;
    overflow: hidden;

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
.project-tabs {
    flex: 1;
}

.project-tab-desc-buttons {
    justify-content: flex-end;
    display: flex;
    font-size: 24px;
    margin-bottom: 5px;
}
.project-tab-desc-content {
    font-size: 14px;
    line-height: 1.6em;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    color: #606266;
    letter-spacing: 1.2px;
    display: flex;
    box-sizing: border-box;
}

.project-tab {
    display: flex;
    flex-direction: column;
    flex: 1;

}
.desc-content {
    overflow-y: auto;
    width: 100%;
    flex: 1;
    box-sizing: border-box;
}

</style>