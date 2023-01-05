/*
 * @Author: BORING GHOST
 * @Date: 2022-10-12 11:46:34
 * @LastEditTime: 2022-10-14 15:25:07
 * @Description:
 */
/**
 * todo 错误返回值
 */
exports.errMsgFn = (errMsg = "验证失败") => ({
  code: 400,
  errMsg,
});

/**
 * todo 成功的返回值
 * @param {} data 数据
 * @param {} msg 提示信息
 */
exports.successFn = (data = [], msg = "操作成功") => {
  return {
    code: 200,
    message: msg,
    data,
  };
};

/**
 * todo 睡眠函数
 */
exports.sleep = (time = 100) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};
