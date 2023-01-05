# 如何搭建

> 需要对下面的配置文件进行配置,否则无法运行(如果没有文件需要手动创建)

## 1. configs/ips.js

```js
/**
 * todo 项目的静态资源
 */
export const OSSBaseip = {
  // 登陆页面的背景图片
  loginBG: "https://**/loginbg.svg",
  // 登录页面中form表单input框用户名图标
  formUserIcon: "https://**/form_icon_user.svg",
  // 登录页面中form表单input框密码图标
  formPasswordIcon: "https://**/form_icon_password.svg",
  // 注册页面背景
  resistBG: "https://**/resistbg.svg",
  // 注册页面头像
  resistProfile: "https://**/resistProfile.svg",
  // loading动画
  loadingPath: "https://**/loading.svg",
};
```

## 2.

> uniCloud-aliyun/cloudfunctions/userlogin/dev.config.js 跟 uniCloud-aliyun/cloudfunctions/other/dev.config.js

```js
// 微信公众平台appid
exports.appid = "";
// 微信公众平台密钥
exports.wxSecret = "";
// jwt密钥
exports.jwtSecret = "";
```

## 3. 手动在 unicloud 控制台添加一张 weixinAuths 的数据表,然后将自己在注册页获取的 id 录入(否则当前微信没有使用权,只能使用游客账号)

示例:

```
注册页获取到的id: sdfsaaff
weixinAuths表添加一项纪录
{
  _id:"sdfsaaff",
  createTime:1665458971132 // 这个只是当前的时间戳
}
```

## 4. 添加一个游客账号的权限,weixinAuths 表中添加一项记录

`这项纪录是固定的`

```
{
  "_id": "wqhl3lhj1l32l19safilyouke",
  "createTime": 1665458971333,
  "type": "youke" // 这个属性必须是youke
}
```

# 测试环境

微信开发者工具: iPhone 12/13 mini 100%

# 云 api

- 余额计算

```js
余额:150		 欠:150			实际:余额-欠款
//0->100        100->50	      50->-50	    -50->150	     150->50	     50->200	  200->150
借100(余+ 欠+) 	消费50(余-)	 消费100(余-)	借200(余+ 欠+)	还100(余-欠-)	工资150(+)	还 50(余- 欠-)
// todo
借款:余额 +  欠款 +
还款:余额 - 欠款 -
消费:余额-
收入:余额+
```

- userlogin

1. `weixinAuthor` 登录授权:查看这个微信有没有使用的权限

```
uniCloud.callFunction({
    name: "userlogin",
    data: {
      api: "weixinAuthor",
      code,
  },
}
```

2. `readweixinID` 读取微信 ID:单独为某个微信读取自己的 id

```
uniCloud.callFunction({
    name: "userlogin",
    data: {
      api: "readweixinID",
      code,
  },
}
```

3. `touristLOGIN` 游客登录:获取游客账号的 token

```
uniCloud.callFunction({
    name: "userlogin",
    data: {
      api: "touristLOGIN",
      code, // 可随便填写
  },
}
```

4. `usrloginapi` 校验账号:校验账号密码的正确性(在一个账号都没有的情况下就会自动创建)

```
uniCloud.callFunction({
    name: "userlogin",
    data: {
     api: "usrloginapi",
     token,
     username: this.form.name,
     password: this.form.password,
  },
}
```

5. `addUsername` 单独创建一个账号

```
uniCloud.callFunction({
    name: "userlogin",
    data: {
     api: "addUsername",
      username: this_.form.name,
      password: this_.form.password,
      token
  },
}
```

- other

6. `getUserInfo` 获取某个账号的信息

```
uniCloud.callFunction({
   name: "other",
   data: {
     api: "getUserInfo",
     token,
     username:"",
   },
}
```

7. `updateUserinfo` 跟新某个用户的信息

```
uniCloud.callFunction({
   name: "other",
   data: {
   api: "updateUserinfo",
   token,
   asia: "",// 网名
   description: this.form.description || "",//签名
   _id: this.$store.getters._id,
   avatar?: this.form.avatar || "",
  },
}
```

- other debtApis(债务模块)

8. `updateTotalsprice` 跟新某个账号的总债务信息
   `非必要不要再项目中使用`

```
uniCloud.callFunction({
   name: "other",
    data: {
      api: "updateTotalsprice",
      id: this.$store.state.user._id || "",
      username,
      token,
      data: { zhichu?: "12", shouru?: "122", jieyu?: 1233 },
    },
}
```

9. `readTotalsprice` 查询某个账号的债务信息

```
uniCloud.callFunction({
   name: "other",
    data: {
      api: "readTotalsprice",
      id: this.$store.state.user._id || "",
      token,
    },
}
```

10. `addSingleZhichuBill` 添加一条支出账单

```
/**
 * name 物品名称
 * price 物品价格
 * dianpu 店铺名称
 * images 多张图片信息(可选)
 * other 其它信息(可选)
 */
uniCloud.callFunction({
   name: "other",
    data: {
      api: "addSingleZhichuBill",
      username: this.$store.state.user.username || "",
      id: this.$store.state.user._id || "",
      bill: {
        name: "工资",
        dianpu: "公司",
        price: "1000",
        images: ["https://www.baidu.com/img/flexible/logo/pc/result@2.png"],
        other: { sdf: "121312" },
      },
      token: uni.getStorageSync(this.$xlb_staticEdit["token_KEY"]) || "",
  },
        success(res) {
          console.log(res);
        },
        fail(e) {
          console.log(e);
        },
        complete() {
          uni.hideLoading();
        },
      });
```

11. `addSingleShouruBill` 添加一条收入账单

```
/**
 * name 物品名称
 * price 物品价格
 * dianpu 店铺名称
 * images 多张图片信息(可选)
 * other 其它信息(可选)
 */
uniCloud.callFunction({
   name: "other",
    data: {
      api: "addSingleShouruBill",
      username: this.$store.state.user.username || "",
      id: this.$store.state.user._id || "",
      bill: {
        name: "工资",
        dianpu: "公司",
        price: "1000",
        images: ["https://www.baidu.com/img/flexible/logo/pc/result@2.png"],
        other: { sdf: "121312" },
      },
      token: uni.getStorageSync(this.$xlb_staticEdit["token_KEY"]) || "",
    },
        success(res) {
          console.log(res);
        },
        fail(e) {
          console.log(e);
        },
        complete() {
          uni.hideLoading();
        },
      });
```

12. `readYearOrMonthBills` 查询年份/月份总历史记录

```
uniCloud.callFunction({
   name: "other",
    data: {
       api: "readYearOrMonthBills",
       username: this.$store.state.user.username || "",
       year: year,
       month?:month,
       token: "",
     },
}
```

13. `readHistoryMonthBills` 查询某个月的所有历史账单(单项账单历史表)

```
uniCloud.callFunction({
   name: "other",
     data: {
       api: "readHistoryMonthBills",
       year,
       month,
       username: this.$store.state.user.username || "",
       token: uni.getStorageSync(this.$xlb_staticEdit["token_KEY"]) || "",
     },
}
```

13. `addJiekuan` 添加一条借款信息

```
uniCloud.callFunction({
   name: "other",
    data: {
      api: "addJiekuan",
      id: this.$store.state.user._id || "",
      price: 12,
      name: "支付宝",
      username: this.$store.state.user.username || "",
      token: uni.getStorageSync(this.$xlb_staticEdit["token_KEY"]) || "",
    },
}
```

14. `addhaikuan` 添加一条还款信息

```
uniCloud.callFunction({
   name: "other",
    data: {
      api: "addhaikuan",
      username: this.$store.state.user.username || "",
      prid: this.billid || "",
      userid: this.$store.state.user._id || "",
      billid: id,
      token:
        uni.getStorageSync(this.$xlb_staticEdit["token_KEY"]) || "",
    },
}
```

15. `readAlljiekuans` 查询所有借款信息

```
uniCloud.callFunction({
   name: "other",
    data: {
      api: "readAlljiekuans",
      username: this.$store.state.user.username || "",
      token: uni.getStorageSync(this.$xlb_staticEdit["token_KEY"]) || "",
    },
}
```

16. `addHaikuananpai` 新增还款安排

```
uniCloud.callFunction({
   name: "other",
    data: {
      api: "addHaikuananpai",
      billid: this.billid,
      time: res.time,
      price: res.price,
      username: this.$store.state.user.username || "",
      token:
        uni.getStorageSync(this.$xlb_staticEdit["token_KEY"]) ||
        "",
    },
}
```
