import { createApp } from 'vue';

import App from '@/app/App.vue';
import { pinia } from '@/app/pinia';
import router from '@/router';

import '../css/app.css';

const app = createApp(App);

app.use(pinia);
app.use(router);

app.mount('#app');
