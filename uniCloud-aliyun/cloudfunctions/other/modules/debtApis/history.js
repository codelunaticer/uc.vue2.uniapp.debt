/*
 * @Author: BORING GHOST
 * @Date: 2022-10-18 14:27:48
 * @LastEditTime: 2022-10-21 16:14:12
 * @Description:
 */
const { historyProffix, db } = require("./conf.js");
const { updateTotalsprice, readTotalsprice } = require("./toasts.js");
const {
  readYearOrMonthBills,
  updateMonthShouru,
  createMonthBill,
} = require("./years.js");
/**
 * qk 单条历史账单键名
 * month 月份
 * year 年份
 * day 日
 * time 总时间
 * name 物品名称
 * price 物品价格
 * type 账单类型 支出:'zhichu' 收入: 'shouru'
 * dianpu 店铺名称
 * images 多张图片信息(可选)
 * other 其它信息
 */
/**
 * todo 查询某个月的所有历史账单(单项账单历史表)
 * @param {string} username 账户名
 * @param {number} year 年份
 * @param {number} month 年份
 */
exports.readHistoryMonthBills = function (username, year, month) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!username) {
        resolve({
          code: 400,
          message: "缺少用户名",
          __debug__: "history readHistoryMonthBills ",
        });
      } else if (!year || typeof year !== "number") {
        resolve({
          code: 400,
          message: "年份参数错误",
          __debug__: "history readHistoryMonthBills ",
        });
      } else if (!month || typeof month !== "number") {
        resolve({
          code: 400,
          message: "月份参数错误",
          __debug__: "history readHistoryMonthBills ",
        });
      } else {
        // 通过所有验证,可以查询
        const TABLE_name = historyProffix + username;
        const { data } = await db
          .collection(TABLE_name)
          .limit(500)
          .where({
            year,
            month,
          })
          .orderBy("day", "desc")
          .get();
        if (data[0]) {
          resolve({
            code: 200,
            message: "读取成功",
            data: data,
          });
        } else {
          resolve({
            code: 200,
            message: "暂无数据",
            data: [],
          });
        }
      }
    } catch (error) {
      resolve({
        code: 400,
        message: "读取数据失败",
        __debug__: "history readHistoryMonthBills 程序错误",
      });
    }
  });
};
/**
 * todo 添加一条收入账单
 */
exports.addSingleShouruBill = function (params, username, id) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!username || !id) {
        resolve({
          code: 400,
          message: "缺少用户名或者用户ID",
          __debug__: "history addSingleShouruBill ",
        });
      } else if (
        Object.prototype.toString.call(params) != "[object Object]" ||
        JSON.stringify(params) == "{}"
      ) {
        resolve({
          code: 400,
          message: "参数错误",
          __debug__: "history addSingleShouruBill ",
        });
      } else {
        const { name, price, dianpu, images, other } = params;
        const reuslt = hasAttribute(
          name,
          price,
          "shouru",
          dianpu,
          images,
          other
        );
        if (reuslt.code == 400) {
          resolve(reuslt);
        } else {
          // 参数没有问题
          // qk 年月份账单记录处理
          const yeardata = await readYearOrMonthBills(
            username,
            reuslt.data.year,
            reuslt.data.month
          );
          if (yeardata.code === 400) {
            resolve(yeardata);
          } else if (yeardata.code === 300) {
            // 没有这项记录,需要自动创建
            await createMonthBill(
              username,
              reuslt.data.year,
              reuslt.data.month,
              {
                shouru: reuslt.data.price,
                jieyu: reuslt.data.price,
              }
            );
            // 月份记录修改完成,继续 总账单记录处理
          } else {
            const id = yeardata.data[0]["_id"];
            const shouru = Number(
              (Number(yeardata.data[0]["shouru"]) + reuslt.data.price).toFixed(
                2
              )
            );
            const jieyu = Number(
              (Number(yeardata.data[0]["jieyu"]) + reuslt.data.price).toFixed(2)
            );
            // 有这项记录,直接进行修改就行
            await updateMonthShouru(username, id, {
              shouru: shouru,
              jieyu: jieyu,
            });
            // 月份记录修改完成,继续 总账单记录处理
          }
          // qk 总账单记录处理
          const result3 = await readTotalsprice(id);
          if (result3.code === 400) {
            resolve(result3);
          } else {
            // 查询到此账户的数据,开始修改总账单记录
            try {
              let newData = {};
              if (result3.code === 300) {
                // 没有这个账号的记录,需要创建,这里直接跟新会自动创建
                newData = {
                  shouru: Number(reuslt.data.price.toFixed(2)),
                  jieyu: Number(reuslt.data.price.toFixed(2)),
                };
              } else {
                const { shouru, jieyu } = result3.data;
                newData = {
                  shouru: Number((shouru + price).toFixed(2)),
                  jieyu: Number((jieyu + price).toFixed(2)),
                };
              }
              const result2 = await updateTotalsprice(id, username, newData);
              if (result2.code === 400) {
                resolve(result2);
              }
              // 总账单,跟新成功,开始创建单个账单记录
              // resolve({
              //   code: 200,
              //   message: "收入账单添加成功",
              // });
            } catch (error) {
              resolve({
                code: 400,
                message: "修改数据失败",
                __debug__: "history addSingleShouruBill ",
              });
            }
          }
          // qk 跟新单个账单记录
          const historyTablename = historyProffix + username;
          await db.collection(historyTablename).add(reuslt.data);
          resolve({
            code: 200,
            message: "账单添加成功",
          });
        }
      }
    } catch (error) {
      resolve({
        code: 400,
        message: "添加失败",
        __debug__: "history addSingleShouruBill 程序错误",
      });
    }
  });
};
/**
 * todo 添加一条支出账单
 * @param {object} ...同上
 */
exports.addSingleZhichuBill = function (params, username, id) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!username || !id) {
        resolve({
          code: 400,
          message: "缺少用户名或者用户ID",
          __debug__: "history addSingleShouruBill ",
        });
      } else if (
        Object.prototype.toString.call(params) != "[object Object]" ||
        JSON.stringify(params) == "{}"
      ) {
        resolve({
          code: 400,
          message: "参数错误",
          __debug__: "history addSingleShouruBill ",
        });
      } else {
        const { name, price, dianpu, images, other } = params;
        const reuslt = hasAttribute(
          name,
          price,
          "zhichu",
          dianpu,
          images,
          other
        );
        if (reuslt.code == 400) {
          resolve(reuslt);
        } else {
          // 参数没有问题
          // qk 年月份账单记录处理
          const yeardata = await readYearOrMonthBills(
            username,
            reuslt.data.year,
            reuslt.data.month
          );
          if (yeardata.code === 400) {
            resolve(yeardata);
          } else if (yeardata.code === 300) {
            // 没有这项记录,需要自动创建
            await createMonthBill(
              username,
              reuslt.data.year,
              reuslt.data.month,
              {
                zhichu: reuslt.data.price,
                jieyu: Number((0 - reuslt.data.price).toFixed(2)),
              }
            );
            // 月份记录修改完成,继续 总账单记录处理
          } else {
            const id = yeardata.data[0]["_id"];
            const zhichu = Number(
              (Number(yeardata.data[0]["zhichu"]) + reuslt.data.price).toFixed(
                2
              )
            );
            const jieyu = Number(
              (Number(yeardata.data[0]["jieyu"]) - reuslt.data.price).toFixed(2)
            );
            // 有这项记录,直接进行修改就行
            await updateMonthShouru(username, id, {
              zhichu: zhichu,
              jieyu: jieyu,
            });
            // 月份记录修改完成,继续 总账单记录处理
          }
          // qk 总账单记录处理
          const result3 = await readTotalsprice(id);
          if (result3.code === 400) {
            resolve(result3);
          } else {
            // 查询到此账户的数据,开始修改总账单记录
            try {
              let newData = {};
              if (result3.code === 300) {
                // 没有这个账号的记录,需要创建,这里直接跟新会自动创建
                newData = {
                  zhichu: Number(reuslt.data.price.toFixed(2)),
                  jieyu: Number((0 - reuslt.data.price).toFixed(2)),
                };
              } else {
                const { zhichu, jieyu } = result3.data;
                newData = {
                  zhichu: Number((zhichu + price).toFixed(2)),
                  jieyu: Number((jieyu - price).toFixed(2)),
                };
              }
              const result2 = await updateTotalsprice(id, username, newData);
              if (result2.code === 400) {
                resolve(result2);
              }
              // 总账单,跟新成功,开始创建单个账单记录
              // resolve({
              //   code: 200,
              //   message: "收入账单添加成功",
              // });
            } catch (error) {
              resolve({
                code: 400,
                message: "修改数据失败",
                __debug__: "history addSingleShouruBill ",
              });
            }
          }
          // qk 跟新单个账单记录
          const historyTablename = historyProffix + username;
          await db.collection(historyTablename).add(reuslt.data);
          resolve({
            code: 200,
            message: "账单添加成功",
          });
        }
      }
    } catch (error) {
      resolve({
        code: 400,
        message: "添加失败",
        __debug__: "history addSingleShouruBill 程序错误",
      });
    }
  });
};

/**
 * qk 判断参数是否拥有添加账单的所有必须属性
 * 如果缺少返回code:400
 * 返回可以使用的数据
 */
function hasAttribute(name, price, type, dianpu, images, other) {
  const resultfn = (message = "操作失败") => ({
    code: 400,
    message,
    __debug__: "history hasAttribute",
  });
  try {
    if (!name) return resultfn("缺少物品名称");
    if (!type) return resultfn("缺少账单类型");
    if (!dianpu) return resultfn("缺少店铺名称");
    if (!price && price != 0) {
      return resultfn("缺少物品价格");
    }
    const nowdate = new Date();
    // ! 需要更多参数可以在这里扩展
    let value = {
      month: nowdate.getMonth() + 1,
      year: nowdate.getFullYear(),
      time: nowdate.getTime(),
      day: nowdate.getDate(),
      name,
      price: Number(price.toFixed(2)),
      type,
      dianpu,
      images: [],
      other: {},
    };
    if (Array.isArray(images) && images.length > 0) {
      value.images = images;
    }
    if (
      Object.prototype.toString.call(other) == "[object Object]" &&
      JSON.stringify(other) !== "{}"
    ) {
      value.other = other;
    }
    return {
      code: 200,
      message: "判断成功",
      data: value,
    };
  } catch (error) {
    return resultfn("history hasAttribute 参数处理失败 程序错误");
  }
}
