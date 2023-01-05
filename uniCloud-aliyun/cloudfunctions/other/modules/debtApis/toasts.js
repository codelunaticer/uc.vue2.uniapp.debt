/*
 * @Author: BORING GHOST
 * @Date: 2022-10-17 15:34:02
 * @LastEditTime: 2022-10-21 10:33:20
 * @Description:总金额表
 */
const { toastsTablename, db } = require("./conf.js");
// qk 键名
/**
 * shouru 总收入
 * zhichu 总支出
 * jiekuan 所剩借款
 * jieyu  当前结余金额
 */

/**
 * qk
 * todo 判断是否有该用户的记录
 * @param {string} _id 账号id
 */
function hasUser(_id) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!_id) {
        resolve({
          code: 400,
          message: "缺少id",
          __debug__: "toastjs hasUser",
        });
      } else {
        const { data } = await db.collection(toastsTablename).doc(_id).get();
        let code = 300;
        if (data.length > 0) {
          code = 200;
        }
        resolve({
          code,
        });
      }
    } catch (error) {
      console.log(error);
      resolve({
        code: 400,
        message: "查询失败",
        __debug__: "toastjs hasUser 程序错误",
      });
    }
  });
}
/**
 * qk
 * todo 添加一个用户的信息
 * @param {string} _id 账号id
 * @param {string} username 用户名(账号名)
 */
function addUserToast(_id, username) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!_id) {
        resolve({
          code: 400,
          message: "缺少账号id",
          __debug__: "toastjs addUserToast",
        });
      } else if (!username) {
        resolve({
          code: 400,
          message: "缺少用户姓名",
          __debug__: "toastjs addUserToast",
        });
      } else {
        // ! 总账单记录键名可在此扩展 updateTotalsprice
        const result = await db.collection(toastsTablename).add({
          _id,
          username,
          shouru: 0,
          zhichu: 0,
          jieyu: 0,
          jiekuan: 0,
        });
        resolve({
          code: 200,
          message: "添加成功",
        });
      }
    } catch (error) {
      resolve({
        code: 400,
        message: "添加失败",
        __debug__: "toastjs addUserToast 程序错误",
      });
    }
  });
}

/**
 * todo 查询某个账号的总账数据
 * @param {string} _id 账号id
 */
exports.readTotalsprice = function (_id) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!_id) {
        resolve({
          code: 400,
          message: "缺少账号id",
          __debug__: "toastjs readTotalsprice ",
        });
      }
      const { data } = await db.collection(toastsTablename).doc(_id).get();
      if (data.length > 0) {
        const { _id, ...toastinfo } = data[0];
        resolve({
          code: 200,
          message: "查询成功",
          data: toastinfo,
        });
      } else {
        resolve({
          code: 300,
          message: "没有此账号",
          __debug__: "toastjs readTotalsprice ",
        });
      }
    } catch (error) {
      console.log(error);
      resolve({
        code: 400,
        message: "查询失败",
        __debug__: "toastjs readTotalsprice 程序错误",
      });
    }
  });
};

/**
 * todo 修改总金额数据
 * @param {string} _id 账号id
 * @param {string} username 用户名(账号名)
 * @param {object} data 修改的数据
 */
exports.updateTotalsprice = function (_id, username, data) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!_id) {
        resolve({
          code: 400,
          message: "缺少账号id",
          __debug__: "toastjs updateTotalsprice",
        });
      }
      if (!username) {
        resolve({
          code: 400,
          message: "缺少用户名(账号名)",
          __debug__: "toastjs updateTotalsprice",
        });
      }
      if (!data || JSON.stringify(data) == "{}") {
        resolve({
          code: 400,
          message: "缺少需要修改的数据",
          __debug__: "toastjs updateTotalsprice",
        });
      }
      // qk 修改函数
      function update(data) {
        return new Promise(async (resolve, reject) => {
          try {
            // ! 总账单记录键名可在此扩展,addUserToast处也需要修改
            let obj = {};
            if (data.shouru || data.shouru == 0) {
              obj.shouru = Number(data.shouru);
            }
            if (data.zhichu || data.zhichu == 0) {
              obj.zhichu = Number(data.zhichu);
            }
            if (data.jieyu || data.jieyu == 0) {
              obj.jieyu = Number(data.jieyu);
            }
            if (data.jiekuan || data.jiekuan == 0) {
              obj.jiekuan = Number(data.jiekuan);
            }
            await db
              .collection(toastsTablename)
              .doc(_id)
              .update({
                ...obj,
              });
            resolve({
              code: 200,
              message: "修改成功!",
            });
          } catch (error) {
            resolve({
              code: 400,
              message: "修改失败",
              __debug__: "toastjs updateTotalsprice updatearg 程序错误",
            });
          }
        });
      }
      const result = await hasUser(_id);
      if (result.code === 400) {
        resolve(result);
      } else if (result.code === 300) {
        // 没有该记录时自动添加
        const result2 = await addUserToast(_id, username);
        if (result2.code == 400) {
          resolve(result2);
        } else {
          // 自动创建成功,可以修改
          const result3 = await update(data);
          resolve(result3);
        }
      } else {
        // 已有记录,可以直接修改
        const result3 = await update(data);
        resolve(result3);
      }
      resolve({
        code: 301,
      });
    } catch (error) {
      resolve({
        code: 400,
        message: "修改失败",
        __debug__: "toastjs updateTotalsprice 程序错误",
      });
    }
  });
};

exports.addUserToast = addUserToast;
