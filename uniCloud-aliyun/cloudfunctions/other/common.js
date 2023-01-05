/*
 * @Author: BORING GHOST
 * @Date: 2022-10-12 11:42:48
 * @LastEditTime: 2022-10-12 12:07:29
 * @Description:
 */
const db = uniCloud.database();
const jwt = require("jsonwebtoken");
// 记录用户权限的表名
const weixinAuths_name = "weixinAuths";
// 记录用户信息的表名
const userInfo_name = "user";

/**
 * todo 查看token是否拥有权限
 * @param {*} jwttoken
 * @param {*} jwtSecret jwt密钥
 */
exports.checkJwtToken = function (jwttoken, jwtSecret) {
  return new Promise(async (resolve, reject) => {
    try {
      const { id } = await jwt.verify(jwttoken, jwtSecret);
      const { data } = await db.collection(weixinAuths_name).doc(id).get();
      data[0] ? resolve(id) : resolve(false);
    } catch (error) {
      reject(error);
    }
  });
};
