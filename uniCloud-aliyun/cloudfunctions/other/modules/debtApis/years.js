/*
 * @Author: BORING GHOST
 * @Date: 2022-10-19 09:50:12
 * @LastEditTime: 2022-10-21 10:35:00
 * @Description:
 */
/**
 * qk 年份记录表键名
 * year 年份
 * month 月份
 * shouru 收入
 * zhichu 支出
 * jieyu 结余
 * jiekuan 借款
 */

const { db, historyyearProffix } = require("./conf.js");

/**
 * todo 创建一个月份记录
 * @param {string} username 用户名,账户名
 * @param {string} year 年份
 * @param {string} month 月份(可选参)
 * @param {object} params 修改的值(可选:初始值)
 */
exports.createMonthBill = function (username, year, month, params = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!username) {
        resolve({
          code: 400,
          message: "缺少用户名,账户名",
          __debug__: "other debtapis yearsjs createMonthBill",
        });
      } else if (!year || typeof year !== "number") {
        resolve({
          code: 400,
          message: "年份参数不正确",
          __debug__: "other debtapis yearsjs createMonthBill",
        });
      } else if (!month || typeof month !== "number") {
        resolve({
          code: 400,
          message: "月份参数不正确",
          __debug__: "other debtapis yearsjs createMonthBill",
        });
      } else if (Object.prototype.toString.call(params) != "[object Object]") {
        resolve({
          code: 400,
          message: "初始参数错误",
          __debug__: "other debtapis yearsjs createMonthBill ",
        });
      } else {
        // ! 月份账单记录键名可在此扩展 updateMonthShouru
        let obj = {
          year: Number(year),
          month: Number(month),
          shouru: 0,
          zhichu: 0,
          jieyu: 0,
          jiekuan: 0,
        };
        const { shouru, zhichu, jieyu, jiekuan } = params;
        if (shouru) {
          obj.shouru = Number(shouru);
        }
        if (zhichu) {
          obj.zhichu = Number(zhichu);
        }
        if (jieyu) {
          obj.jieyu = Number(jieyu);
        }
        if (jiekuan) {
          obj.jiekuan = Number(jiekuan);
        }
        const TABLE_name = historyyearProffix + username;
        await db.collection(TABLE_name).add(obj);
        resolve({
          code: 200,
          message: "创建月份账单成功",
        });
      }
    } catch (error) {
      resolve({
        code: 400,
        message: "创建月份账单失败",
        __debug__: "other debtapis yearsjs createMonthBill 程序错误",
      });
    }
  });
};
/**
 * todo 修改某月的收入
 * @param {string} username 用户名,账户名
 * @param {string} id 账单id
 * @param {object} params 修改的值
 */
exports.updateMonthShouru = function (username, id, params) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!username) {
        resolve({
          code: 400,
          message: "缺少用户名,账户名",
          __debug__: "other debtapis yearsjs createMonthBill",
        });
      } else if (!id) {
        resolve({
          code: 400,
          message: "缺少账单id",
          __debug__: "other debtapis yearsjs updateMonthShouru",
        });
      } else if (
        Object.prototype.toString.call(params) != "[object Object]" ||
        JSON.stringify(params) == "{}"
      ) {
        resolve({
          code: 400,
          message: "修改参数不正确",
          __debug__: "other debtapis yearsjs updateMonthShouru",
        });
      } else {
        // ! 月份账单记录键名可在此扩展 createMonthBill
        const { shouru, zhichu, jieyu, jiekuan } = params;
        let obj = {};
        if (shouru) {
          obj.shouru = Number(shouru);
        }
        if (zhichu) {
          obj.zhichu = Number(zhichu);
        }
        if (jieyu) {
          obj.jieyu = Number(jieyu);
        }
        if (jiekuan) {
          obj.jiekuan = Number(jiekuan);
        }
        if (JSON.stringify(obj) == "{}") {
          resolve({
            code: 400,
            message: "修改参数不正确",
            __debug__: "other debtapis yearsjs updateMonthShouru",
          });
        }
        const TABLE_name = historyyearProffix + username;
        await db.collection(TABLE_name).doc(id).update(obj);
        resolve({
          code: 200,
          message: "修改月份收入成功",
        });
      }
    } catch (error) {
      console.log(error);
      resolve({
        code: 400,
        message: "修改月份收入失败",
        __debug__: "other debtapis yearsjs updateMonthShouru 程序错误",
      });
    }
  });
};
/**
 * todo 读取某一年或者某月的账单
 * @param {string} username 用户名,账户名
 * @param {string} year 年份
 * @param {string} month 月份(可选参)
 */
exports.readYearOrMonthBills = function (username, year, month = 0) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!username) {
        resolve({
          code: 400,
          message: "缺少用户名,账户名",
          __debug__: "other debtapis yearsjs readYearBills",
        });
      } else if (!year || typeof year !== "number") {
        resolve({
          code: 400,
          message: "年份参数不正确",
          __debug__: "other debtapis yearsjs readYearBills",
        });
      } else {
        const TABLE_name = historyyearProffix + username;
        let arg = { year: year };
        if (month && typeof month === "number") {
          arg.month = Number(month);
        }
        const { data } = await db.collection(TABLE_name).where(arg).get();
        if (data[0]) {
          resolve({
            code: 200,
            message: "读取年/月份份数据成功",
            data: data,
          });
        } else {
          resolve({
            code: 300,
            message: "暂无记录",
            data: [],
          });
        }
      }
    } catch (error) {
      resolve({
        code: 400,
        message: "读取年/月份数据失败",
        __debug__: "other debtapis yearsjs readYearBills 程序错误",
      });
    }
  });
};
