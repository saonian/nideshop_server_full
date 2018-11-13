module.exports = class extends think.Model {

  async tree(pid = 0) {
    let topCategory = await this.where({is_show: 1, parent_id: pid}).order(['sort_order ASC']).select();

    // 这里不能用forEach或者map来循环
    for (let i = 0; i < topCategory.length; i++) {
      // topCategory[i].icon_url = this.config('qiniu.domain') + topCategory[i].icon_url;
      // if (!/^http/i.test(topCategory[i].wap_banner_url)) {
      //   topCategory[i].wap_banner_url = this.config('qiniu.domain') + topCategory[i].wap_banner_url;
      // }
      const children = await this.tree(topCategory[i].id);

      topCategory[i].children = children;
    }

    return topCategory;
  }

};
