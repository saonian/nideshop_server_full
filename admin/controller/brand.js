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

    const model = this.model('brand');
    const data = await model.field(['id', 'name', 'floor_price', 'list_pic_url', 'is_new', 'sort_order', 'new_sort_order', 'is_show']).where({name: ['like', `%${name}%`]}).order(['sort_order ASC']).page(page, size).countSelect();

    return this.success(data);
  }

  async infoAction() {
    const id = this.get('id');
    const model = this.model('brand');
    const data = await model.where({id: id}).find();

    return this.success(data);
  }

  async storeAction() {
    if (!this.isPost) {
      return false;
    }

    const values = this.post();
    const id = this.post('id');

    const model = this.model('brand');
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

    const count = await this.model('goods').where({brand_id: id}).count();

    if (count > 0) {
      return this.fail('该品牌存在关联商品，无法删除');
    }

    await this.model('brand').where({id: id}).limit(1).delete();

    return this.success('删除成功');
  }
};
