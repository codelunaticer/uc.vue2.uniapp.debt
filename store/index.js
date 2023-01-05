/*
 * @Author: BORING GHOST
 * @Date: 2022-10-13 09:08:24
 * @LastEditTime: 2022-10-14 10:06:44
 * @Description:
 */
import Vue from "vue";
import Vuex from "vuex";

// qk 模块
import { user } from "./modules/user.js";
import { getters } from "./getters.js";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    user,
  },
  getters,
});
