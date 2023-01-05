/*
 * @Author: BORING GHOST
 * @Date: 2022-10-13 09:55:09
 * @LastEditTime: 2022-10-13 10:17:23
 * @Description:
 */
const jwt = require("jsonwebtoken");
const db = uniCloud.database();
// 记录用户权限的表名
const weixinAuths_name = "weixinAuths";
// 记录用户信息的表名
const userInfo_name = "user";
/**
 * todo 返回游客的token
 * @param {string} jwtSecret
 */
exports.touris_Gettoken = function (jwtSecret) {
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await db
        .collection(weixinAuths_name)
        .where({
          type: "youke",
        })
        .get();
      if (data[0]) {
        resolve({
          code: 200,
          token: jwt.sign({ id: data[0]["_id"] }, jwtSecret),
        });
      } else {
        resolve({
          code: 300,
          message: "游客账号失效",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
