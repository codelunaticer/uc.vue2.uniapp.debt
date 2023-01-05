/*
 * @Author: BORING GHOST
 * @Date: 2022-10-17 15:04:03
 * @LastEditTime: 2022-10-22 20:28:20
 * @Description:
 */

const { readTotalsprice } = require("./toasts.js");
const {
  addSingleZhichuBill,
  addSingleShouruBill,
  readHistoryMonthBills,
} = require("./history.js");
const { readYearOrMonthBills } = require("./years.js");
const {
  addJiekuan,
  addhaikuan,
  readAlljiekuans,
  addHaikuananpai,
  readQiantiao,
} = require("./jiekuan.js");

module.exports = {
  // 查询总金额数据
  readTotalsprice,
  // 添加一条支出账单
  addSingleZhichuBill,
  // 添加一条收入账单
  addSingleShouruBill,
  // 查询某一年或者加某月的总账单
  readYearOrMonthBills,
  // 查询某个月的所有历史账单(单项账单历史表)
  readHistoryMonthBills,
  // 添加一条借款信息
  addJiekuan,
  // 添加一条还款信息
  addhaikuan,
  // 查询所有借款信息
  readAlljiekuans,
  // 新增还款安排
  addHaikuananpai,
  // 查询某个借款的欠条
  readQiantiao,
};
