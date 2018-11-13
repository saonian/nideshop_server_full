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

    const model = this.model('goods');
    let data = await model.where({'g.name': ['like', `%${name}%`]}).alias('g').field(['g.*', 'c.name AS cat_name']).join({
      table: 'category',
      join: 'inner',
      as: 'c',
      on: ['c.id', 'g.category_id']
    }).order(['id DESC']).page(page, size).countSelect();

    data.data.forEach(item => {
      item.add_time = think.datetime(item.add_time);
    });

    return this.success(data);
  }

  async infoAction() {
    const id = this.get('id');
    const model = this.model('goods');
    const data = await model.where({id: id}).find();
    data.gallery = await this.model('goods_gallery').where({goods_id: id}).order('sort_order ASC').select();
    data.primaryProduct = await this.model('product').where({goods_id: id, goods_specification_ids: null}).find();
    data.faq = await this.model('goods_issue').where({goods_id: id}).select();
    data.attrs = data.attrs ? JSON.parse(data.attrs) : [];

    return this.success(data);
  }

  async storeAction() {
    if (!this.isPost) {
      return false;
    }

    const values = this.post();
    const id = parseInt(this.post('id'));

    const model = this.model('goods');
    values.is_on_sale = values.is_on_sale ? 1 : 0;
    values.is_new = values.is_new ? 1 : 0;
    values.is_hot = values.is_hot ? 1 : 0;
    values.attrs = JSON.stringify(values.attrs);

    // 开启事务
    try {
      await model.execute('BEGIN');

      if (id > 0) {
        await model.where({id: id}).update(values);

        const existsGallery = await this.model('goods_gallery').where({goods_id: id}).select();
        for (const i of existsGallery) {
          const result = values.gallery.find(item => {
            return item.id === i.id;
          });

          if (!result) {
            await this.model('goods_gallery').where({id: i.id}).delete();
          }

        }

        for (let i = 0; i < values.gallery.length; i++) {
          if (values.gallery[i].id) {
            await this.model('goods_gallery').where({id: values.gallery[i].id}).update({ img_url: values.gallery[i].img_url });
          } else {
            await this.model('goods_gallery').add({
              goods_id: id,
              img_url: values.gallery[i].img_url,
              img_desc: '',
              sort_order: i + 1
            });
          }
        }

        const existsFaq = await this.model('goods_issue').where({goods_id: id}).select();
        for (const i of existsFaq) {
          const result = values.faq.find(item => {
            return item.id === i.id;
          });

          if (!result) {
            await this.model('goods_issue').where({id: i.id}).delete();
          }
        }

        for (let i = 0; i < values.faq.length; i++) {
          if (values.faq[i].id) {
            await this.model('goods_issue').where({id: values.faq[i].id}).update({ question: values.faq[i].question, answer: values.faq[i].answer });
          } else {
            await this.model('goods_issue').add({
              goods_id: id,
              question: values.faq[i].question,
              answer: values.faq[i].answer
            });
          }
        }

        await this.model('product').where({goods_id: id, goods_specification_ids: null}).update({
          goods_number: parseInt(values.goods_number),
          retail_price: values.retail_price
        });
      } else {
        delete values.id;
        values.goods_sn = values.primaryProduct.goods_sn;
        values.add_time = think.datetime(new Date().getTime());
        values.id = await model.add(values);

        // 插入一个无规格的默认product
        const productId = await this.model('product').add({
          goods_id: values.id,
          goods_specification_ids: null,
          goods_sn: values.primaryProduct.goods_sn,
          goods_number: parseInt(values.primaryProduct.goods_number),
          retail_price: values.retail_price
        });

        model.where({id: values.id}).update({
          primary_product_id: productId
        });

        for (let i = 0; i < values.gallery.length; i++) {
          await this.model('goods_gallery').add({
            goods_id: values.id,
            img_url: values.gallery[i],
            img_desc: '',
            sort_order: i + 1
          });
        }

        for (let i = 0; i < values.faq.length; i++) {
          if (values.faq[i].question && values.faq[i].answer) {
            await this.model('goods_issue').add({
              goods_id: values.id,
              question: values.faq[i].question,
              answer: values.faq[i].answer
            });
          }
        }
      }

      await model.execute('COMMIT');
      return this.success(values);
    } catch (e) {
      await model.execute('ROLLBACK');
      think.logger.error(e);
      return this.fail('保存失败');
    }
  }

  async destroyAction() {
    const id = parseInt(this.post('id'));
    const model = this.model('goods');

    // 开启事务
    try {
      await model.execute('BEGIN');

      await model.where({id: id}).delete();
      await this.model('goods_issue').where({goods_id: id}).delete();
      await this.model('goods_gallery').where({goods_id: id}).delete();
      await this.model('goods_specification').where({goods_id: id}).delete();
      await this.model('product').where({goods_id: id}).delete();

      await model.execute('COMMIT');
      return this.success('删除成功');
    } catch (e) {
      await model.execute('ROLLBACK');
      think.logger.error(e);
      return this.fail('删除失败');
    }
  }
};
