const Base = require('./base.js');

module.exports = class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  async indexAction() {
    const page = this.get('page') || 1;
    const size = this.get('size') || 10;
    const name = this.get('name') || '';

    const model = this.model('admin');
    const data = await model.where({username: ['like', `%${name}%`]}).order(['id DESC']).field('id,username,add_time,update_time,last_login_time,last_login_ip').page(page, size).countSelect();

    return this.success(data);
  }

  async infoAction() {
    const id = this.get('id');
    const model = this.model('admin');
    const data = await model.where({id: id}).field('id,username,add_time,update_time,last_login_time,last_login_ip').find();

    return this.success(data);
  }

  async storeAction() {
    if (!this.isPost) {
      return false;
    }

    const values = this.post();
    const id = this.post('id');

    const model = this.model('admin');
    if (id > 0) {
      if (values.password) {
        const salt = await model.where({id: id}).getField('password_salt', true);
        values.password = think.md5(values.password + '' + salt);
      }

      await model.where({id: id}).update(values);
    } else {
      delete values.id;

      if (values.password) {
        const salt = Math.random().toString(36).substring(2, 8).toUpperCase();
        values.password = think.md5(values.password + salt);
        values.password_salt = salt;
      }
      await model.add(values);
    }
    return this.success(values);
  }

  async destroyAction() {
    const id = parseInt(this.post('id'));
    // 不允许删除管理员
    if (id === 1) {
      this.fail('参数错误');
    }
    await this.model('admin').where({id: id}).limit(1).delete();

    return this.success();
  }
};
