/*
 * @Author: BORING GHOST
 * @Date: 2022-09-23 09:20:03
 * @LastEditTime: 2022-10-12 11:54:47
 * @Description:
 */

const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const db = uniCloud.database();

// 记录用户权限的表名
const weixinAuths_name = "weixinAuths";
// 记录用户信息的表名
const userInfo_name = "user";

/**
 * 微信授权
 * @param {string} appid 微信公众平台appid
 * @param {string} wxSecret 微信公众平台密钥
 * @param {string} code 微信授权code
 * @return {promise} promise 返回一个token
 */
exports.weixinAuthor = function (appid, wxSecret, code) {
  const weixinHttps = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${wxSecret}&js_code=${code}&grant_type=authorization_code`;
  return uniCloud.httpclient.request(weixinHttps, {
    dataType: "json",
  });
};

/**
 * 查看token是否拥有权限
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

/**
 * 通过token判断是新用户还是老用户,然后再加密进行返回
 * @param {string} token
 * @param {string} jwtSecret
 * @return {object} 返回一个jwt加密的token跟用户类型
 */
exports.jwtTotoken = function (token, jwtSecret) {
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await db.collection(weixinAuths_name).doc(token).get();
      const type = data[0] ? "老用户" : "新用户";
      const newToken = jwt.sign({ id: token }, jwtSecret);
      resolve({
        token: newToken,
        type,
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * 添加一个用户权限id
 * @param {*} authId 权限标识
 */
exports.addWeixinAuth = function (authId) {
  return new Promise(async (resolve, reject) => {
    try {
      await db.collection(weixinAuths_name).add({
        _id: authId,
        createTime: Date.now(),
      });
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * 校验账号是否已经存在,如果存在密码是否一致
 * @param {*} authId 权限id
 * @param {*} username
 * @param {*} password
 * @return {object} {code} code: 400:密码不一致 200:密码正确 300:没有此账号
 */
exports.checkUserItem = function (authId, username, password) {
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
        const hash = data[0].hash;
        const check = await bcryptjs.compare(password, hash);
        if (!check) {
          resolve({
            code: 400,
            errMsg: "密码错误!",
          });
        } else {
          const { _id, hash, authId, ...userinfo } = data[0];
          resolve({
            code: 200,
            errMsg: "登录成功!",
            userinfo: userinfo,
          });
        }
      } else {
        resolve({
          code: 300,
          errMsg: "没有此账号",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * 创建一个账号密码
 * @param {string} authId 微信权限id
 * @param {object} userinfo 其它用户信息
 * @param {string} password 密码
 */
exports.addUserInfo = function (authId, userinfo, password) {
  return new Promise(async (resolve, reject) => {
    try {
      const new_info = JSON.parse(JSON.stringify(userinfo));
      const hash = await bcryptjs.hash(password, 10);
      await db.collection(userInfo_name).add({
        ...new_info,
        authId,
        hash,
        createTime: Date.now(),
      });
      resolve({
        userinfo: new_info,
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * 查看当前用户有没有已经存在的账号
 * @param {object} authId 微信权限id
 * @param {string} username 用户名
 */
exports.nowHasUsername = function (authId, username) {
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await db
        .collection(userInfo_name)
        .where({
          authId,
        })
        .get();
      if (data[0]) {
        resolve({
          code: 200,
          message: "你名下已经有" + data.length + "个账号了",
          data: data[0],
        });
      } else {
        resolve({
          code: 300,
          message: "你目前还没有创建过任何账号",
          data: [],
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
