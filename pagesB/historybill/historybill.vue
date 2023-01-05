<!--
 * @Author: BORING GHOST
 * @Date: 2022-10-20 09:11:16
 * @LastEditTime: 2022-10-21 14:47:46
 * @Description: 
-->
<template>
  <view class="historybill__">
    <!-- 下拉框区域 -->
    <view class="selects">
      <uni-data-select
        v-model="year_value"
        :localdata="year_range"
        :clear="false"
        placeholder="选择年份"
        @change="yearChange"
      ></uni-data-select>
      <!-- 年份选择器 -->
      <uni-data-select
        v-model="month_value"
        :localdata="month_range"
        :clear="false"
        placeholder="选择月份"
        @change="monthChange"
      ></uni-data-select>
    </view>
    <!-- 标题 -->
    <view class="bill-title">账单明细</view>
    <!-- 内容区域 -->
    <view class="content">
      <scroll-view scroll-y="true" class="scroll-Y">
        <template v-if="tablelist.length > 0">
          <view
            v-for="(item, index) in tablelist"
            :key="index"
            class="content-item"
          >
            <view class="_title bd-item">{{ item.date }}</view>
            <view
              v-for="item2 in item.list"
              :key="item2._id"
              class="module bd-item"
            >
              <template v-if="!loading">
                <view class="left">
                  <view class="name">{{ item2.name }}</view>
                  <view class="descripts">
                    <view class="time">{{ item2.time | formatDate }}</view>
                    <view class="dianpu">{{ item2.dianpu }}</view>
                  </view>
                </view>
                <view class="right">
                  <view style="color: #fa1919" v-if="item2.type === 'zhichu'">
                    -{{ item2.price }}
                  </view>
                  <view
                    style="color: #2085df"
                    v-else-if="item2.type === 'shouru'"
                  >
                    +{{ item2.price }}
                  </view>
                  <view v-else>{{ item2.price }}</view>
                </view>
              </template>
              <view v-else class="mask-box">Loading...</view>
            </view>
          </view>
        </template>
        <view class="mask" v-else>没有任何消费记录</view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
export default {
  name: "HistoryBill",
  data() {
    return {
      loading: true,
      // qk 下拉框
      year_value: "",
      year_range: [],
      month_value: "",
      month_range: [],
      // qk
      tablelist: [],
    };
  },
  onLoad() {
    this.yearMonthInfo();
  },
  // todo 下拉刷新
  onPullDownRefresh() {
    this.getYearMonthData(this.year_value, this.month_value);
    uni.stopPullDownRefresh();
  },
  methods: {
    /**
     * todo 查询某年某月的账单数据
     * @param {number} year 年份
     * @param {number} month 月份
     */
    getYearMonthData(year, month) {
      try {
        if (!year || !month) return;
        uni.showLoading({
          title: "加载中...",
          mask: true,
        });
        this.loading = true;
        uniCloud.callFunction({
          name: "other",
          data: {
            api: "readHistoryMonthBills",
            year,
            month,
            username: this.$store.state.user.username || "",
            token: uni.getStorageSync(this.$xlb_staticEdit["token_KEY"]) || "",
          },
          success: ({ result }) => {
            if (result.code === 200) {
              this.tablistDataDepose(result.data);
            } else {
              console.log(result);
            }
          },
          fail: (e) => {
            console.log(e);
          },
          complete: () => {
            uni.hideLoading();
            this.loading = false;
          },
        });
      } catch (error) {
        console.log(error);
        uni.hideLoading();
      }
    },
    // todo 将接口数据处理成tablelist可用数据
    tablistDataDepose(data) {
      try {
        let result = [];
        let weiyi = new Map();
        for (let k = 0, len = data.length; k < len; k++) {
          const item = data[k];
          let listItem = JSON.parse(JSON.stringify(item));
          listItem.price = item.price.toFixed(2);
          if (weiyi.has(item.day)) {
            // result中已经有这个日期的数据,直接push到list
            result[weiyi.get(item.day)]["list"].unshift(listItem);
          } else {
            // result中还没有这个日期的数据,创建
            const resultItem = {
              date: item.month + "月" + item.day + "日",
              list: [listItem],
            };
            result.push(resultItem);
            weiyi.set(item.day, result.length - 1);
          }
        }
        this.tablelist = result;
      } catch (error) {
        console.log(error);
      }
    },
    // todo 年月选择器变化
    yearChange(year) {
      this.getYearMonthData(year, this.month_value);
    },
    monthChange(month) {
      this.getYearMonthData(this.year_value, month);
    },

    // todo 年月份下拉框静态数据处理
    yearMonthInfo() {
      try {
        // qk 年
        let timearr = [];
        for (let k = 2022, len = 2100; k < len; k++) {
          timearr.push({
            value: k,
            text: k + "年",
          });
          this.year_range = timearr;
          // qk 月
          let montharr = [];
          for (let k = 1, len = 12; k <= len; k++) {
            montharr.push({
              value: k,
              text: k + "月",
            });
          }
          this.month_range = montharr;
        }
        // qk 初始化tablelist数据
        const date = new Date();
        this.year_value = date.getFullYear(); //获取当前年份
        this.month_value = date.getMonth() + 1; //获取当前月份
        this.getYearMonthData(this.year_value, this.month_value);
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.historybill__ {
  /* 内容区域 */
  .content {
    overflow: hidden;

    .scroll-Y {
      height: calc(100vh - 80px - 20px);
      padding: 0 10px;
      box-sizing: border-box;

      .content-item {
        border-radius: 10px;
        background-color: white;
        margin-bottom: 20px;
        font-size: 14px;
        ._title {
          color: #999999;
          height: 20px;
        }
        .module {
          display: flex;
          position: relative;
          .mask-box {
            width: 100%;
            height: 48px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .left {
            overflow: hidden;
            flex: 6;
            .name {
              font-weight: 500;
              color: black;
            }
            .descripts {
              padding-top: 5px;
              display: flex;
              justify-content: flex-start;
              align-items: center;
              color: #b9b8b8;
              .time {
                margin-right: 10px;
              }
            }
          }
          .right {
            overflow: hidden;
            flex: 3;
            font-weight: 700;
            font-size: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
        }
        .bd-item {
          padding: 5px 20px;
          border-bottom: 1px solid #e0dfdf;
        }
        .module:last-child.bd-item {
          border-bottom: 0px solid #e0dfdf;
        }
      }
      .mask {
        min-height: 100px;
        border-radius: 10px;
        display: flex;
        justify-content: center;
        color: #90a4ae;
        font-weight: 700;
        align-items: center;
      }
    }
  }
  /* 标题 */
  .bill-title {
    width: 100%;
    height: 40px;
    box-sizing: border-box;
    overflow: hidden;
    padding-left: 16px;
    display: flex;
    align-items: flex-start;
    color: #6a6a6a;
  }
  /* 下拉框 */
  .selects {
    width: 100%;
    height: 40px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-around;
    align-items: center;
    color: #6a6a6a !important;
    ::v-deep .uni-stat__select {
      .uni-select__selector-scroll {
        min-width: 70px;
      }
      .uni-select {
        border: 0 solid #feda46;
        font-weight: 700;
      }
      .uni-icons {
        font-weight: 700;
        color: #6a6a6a !important;
      }
    }
  }
}
</style>
