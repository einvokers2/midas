<template>
    <el-card v-if="project">
        <template #header>
            <div class="card-header">
                <span>{{ project.name }}</span>
            </div>
        </template>
        <p v-for="o in 4" :key="o" class="text item">{{ 'List item ' + o }}</p>
        <template #footer>Footer content</template>
    </el-card>
</template>

<script lang="ts" setup>
import { Project } from '@/models/project'

const project = defineModel<Project>()
</script>