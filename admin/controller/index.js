const Base = require('./base.js');

module.exports = class extends Base {
  indexAction() {
    return this.display();
  }

  async uptokenAction() {
    const qiniu = require('qiniu');
    var mac = new qiniu.auth.digest.Mac(this.config('qiniu.appkey'), this.config('qiniu.appsec'));
    var putPolicy = new qiniu.rs.PutPolicy({scope: this.config('qiniu.bucket')});
    var uptoken = putPolicy.uploadToken(mac);

    return this.json({errno: 0, uptoken: uptoken, region: this.config('qiniu.region')});
  }
};
