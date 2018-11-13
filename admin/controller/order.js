const Base = require('./base.js');

module.exports = class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  async indexAction() {
    const page = this.get('page') || 1;
    const size = this.get('size') || 10;
    const orderSn = this.get('orderSn') || '';
    const consignee = this.get('consignee') || '';

    const model = this.model('order');
    const data = await model.where({order_sn: ['like', `%${orderSn}%`], consignee: ['like', `%${consignee}%`]}).order(['id DESC']).page(page, size).countSelect();

    for (const item of data.data) {
      item.order_status_text = await this.model('order').getOrderStatusText(item.order_status);
      item.user = await this.model('user').where({id: item.user_id}).field('nickname').find();
    }
    return this.success(data);
  }

  async infoAction() {
    const id = this.get('id');
    const model = this.model('order');
    const data = await model.where({id: id}).find();

    data.province = await this.model('region').getRegionName(data.province);
    data.city = await this.model('region').getRegionName(data.city);
    data.district = await this.model('region').getRegionName(data.district);
    data.full_address = data.province_name + data.city_name + data.district_name;

    data.order_status_text = await this.model('order').getOrderStatusText(data.order_status);
    data.user = await this.model('user').where({id: data.user_id}).field('nickname').find();
    delete data.user.password;

    data.express = await this.model('order_express').where({order_id: data.id}).find();
    data.goods = await this.model('order_goods').where({order_id: data.id}).select();

    return this.success(data);
  }

  async storeAction() {
    if (!this.isPost) {
      return false;
    }

    const values = this.post();
    const id = this.post('id');

    const model = this.model('order');
    values.is_show = values.is_show ? 1 : 0;
    values.is_new = values.is_new ? 1 : 0;
    if (id > 0) {
      await model.where({id: id}).update(values);
    } else {
      delete values.id;
      await model.add(values);
    }
    return this.success(values);
  }

  async destoryAction() {
    const id = this.post('id');
    await this.model('order').where({id: id}).limit(1).delete();

    // 删除订单商品
    await this.model('order_goods').where({order_id: id}).delete();

    // TODO 事务，验证订单是否可删除（只有失效的订单才可以删除）

    return this.success();
  }
};
