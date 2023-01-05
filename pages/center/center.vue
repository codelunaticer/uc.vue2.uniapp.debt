<!--
 * @Author: BORING GHOST
 * @Date: 2022-10-11 11:07:34
 * @LastEditTime: 2022-10-22 21:15:45
 * @Description: 个人中心
-->
<template>
  <div class="center">
    <xlb-loading
      v-show="isloading"
      :error="error"
      :text="loadingText"
    ></xlb-loading>
    <!-- 背景 -->
    <view class="BG"></view>
    <!-- 刷新按钮 -->
    <view
      style="
        background-color: black;
        box-shadow: 0px 7px 10px rgba(0, 0, 0, 0.5);
      "
      class="xlb-refresh"
      @click="getUserInfo"
    >
      <uni-icons type="refresh-filled" color="#fff" size="24" />
    </view>
    <!-- 设置 -->
    <view @click="setting" class="setting">
      <uni-icons type="gear-filled" size="35"></uni-icons>
    </view>
    <!-- 头像 -->
    <view class="avatar">
      <image
        class="xlb-avatar"
        :src="avatar"
        mode="scaleToFill"
        @error="avatar = defaultImg"
      />
      <view
        v-show="isloading"
        style="background-color: white"
        class="xlb-mask-box"
      >
        loading...
      </view>
    </view>
    <!-- 网名 -->
    <view class="usernames">
      <view class="name">{{ userinfo.asia || userinfo.username || "" }}</view>
      <view class="description">{{ userinfo.description }}</view>
    </view>
    <!-- 模块 -->
    <view class="modules">
      <view class="module_item">
        <view class="number">03</view>
        <view class="name">收藏</view>
      </view>
      <view class="module_item">
        <view class="number">02</view>
        <view class="name">观看历史</view>
      </view>
      <view class="module_item">
        <view class="number">08</view>
        <view class="name">下载</view>
      </view>
    </view>
    <!-- 内容 -->
    <view class="content">
      <!-- tab -->
      <view class="tabs">
        <button class="btns">收藏</button>
        <button class="btns">观看历史</button>
        <button class="btns">下载</button>
      </view>

      <!-- content -->
      <!-- <view class="content-box">
        <template v-for="(item, index) in imglist">
          <view class="item" :key="index">
            <image class="xlb-image" :src="item" mode="widthFix" />
          </view>
        </template>
      </view> -->
    </view>
  </div>
</template>

<script>
import defaultImg from "@/static/default.png";
export default {
  name: "center",
  components: {},
  props: {},
  data() {
    return {
      defaultImg,
      imglist: ["", "", "", "", "", "", "", ""],
      //qk loading
      error: 1,
      loadingText: "",
      loadingCount: 0,
    };
  },
  computed: {
    isloading() {
      return this.loadingCount > 0;
    },
    // qk 头像
    avatar() {
      return this.$store.state.user.avatar || this.defaultImg;
    },
    // qk 用户信息
    userinfo() {
      return this.$store.state.user.other || {};
    },
  },
  // 页面周期函数--监听页面加载
  onLoad() {
    this.dataList();
  },
  methods: {
    dataList() {
      this.getUserInfo();
    },
    /**
     * todo 设置
     */
    setting() {
      uni.showActionSheet({
        itemList: ["修改资料", "退出登录"],
        success: (res) => {
          const num = res.tapIndex + 1;
          if (num == 1) {
            // qk 修改资料
            uni.navigateTo({ url: this.GOTO_PageFn("modifyData") });
          } else if (num == 2) {
            // qk 退出登录
            this.$store.dispatch("user/loginout");
          }
        },
        fail: function (res) {
          console.log(res.errMsg);
        },
      });
    },
    /**
     * todo 获取用户信息
     */
    async getUserInfo() {
      this.loadingCount++;
      this.loadingText = "查询用户信息中...";
      try {
        const { code, message } = await this.$store.dispatch(
          "user/updateuserinfo"
        );
        if (code === 400) {
          this.error++;
          this.loadingText = message;
          await this.$xlb_asyncSleep();
          this.loadingCount--;
        } else if (code === 200) {
          this.loadingCount--;
        } else {
          this.loadingText = "失败(未知错误)";
          await this.$xlb_asyncSleep();
          this.loadingCount--;
        }
      } catch (error) {
        this.loadingText = "用户信息获取失败";
        await this.$xlb_asyncSleep();
        this.loadingCount--;
        console.log(error);
      }
    },
  },

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
.center {
  .content {
    position: absolute;
    width: 100%;
    min-height: 50vh;
    top: 800rpx;
    left: 0;

    background: rgb(255, 255, 255);
    box-shadow: 0px -3px 34px rgba(53, 64, 90, 0.09);
    border-radius: 31px 31px 0px 0px;
    .content-box {
      display: flex;
      justify-content: space-around;
      align-items: center;
      flex-wrap: wrap;
      width: 100%;
      .item {
        margin: 10px 0;
        width: 40%;
        height: 190px;
        box-shadow: 0px 3px 15px rgba(97, 97, 97, 0.53);
        border-radius: 16.52px;
        overflow: hidden;
        .xlb-image {
          height: 100% !important;
        }
      }
    }
    .tabs {
      width: 100%;
      height: 50px;
      margin: 20px 0;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 0 20px;
      box-sizing: border-box;
    }
    .btns {
      height: 30px;
      margin: 0 10px;
      border: 1px solid gray;
      line-height: 28px;
      font-size: 14px;
      padding: 0 4px;
      text-align: center;
      box-shadow: 0px 18px 32px rgba(245, 246, 247, 0.44);
      border-radius: 6px;
      &:hover {
        background-color: rgb(255, 198, 0);
        font-weight: 700;
        color: black;
        border: 1px solid rgb(255, 198, 0);
        box-shadow: 0px 18px 32px rgba(255, 198, 0, 0.44);
      }
    }
  }
  /* 模块 */
  .modules {
    position: absolute;
    box-sizing: border-box;
    padding: 0 10px;
    top: 620rpx;
    left: 50%;
    width: 80%;
    height: 70px;
    transform: translateX(-50%);
    background: rgb(255, 255, 255);
    border-radius: 8px;
    box-shadow: 0px 19px 43px rgba(53, 64, 90, 0.13);
    display: flex;
    justify-content: space-around;
    align-items: center;
    .module_item {
      flex: 1;
      width: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;
      .number {
        text-align: center;
        font-size: 20px;
        color: rgb(53, 64, 90);
        font-weight: 700;
      }
      .name {
        text-align: center;
        font-size: 12px;
        font-weight: 500;
        line-height: 18px;

        opacity: 0.38;
        color: rgb(53, 64, 90);
      }
    }
  }
  /* 网名 */
  .usernames {
    width: 100%;
    position: absolute;
    top: 500rpx;
    .name {
      color: rgb(53, 64, 90);
      font-size: 24px;
      font-weight: 700;
      display: flex;
      width: 100%;
      justify-content: center;
      align-items: center;
      min-height: 20px;
    }
    .description {
      font-size: 14px;
      color: rgb(178, 182, 192);
      font-weight: 700;
      text-align: center;
      line-height: 25px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap; //单行超出显示省略号
      min-height: 25px;
    }
  }
  /* 头像 */
  .avatar {
    position: absolute;
    overflow: hidden;
    width: 109px;
    height: 108.6px;
    top: 240rpx;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 50%;
    box-sizing: border-box;
    box-shadow: 0px 16px 25px rgba(100, 140, 155, 0.61);
  }
  /* 设置 */
  .setting {
    position: absolute;
    width: 35px;
    height: 35px;
    top: 189.52rpx;
    right: 80rpx;
  }
  /* 背景 */
  .BG {
    position: absolute;
    background-color: #f5f6f7;
    width: 100vw;
    height: 100vh;
    z-index: -1;
  }
}
</style>
