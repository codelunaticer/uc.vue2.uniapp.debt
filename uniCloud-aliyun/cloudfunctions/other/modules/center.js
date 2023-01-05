/*
 * @Author: BORING GHOST
 * @Date: 2022-10-12 11:54:10
 * @LastEditTime: 2022-10-14 10:54:59
 * @Description:
 */
const db = uniCloud.database();
// 记录用户权限的表名
const weixinAuths_name = "weixinAuths";
// 记录用户信息的表名
const userInfo_name = "user";

/**
 * todo 修改用户信息
 * @param {string} _id 用户id
 * @param {string} asia 网名
 * @param {string} description 个性签名
 * @param {string} avatar 头像
 */
exports.updateUserinfo = function (_id, asia, description, avatar) {
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await db.collection(userInfo_name).doc(_id).get();
      if (data[0]) {
        // 有这个id可以修改
        let params = {
          asia,
          description,
        };
        if (avatar) {
          params.avatar = avatar;
        }
        const reuslt = await db
          .collection(userInfo_name)
          .doc(_id)
          .update(params);
        console.log(reuslt);
        resolve({
          code: 200,
        });
      } else {
        // 没有这个id
        resolve({
          code: 300,
          message: "查询不到此用户",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * todo 获取用户信息
 * @param {object} authId 微信权限id
 * @param {string} username 用户名
 */
exports.getUserInfo = function (authId, username) {
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await db
        .collection(userInfo_name)
        .where({
          authId,
          username,
        })
        .get();
      if (data[0]) {
        const { hash, authId, ...userinfo } = data[0];
        resolve({
          code: 200,
          message: "查询成功",
          data: userinfo,
        });
      } else {
        resolve({
          code: 300,
          message: "用户不存在",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
