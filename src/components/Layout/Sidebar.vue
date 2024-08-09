<template>
  <el-menu
    default-active="1-1"
    class="sideBarMenu"
  >
    <el-sub-menu index="1">
      <template #title>
        <el-icon><Management /></el-icon>
        <span>管理</span>
      </template>
      <el-menu-item index="1-1" @click="navigateTo('/')">
        <template #title>
          <el-icon><Histogram /></el-icon>
          <span>数据看板</span>
        </template>
      </el-menu-item>
      <el-menu-item index="1-2"  @click="navigateTo('/projectManagement')">
        <template #title>
          <el-icon><Operation /></el-icon>
          <span>项目管理</span>
        </template>
      </el-menu-item>
      <el-menu-item index="1-3">
        <template #title>
          <el-icon><Clock /></el-icon>
          <span>日程管理</span>
        </template>
      </el-menu-item>
      <el-menu-item index="1-4">
        <template #title>
          <el-icon><Avatar /></el-icon>
          <span>账户管理</span>
        </template>
      </el-menu-item>
    </el-sub-menu>
    <el-menu-item index="2">
      <el-icon><Setting /></el-icon>
      <span>设置</span>
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts" setup>
import {
  Avatar,
  Clock,
  Histogram,
  Operation,
  Setting,
} from '@element-plus/icons-vue'

import { useRouter } from 'vue-router'

const router = useRouter()
function navigateTo(path: string) {
  router.push(path)
}

</script>

<style scoped>
.sideBarMenu {
  height: 100%;
}
</style>