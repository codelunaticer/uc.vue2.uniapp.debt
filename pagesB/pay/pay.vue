<!--
 * @Author: BORING GHOST
 * @Date: 2022-10-20 15:46:23
 * @LastEditTime: 2022-10-23 10:57:31
 * @Description: 债务 加一笔消费
-->
<template>
  <view class="Pay__">
    <!-- 内容区域 -->
    <view class="content">
      <!-- form表单 -->
      <uni-forms label-position="top" ref="form" :model="form">
        <uni-forms-item label="商品" name="name">
          <uni-easyinput
            trim
            :inputBorder="false"
            v-model="form.name"
            type="text"
            :adjust-position="true"
            placeholder="请输入商品名称~"
          />
        </uni-forms-item>
        <uni-forms-item label="店铺" name="dianpu">
          <uni-easyinput
            trim
            :adjust-position="true"
            :inputBorder="false"
            v-model="form.dianpu"
            type="text"
            placeholder="请输入店铺名称~"
          />
        </uni-forms-item>
        <uni-forms-item label="价格" name="price">
          <uni-number-box
            :step="0.11"
            :min="0"
            :max="88888"
            v-model="form.price"
          ></uni-number-box>
        </uni-forms-item>
      </uni-forms>
    </view>
    <!-- 按钮 -->
    <button @click="xiaofeiSubmit" class="btn">提交</button>
  </view>
</template>

<script>
export default {
  name: "PayIndex",
  data() {
    return {
      // qk form表单
      form: {},
      rules: {
        name: {
          rules: [
            {
              required: true,
              errorMessage: "商品名称必须填写!",
            },
            {
              maxLength: 20,
              errorMessage: "买的什么东西名字这么长?",
            },
          ],
        },
        price: {
          rules: [
            {
              required: true,
              errorMessage: "商品必须有价格!",
            },
            {
              validateFunction: function (rule, value, data, callback) {
                if (value == 0) {
                  callback("商品必须有价格");
                }
                return true;
              },
            },
          ],
        },
        dianpu: {
          rules: [
            {
              required: true,
              errorMessage: "店铺名称必须填写!",
            },
            {
              maxLength: 20,
              errorMessage: "什么老板会取这么长的名字?",
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
  methods: {
    // todo 提交
    xiaofeiSubmit() {
      const this_ = this;
      this.$refs.form
        .validate()
        .then((res) => {
          uni.showModal({
            title: "提示",
            content: "是否消费?",
            showCancel: true,
            success: ({ confirm, cancel }) => {
              if (confirm) {
                // qk 校验通过
                uni.showLoading({
                  title: "提交中...",
                  mask: true,
                });
                uniCloud.callFunction({
                  name: "other",
                  data: {
                    api: "addSingleZhichuBill",
                    username: this.$store.state.user.username || "",
                    id: this.$store.state.user._id || "",
                    bill: {
                      name: res.name || "",
                      dianpu: res.dianpu || "",
                      price: res.price || "",
                    },
                    token:
                      uni.getStorageSync(this.$xlb_staticEdit["token_KEY"]) ||
                      "",
                  },
                  success({ result }) {
                    if (result.code === 400) {
                      uni.showToast({
                        title: "消费失败",
                        icon: "none",
                        mask: false,
                      });
                    } else {
                      uni.navigateBack({
                        delta: 1,
                        success() {
                          uni.showToast({
                            title: "消费成功",
                            icon: "none",
                            mask: false,
                          });
                          this_.form = {};
                        },
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
            fail: (e) => {
              console.log(e);
            },
          });
        })
        .catch((e) => {
          console.log(e);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.Pay__ {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  padding-top: 60px;
  .content {
    padding: 50px 10px;
    width: 80%;
    min-height: 100px;
    border-radius: 10px;
    background-color: white;
  }
  .btn {
    width: 70%;
    margin-top: 100px;
    letter-spacing: 5px;
  }
  /* form表单 */
  ::v-deep .uni-forms {
    padding: 0 20px;
    .uni-forms-item__label {
      font-weight: 700;
      color: #adadad;
    }
  }
  ::v-deep input {
    border-bottom: 2px solid #adadad;
    color: black;
    font-weight: 700;
  }
}
</style>
