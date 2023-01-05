/*
 * @Author: BORING GHOST
 * @Date: 2022-10-17 15:41:07
 * @LastEditTime: 2022-10-21 10:38:30
 * @Description:
 */
exports.db = uniCloud.database();
// qk 各类表格名称,必须都是小写
exports.toastsTablename = "toasts"; // 用户总金额表

exports.historyProffix = "billhistory_"; // 单项账单历史记录表前缀

exports.historyyearProffix = "billyearhistory_"; // 年份账单历史记录表前缀

exports.historyJiekuanProffix = "billjiekuan_"; // 借款记录表前缀
