/*
 * @Author: BORING GHOST
 * @Date: 2022-10-10 11:12:26
 * @LastEditTime: 2022-10-22 16:13:05
 * @Description: 页面路径管理
 */
/**
 * todo 调用对应的页面路径
 * @param {string} login 登录页
 * @param {string} resist 注册页
 * @param {string} center 个人中心
 * @param {string} debt 债务
 * @param {string} task 任务
 * @param {string} modifyData 修改资料
 * @param {string} historybill 历史账单
 * @param {string} pay 加一笔消费
 * @param {string} shouru 加一笔收入
 * @param {string} qiankuan 欠款记录
 * @param {string} haikuan 还款列表
 */
export function routes(KEY) {
  if (!KEY) {
    throw Error("页面路径调用错误(routes.js)");
  }
  const conf = {
    login: "/pages/login/login",
    resist: "/pages/resist/resist",
    center: "/pages/center/center",
    debt: "/pages/debt/debt",
    task: "/pages/task/task",
    modifyData: "/pagesA/center/modifyData/modifyData",
    historybill: "/pagesB/historybill/historybill",
    pay: "/pagesB/pay/pay",
    shouru: "/pagesB/shouru/shouru",
    qiankuan: "/pagesB/qiankuan/qiankuan",
    haikuan: "/pagesB/qiankuan/haikuan",
  };
  if (!conf[KEY]) {
    throw Error("没有这个页面(routes.js)");
  }
  return conf[KEY];
}
