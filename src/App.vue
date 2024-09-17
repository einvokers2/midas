<script setup lang="ts">
import Sidebar from './components/Layout/Sidebar.vue';
</script>

<template>
  <div class="layout">
    <el-container class="container">
      <el-aside width="200px" class="sidebar">
        <Sidebar />
      </el-aside>
      <el-container class="container">
        <el-main class="main"><RouterView></RouterView></el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.layout {
  height: 100%;
  width: 100%;

}
.container {
  height: 100%;
  width: 100%;
  background-color: #F6F6F9;
}
.sidebar {
  height: 100%;
}

.main {
  overflow-y: auto;
  display: flex;
  margin-top: 15px;
  box-sizing: border-box;
}
</style>
