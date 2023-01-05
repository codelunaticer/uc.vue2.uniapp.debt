<!--
 * @Author: BORING GHOST
 * @Date: 2022-10-20 15:46:23
 * @LastEditTime: 2022-10-22 20:59:47
 * @Description: 债务 欠款记录
-->
<template>
  <view class="Qiankuan_">
    <view class="title">欠款</view>
    <!-- 抽屜 -->
    <button class="open-btn" @click="showDrawer">添加一条欠款</button>
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
          <uni-forms-item label="借款对象" name="name">
            <uni-easyinput
              trim
              :inputBorder="false"
              v-model="form.name"
              type="text"
              :adjust-position="true"
              placeholder="请输入借款对象~"
            />
          </uni-forms-item>
          <uni-forms-item label="借款金额" name="price">
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
    <!-- 内容 -->
    <view v-for="item in jiekuanList" :key="item._id" class="item">
      <view @click="gotoPage(item)" class="top">
        <view class="name">{{ item.name }}</view>
        <view class="price" v-if="item.ish" style="color: #2085df">
          {{ item.price }}元
        </view>
        <view class="price" v-else style="color: #fa1919">
          {{ item.price }}元
        </view>
      </view>
      <view class="descript">借款时间:{{ item.time | formatDateAll }}</view>
    </view>
  </view>
</template>

<script>
export default {
  name: "QiankuanIndex",
  data() {
    return {
      jiekuanList: [],
      // qk form表单
      form: {},
      rules: {
        name: {
          rules: [
            {
              required: true,
              errorMessage: "借款对象必须填写!",
            },
            {
              maxLength: 20,
              errorMessage: "只有你才会取这么长的名字?",
            },
          ],
        },
        price: {
          rules: [
            {
              required: true,
              errorMessage: "借款必须有金额!",
            },
            {
              validateFunction: function (rule, value, data, callback) {
                if (value == 0) {
                  callback("借款必须有金额");
                }
                return true;
              },
            },
          ],
        },
      },
    };
  },
  onReady() {
    // 需要在onReady中设置规则
    this.$refs.form.setRules(this.rules);
  },
  // todo 下拉刷新
  onPullDownRefresh() {
    this.getJiekuanlistApi();
    uni.stopPullDownRefresh();
  },
  onLoad() {
    this.getJiekuanlistApi();
  },
  methods: {
    // todo 页面跳转
    gotoPage({ _id, name }) {
      uni.navigateTo({
        url: this.GOTO_PageFn("haikuan") + `?id=${_id}&name=${name}`,
      });
    },
    // todo 提交借款
    submit() {
      this.$refs.form
        .validate()
        .then((res) => {
          uni.showModal({
            title: "提示",
            content: "确定提交?",
            showCancel: true,
            success: ({ confirm, cancel }) => {
              if (confirm) {
                uni.showLoading({
                  title: "加载中",
                  mask: true,
                });
                uniCloud.callFunction({
                  name: "other",
                  data: {
                    api: "addJiekuan",
                    id: this.$store.state.user._id || "",
                    price: res.price,
                    name: res.name,
                    username: this.$store.state.user.username || "",
                    token:
                      uni.getStorageSync(this.$xlb_staticEdit["token_KEY"]) ||
                      "",
                  },
                  success: ({ result }) => {
                    if (result.code === 200) {
                      uni.showToast({
                        title: "添加成功",
                        icon: "none",
                        mask: true,
                      });
                      this.closeDrawer();
                      this.getJiekuanlistApi();
                      this.form = {};
                    } else {
                      uni.showToast({
                        title: "添加失败",
                        icon: "none",
                        mask: true,
                      });
                    }
                  },
                  fail(e) {
                    console.log(e);
                  },
                  complete() {
                    uni.hideLoading();
                  },
                });
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
    // todo 查询所有借款信息
    getJiekuanlistApi() {
      uni.showLoading({
        title: "查询中...",
        mask: true,
      });
      uniCloud.callFunction({
        name: "other",
        data: {
          api: "readAlljiekuans",
          username: this.$store.state.user.username || "",
          token: uni.getStorageSync(this.$xlb_staticEdit["token_KEY"]) || "",
        },
        success: ({ result }) => {
          if (result.code === 200) {
            uni.showToast({
              title: "读取成功",
              icon: "none",
              mask: false,
            });
            this.jiekuanList = result.data;
          } else {
            uni.showToast({
              title: "出错啦",
              icon: "none",
              mask: false,
            });
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
  },
};
</script>

<style lang="scss" scoped>
.Qiankuan_ {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
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
  /* 内容 */
  .item {
    width: 90%;
    margin: 20px 0;
    height: 100px;
    box-sizing: border-box;
    padding: 10px;
    background-color: #c4c4c4;
    border: 1px solid #000000;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: flex-start;
    &:last-child {
      margin-bottom: 70px;
    }
    .descript {
      font-size: 14px;
    }
    .top {
      display: flex;
      width: 100%;
      box-sizing: border-box;
      padding-right: 20px;
      justify-content: space-between;
      align-items: center;
      .price {
        font-size: 20px;
      }
      .name {
        font-weight: 700;
        font-size: 20px;
      }
    }
  }
  .title {
    width: 80%;
    margin-top: 20px;
    height: 50px;
    font-weight: 700;
    font-size: 20px;
    padding-left: 50px;
    letter-spacing: 50px;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #c4c4c4;
    border: 1px solid #000000;
  }
}
</style>
