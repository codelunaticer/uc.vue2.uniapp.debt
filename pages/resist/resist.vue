<!--
 * @Author: BORING GHOST
 * @Date: 2022-10-09 16:18:19
 * @LastEditTime: 2022-10-11 11:10:45
 * @Description: 注册
-->
<template>
  <view class="resist">
    <!-- 背景 -->
    <image class="image-bg" :src="resistBG" mode="widthFix" />
    <!-- 标题 -->
    <view class="title">创建新ID</view>
    <!-- logo -->
    <view class="logo">
      <image
        :src="resistProfile"
        style="width: 100%; height: 100%"
        mode="scaleToFill"
      />
    </view>
    <!-- 内容 -->
    <view class="content">
      <uni-forms ref="form" :model="form">
        <uni-forms-item name="id">
          <view class="icon">
            <uni-icons
              color="#00c889"
              type="personadd-filled"
              size="30"
            ></uni-icons>
          </view>
          <input
            placeholder="读取到的ID会在这里显示~"
            disabled
            v-model="form.id"
            type="text"
          />
        </uni-forms-item>
      </uni-forms>
      <!-- 复制 -->
      <view @click="copyID" class="xlb-text-base copy-text">
        复制ID到剪切板
      </view>
      <!-- 提交按钮 -->
      <button @click="resist" class="submit-btn">读取自己的ID</button>
      <!-- 提示信息 -->
      <view class="tip-text">
        <uni-icons class="icon" type="chatboxes" size="20"></uni-icons>
        <view class="text">
          痞老板太懒惰了~没有开启自动注册功能!获取ID后请将ID复制后发给痞老板,他会亲自将您的ID给予授权~
        </view>
      </view>
      <!-- 前往登录页 -->
      <view @click="goLogin" class="gotoLogin">
        <uni-icons type="back" color="rgb(154, 157, 216)" size="14"></uni-icons>
        返回登录
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "resist",
  components: {},
  props: {},
  data() {
    return {
      form: {
        id: "",
      },
      // qk 静态资源
      resistBG: "",
      resistProfile: "",
    };
  },
  computed: {},
  onLoad() {
    this.readStaticURL();
  },
  methods: {
    /**
     * todo 复制ID到剪切板
     */
    copyID() {
      uni.setClipboardData({
        data: this.form.id,
        showToast: true,
      });
    },
    /**
     * todo 处理静态资源
     */
    readStaticURL() {
      const { resistBG, resistProfile } = this.CONF_OSSBaseip;
      this.resistBG = resistBG;
      this.resistProfile = resistProfile;
    },
    /**
     * todo 注册
     */
    resist() {
      uni.showModal({
        title: "哈啰",
        content: "做选择前请三思而后行!",
        showCancel: true,
        success: async ({ confirm }) => {
          if (confirm) {
            try {
              const this_ = this;
              uni.showLoading({
                title: "微信授权中...",
                mask: true,
              });
              const code = await this.getCode();
              uni.showLoading({
                title: "ID读取中...",
                mask: true,
              });
              uniCloud.callFunction({
                name: "userlogin",
                data: {
                  api: "readweixinID",
                  code,
                },
                success({ result }) {
                  if (result.code === 400) {
                    uni.hideLoading();
                    uni.showModal({
                      content: result.errMsg,
                      showCancel: false,
                      success: ({ confirm, cancel }) => {},
                    });
                  } else if (result.code === 200) {
                    uni.hideLoading();
                    uni.showModal({
                      content: result.message,
                      showCancel: false,
                      success: () => {
                        this_.form.id = result.id;
                      },
                    });
                  } else {
                    uni.hideLoading();
                    uni.showToast({
                      title: "失败(未知错误)",
                      icon: "error",
                      duration: 2000,
                    });
                  }
                },
                fail(err) {
                  uni.hideLoading();
                  uni.showToast({
                    title: "读取失败",
                    icon: "error",
                    duration: 2000,
                  });
                  console.log(err);
                },
              });
            } catch (error) {
              console.log(error);
            }
          }
        },
        fail: () => {
          console.log("失败");
        },
      });
    },
    /**
     * 获取code
     */
    getCode() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          uni.login({
            provider: "weixin",
            success: function ({ code }) {
              resolve(code);
            },
            fail(err) {
              reject(err);
            },
          });
        }, 2000);
      });
    },
    /**
     * todo 前往登录页面
     */
    goLogin() {
      uni.navigateBack({
        delta: 1,
      });
    },
  },
  watch: {},
  // 页面周期函数--监听页面初次渲染完成
  onReady() {},
  // 页面周期函数--监听页面显示(not-nvue)
  onShow() {},
  // 页面周期函数--监听页面隐藏
  onHide() {},
  // 页面周期函数--监听页面卸载
  onUnload() {},
  // 页面处理函数--监听用户下拉动作
  // onPullDownRefresh() { uni.stopPullDownRefresh(); },
  // 页面处理函数--监听用户上拉触底
  // onReachBottom() {},
  // 页面处理函数--监听页面滚动(not-nvue)
  // onPageScroll(event) {},
  // 页面处理函数--用户点击右上角分享
  // onShareAppMessage(options) {},
};
</script>

<style lang="scss" scoped>
.resist {
  /* 内容 */
  .content {
    position: absolute;
    width: 335px;
    height: 576.67px;
    top: 276.66rpx;
    left: 50%;
    transform: translateX(-50%);

    background: rgb(255, 255, 255);
    border-radius: 30px;
    .copy-text {
      font-size: 14px;
      width: 300px;
      height: 14px;
      margin: 0 auto 0 auto;
      text-align: right;
    }
    /* 返回按钮(前往登录页) */
    .gotoLogin {
      width: 300px;
      height: 14px;
      margin: 70px auto 0 auto;
      color: rgb(154, 157, 216);
      font-size: 14px;
      font-weight: 400;
      line-height: 14px;
      letter-spacing: 0px;
    }
    /* 提示信息 */
    .tip-text {
      margin: 39px auto 0 auto;
      width: 300px;
      height: 100px;
      box-sizing: border-box;
      padding: 14px;

      background: rgb(251, 251, 253);
      border-radius: 17px;
      position: relative;
      .icon {
        position: absolute;
        top: 14px;
        left: 14px;
      }
      .text {
        color: rgba(6, 2, 32, 0.5);
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
        letter-spacing: 0px;
        text-align: left;
        text-indent: 2em;
      }
    }
    /* 按钮 */
    .submit-btn {
      width: 228.62px;
      height: 51.89px;
      background-color: #00c888;
      color: white;
      font-size: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 25.95px;
      margin-top: 56px;
    }
    /* 表单 */
    ::v-deep .uni-forms {
      padding: 108.9px 14px 0 14px;
      .uni-forms-item {
        margin-bottom: 5px;
      }
      .uni-forms-item__content {
        display: flex;
        justify-content: center;
        padding-left: 8px;
        align-items: center;
        background: rgb(251, 251, 253);
        border-radius: 10px;
        .icon {
          margin-right: 10px;
          background: rgba(0, 200, 137, 0.1);
          border-radius: 10px;
          width: 40.66px;
          height: 37.01px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        input {
          color: rgba(6, 2, 32, 0.5);
          flex: 1;
          height: 48.54px;
          margin: 0 auto;
          font-size: 14px;
        }
      }
    }
  }
  /* logo */
  .logo {
    position: absolute;
    width: 89px;
    height: 78px;
    top: 226.64rpx;
    left: 285rpx;
    z-index: 5;
    background: rgb(255, 255, 255);
    box-shadow: 0px 4px 20px rgba(171, 214, 255, 0.25);
    border-radius: 25px;
    overflow: hidden;
  }
  /* 标题 */
  .title {
    position: absolute;
    top: 142rpx;
    left: 281.76rpx;

    color: rgb(6, 2, 32);
    font-family: Noto Sans SC;
    font-size: 23px;
    font-weight: 700;
    line-height: 20px;
    letter-spacing: -0.23999999463558197px;
    text-align: center;
  }
  /* 背景 */
  .image-bg {
    position: absolute;
    width: 100%;
  }
}
</style>
