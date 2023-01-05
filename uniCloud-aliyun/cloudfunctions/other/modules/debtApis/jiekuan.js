/*
 * @Author: BORING GHOST
 * @Date: 2022-10-21 10:36:25
 * @LastEditTime: 2022-10-22 21:12:37
 * @Description:
 */
/**
 * qk 借款表的键名
 * month 月份
 * year 年份
 * day 日
 * time 总时间
 * price 借款额度
 * name 借款对象
 * ish 是否还清
 * list[{id:欠条id,ish:是否已还,price:金额,time:还款时间}] 还款安排
 */
const { updateTotalsprice, readTotalsprice } = require("./toasts.js");
const { historyJiekuanProffix, db } = require("./conf.js");
const {
  readYearOrMonthBills,
  updateMonthShouru,
  createMonthBill,
} = require("./years.js");
// qk 借款表单键名扩展处
const JiekuanTableBase = () => {
  const nowdate = new Date();
  return {
    month: nowdate.getMonth() + 1,
    year: nowdate.getFullYear(),
    time: nowdate.getTime(),
    day: nowdate.getDate(),
    name: "",
    ish: false,
    price: 0,
    list: [],
  };
};
/**
 * todo 查询某个借款的欠条
 * @param {string} username 账户名
 * @param {string} billID 单号id
 */
exports.readQiantiao = function (username, billID) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!username || !billID) {
        resolve({
          code: 400,
          message: "缺少用户名或者单号id",
          __debug__: "jiekuanJs readQiantiao",
        });
      } else {
        // 可以读取
        const TABLE_name = historyJiekuanProffix + username;
        const { data } = await db.collection(TABLE_name).doc(billID).get();
        if (data[0]) {
          resolve({
            code: 200,
            message: "查询成功,这是所有的欠条",
            data: data[0]["list"],
          });
        } else {
          resolve({
            code: 400,
            message: "未找到此项借款",
            __debug__: "jiekuanJs readQiantiao",
          });
        }
      }
    } catch (error) {
      resolve({
        code: 400,
        message: "读取失败",
        __debug__: "jiekuanJs readQiantiao 程序错误",
        error,
      });
    }
  });
};
/**
 * todo 新增还款安排
 * @param {string} username 账户名
 * @param {string} billID 单号id
 * @param {string} time 还款时间
 * @param {string} price 金额
 */
exports.addHaikuananpai = function (username, billID, time, price) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!username || !billID) {
        resolve({
          code: 400,
          message: "缺少用户名或者单号id",
          __debug__: "jiekuanJs addHaikuananpai",
        });
      } else if (
        !time ||
        !price ||
        typeof price != "number" ||
        typeof time != "number"
      ) {
        resolve({
          code: 400,
          message: "还款时间,金额参数不对",
          __debug__: "jiekuanJs addHaikuananpai",
        });
      } else {
        const TABLE_name = historyJiekuanProffix + username;
        const bill_result = await db.collection(TABLE_name).doc(billID).get();
        const data = JSON.parse(JSON.stringify(bill_result.data));
        if (data[0]) {
          // 拥有此单号
          // list必须是数组
          if (!Array.isArray(data[0]["list"])) {
            data[0]["list"] = [];
          }
          // list中的金额不能大于这单的总借款
          const sum = data[0]["list"].reduce((a, b) => {
            return a + Number(b.price);
          }, 0);
          if (data[0].price >= sum + price) {
            // 可以添加
            data[0]["list"].push({
              ish: false,
              price: Number(price.toFixed(2)),
              time: time,
              id: Date.now(),
            });
            const { _id, ...other } = data[0];
            await db.collection(TABLE_name).doc(_id).update(other);
            resolve({
              code: 200,
              message: "安排成功",
            });
          } else {
            if (data[0].price - sum === 0) {
              resolve({
                code: 300,
                message: "欠条已经打完啦",
              });
            } else {
              // 超额了
              resolve({
                code: 300,
                message: "只需要打" + (data[0].price - sum) + "元欠条就行了",
              });
            }
          }
        } else {
          resolve({
            code: 400,
            message: "未找到此欠条",
            __debug__: "jiekuanJs addHaikuananpai",
          });
        }
      }
    } catch (error) {
      resolve({
        code: 400,
        message: "新增失败",
        __debug__: "jiekuanJs addHaikuananpai 程序错误",
        error,
      });
    }
  });
};
/**
 * todo 查询所有借款信息
 * @param {string} username 账户名
 */
exports.readAlljiekuans = function (username) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!username) {
        resolve({
          code: 400,
          message: "缺少用户名",
          __debug__: "jiekuanjs readAlljiekuans ",
        });
      } else {
        // 参数验证通过
        const TABLE_name = historyJiekuanProffix + username;
        const { data } = await db
          .collection(TABLE_name)
          .limit(500)
          .orderBy("_id", "desc")
          .get();
        if (data.length > 0) {
          resolve({
            code: 200,
            message: "读取借款信息成功",
            data: data,
          });
        } else {
          resolve({
            code: 200,
            message: "暂时没有欠款",
            data: [],
          });
        }
      }
    } catch (error) {
      resolve({
        code: 400,
        message: "查询借款失败",
        __debug__: "jiekuanjs readAlljiekuans 程序错误",
      });
    }
  });
};

/**
 * todo 添加一条借款信息
 * @param {string} username 账户名
 * @param {string} id 账户iD
 * @param {number} price 借款额度
 * @param {number} name 借款对象
 * 添加借款:
 * 总余额表->结余+,借款+
 * 月表->结余+,借款+
 */
exports.addJiekuan = function (username, id, price, name) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!username || !id) {
        resolve({
          code: 400,
          message: "缺少用户名或者用户ID",
          __debug__: "jiekuanjs addJiekuan ",
        });
      } else if (!price || typeof price !== "number") {
        resolve({
          code: 400,
          message: "借款额度参数错误",
          __debug__: "jiekuanjs addJiekuan ",
        });
      } else if (!name) {
        resolve({
          code: 400,
          message: "借款对象不能为空",
          __debug__: "jiekuanjs addJiekuan ",
        });
      } else {
        // 通过所有验证,可以添加
        const params = JiekuanTableBase();
        params.name = name;
        params.price = Number(price.toFixed(2));
        // qk 总余额表修改
        const toast_result = await readTotalsprice(id);
        if (toast_result.code === 400) {
          resolve(toast_result);
        } else {
          // 查询到此账户的数据,开始修改总账单记录
          let newData = {};
          if (toast_result.code === 300) {
            // 没有这个账号的记录,需要创建,这里直接跟新会自动创建
            newData = {
              jiekuan: Number(params.price.toFixed(2)),
              jieyu: Number(params.price.toFixed(2)),
            };
          } else {
            const { jiekuan, jieyu } = toast_result.data;
            newData = {
              jiekuan: Number(
                Number(jiekuan) + Number(params.price.toFixed(2))
              ),
              jieyu: Number(Number(jieyu) + Number(params.price.toFixed(2))),
            };
          }
          const updateTotal_result = await updateTotalsprice(
            id,
            username,
            newData
          );
          if (updateTotal_result.code === 400) {
            resolve(updateTotal_result);
          }
          // 总账单,跟新成功,可以继续跟新月份表记录
        }
        // qk 年月份账单记录处理
        const yeardata = await readYearOrMonthBills(
          username,
          params.year,
          params.month
        );
        if (yeardata.code === 400) {
          resolve(yeardata);
        } else if (yeardata.code === 300) {
          // 没有这项记录,需要自动创建
          await createMonthBill(username, params.year, params.month, {
            jiekuan: Number(params.price.toFixed(2)),
            jieyu: Number(params.price.toFixed(2)),
          });
          // 月份记录修改完成,继续 总账单记录处理
        } else {
          // 有这项记录就更新
          const zhangdanid = yeardata.data[0]["_id"];
          const jiekuan = Number(
            (yeardata.data[0]["jiekuan"] + params.price).toFixed(2)
          );
          const jieyu = Number(
            (yeardata.data[0]["jieyu"] + params.price).toFixed(2)
          );
          // 有这项记录,直接进行修改就行
          await updateMonthShouru(username, zhangdanid, {
            jiekuan: jiekuan,
            jieyu: jieyu,
          });
          // 月份记录修改完成,继续创建 借款表记录
        }
        const TABLE_name = historyJiekuanProffix + username;
        await db.collection(TABLE_name).add(params);
        resolve({
          code: 200,
          message: "借款添加成功",
        });
      }
    } catch (error) {
      resolve({
        code: 400,
        message: "添加借款失败",
        __debug__: "jiekuanjs addJiekuan 程序错误",
      });
    }
  });
};

/**
 * todo 添加一条还款信息
 * @param {string} username 账户名
 * @param {string} userid 账户ID
 * @param {string} prid 借款单号id
 * @param {number} billid 欠条id
 * 添加借款:
 * 总余额表->结余-,借款-
 * 月表->结余-
 */
exports.addhaikuan = function (username, userid, prid, billid) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!username || !userid || !prid || !billid) {
        resolve({
          code: 400,
          message: "缺少用户名,用户ID,单号ID,欠条ID",
          __debug__: "jiekuanjs addhaikuan ",
        });
      } else {
        // 通过所有验证,可以添加
        // qk 处理借款记录表
        const TABLE_name = historyJiekuanProffix + username;
        const { data } = await db.collection(TABLE_name).doc(prid).get();
        if (data.length <= 0) {
          resolve({
            code: 400,
            message: "并没有查询到此单号",
            __debug__: "jiekuanjs addhaikuan",
          });
        } else {
          const index = data[0]["list"].findIndex((v) => v.id === billid);
          if (index < 0) {
            resolve({
              code: 400,
              message: "没有找到此欠条",
              __debug__: "jiekuanjs addhaikuan",
            });
          } else {
            // 有此欠条
            data[0]["list"][index]["ish"] = true;
            const ish = data[0]["list"].findIndex((v) => v.ish == false);
            data[0]["ish"] = ish < 0;
            const price = data[0]["list"][index]["price"];
            const { _id, ...other } = data[0];
            await db.collection(TABLE_name).doc(_id).update(other);
            // qk 总余额表修改
            const toast_result = await readTotalsprice(userid);
            if (toast_result.code === 400) {
              resolve(toast_result);
            } else {
              // 查询到此账户的数据,开始修改总账单记录
              if (toast_result.code === 300) {
                // 没有这个账号的记录,需要创建,这里直接跟新会自动创建
                resolve({
                  code: 400,
                  message: "这个账单的相关账户失效,需要管理创建",
                  __debug__: "other jiekuanjs addhaikuan",
                });
              } else {
                let newData = {};
                const { jiekuan, jieyu } = toast_result.data;
                newData = {
                  jiekuan: Number((jiekuan - price).toFixed(2)),
                  jieyu: Number((jieyu - price).toFixed(2)),
                };
                const updateTotal_result = await updateTotalsprice(
                  userid,
                  username,
                  newData
                );
                if (updateTotal_result.code === 400) {
                  resolve(updateTotal_result);
                }
                // 总账单,跟新成功,可以继续跟新月份表记录
              }
              // qk 年月份账单记录处理
              const nowdate = new Date();
              const month = nowdate.getMonth() + 1;
              const year = nowdate.getFullYear();
              const yeardata = await readYearOrMonthBills(
                username,
                year,
                month
              );
              if (yeardata.code === 400) {
                resolve(yeardata);
              } else if (yeardata.code === 300) {
                // 没有这项记录,需要自动创建
                await createMonthBill(username, params.year, params.month, {
                  jieyu: Number(price.toFixed(2)),
                });
                // 月份记录修改完成,继续 总账单记录处理
              } else {
                // 有这项记录就更新
                const zhangdanid = yeardata.data[0]["_id"];
                const jieyu = Number(
                  (yeardata.data[0]["jieyu"] - price).toFixed(2)
                );
                // 有这项记录,直接进行修改就行
                await updateMonthShouru(username, zhangdanid, {
                  jieyu: jieyu,
                });
                // 月份记录修改完成,继续处理 借款表记录
                resolve({
                  code: 200,
                  message: "还款成功",
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
      resolve({
        code: 400,
        message: "添加借款失败",
        __debug__: "jiekuanjs addhaikuan 程序错误",
      });
    }
  });
};
