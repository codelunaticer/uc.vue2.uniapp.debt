/*
 * @Author: BORING GHOST
 * @Date: 2022-10-09 14:26:52
 * @LastEditTime: 2022-10-22 14:58:39
 * @Description:
 */
import { OSSBaseip } from "./ips.js";
import { routes } from "./routes.js";
import { asyncSleep, errMsg, imageToBase64 } from "./utils.js";
import { staticEdit } from "./conf.js";
// qk 全局过滤器
import { formatDate, formatDateAll } from "./filters.js";

export default {
  install(app) {
    app.prototype.CONF_OSSBaseip = OSSBaseip;
    app.prototype.GOTO_PageFn = routes;
    app.prototype.$xlb_asyncSleep = asyncSleep;
    app.prototype.$xlb_staticEdit = staticEdit;
    app.prototype.$xlb_errmessage = errMsg;
    app.prototype.$xlb_imageToBase64 = imageToBase64;
    app.filter(formatDate.name, formatDate.fn);
    app.filter(formatDateAll.name, formatDateAll.fn);
  },
};
