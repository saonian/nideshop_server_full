const Base = require('./base.js');

module.exports = class extends Base {
  async positionsAction() {
    const positions = await this.model('ad_position').select();

    return this.success(positions);
  }

  async adsAction() {
    const positionId = parseInt(this.get('pid'));

    const model = this.model('ad');
    if (positionId) {
      model.where({ad_position_id: positionId});
    }
    const ads = await model.select();

    return this.success(ads);
  }

  async posInfoAction() {
    const id = parseInt(this.get('id'));

    if (!id) {
      return this.fail('参数错误');
    }

    const position = await this.model('ad_position').where({id: id}).find();

    return this.success(position);
  }

  async adInfoAction() {
    const id = parseInt(this.get('id'));

    if (!id) {
      return this.fail('参数错误');
    }

    const ad = await this.model('ad').where({id: id}).find();

    return this.success(ad);
  }

  async posStoreAction() {
    const id = parseInt(this.post('id'));
    const params = this.post();

    if (!params.name || !params.width || !params.height) {
      return this.fail('参数错误');
    }

    if (id) {
      await this.model('ad_position').where({id: id}).update(params);
    } else {
      await this.model('ad_position').add(params);
    }

    return this.success('保存成功');
  }

  async adStoreAction() {
    const id = parseInt(this.post('id'));
    const params = this.post();

    if (!params.name || !params.image_url || !params.ad_position_id) {
      return this.fail('参数错误');
    }

    if (id) {
      await this.model('ad').where({id: id}).update(params);
    } else {
      await this.model('ad').add(params);
    }

    return this.success('保存成功');
  }

  async posDestroyAction() {
    const id = parseInt(this.post('id'));

    const count = await this.model('ad').where({ad_position_id: id}).count();

    if (count) {
      return this.fail('该广告位下存在广告，无法删除');
    }

    await this.model('ad_position').where({id: id}).delete();

    return this.success('删除成功');
  }

  async adDestroyAction() {
    const id = parseInt(this.post('id'));

    await this.model('ad').where({id: id}).delete();

    return this.success('删除成功');
  }
}