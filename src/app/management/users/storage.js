import Storage from 'backbone.storage';
import Model from './model';
import Collection from './collection';

var UsersStorage = Storage.extend({
  model: Model,
  collection: Collection,
  getSubHeaderItems() {
    return {
      navigationItems: [
        {
          name: t(`subheader.management.users`),
          link: `/#management/users`
        },
        {
          name: t(`subheader.management.organizations`),
          link: `/#management/organizations`
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
  },
  getAppAdminHeaderItems(model) {
    return {
      mainItem: {
        name: model.get('name'),
        link: `/#organizations/${model.get('id')}`
      },
      navigationItems: [
        {
          name: t('subheader.families'),
          link: `/#organizations/${model.get('id')}/families`
        },
        {
          name: t('subheader.users'),
          link: `/#organizations/${model.get('id')}/users`
        },
        {
          name: t('subheader.indicators'),
          link: `/#organizations/${model.get('id')}/indicators`
        }
      ]
    };
  }
});

export default new UsersStorage();
