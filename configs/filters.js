/*
 * @Author: BORING GHOST
 * @Date: 2022-10-20 14:45:47
 * @LastEditTime: 2022-10-22 14:58:22
 * @Description:
 */
export const formatDate = {
  name: "formatDate",
  fn: function (time) {
    if (!time) return "";
    let date = new Date(time);
    let year = date.getFullYear();
    // 在日期格式中，月份是从0开始的，因此要加0，使用三元表达式在小于10的前面加0，以达到格式统一  如 09:11:05
    let month =
      date.getMonth() + 1 < 10
        ? "0" + (date.getMonth() + 1)
        : date.getMonth() + 1;
    let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    let hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    let minutes =
      date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    let seconds =
      date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
    // return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    return hours + ":" + minutes + ":" + seconds;
  },
};

export const formatDateAll = {
  name: "formatDateAll",
  fn: function (time) {
    if (!time) return "";
    let date = new Date(time);
    let year = date.getFullYear();
    // 在日期格式中，月份是从0开始的，因此要加0，使用三元表达式在小于10的前面加0，以达到格式统一  如 09:11:05
    let month =
      date.getMonth() + 1 < 10
        ? "0" + (date.getMonth() + 1)
        : date.getMonth() + 1;
    let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    let hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    let minutes =
      date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    let seconds =
      date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
    return (
      year +
      "年" +
      month +
      "月" +
      day +
      "日 " +
      hours +
      "时" +
      minutes +
      "分" +
      seconds +
      "秒"
    );
    // return hours + ":" + minutes + ":" + seconds;
  },
};
