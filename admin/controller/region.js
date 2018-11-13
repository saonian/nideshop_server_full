const Base = require('./base.js');

module.exports = class extends Base {

  async indexAction() {
    const type = parseInt(this.get('type'));
    const pid = parseInt(this.get('pid'));
    const region = await this.model('region').where({type: type, parent_id: pid}).select();
    return this.success(region);
  }

  async infoAction() {
    const region = await this.model('region').getRegionInfo(this.get('regionId'));
    return this.success(region);
  }

  async listAction() {
    const regionList = await this.model('region').getRegionList(this.get('parentId'));
    return this.success(regionList);
  }
};
