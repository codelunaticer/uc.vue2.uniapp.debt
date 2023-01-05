<!--
 * @Author: BORING GHOST
 * @Date: 2022-10-11 11:10:09
 * @LastEditTime: 2022-10-22 21:21:20
 * @Description: 债务
-->
<template>
  <view class="debt">
    <xlb-loading
      v-show="isloading"
      :error="error"
      :text="loadingText"
    ></xlb-loading>
    <!-- 模块 -->
    <view @click="gotoModule" class="module-box">
      <image
        style="width: 100%; height: 100%"
        src="../../static/tabbar/unknown.png"
        mode="widthFix"
      />
    </view>
    <!-- 上部分 -->
    <view v-if="!loading" class="top-container">
      <!-- 年份选择器 -->
      <uni-data-select
        v-model="year_value"
        :localdata="range"
        :clear="false"
        placeholder="选择年份"
        @change="change"
      ></uni-data-select>
      <view class="title">剩余</view>
      <view class="jieyu">
        <view class="wei-jieyu" v-if="shenyu < 0" style="color: #fa1919">
          <view class="wei-icon">
            <uni-icons type="info-filled" color="#fa1919" size="25"></uni-icons>
            危
          </view>
          <view class="xiushi-jieyu"> 结余:{{ jieyu }} </view>
          <view class="xiushi-jiekuan"> 借款:{{ jiekuan }} </view>
          {{ shenyu }}
        </view>
        <view class="wei-jieyu" v-else>
          <view class="xiushi-jieyu"> 结余:{{ jieyu }} </view>
          <view class="xiushi-jiekuan"> 借款:{{ jiekuan }} </view>
          {{ shenyu }}
        </view>
      </view>
      <view class="zhichuheshouru">
        <view class="shouru item">
          <view class="label">收入</view>
          <view class="jine">{{ shouru }}</view>
        </view>
        <view class="xiu">|</view>
        <view class="zhichu item">
          <view class="label">支出</view>
          <view class="jine">{{ zhichu }}</view>
        </view>
      </view>
    </view>
    <view class="load-mask" v-else>loading...</view>
    <!-- 内容部分 -->
    <view class="content-container">
      <view
        class="list"
        style="border-bottom: 2px solid rgba(106, 106, 106, 0.4)"
      >
        <view>月份</view>
        <view>收入</view>
        <view>支出</view>
        <view>结余</view>
        <view>借款</view>
      </view>
      <template v-if="tablelist.length > 0">
        <view v-for="(item, index) in tablelist" :key="index" class="list">
          <view>{{ item.month + "月" }}</view>
          <view>{{ item.shouru }}</view>
          <view>{{ item.zhichu }}</view>
          <view>{{ item.jieyu }}</view>
          <view>{{ item.jiekuan }}</view>
        </view>
      </template>
      <view style="color: #6a6a6a; text-align: center; padding: 15px 0" v-else>
        没有任何消费记录
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "debt",
  components: {},
  props: {},
  data() {
    return {
      loading: true,
      // qk 金额部分
      shenyu: 0,
      jieyu: 0,
      shouru: 0,
      zhichu: 0,
      jiekuan: 0,
      tablelist: [],
      // qk 年份下拉框
      year_value: "",
      range: [],
      //qk loading
      error: 1,
      loadingText: "",
      loadingCount: 0,
    };
  },
  onLoad() {
    this.dataList();
  },
  computed: {
    isloading() {
      return this.loadingCount > 0;
    },
  },
  // todo 下拉刷新
  onPullDownRefresh() {
    this.change(this.year_value);
    uni.stopPullDownRefresh();
  },
  methods: {
    // todo 前往某一个模块
    gotoModule() {
      uni.showActionSheet({
        itemList: ["加一笔消费", "加一笔收入", "账单记录", "欠款记录"],
        success: ({ tapIndex }) => {
          if (tapIndex === 0) {
            // 加一笔消费
            uni.navigateTo({ url: this.GOTO_PageFn("pay") });
          } else if (tapIndex === 1) {
            // 加一笔收入
            uni.navigateTo({ url: this.GOTO_PageFn("shouru") });
          } else if (tapIndex === 2) {
            // 账单记录
            uni.navigateTo({ url: this.GOTO_PageFn("historybill") });
          } else if (tapIndex === 3) {
            // 欠款记录
            uni.navigateTo({ url: this.GOTO_PageFn("qiankuan") });
          }
          console.log(tapIndex);
        },
        fail: (error) => {},
      });
    },
    dataList() {
      // qk 年份下拉框出处理
      let timearr = [];
      for (let k = 2022, len = 2100; k < len; k++) {
        timearr.push({
          value: k,
          text: k + "年",
        });
      }
      this.range = timearr;
      const date = new Date();
      const year = date.getFullYear(); //默认查询当前年份
      this.year_value = year;
      this.getYearHistory(year);
      // qk
      this.getUserToastinfo();
    },
    // todo 查询年份历史记录
    async getYearHistory(year) {
      if (!year) return;
      try {
        this.loadingCount++;
        this.loadingText = "历史记录查询中...";
        uniCloud.callFunction({
          name: "other",
          data: {
            api: "readYearOrMonthBills",
            username: this.$store.state.user.username || "",
            year: year,
            token: uni.getStorageSync(this.$xlb_staticEdit["token_KEY"]) || "",
          },
          success: async ({ result }) => {
            try {
              if (result.code === 400) {
                this.error++;
                this.loadingText = result.message;
                await this.$xlb_asyncSleep();
              } else {
                this.tablelist = result.data;
                this.loadingText = "历史记录读取完成";
              }
            } catch (error) {
              this.error++;
              this.loadingText = "历史记录处理异常";
              await this.$xlb_asyncSleep();
            }
            this.loadingCount--;
          },
          fail: async (error) => {
            console.log(error);
            this.error++;
            this.loadingText = "历史记录处理失败";
            await this.$xlb_asyncSleep();
            this.loadingCount--;
          },
        });
      } catch (error) {
        console.log(error);
        this.error++;
        this.loadingText = "历史记录处理失败";
        await this.$xlb_asyncSleep();
        this.loadingCount--;
      }
    },
    // todo 查询账号总资金记录
    getUserToastinfo() {
      this.loading = true;
      this.loadingCount++;
      this.loadingText = "总资金查询中...";
      uniCloud.callFunction({
        name: "other",
        data: {
          api: "readTotalsprice",
          id: this.$store.state.user._id || "",
          token: uni.getStorageSync(this.$xlb_staticEdit["token_KEY"]) || "",
        },
        success: async ({ result }) => {
          try {
            if (result.code === 200) {
              const { jieyu, shouru, zhichu, jiekuan } = result.data;
              this.shenyu = Number((jieyu - jiekuan).toFixed(2));
              this.jiekuan = jiekuan;
              this.jieyu = jieyu;
              this.shouru = shouru;
              this.zhichu = zhichu;
              this.loadingText = "总资金处理成功";
            } else {
              this.error++;
              this.loadingText = result.message;
              await this.$xlb_asyncSleep();
            }
          } catch (error) {
            console.log(error);
            this.error++;
            this.loadingText = "总资金处理异常";
            await this.$xlb_asyncSleep();
          }
          this.loadingCount--;
          this.loading = false;
        },
        fail: async () => {
          this.error++;
          this.loadingText = "总资金处理失败";
          await this.$xlb_asyncSleep();
          this.loadingCount--;
          this.loading = false;
        },
      });
    },
    // todo 年份下拉框发生变化
    change(e) {
      this.getYearHistory(e);
      this.getUserToastinfo();
    },
  },
  watch: {},
};
</script>

<style lang="scss" scoped>
.debt {
  .module-box {
    position: fixed;
    top: 20rpx;
    right: 30rpx;
    width: 30px;
    height: 30px;
    border-radius: 5px;
    padding: 5px;
    background-color: #f5f6f7;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.5);
  }
  /* 内容部分 */
  .content-container {
    min-height: 50px;
    background-color: white;
    font-size: 14px;
    color: #6a6a6a;
    .list {
      width: 100%;
      display: flex;
      justify-content: space-around;
      padding: 10px 0;
    }
  }
  .load-mask {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 150px;
    background-color: #feda46;
    color: #f5f6f7;
    font-weight: 700;
  }
  /* 上部分 */
  .top-container {
    width: 100%;
    height: 200px;
    background-color: #feda46;
    ::v-deep .uni-stat__select {
      width: 90px;
      margin-left: 30px;
      .uni-select {
        border: 0 solid #feda46;
        font-weight: 700;
      }
      .uni-icons {
        font-weight: 700;
        color: black !important;
      }
    }

    .title {
      text-align: center;
      font-size: 16px;
    }
    .jieyu {
      text-align: center;
      font-size: 25px;
      font-weight: 700;
      color: black;
      margin: 20px 0;
      .wei-jieyu {
        position: relative;
        .xiushi-jieyu {
          position: absolute;
          bottom: -20px;
          left: 20px;
          font-size: 12px;
          letter-spacing: 1px;
        }
        .xiushi-jiekuan {
          position: absolute;
          bottom: -20px;
          right: 20px;
          font-size: 12px;
          letter-spacing: 1px;
        }
        .wei-icon {
          position: absolute;
          top: -48px;
          left: 56%;
          font-size: 14px;
        }
      }
    }
    .zhichuheshouru {
      margin-top: 40px;
      display: flex;
      width: 100%;
      justify-content: space-around;
      align-items: center;
      .item {
        display: flex;
        justify-content: space-around;
        align-items: center;
      }
      .xiu {
        font-weight: 700;
      }
      .label {
        font-size: 16px;
        margin-right: 16px;
      }
      .jine {
        font-size: 20px;
        font-weight: 700;
        color: black;
      }
    }
  }
}
</style>
