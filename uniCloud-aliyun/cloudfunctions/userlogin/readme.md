# 使用

1. 将 userlogin 目录放入 cloudfunctions 下
2. 打开 userlogin 目录下的配置文件.js,按要求配置好并且重命名好
3. 可以参照示例文件进行使用

# api 简单介绍

```js
uniCloud.callFunction({
  name: "userlogin",
  data: {
    api: "weixinAuthor", // 首先需用通过这个接口进行用户授权,得到返回的token
    code: "", // 必须传入有效的微信code
  },
});

// 然后

uniCloud.callFunction({
  name: "userlogin",
  data: {
    api: "usrloginapi", // 拥有token的情况下,调用这个接口校验账号密码,如果没有这个账号,会自动创建,有的话会校验密码的正确性,最后会返回该账号的用户信息
    token: uni.getStorageSync("token"), // 接口必须携带token
    username: this.form.username,
    password: this.form.password,
  },
});
```
