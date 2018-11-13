const Base = require('./base.js');

module.exports = class extends Base {

  async indexAction() {
    const page = this.get('page') || 1;
    const size = this.get('size') || 10;
    const coupon = this.get('coupon');
    const coupons = await this.model('coupon').where({coupon: ['like', `%${coupon}%`]}).order(['id DESC']).page(page, size).countSelect();

    for (const item of coupons.data) {
      item.user = await this.model('user').where({id: item.user_id}).field('nickname').find();
    }

    return this.success(coupons);
  }

  async infoAction() {
    const coupon = await this.model('coupon').where({id: parseInt(this.get('id'))}).find();

    coupon.user = await this.model('user').where({id: coupon.user_id}).field('nickname').find();

    return this.success(coupon);
  }

  async saveAction() {
    const id = parseInt(this.post('id'));
    const params = this.post();

    if (id) {
      delete params.coupon;
      params.updated_at = think.datetime(new Date().getTime());

      await this.model('coupon').where({id: id}).update(params);
    } else {
      await this.model('coupon').where({id: id}).add(params);
    }

    return this.success('保存成功');
  }

  async destroyAction() {
    const rows = await this.model('coupon').where({id: parseInt(this.get('id'))}).delete();

    return this.success(rows);
  }
};
