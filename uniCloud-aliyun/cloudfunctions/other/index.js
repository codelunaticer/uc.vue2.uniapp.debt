/*
 * @Author: BORING GHOST
 * @Date: 2022-10-12 11:37:43
 * @LastEditTime: 2022-10-22 20:28:52
 * @Description:
 * getUserInfo 获取用户信息
 */
"use strict";

const { errMsgFn, successFn, sleep } = require("./wrench.js");

const { appid, wxSecret, jwtSecret } = require("./dev.config.js");

const { checkJwtToken } = require("./common.js");
const { getUserInfo, updateUserinfo } = require("./modules/center.js");
const debtApis = require("./modules/debtApis/index.js");

exports.main = async (event, context) => {
  const { api } = event;
  if (!api) {
    throw Error("接口传参错误");
  }
  if (!event.token) {
    return errMsgFn("未授权的账号");
  }
  if (!jwtSecret) return errMsgFn("缺少服务配置");
  // todo 检查此token是否有效
  let accountId = "";
  try {
    accountId = await checkJwtToken(event.token, jwtSecret);
    if (!accountId) return errMsgFn("无权限,请创建");
  } catch (error) {
    return errMsgFn("权限校验失败");
  }
  // ! 上面已经通过了token校验
  if (api === "getUserInfo") {
    // todo 获取用户信息
    try {
      if (!event.username) return errMsgFn("缺少参数");
      const { code, data } = await getUserInfo(accountId, event.username);
      await sleep();
      if (code == 200) {
        return successFn(data, "查询成功");
      } else if (code == 300) {
        return errMsgFn("用户不存在");
      } else {
        return errMsgFn("未知错误");
      }
    } catch (error) {
      return errMsgFn("查询失败,请联系管理");
    }
  } else if (api === "updateUserinfo") {
    // todo 跟新某个用户的信息
    try {
      // if (!event.avatar) return errMsgFn("头像不能为空");
      if (!event.asia) return errMsgFn("网名不能为空");
      if (!event.description) return errMsgFn("签名不能为空");
      if (!event._id) return errMsgFn("缺少参数");
      const { code, message } = await updateUserinfo(
        event._id,
        event.asia,
        event.description,
        event.avatar || ""
      );
      if (code === 200) {
        return { code: 200, message: "跟新成功" };
      } else {
        return errMsgFn("查询不到此用户");
      }
    } catch (error) {
      return errMsgFn("修改资料失败,请联系管理");
    }
  } else if (api === "readTotalsprice") {
    // todo 查询总金额
    try {
      const result = await debtApis.readTotalsprice(event.id);
      return result;
    } catch (error) {
      return errMsgFn("查询失败!!!");
    }
  } else if (api === "updateTotalsprice") {
    try {
      const result = await debtApis.updateTotalsprice(
        event.id,
        event.username,
        event.data
      );
      return result;
    } catch (error) {
      return errMsgFn("跟新失败!!!");
    }
  } else if (api === "addSingleZhichuBill") {
    // todo 添加一条支出账单
    try {
      const result = await debtApis.addSingleZhichuBill(
        event.bill,
        event.username,
        event.id
      );
      return result;
    } catch (error) {
      return errMsgFn("添加支出失败!!!");
    }
  } else if (api === "addSingleShouruBill") {
    // todo 添加一条收入账单
    try {
      const result = await debtApis.addSingleShouruBill(
        event.bill,
        event.username,
        event.id
      );
      return result;
    } catch (error) {
      return errMsgFn("添加收入失败!!!");
    }
  } else if (api === "readYearOrMonthBills") {
    // todo 查询某一年或者加某月的总账单
    try {
      const result = await debtApis.readYearOrMonthBills(
        event.username,
        event.year
      );
      return result;
    } catch (error) {
      return errMsgFn("添加收入失败!!!");
    }
  } else if (api === "readHistoryMonthBills") {
    // todo 查询某个月的所有历史账单(单项账单历史表)
    try {
      const result = await debtApis.readHistoryMonthBills(
        event.username,
        event.year,
        event.month
      );
      return result;
    } catch (error) {
      return errMsgFn("查询历史账单失败!!!");
    }
  } else if (api === "addJiekuan") {
    // todo 添加一条借款信息
    try {
      const result = await debtApis.addJiekuan(
        event.username,
        event.id,
        event.price,
        event.name
      );
      return result;
    } catch (error) {
      return errMsgFn("查询历史账单失败!!!");
    }
  } else if (api === "addhaikuan") {
    // todo 添加一条还款信息
    try {
      const result = await debtApis.addhaikuan(
        event.username,
        event.userid,
        event.prid,
        event.billid
      );
      return result;
    } catch (error) {
      return errMsgFn("查询历史账单失败!!!");
    }
  } else if (api === "readAlljiekuans") {
    // todo 查询所有借款信息
    try {
      const result = await debtApis.readAlljiekuans(event.username);
      return result;
    } catch (error) {
      return errMsgFn("查询借款信息失败!!!");
    }
  } else if (api === "addHaikuananpai") {
    // todo 新增还款安排
    try {
      const result = await debtApis.addHaikuananpai(
        event.username,
        event.billid,
        event.time,
        event.price
      );
      return result;
    } catch (error) {
      return errMsgFn("新增还款安排失败!!!");
    }
  } else if (api === "readQiantiao") {
    // todo 查询某个借款的欠条
    try {
      const result = await debtApis.readQiantiao(event.username, event.billid);
      return result;
    } catch (error) {
      return errMsgFn("查询欠条失败!!!");
    }
  }
  return {
    code: 200,
    message: "没有此接口",
  };
};
