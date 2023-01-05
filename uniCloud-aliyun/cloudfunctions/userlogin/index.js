/*
 * @Author: BORING GHOST
 * @Date: 2022-09-23 09:04:40
 * @LastEditTime: 2022-10-14 15:25:14
 * @Description:
 * 1. userlogin中账号密码登录前必须先通过weixinAuthor接口授权得到一个token
 * 2. 客户端再调用userloginapi将账号密码跟token一起发送服务端才能有验证密码是否正确的资格
 * 3. 如果token正确并且密码正确,就会将用户信息进行返回
 * 4. 中途验证失败都会返回一个成功状态{code:400,errMsg:'错误信息'}的数据
 * 5. 其它错误都会抛红
 * 6. 如果成功会有message属性
 * weixinAuthor : 用户授权
 * usrloginapi : 账号登录校验
 * readweixinID : 获取微信id
 * addUsername : 单独创建一个账号
 * touristLOGIN : 游客身份登录
 */
"use strict";
const errMsgFn = (errMsg = "验证失败") => ({
  code: 400,
  errMsg,
});
const {
  weixinAuthor,
  jwtTotoken,
  addWeixinAuth,
  checkJwtToken,
  checkUserItem,
  addUserInfo,
  nowHasUsername,
} = require("./apis.js");
const { touris_Gettoken } = require("./tourist.js");
const { appid, wxSecret, jwtSecret } = require("./dev.config.js");
const sleep = (time = 100) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

exports.main = async (event, context) => {
  const { api } = event;
  if (!api) {
    throw Error("接口传参错误");
  }
  if (
    api === "weixinAuthor" ||
    api === "readweixinID" ||
    api === "touristLOGIN"
  ) {
    // ! 进行微信授权
    await sleep();
    if (!event.code) return errMsgFn("缺少授权code");
    if (!appid) return errMsgFn("缺少服务配置");
    if (!wxSecret) return errMsgFn("缺少服务配置");
    if (!jwtSecret) return errMsgFn("缺少服务配置");
    // todo 游客登录
    if (api === "touristLOGIN") {
      try {
        const username = "touristname";
        const password = "touristpassword";
        const { code, token } = await touris_Gettoken(jwtSecret);
        if (code == 300) {
          return errMsgFn("游客账号失效啦");
        } else {
          return {
            code: 200,
            token,
            message: "游客账号登录成功",
          };
        }
      } catch (error) {
        return errMsgFn("游客身份登录失败");
      }
    }
    // todo 获取微信唯一标识
    const wxRes = await weixinAuthor(appid, wxSecret, event.code);
    if (wxRes.data.errcode === 40029) {
      return errMsgFn("授权失败,请检查前台是否配置了开发者id");
    } else if (wxRes.data.errcode === 45011) {
      return errMsgFn("频率限制，每个用户每分钟100次");
    } else if (wxRes.data.errcode === 40226) {
      return errMsgFn("高风险等级用户，登录拦截");
    } else if (wxRes.data.errcode === -1) {
      return errMsgFn("系统繁忙，此时请开发者稍候再试");
    } else if (wxRes.data.errcode) {
      return errMsgFn("授权失败,请检查服务配置");
    }

    // todo 标识(token)加密处理+新用户或者老用户
    const token = wxRes.data.openid;
    // todo 当接口为读取(注册)时可以直接返回
    if (api === "readweixinID") {
      await sleep(2000);
      return {
        code: 200,
        message: "恭喜你,ID读取成功",
        id: token,
      };
    }
    const jwt_data = await jwtTotoken(token, jwtSecret);
    let message = "授权成功!您是老用户!";
    // todo 如果是新用户: 为用户自动添加一个权限记录
    if (jwt_data.type === "新用户") {
      // await addWeixinAuth(token);
      // message = "授权成功!您是新用户,后台以自动为您添加了权限!";
      return errMsgFn("您是新用户,请联系痞老板为您授权! 或者自己注册一个!");
    }

    // 授权完成
    return {
      code: 200,
      token: jwt_data.token,
      type: jwt_data.type,
      message,
    };
  } else {
    // ! 以下接口都需要先进行授权token
    if (!(event.username && event.username.replace(/ /g, "")))
      return errMsgFn("账号不能为空");
    if (!(event.password && event.password.replace(/ /g, "")))
      return errMsgFn("密码不能为空");
    const eventUsername = event.username.replace(/ /g, "");
    const eventPassword = event.password.replace(/ /g, "");
    if (!event.token) {
      return errMsgFn("未授权的账号");
    }
    await sleep();
    // todo 检查此token是否有效
    let accountId = "";
    try {
      accountId = await checkJwtToken(event.token, jwtSecret);
      if (!accountId) return errMsgFn("无权限,请创建");
    } catch (error) {
      return errMsgFn("权限校验失败");
    }
    if (api === "usrloginapi") {
      // todo 校验账号是否已经存在,如果存在密码是否一致
      const { code, userinfo } = await checkUserItem(
        accountId,
        eventUsername,
        eventPassword
      );
      if (code === 400) {
        return errMsgFn("密码错误");
      } else if (code === 200) {
        return {
          code: 200,
          message: "登录成功,欢迎回来!",
          userinfo: userinfo,
        };
      } else if (code === 300) {
        // todo 账号不存在:自动创建一个新的账号
        try {
          // qk 查看当前用户当前有没有存在的账号
          const data = await nowHasUsername(accountId, eventUsername);
          if (data.code === 200) {
            return {
              code: 202, // 202 :已经有了存在的账号
              message: data.message,
            };
          } else if (data.code === 300) {
            const { userinfo } = await addUserInfo(
              accountId,
              { username: eventUsername },
              eventPassword
            );
            return {
              code: 200,
              message: "账号不存在,恭喜你,账号创建成功!",
              userinfo,
            };
          }
        } catch (error) {
          return errMsgFn("账号创建失败,请联系管理员");
        }
      }
    }
    // todo 注册一个账号
    if (api === "addUsername") {
      try {
        const { userinfo } = await addUserInfo(
          accountId,
          { username: eventUsername },
          eventPassword
        );
        return {
          code: 200,
          message: "恭喜你,账号创建成功!",
          userinfo,
        };
      } catch (error) {
        console.log(error);
        return errMsgFn("账号创建失败,请联系管理员");
      }
    }
    return {
      code: 200,
      message: "没有此接口",
    };
  }
};
