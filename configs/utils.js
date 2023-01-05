/*
 * @Author: BORING GHOST
 * @Date: 2022-10-11 14:34:38
 * @LastEditTime: 2022-10-14 15:25:43
 * @Description:
 */
/**
 * todo 睡眠
 * @param {*} time 时间长(默认1500)
 */
export function asyncSleep(time = 500) {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        resolve(true);
      }, time);
    } catch (error) {
      resolve(true);
    }
  });
}
/**
 * todo 失败吐司
 */
export const errMsg = (msg = "失败") => {
  uni.showToast({
    title: msg,
    icon: "error",
    duration: 2000,
  });
};

/**
 * todo 图片转base64
 */
export const imageToBase64 = (url) => {
  return new Promise((resolve, reject) => {
    uni.getFileSystemManager().readFile({
      filePath: url, //选择图片返回的相对路径
      encoding: "base64", //编码格式
      success: (res) => {
        const base64 = "data:image/jpeg;base64," + res.data; //不加上这串字符，在页面无法显示的哦
        resolve(base64);
      },
      fail: (e) => {
        console.log("图片转换失败");
        reject("图片转换失败");
      },
    });
  });
};
