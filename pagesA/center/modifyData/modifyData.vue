<!--
 * @Author: BORING GHOST
 * @Date: 2022-10-13 14:23:21
 * @LastEditTime: 2022-10-14 11:48:10
 * @Description: modifyData 修改资料
-->
<template>
  <view class="modifyData">
    <xlb-loading
      v-show="isloading"
      :error="error"
      :text="loadingText"
    ></xlb-loading>
    <!-- 头像 -->
    <view @click="updateAvatar" class="avatar">
      <view class="bd">
        <image
          class="xlb-avatar"
          @error="avatar = defaultImg"
          :src="avatar"
          mode="scaleToFill"
        />
      </view>
      <view class="icon">
        <uni-icons type="camera-filled" size="24" />
      </view>
    </view>
    <!-- form表单 -->
    <uni-forms label-position="top" ref="form" :rules="rules" :model="form">
      <uni-forms-item label="网名" name="asia">
        <uni-easyinput
          trim
          :inputBorder="false"
          v-model="form.asia"
          type="text"
          :adjust-position="true"
          placeholder="您想娶一个什么样的网名呢~"
        />
      </uni-forms-item>
      <uni-forms-item label="个性签名" name="description">
        <uni-easyinput
          trim
          :adjust-position="true"
          :inputBorder="false"
          v-model="form.description"
          type="text"
          placeholder="这是跟QQ一样的个性签名"
        />
      </uni-forms-item>
    </uni-forms>
    <!-- 保存 -->
    <button @click="saveSbmit" class="saveModifyData">保存</button>
  </view>
</template>

<script>
import defaultImg from "@/static/default.png";

export default {
  name: "modifyData",
  data() {
    return {
      defaultImg,
      avatar: defaultImg,
      userinfo: {},
      //qk loading
      error: 1,
      loadingText: "",
      loadingCount: 0,
      // qk form表单
      form: {
        avatar: "",
      },
      rules: {
        asia: {
          rules: [
            {
              required: true,
              errorMessage: "把网名填好行不行?",
            },
          ],
        },
        description: {
          rules: [
            {
              required: true,
              errorMessage: "个性签名凑合填一下也行的?",
            },
          ],
        },
      },
    };
  },
  computed: {
    isloading() {
      return this.loadingCount > 0;
    },
  },
  onLoad() {
    uni.hideHomeButton();
    this.updateUserinfo();
  },
  methods: {
    /**
     * todo 跟新参数
     */
    async updateUserinfo() {
      try {
        const { avatar, asia, description } = await this.$store.dispatch(
          "user/getuserinfo"
        );
        avatar ? (this.avatar = avatar) : "";
        avatar ? (this.form.asia = asia) : "";
        avatar ? (this.form.description = description) : "";
      } catch (error) {
        console.log(error);
      }
    },
    /**
     * todo 跟新头像
     */
    updateAvatar() {
      uni.showActionSheet({
        itemList: ["打开相册"],
        success: ({ tapIndex }) => {
          const num = tapIndex + 1;
          if (num == 1) {
            uni.chooseImage({
              count: 1, //默认9
              sizeType: ["original", "compressed"], //可以指定是原图还是压缩图，默认二者都有
              sourceType: ["album"], //从相册选择
              success: async (res) => {
                try {
                  const tempFilePath = res.tempFilePaths[0];
                  const result = await this.$xlb_imageToBase64(tempFilePath);
                  this.avatar = result;
                  this.form.avatar = result;
                  // console.log(result);
                } catch (error) {
                  console.log(error);
                  this.$xlb_errmessage("图片处理失败");
                }
              },
              fail(e) {
                console.log(e);
              },
            });
          }
        },
        fail: (error) => {
          console.log(error.errMsg);
        },
      });
    },
    /**
     * todo 保存资料
     */
    saveSbmit() {
      this.$refs.form
        .validate()
        .then(() => {
          this.loadingText = "提交数据中...";
          this.loadingCount++;
          uniCloud.callFunction({
            name: "other",
            data: {
              api: "updateUserinfo",
              token: uni.getStorageSync(this.$xlb_staticEdit["token_KEY"]),
              asia: this.form.asia || "",
              description: this.form.description || "",
              _id: this.$store.getters._id,
              avatar: this.form.avatar || "",
            },
            success: async ({ result }) => {
              if (result.code === 400) {
                this.error++;
                this.loadingText = result.errMsg;
                await this.$xlb_asyncSleep();
                this.loadingCount--;
              } else if (result.code === 200) {
                try {
                  await this.$store.dispatch("user/updateuserinfo");
                } catch (error) {
                  console.log(error);
                }
                this.loadingCount--;
                uni.navigateBack({
                  delta: 1,
                  success() {
                    uni.showToast({
                      title: "恭喜主人,更新好啦!",
                      icon: "none",
                      mask: true,
                    });
                  },
                });
              } else {
                this.loadingText = "失败(未知错误)";
                await this.$xlb_asyncSleep();
                this.loadingCount--;
              }
            },
            fail: (e) => {
              console.log(e);
              this.loadingCount--;
            },
          });
        })
        .catch((err) => {});
    },
  },
};
</script>

<style lang="scss" scoped>
.modifyData {
  border-top: 2px solid #e6e9f2;
  /* 保存 */
  .saveModifyData {
    margin: 80px auto 0 auto;
    width: 70%;
    color: white;
    background-color: #40487c;
    &:active {
      background-color: #dedede;
    }
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
  /* 头像 */
  .avatar {
    width: 100px;
    height: 100px;
    margin: 80rpx auto 0 auto;
    background-color: #e6e9f2;
    border-radius: 50%;
    position: relative;
    .bd {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      overflow: hidden;
    }
    .icon {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background-color: #d5d3ff;
      box-sizing: border-box;
      border: 2px solid white;
      position: absolute;
      right: 0px;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
