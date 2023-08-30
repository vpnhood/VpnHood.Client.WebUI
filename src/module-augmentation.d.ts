import Vue from 'vue'
import app from "@/App.vue";

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $loadApp: app.config.globalProperties.$loadApp;
    }
}
