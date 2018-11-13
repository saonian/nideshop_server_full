该项目为原nideshop服务端后台API完善版。
由于think.js太烂，本项目不再更新，如若发现问题自行解决。

管理界面：[nideshop_admin_full](https://github.com/saonian/nideshop_admin_full)

## 使用说明

1. 导入shop.sql（在原数据库基础上做了精简优化），并修改数据库配置文件

2. 将整个目录复制到原作者项目的src目录下

3. 修改common/config/config.js文件，加入以下七牛配置（图片放在七牛）

   `qiniu: {
       appkey: 'your appkey',
       appsec: 'your appsec',
       domain: 'http://domain/', // 需要保留http，结尾带斜杠，用来与图片组合成URL
       bucket: 'your bucket',
       region: 'ECN'
     }`

4. 管理员账户：admin/jiafeimao