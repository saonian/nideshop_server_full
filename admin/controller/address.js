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

    const model = this.model('address');
    const data = await model.where({name: ['like', `%${name}%`]}).order(['id DESC']).page(page, size).countSelect();
    for (let i = 0; i < data.data.length; i++) {
      data.data[i].user = await this.model('user').where({id: data.data[i].user_id}).field('nickname').find();
      data.data[i].province = await this.model('region').getRegionName(data.data[i].province_id);
      data.data[i].city = await this.model('region').getRegionName(data.data[i].city_id);
      data.data[i].district = await this.model('region').getRegionName(data.data[i].district_id);
      data.data[i].full_address = data.data[i].province_name + data.data[i].city_name + data.data[i].district_name;
    }

    return this.success(data);
  }

  async infoAction() {
    const id = this.get('id');
    const model = this.model('address');
    const data = await model.where({id: id}).find();

    data.user = await this.model('user').where({id: data.user_id}).field('nickname').find();

    return this.success(data);
  }

  async saveAction() {
    let addressId = this.post('id');
    const userId = this.post('user_id');

    const addressData = {
      name: this.post('name'),
      mobile: this.post('mobile'),
      province_id: this.post('province_id'),
      city_id: this.post('city_id'),
      district_id: this.post('district_id'),
      address: this.post('address'),
      user_id: userId,
      is_default: this.post('is_default') === 1 ? 1 : 0
    };

    if (think.isEmpty(addressId)) {
      addressId = await this.model('address').add(addressData);
    } else {
      await this.model('address').where({id: addressId, user_id: userId}).update(addressData);
    }

    // 如果设置为默认，则取消其它的默认
    if (this.post('is_default') === 1) {
      await this.model('address').where({id: ['<>', addressId], user_id: userId}).update({
        is_default: 0
      });
    }
    const addressInfo = await this.model('address').where({id: addressId}).find();

    return this.success(addressInfo);
  }

  async destoryAction() {
    const id = this.post('id');
    await this.model('address').where({id: id}).limit(1).delete();

    return this.success();
  }
};
