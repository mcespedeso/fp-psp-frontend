import Storage from 'backbone.storage';
import Collection from './collection';

var ManagementStorage = Storage.extend({
  model: null,
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
  }
});

export default new ManagementStorage();
