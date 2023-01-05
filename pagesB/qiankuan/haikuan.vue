<!--
 * @Author: BORING GHOST
 * @Date: 2022-10-20 15:46:23
 * @LastEditTime: 2022-10-22 21:13:48
 * @Description: 债务 还款列表
-->
<template>
  <view class="Haikuanlist_">
    <cover-view v-show="showerror" class="error-pop">
      {{ errortext }}
    </cover-view>
    <view
      class="addbtn"
      style="
        backgroud-color: #f5f6f7;
        height: 80px;
        box-sizing: border-box;
        overflow: hidden;
      "
    >
      <button class="add-btn" @click="showDrawer">新增还款安排</button>
    </view>
    <!-- 内容 -->
    <view class="content">
      <view v-for="item in billList" :key="item.id" class="item">
        <view v-if="item.ish" class="icon">还</view>
        <view class="left">
          <view class="price">
            <span style="margin-right: 10px">还款金额: </span>
            {{ item.price }}
          </view>
          <view class="time">
            <span style="margin-right: 10px">还款时间:</span>
            <span>{{ item.time | formatDateAll }}</span>
          </view>
        </view>
        <view class="btns">
          <view v-if="item.ish">已还</view>
          <view @click="updateCheck(item.id)" v-else class="no-h"
            >点击修改成以还</view
          >
        </view>
      </view>
    </view>
    <!-- 抽屉 -->
    <uni-drawer
      class="custom-drawer"
      :width="300"
      ref="showRight"
      mode="left"
      :mask-click="false"
    >
      <button class="close-btn" @click="closeDrawer">关闭</button>
      <scroll-view style="height: 100%" scroll-y="true">
        <!-- form表单 -->
        <uni-forms label-position="top" ref="form" :model="form">
          <uni-forms-item label="还款时间" name="time">
            <uni-datetime-picker returnType="timestamp" v-model="form.time" />
          </uni-forms-item>
          <uni-forms-item label="还款金额" name="price">
            <uni-number-box
              :step="0.11"
              :min="0"
              :max="88888"
              v-model="form.price"
            ></uni-number-box>
          </uni-forms-item>
        </uni-forms>
        <button class="close-btn" @click="submit">提交</button>
      </scroll-view>
    </uni-drawer>
  </view>
</template>

<script>
export default {
  name: "Haikuanlist",
  data() {
    return {
      showerror: false,
      errortext: "",
      billid: "",
      billList: [],
      // qk form 表单
      form: {},
      rules: {
        time: {
          rules: [
            {
              required: true,
              errorMessage: "请选择时间!",
            },
            {
              validateFunction: function (rule, value, data, callback) {
                if (!value || typeof value != "number") {
                  callback("请选择时间");
                }
                return true;
              },
            },
          ],
        },
        price: {
          rules: [
            {
              required: true,
              errorMessage: "请输入额度!",
            },
            {
              validateFunction: function (rule, value, data, callback) {
                if (value == 0) {
                  callback("请输入额度");
                }
                return true;
              },
            },
          ],
        },
      },
    };
  },
  // todo 下拉刷新
  onPullDownRefresh() {
    this.getQiantiaoApi();
    uni.stopPullDownRefresh();
  },
  onReady() {
    // 需要在onReady中设置规则
    this.$refs.form.setRules(this.rules);
  },
  onLoad(opt) {
    if (opt.name) {
      uni.setNavigationBarTitle({
        title: opt.name + "的欠条",
      });
    }
    if (opt.id) {
      this.billid = opt.id;
    }
    this.getQiantiaoApi();
  },
  methods: {
    // todo 欠条修改成已还
    updateCheck(id) {
      if (!id) {
        this.showerr("这是条没有id的欠条");
        return;
      }
      uni.showModal({
        title: "提示",
        content: "是否修改?",
        showCancel: true,
        success: ({ confirm, cancel }) => {
          if (confirm) {
            // 开始提交
            uni.showLoading({
              title: "修改中...",
              mask: true,
            });
            uniCloud.callFunction({
              name: "other",
              data: {
                api: "addhaikuan",
                username: this.$store.state.user.username || "",
                prid: this.billid || "",
                userid: this.$store.state.user._id || "",
                billid: id,
                token:
                  uni.getStorageSync(this.$xlb_staticEdit["token_KEY"]) || "",
              },
              success: ({ result }) => {
                console.log(result);
                if (result.code === 400) {
                  this.showerr(result.message || result.errMsg);
                } else {
                  uni.showToast({
                    title: "还款成功",
                    icon: "none",
                    mask: false,
                  });
                  this.getQiantiaoApi();
                  console.log(result);
                }
              },
              fail: (e) => {
                console.log(e);
              },
              complete: () => {
                uni.hideLoading();
              },
            });
          }
        },
        fail: (e) => {
          console.log(e);
        },
      });
    },
    // todo 查询欠条
    getQiantiaoApi() {
      uni.showLoading({
        title: "查询中...",
        mask: true,
      });
      uniCloud.callFunction({
        name: "other",
        data: {
          api: "readQiantiao",
          billid: this.billid || "",
          token: uni.getStorageSync(this.$xlb_staticEdit["token_KEY"]) || "",
          username: this.$store.state.user.username || "",
        },
        success: ({ result }) => {
          if (result.code === 400) {
            this.showerr(result.message);
          } else {
            this.billList = result.data;
          }
        },
        fail: (e) => {
          console.log(e);
        },
        complete: () => {
          uni.hideLoading();
        },
      });
    },
    // todo 提交安排
    submit() {
      if (!this.billid) {
        uni.showToast({
          title: "该欠条没有ID",
          icon: "none",
          mask: false,
        });
        return;
      }
      this.$refs.form
        .validate()
        .then((res) => {
          uni.showModal({
            title: "提示",
            content: "确定提交?",
            showCancel: true,
            success: ({ confirm, cancel }) => {
              if (confirm) {
                // qk 可以新增
                try {
                  uni.showLoading({
                    title: "提交中...",
                    mask: true,
                  });
                  uniCloud.callFunction({
                    name: "other",
                    data: {
                      api: "addHaikuananpai",
                      billid: this.billid || "",
                      time: res.time,
                      price: res.price,
                      username: this.$store.state.user.username || "",
                      token:
                        uni.getStorageSync(this.$xlb_staticEdit["token_KEY"]) ||
                        "",
                    },
                    success: ({ result }) => {
                      if (result.code === 400) {
                        this.showerr(result.message);
                      } else if (result.code === 300) {
                        this.showerr(result.message);
                      } else {
                        // 添加成功
                        uni.showToast({
                          title: "欠条以打好",
                          icon: "none",
                          mask: false,
                        });
                        this.closeDrawer();
                        this.getQiantiaoApi();
                        this.form = {};
                      }
                    },
                    fail: (e) => {
                      console.log(e);
                    },
                    complete: () => {
                      uni.hideLoading();
                    },
                  });
                } catch (error) {
                  console.log(error);
                }
                console.log(res);
              }
            },
            fail(e) {
              console.log(e);
            },
          });
        })
        .catch((e) => {
          console.log(e);
        });
    },
    // todo 打开/关闭抽屉
    showDrawer() {
      this.$refs.showRight.open();
    },
    closeDrawer() {
      this.$refs.showRight.close();
    },
    showerr(msg = "Error") {
      this.errortext = msg;
      this.showerror = true;
      setTimeout(() => {
        this.showerror = false;
      }, 1500);
    },
  },
};
</script>

<style lang="scss" scoped>
.Haikuanlist_ {
  .content {
    margin-top: 90px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    flex-wrap: wrap;
    .item {
      width: 90%;
      padding: 10px;
      box-sizing: border-box;
      background-color: #c4c4c4;
      border: 1px solid #000000;
      margin-bottom: 20px;
      position: relative;
      .icon {
        position: absolute;
        top: 0;
        right: 0;
        width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        color: #c4c4c4;
        background-color: rgba(64, 170, 242, 0.5);
      }
      .left {
        padding-top: 10px;
        font-size: 20px;
        font-weight: 700;
        .time {
          font-size: 14px;
          padding: 10px 0 0 0;
        }
      }
      .btns {
        font-size: 14px;
        float: right;
        padding-top: 10px;
        .no-h {
          color: red;
        }
      }
    }
  }
  /* 抽屉 */
  .open-btn {
    width: 90%;
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #7fae42;
    font-size: 14px;
    &:active {
      background-color: #9aa4ab;
    }
  }
  .custom-drawer {
    ::v-deep .uni-forms {
      padding: 10px;
    }
    .close-btn {
      margin: 10px 0;
    }
  }
  .addbtn {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9;
    .add-btn {
      width: 70%;
    }
  }
}
</style>
