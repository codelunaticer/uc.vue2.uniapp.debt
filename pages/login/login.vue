<!--
 * @Author: BORING GHOST
 * @Date: 2022-10-09 08:41:44
 * @LastEditTime: 2022-10-23 10:55:09
 * @Description: 登录
-->
<template>
  <view class="login__">
    <xlb-loading
      v-show="isloading"
      :error="loadingerror"
      :text="loadingText"
    ></xlb-loading>
    <!-- 背景 -->
    <image
      class="login-bg"
      :src="loginBG"
      mode="widthFix"
      style="width: 100%"
    />
    <!-- 调试 -->
    <view class="tiaoshitext" @click="tiaoshiEvent">调试</view>
    <!-- 文字 -->
    <view class="login-title"> 登录 </view>
    <!-- 登录框 -->
    <view class="login-form">
      <uni-forms ref="form" :model="form">
        <uni-forms-item name="name">
          <view class="item-icon name">
            <image :src="formUserIcon" mode="widthFix" />
          </view>
          <uni-easyinput
            :style="inputStyle"
            :inputBorder="false"
            v-model="form.name"
            placeholder="用户名"
          >
          </uni-easyinput>
        </uni-forms-item>
        <view class="form-line" />
        <uni-forms-item name="password">
          <view class="item-icon password">
            <image :src="formPasswordIcon" mode="widthFix" />
          </view>
          <uni-easyinput
            type="password"
            :adjust-position="true"
            :style="inputStyle"
            :inputBorder="false"
            v-model="form.password"
            placeholder="密码"
          >
          </uni-easyinput>
        </uni-forms-item>
      </uni-forms>
    </view>
    <!-- 操作按钮 -->
    <view class="handleBtns">
      <button @click="submit" class="login-btn">登录</button>
    </view>
    <!-- 注册账号 -->
    <view @click="goResit" class="forgetPassword">注册账号</view>
    <!-- 保存密码 -->
    <checkbox-group
      @change="
        ({ detail }) => {
          isSave = detail['value'][0];
        }
      "
      class="isSave"
    >
      <checkbox :value="true" :checked="checkFlag">记住密码</checkbox>
    </checkbox-group>
    <!-- 游客身份登录 -->
    <view class="touristLogin">
      <button @click="touristLogin" class="Go">Go</button>
      <view class="text">点我以游客身份进入!</view>
    </view>
  </view>
</template>

<script>
const errMsg = (msg = "授权失败") => {
  uni.showToast({
    title: msg,
    icon: "error",
    duration: 2000,
  });
};
const successMsg = (msg = "成功") => {
  uni.showToast({
    title: msg,
    icon: "success",
  });
};
export default {
  data() {
    return {
      isSave: false,
      checkFlag: false,
      // qk loading
      isloading: false,
      loadingText: "",
      loadingerror: 1,

      form: {
        name: "",
        password: "",
      },
      rules: {
        name: {
          rules: [
            {
              required: true,
              errorMessage: "用户名不能为空",
            },
            {
              maxLength: 6,
              errorMessage: "长度超过了6位",
            },
            {
              validateFunction: function (rule, value, data, callback) {
                const guize = /^[a-z]+$/;
                if (!guize.test(value)) {
                  callback("只能是小写英文");
                }
                return true;
              },
            },
          ],
        },
        password: {
          rules: [
            {
              required: true,
              errorMessage: "密码不能为空",
            },
          ],
        },
      },
      inputStyle: {
        color: "rgb(147, 149, 164)",
      },
      // QK 静态资源
      loginBG: "",
      formUserIcon: "",
      formPasswordIcon: "",
    };
  },
  watch: {
    checkFlag: {
      handler(newv) {
        this.isSave = newv;
      },
      immediate: true,
    },
  },
  onLoad() {
    this.isSaveAccunt(1);
    this.stitchStaticResourcePath();
  },
  onReady() {
    // 需要在onReady中设置规则
    this.$refs.form.setRules(this.rules);
  },
  methods: {
    /**
     * todo 游客登录
     */
    touristLogin() {
      uni.showModal({
        title: "游客",
        content: "以游客身份进入可体验小程序功能!",
        showCancel: true,
        confirmText: "狗狗狗~",
        success: ({ confirm, cancel }) => {
          if (confirm) {
            this.loadingText = "游客登录中...";
            this.isloading = true;
            uniCloud.callFunction({
              name: "userlogin",
              data: {
                api: "touristLOGIN",
                code: "sdfwhlkj",
              },
              success: async ({ result }) => {
                if (result.code === 400) {
                  this.loadingerror++;
                  this.loadingText = "登录失败!!" + result.errMsg;
                  await this.$xlb_asyncSleep();
                } else if (result.code === 200) {
                  this.loadingText = "游客登录成功,欢迎!";
                  await this.$xlb_asyncSleep();
                  uni.setStorageSync(
                    this.$xlb_staticEdit["token_KEY"],
                    result.token
                  );
                  if (uni.getStorageSync(this.$xlb_staticEdit["token_KEY"])) {
                    // qk 游客token获取成功,可以创建账号
                    Object.assign(this.form, {
                      name: "touristname",
                      password: "touristpassword",
                    });
                    this.isSaveAccunt(2);
                    const this_ = this;
                    uniCloud.callFunction({
                      name: "userlogin",
                      data: {
                        api: "addUsername",
                        username: this_.form.name,
                        password: this_.form.password,
                        token: uni.getStorageSync(
                          this.$xlb_staticEdit["token_KEY"]
                        ),
                      },
                      success: ({ result }) => {
                        if (result.code == 400) {
                          uni.setStorageSync(
                            this.$xlb_staticEdit["token_KEY"],
                            ""
                          );
                          this_.isloading = false;
                          uni.showModal({
                            content: result.errMsg,
                            showCancel: false,
                          });
                        } else if (result.code == 200) {
                          this_.isloading = false;
                          // qk 游客账号创建成功
                          uni.switchTab({ url: this_.GOTO_PageFn("center") });
                        } else {
                          uni.setStorageSync(
                            this.$xlb_staticEdit["token_KEY"],
                            ""
                          );
                          this_.isloading = false;
                          errMsg("失败(未知错误)");
                        }
                      },
                      fail: (err) => {
                        console.log(err);
                        uni.setStorageSync(
                          this.$xlb_staticEdit["token_KEY"],
                          ""
                        );
                        this_.isloading = false;
                        errMsg("账号创建失败");
                      },
                    });
                  } else {
                    this.loadingerror++;
                    this.loadingText = "记录失败,建议联系痞老板!";
                    await this.$xlb_asyncSleep();
                  }
                } else {
                  this.loadingerror++;
                  this.loadingText = "登录失败(未知错误)";
                  await this.$xlb_asyncSleep();
                }
                this.isloading = false;
              },
              fail: async () => {
                this.loadingerror++;
                this.loadingText = "登录失败";
                await this.$xlb_asyncSleep();
                this.isloading = false;
              },
            });
          }
        },
      });
    },
    /**
     * todo 登录
     */
    submit() {
      this.$refs.form
        .validate()
        .then((res) => {
          this.userAuth();
        })
        .catch((err) => {});
    },
    /**
     * todo 跳转到注册
     */
    goResit() {
      uni.navigateTo({
        url: this.GOTO_PageFn("resist"),
      });
    },
    /**
     * todo 获取静态资源路径
     */
    stitchStaticResourcePath() {
      const { loginBG, formUserIcon, formPasswordIcon } = this.CONF_OSSBaseip;
      this.loginBG = loginBG;
      this.formUserIcon = formUserIcon;
      this.formPasswordIcon = formPasswordIcon;
    },
    // todo 2.校验账号
    userlogin() {
      const this_ = this;
      this.loadingText = "账号校验中...";
      this.isloading = true;

      uniCloud.callFunction({
        name: "userlogin",
        data: {
          api: "usrloginapi",
          token: uni.getStorageSync(this.$xlb_staticEdit["token_KEY"]),
          username: this.form.name,
          password: this.form.password,
        },
        success: ({ result }) => {
          if (result.code == 400) {
            uni.setStorageSync(this.$xlb_staticEdit["token_KEY"], "");
            this_.isloading = false;
            uni.showModal({
              content: result.errMsg,
              showCancel: false,
            });
          } else if (result.code == 202) {
            this_.isloading = false;
            uni.showModal({
              content: result.message + ",是否创建?",
              showCancel: true,
              success: ({ confirm }) => {
                if (confirm) {
                  this_.createUserItem();
                } else {
                  uni.setStorageSync(this.$xlb_staticEdit["token_KEY"], "");
                }
              },
            });
          } else if (result.code == 200) {
            this_.isloading = false;
            // qk 账号创建成功
            this_.createAfterGo(result);
          } else {
            uni.setStorageSync(this.$xlb_staticEdit["token_KEY"], "");
            this_.isloading = false;
            errMsg("失败(未知错误)");
          }
        },
        fail(error) {
          uni.setStorageSync(this.$xlb_staticEdit["token_KEY"], "");
          console.log(error);
          this_.isloading = false;
          errMsg("账号创建失败");
        },
      });
    },
    // todo 1.登录授权
    userAuth() {
      const this_ = this;
      uni.login({
        provider: "weixin",
        success: ({ code }) => {
          this.loadingText = "验证微信权限中...";
          this.isloading = true;

          uniCloud.callFunction({
            name: "userlogin",
            data: {
              api: "weixinAuthor",
              code,
            },
            success: async ({ result }) => {
              if (result.code == 400) {
                this_.isloading = false;
                uni.showModal({
                  content: result.errMsg,
                  showCancel: false,
                });
              } else if (result.code == 200) {
                await this_.loadingfn(result.message);
                uni.setStorageSync(
                  this.$xlb_staticEdit["token_KEY"],
                  result.token
                );
                this_.isloading = false;

                this_.userlogin();
              } else {
                this_.isloading = false;
                errMsg("失败(未知错误)");
              }
            },
            fail(err) {
              console.log("授权失败", err);
              this_.isloading = false;
              errMsg("授权失败");
            },
          });
        },
        fail: (error) => {
          console.log("Code授权失败", error);
          errMsg("Code授权失败");
        },
      });
    },
    // todo 创建账号
    createUserItem() {
      const this_ = this;
      this.loadingText = "账号创建中...";
      this.isloading = true;

      uniCloud.callFunction({
        name: "userlogin",
        data: {
          api: "addUsername",
          username: this_.form.name,
          password: this_.form.password,
          token: uni.getStorageSync(this.$xlb_staticEdit["token_KEY"]),
        },
        success: ({ result }) => {
          if (result.code == 400) {
            uni.setStorageSync(this.$xlb_staticEdit["token_KEY"], "");
            this_.isloading = false;
            uni.showModal({
              content: result.errMsg,
              showCancel: false,
            });
          } else if (result.code == 200) {
            this_.isloading = false;
            // qk 账号创建成功
            this_.createAfterGo(result);
          } else {
            uni.setStorageSync(this.$xlb_staticEdit["token_KEY"], "");
            this_.isloading = false;
            errMsg("失败(未知错误)");
          }
        },
        fail: (err) => {
          console.log(err);
          uni.setStorageSync(this.$xlb_staticEdit["token_KEY"], "");
          this_.isloading = false;
          errMsg("账号创建失败");
        },
      });
    },
    // todo 账号创建成功后或者登录成功后的提示和跳转
    async createAfterGo(result) {
      this.isloading = true;
      try {
        await this.loadingfn(result.message);
        await this.loadingfn("加载数据中...");
        this.isSaveAccunt(2);
        uni.switchTab({ url: this.GOTO_PageFn("center") });
      } finally {
        this.isloading = false;
      }
    },
    // todo 加载间断
    loadingfn(message = "加载中...") {
      return new Promise(async (resolve, reject) => {
        try {
          this.loadingText = message;
          await this.$xlb_asyncSleep();
          resolve(true);
        } catch (error) {
          console.log(error);
          resolve(true);
        }
      });
    },
    /**
     * todo 是否记住账号
     * num:1 读取 2: 存储
     */
    isSaveAccunt(num) {
      try {
        switch (num) {
          case 1:
            const result = uni.getStorageSync(
              this.$xlb_staticEdit["account_KEY"]
            );
            const { name, password } = result;
            Object.assign(this.form, {
              name: name || "",
              password: password || "",
            });
            this.checkFlag = password ? true : false;
            break;
          case 2:
            if (this.isSave) {
              this.$store.commit("user/saveUsername", this.form.name || "");
              uni.setStorageSync(
                this.$xlb_staticEdit["account_KEY"],
                this.form
              );
            } else {
              this.$store.commit("user/saveUsername", this.form.name || "");
              uni.setStorageSync(this.$xlb_staticEdit["account_KEY"], {
                name: this.form.name,
                password: "",
              });
            }
            break;
          default:
            break;
        }
      } catch (error) {
        console.log(error);
      }
    },
    /**
     * todo 调试
     */
    tiaoshiEvent() {
      uni.getSystemInfo({
        success(res) {
          uni.setClipboardData({
            data: JSON.stringify(res),
            showToast: true,
          });
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.login__ {
  /* 调试 */
  .tiaoshitext {
    position: absolute;
    top: 90%;
    right: 50rpx;
    color: rgba(0, 29, 176, 0.3);
  }
  /* 游客身份登录 */
  .touristLogin {
    position: absolute;
    width: 90%;
    top: 1400rpx;
    left: 30rpx;
    padding-left: 50rpx;
    display: flex;
    justify-content: flex-start;
    align-items: flex-end;
    .Go {
      padding: 0;
      background-color: #f3f5f6;
      width: 40px;
      overflow: hidden;
      border: 1px solid rgba(0, 29, 176, 0.3);
      color: rgba(0, 29, 176, 0.3);
      height: 40px;
      border-radius: 10px;
      font-size: 16px;
      line-height: 38px;
      &:active {
        background-color: #9dbff3;
      }
    }
    .text {
      flex: 1;
      color: rgba(0, 29, 176, 0.3);
      padding: 0 0 8px 10px;
    }
  }
  /* 是否记住密码 */
  .isSave {
    position: absolute;
    width: 50%;
    height: 14px;
    top: 1300rpx;
    left: 30rpx;
    transform: scale(0.7);
    color: rgb(154, 157, 216);
  }
  /* 忘记密码 */
  .forgetPassword {
    position: absolute;
    width: 73px;
    height: 14px;
    top: 1154rpx;
    left: 90rpx;

    color: rgb(154, 157, 216);
    font-family: Noto Sans SC;
    font-size: 14px;
    font-weight: 400;
    line-height: 14px;
    letter-spacing: 0px;
    text-align: left;
  }
  /* 操作按钮区 */
  .handleBtns {
    position: absolute;
    top: 1112rpx;
    left: 410rpx;
    .login-btn {
      width: 145px;
      height: 55px;
      color: white;
      font-size: 16px;
      line-height: 55px;
      background: rgb(13, 43, 68);
      /* 登录按钮阴影 */
      box-shadow: 0px 7px 40px rgba(0, 29, 176, 0.3);
      border-radius: 40px;
      &:active {
        opacity: 0.6;
      }
    }
  }
  /* 表单区 */
  .login-form {
    position: relative;
    width: 325px;
    height: 130px;
    top: 802rpx;
    left: 50rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;

    background: rgba(255, 255, 255, 0.8);
    box-shadow: 0px 40rpx 120rpx rgba(55, 62, 125, 0.05);
    border-radius: 25px;
    ::v-deep .uni-forms {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      form {
        .uni-forms-item {
          margin-bottom: 0;
          .uni-forms-item__error {
            top: 75% !important;
            right: 10% !important;
            left: unset !important;
          }
          .uni-forms-item__content {
            display: flex;
            justify-content: flex-start;
            align-items: center;
          }
          .item-icon {
            width: 32px;
            border-radius: $uni-border-radius-base;
            height: 32px;
            display: flex;
            justify-content: center;
            align-items: center;
            &.name {
              background-color: #ffebe4;
            }
            &.password {
              background-color: #ebecff;
            }
            image {
              width: 50%;
            }
          }
          .uni-easyinput {
            .uni-easyinput__content {
              background-color: transparent !important;
            }
            input {
              color: rgb(147, 149, 164);
            }
          }
        }
      }
    }

    .form-name {
      height: 100%;
    }
    .form-password {
      height: 100%;
    }
    .form-line {
      width: 295.5px;
      height: 0.5px;
      background: rgb(229, 231, 243);
      margin: 9px 0;
    }
  }
  .login-bg {
    position: absolute;
  }
  .login-title {
    /* 登录 */
    position: absolute;
    width: 65px;
    height: 32px;
    top: 686rpx;
    left: 310rpx;

    color: rgb(25, 28, 50);
    font-size: 32px;
    font-weight: 700;
    line-height: 32px;
    letter-spacing: 0px;
    text-align: center;
  }
}
</style>
