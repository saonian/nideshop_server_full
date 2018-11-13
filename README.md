## 使用说明

1. 将整个目录复制到原作者项目的src目录下

2. 修改common/config/config.js文件，加入以下七牛配置

   `qiniu: {
       appkey: 'your appkey',
       appsec: 'your appsec',
       domain: 'http://domain/', // 需要保留http，结尾带斜杠，用来与图片组合成URL
       bucket: 'your bucket',
       region: 'ECN'
     }`

由于think.js太烂，本项目不再更新，如若发现问题自行解决。