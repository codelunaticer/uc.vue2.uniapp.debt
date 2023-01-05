/*
 * @Author: BORING GHOST
 * @Date: 2022-10-14 09:51:18
 * @LastEditTime: 2022-10-23 07:58:37
 * @Description: user store
 */
import { staticEdit } from "@/configs/conf.js";
import { routes as GOTO_PageFn } from "../../configs/routes.js";

export const user = {
  namespaced: true,
  state: {
    // ! 调试(接触下面2行注释)
    username: "",
    _id: "",
    // username: "touristname",
    // _id: "63478472398d8500010206f1",
    avatar: "",
    other: {},
  },
  mutations: {
    // qk 修改id
    SET_ID(state, newID) {
      if (newID) {
        state._id = newID;
      }
    },
    // qk 修改头像
    SET_AVATAR(state, avatar) {
      if (avatar) {
        state.avatar = avatar;
      }
    },
    // qk 其它信息
    SET_OTHER(state, other) {
      if (JSON.stringify(other) != "{}") {
        state.other = other;
      }
    },
    // qk 重置state
    reset_state(state) {
      state._id = "";
      state.avatar = "";
      state.other = {};
    },
    // qk 记录账号名称
    saveUsername(state, namestr) {
      state.username = namestr || "";
    },
  },
  actions: {
    // todo 退出登录
    loginout({ commit, state }) {
      try {
        uni.removeStorageSync(staticEdit["token_KEY"]);
        if (!uni.getStorageSync(staticEdit["token_KEY"])) {
          uni.reLaunch({
            url: GOTO_PageFn("login"),
          });
          // qk 删除数据后重置state
          commit("reset_state");
        } else {
          uni.showToast({
            title: "数据删除失败",
            icon: "error",
            mask: true,
          });
        }
      } catch (error) {
        console.log(error);
      }
    },
    // todo 修改用户信息
    setuserinfo({ commit, state }, info) {
      const { _id, avatar, ...other } = info;
      commit("SET_ID", _id || "");
      commit("SET_AVATAR", avatar || "");
      commit("SET_OTHER", other || {});
    },
    // todo 跟新用户信息
    updateuserinfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        try {
          uniCloud.callFunction({
            name: "other",
            data: {
              api: "getUserInfo",
              token: uni.getStorageSync(staticEdit["token_KEY"]),
              username:
                uni.getStorageSync(staticEdit["account_KEY"])["name"] ||
                state.username ||
                "",
            },
            success: ({ result }) => {
              if (result.code === 400) {
                resolve({ code: 400, message: result.errMsg });
              } else if (result.code === 200) {
                const { _id, avatar, ...other } = result.data;
                commit("SET_ID", _id || "");
                commit("SET_AVATAR", avatar || "");
                commit("SET_OTHER", other || {});
                resolve({ code: 200 });
              } else {
                resolve({ code: 300 });
              }
            },
            fail: async (err) => {
              console.log(err);
              reject(err);
            },
          });
        } catch (error) {
          console.log(error);
          reject(error);
        }
      });
    },
    // todo 查询用户信息
    getuserinfo({ commit, state }) {
      return {
        avatar: state.avatar || "",
        asia: state.other.asia || "",
        description: state.other.description || "",
      };
    },
  },
};
