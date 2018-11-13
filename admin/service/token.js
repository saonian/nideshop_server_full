const jwt = require('jsonwebtoken');
const secret = 'SLDLKKDS323%d$3d#ssdd@#@gf&*987h23dHG';

module.exports = class extends think.Service {
  /**
   * 根据header中的X-Nideshop-Token值获取用户id
   */
  async getUserId(token) {
    if (!token) {
      return 0;
    }

    const result = await this.parse(token);
    if (think.isEmpty(result) || result.id <= 0) {
      return 0;
    }

    return result.id;
  }

  async create(userInfo) {
    // 若使用session_key来加密，则需要缓存session_key，并保证缓存时间大于token过期时间
    // 这里使用固定的密钥
    const token = jwt.sign(userInfo, secret);
    return token;
  }

  async parse(token) {
    if (token) {
      try {
        return jwt.verify(token, secret);
      } catch (err) {
        return null;
      }
    }
    return null;
  }

  async verify(token) {
    const result = await this.parse(token);
    if (think.isEmpty(result)) {
      return false;
    }

    return true;
  }
};
