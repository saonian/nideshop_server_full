const Base = require('./base.js');

module.exports = class extends Base {

  async indexAction() {
    const page = this.get('page') || 1;
    const size = this.get('size') || 10;
    const name = this.get('name') || '';

    const data = await this.model('shipper').where({name: ['like', `%${name}%`]}).order(['sort_order ASC']).page(page, size).countSelect();

    return this.success(data);
  }

  async infoAction() {
    const shipper = await this.model('shipper').where({id: parseInt(this.get('id'))}).find();

    return this.success(shipper);
  }

  async saveAction() {
    const id = parseInt(this.post('id'));
    const params = this.post();

    if (id) {
      await this.model('shipper').where({id: id}).update(params);
    } else {
      await this.model('shipper').where({id: id}).add(params);
    }

    return this.success('保存成功');
  }

  async destroyAction() {
    const rows = await this.model('shipper').where({id: parseInt(this.get('id'))}).delete();

    return this.success(rows);
  }
}