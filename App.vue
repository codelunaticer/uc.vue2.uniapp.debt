<!--
 * @Author: BORING GHOST
 * @Date: 2022-10-09 08:41:44
 * @LastEditTime: 2022-10-23 08:03:30
 * @Description: 
-->
<script>
export default {
  onLaunch: function () {
    try {
      console.log("欢迎光临");
      const token = uni.getStorageSync(this.$xlb_staticEdit["token_KEY"]);
      const { name } = uni.getStorageSync(this.$xlb_staticEdit["account_KEY"]);
      if (token && name) {
        // ! 调试(去掉下一行注释)
        this.$store.commit("user/saveUsername", name || "");
        uni.switchTab({ url: this.GOTO_PageFn("center") });
      }
    } catch (error) {
      console.log(error);
    }
  },
  onShow: function () {
    console.log("App Show");
  },
  onHide: function () {
    console.log("App Hide");
  },
};
</script>

<style>
/*每个页面公共css */
@import "@/styles/index.scss";
</style>
