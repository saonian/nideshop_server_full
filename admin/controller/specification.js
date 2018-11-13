const Base = require('./base.js');

module.exports = class extends Base {

  async indexAction() {
    const name = this.get('name') || '';
    const page = this.get('page') || 1;
    const size = this.get('size') || 10;

    const specs = await this.model('specification').where({name: ['like', `%${name}%`]}).page(page, size).order('sort_order ASC').countSelect();

    return this.success(specs);
  }

  async goodsAction() {
    const goodsId = parseInt(this.get('id')) || null;
    if (!goodsId) {
      return this.fail('参数错误');
    }

    const products = await this.model('product').where({goods_id: goodsId}).select();

    for (let i = 0; i < products.length; i++) {
      const specIds = products[i].goods_specification_ids ? products[i].goods_specification_ids.split('_') : null;
      let where = {'goods_id': goodsId};
      if (specIds) {
        where['gs.id'] = ['in', specIds];
      } else {
        products[i].specs = [];
        continue;
      }
      products[i].specs = await this.model('goods_specification').alias('gs').join({
        table: 'specification',
        join: 'inner',
        as: 's',
        on: ['s.id', 'gs.specification_id']
      }).where(where).select();
    }

    return this.success(products);
  }

  // 删除商品规格
  async destroyAction() {
    const productId = parseInt(this.get('pid'));

    if (!productId) {
      return this.fail('参数错误');
    }

    const mode = this.model('product');
    const product = await mode.where({id: productId}).find();

    if (think.isEmpty(product)) {
      return this.fail('请求数据不存在');
    }

    try {
      await mode.execute('BEGIN');

      await this.model('goods_specification').where({'id': ['in', product.goods_specification_ids.split('_')]}).delete();
      await mode.where({id: productId}).delete();

      await mode.execute('COMMIT');
      return this.success('删除成功');
    } catch (e) {
      await mode.execute('ROLLBACK');
      return this.fail('删除失败');
    }
  }

  // 删除规格名称
  async removeAction() {
    const id = parseInt(this.post('id'));

    const count = await this.model('goods_specification').where({specification_id: id}).count();

    if (count) {
      return this.fail('该规格类型目前在使用中，无法删除');
    }

    await this.model('specification').where({id: id}).delete();

    return this.success('删除成功');
  }

  async storeAction() {
    const id = parseInt(this.post('id'));
    const name = this.post('name');
    const sortOrder = parseInt(this.post('sort_order'));

    if (think.isEmpty(name)) {
      return this.fail('规格名称不能为空');
    }

    if (id) {
      await this.model('specification').where({id: id}).update({
        name: name,
        sort_order: sortOrder || 50
      });
    } else {
      await this.model('specification').add({
        name: name,
        sort_order: sortOrder || 50
      });
    }

    return this.success('保存成功');
  }

  async saveAction() {
    const goodsId = parseInt(this.post('goods_id'));
    const goodsNumber = this.post('goods_number');
    const retailPrice = this.post('retail_price');
    const goodsSn = this.post('goods_sn');
    const specArr = this.post('spec_arr');

    if (!goodsNumber || !retailPrice || !specArr || !goodsId) {
      return this.fail('参数错误');
    }

    const check = specArr.some(item => {
      return !item.selectedSpecs || !item.selectedSpecVal;
    });

    if (check) {
      return this.fail('参数错误');
    }

    // 开启事务
    const mode = this.model('goods_specification');
    try {
      await mode.execute('BEGIN');

      let sids = [];
      for (let i = 0; i < specArr.length; i++) {
        const insertId = await mode.add({
          goods_id: goodsId,
          specification_id: specArr[i].selectedSpecs,
          value: specArr[i].selectedSpecVal,
          pic_url: ''// TODO 规格图片
        });
        sids.push(insertId);
      }

      await this.model('product').add({
        goods_id: goodsId,
        goods_specification_ids: sids.join('_'),
        goods_sn: goodsSn,
        goods_number: goodsNumber,
        retail_price: retailPrice
      });

      await mode.execute('COMMIT');
      return this.success('保存成功');
    } catch (e) {
      await mode.execute('ROLLBACK');
      return this.fail('保存失败');
    }
  }
}