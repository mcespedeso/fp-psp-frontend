import Storage from 'backbone.storage';
import Model from './model';
import Collection from './collection';

var ApplicationsStorage = Storage.extend({
  model: Model,
  collection: Collection,
  getSubHeaderItems(model) {
    if (model && model.get('name')) {
      return {
        mainItem: {
          name: `${model.get('name')} :: ${model.get('description')}`
        },
        link: `/#management/applications/${model.get('id')}`
      };
    }
    return {
      navigationItems: [
        {
          name: t(`subheader.management.hubs`),
          link: `/#management/applications`
        },
        {
          name: t(`subheader.management.users`),
          link: `/#management/users`
        }
      ]
    };
  },
  getUserSubHeaderItems() {
    return {
      navigationItems: [
        {
          name: t(`subheader.management.hubs`),
          link: `/#management/applications`
        },
        {
          name: t(`subheader.management.users`),
          link: `/#management/users`
        }
      ]
    };
  }
});

export default new ApplicationsStorage();
