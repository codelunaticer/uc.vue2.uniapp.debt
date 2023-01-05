<!--
 * @Author: BORING GHOST
 * @Date: 2022-10-11 15:10:38
 * @LastEditTime: 2022-10-12 14:46:43
 * @Description: 
-->
<template>
  <view class="XlbLoading">
    <view class="loading-container" :style="{ backgroundColor: bg }">
      <view class="icon">
        <image
          :src="loadingPath"
          style="width: 100%; height: 100%"
          mode="widthFix"
        />
      </view>
      <view class="text"> {{ text }} </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "XlbLoading",
  data() {
    return {
      loadingPath: "",
      bg: "rgba(44, 62, 80, 0.9)",
    };
  },
  props: {
    text: {
      type: String,
    },
    error: {
      type: Number,
    },
  },
  watch: {
    error: {
      handler() {
        this.bg = "#cc463d";
        setTimeout(() => {
          this.bg = "rgba(44, 62, 80, 0.9)";
        }, 1000);
      },
    },
  },
  created() {
    this.splitStaticUrl();
  },
  methods: {
    /**
     * todo 处理静态资源
     */
    splitStaticUrl() {
      const { loadingPath } = this.CONF_OSSBaseip;
      this.loadingPath = loadingPath;
    },
  },
};
</script>

<style lang="scss" scoped>
.XlbLoading {
  z-index: 99;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  .loading-container {
    position: relative;
    top: 45%;
    left: 50%;
    width: 80%;
    transform: translateX(-50%);
    box-shadow: 0px 7px 40px rgba(44, 62, 80, 0.3);
    border-radius: 8px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    .icon {
      width: 55px;
      height: 55px;
      padding: 10px;
      box-sizing: border-box;
    }
    .text {
      color: #ededf1;
      flex: 1;
      height: 20px;
      padding-right: 10px;
      text-align: center;
      box-sizing: border-box;
      overflow: hidden;
      font-size: 14px;
      text-overflow: ellipsis;
      white-space: nowrap; //单行超出显示省略号
    }
  }
}
</style>
