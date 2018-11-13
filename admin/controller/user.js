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

    const model = this.model('user');
    const data = await model.where({nickname: ['like', `%${name}%`]}).order(['id DESC']).field('id,nickname,gender,register_time,last_login_time,last_login_ip,register_ip,add_time,avatar').page(page, size).countSelect();

    return this.success(data);
  }

  async footprintAction() {
    const page = this.get('page') || 1;
    const size = this.get('size') || 10;
    const uid = this.get('uid');
    const data = await this.model('footprint').alias('fp').field('g.list_pic_url,g.name,g.goods_sn,fp.*').join({
      table: 'goods',
      join: 'inner',
      as: 'g',
      on: ['g.id', 'fp.goods_id']
    }).where({user_id: uid}).order(['id DESC']).page(page, size).countSelect();

    return this.success(data);
  }

  async collectAction() {
    const page = this.get('page') || 1;
    const size = this.get('size') || 10;
    const uid = this.get('uid');
    const data = await this.model('collect').alias('c').field('g.list_pic_url,g.name,g.goods_sn,c.*').join({
      table: 'goods',
      join: 'inner',
      as: 'g',
      on: ['g.id', 'c.value_id']
    }).where({user_id: uid, 'c.type_id': 0}).order(['id DESC']).page(page, size).countSelect();

    return this.success(data);
  }

  async infoAction() {
    const id = this.get('id');
    const model = this.model('user');
    const data = await model.where({id: id}).field('nickname,gender,register_time,last_login_time,last_login_ip,register_ip,add_time,avatar').find();

    return this.success(data);
  }

  async storeAction() {
    if (!this.isPost) {
      return false;
    }

    const values = this.post();
    const id = this.post('id');

    const model = this.model('user');
    if (id > 0) {
      await model.where({id: id}).update(values);
    } else {
      delete values.id;
      await model.add(values);
    }
    return this.success(values);
  }

  async destroyAction() {
    const id = this.post('id');
    await this.model('user').where({id: id}).limit(1).delete();

    return this.success();
  }
};
