import Storage from 'backbone.storage';
import Collection from './list/collection';
import Model from './add/model';

var SurveysStorage = Storage.extend({
  model: Model,
  collection: Collection,
  getSubHeaderItems() {
    return {
      navigationItems: [
        {
          name: t(`subheader.surveys.list-surveys`),
          link: `/#surveys`
        }
      ]
    };
  },
  getUserSubHeaderItems() {
    return {
      navigationItems: [
        {
          name: t(`subheader.surveys.list-surveys`),
          link: `/#surveys`
        },
        {
          name: t(`subheader.surveys.list-drafts`),
          link: `/#surveys/drafts`
        }
      ]
    };
  }
});

export default new SurveysStorage();
