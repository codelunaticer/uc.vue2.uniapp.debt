/*
 * @Author: BORING GHOST
 * @Date: 2022-10-09 08:41:44
 * @LastEditTime: 2022-10-14 10:00:40
 * @Description:
 */
import App from "./App";

// #ifndef VUE3
import Vue from "vue";
import GlobalAtrri from "./configs/index.js";
// qk 组件
import xlbLoading from "@/components/xlbloading.vue";
Vue.component("xlbLoading", xlbLoading);

// qk vuex
import store from "./store/index.js";
Vue.prototype.$store = store;

Vue.config.productionTip = false;
App.mpType = "app";

Vue.use(GlobalAtrri);

const app = new Vue({
  store,
  ...App,
});
app.$mount();
// #endif

// #ifdef VUE3
import { createSSRApp } from "vue";
export function createApp() {
  const app = createSSRApp(App);
  return {
    app,
  };
}
// #endif
