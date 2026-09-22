// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

// 引入样式
import './assets/css/tailwind.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);

// GitHub Pages SPA redirect: handle ?p= query param from 404.html
const params = new URLSearchParams(window.location.search);
const redirectPath = params.get('p');
if (redirectPath) {
  router.isReady().then(() => {
    router.replace(redirectPath);
  });
}

app.mount('#app');