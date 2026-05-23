import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import {
  ArrowLeft, Bell, Briefcase, ChatDotRound, Clock, DataAnalysis, Delete,
  Document, HomeFilled, Loading, Location, School, Search, UploadFilled, User, UserFilled,
} from '@element-plus/icons-vue';
import App from './App.vue';
import router from './router';
import './assets/styles/main.css';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(ElementPlus);

const icons = { ArrowLeft, Bell, Briefcase, ChatDotRound, Clock, DataAnalysis, Delete, Document, HomeFilled, Loading, Location, School, Search, UploadFilled, User, UserFilled };
for (const [name, comp] of Object.entries(icons)) {
  app.component(name, comp);
}

app.mount('#app');
