import { createApp } from 'vue'
import App from './App.vue'

import './style.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import {router} from './router/index'
import { createPinia } from 'pinia'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus, {locale: zhCn}).use(router).use(createPinia())
app.mount('#app')
