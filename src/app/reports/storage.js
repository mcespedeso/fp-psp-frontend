import Storage from 'backbone.storage';
import CollectionFamilyOrganization from './snapshots/by_organization/collection';
import ModelFamilyOrganization from './snapshots/by_organization/model';

var ReportsStorage = Storage.extend({
  model: ModelFamilyOrganization,
  collection: CollectionFamilyOrganization,
    getSubHeaderItems() {
      return {
        navigationItems: [
          {
            name: t('report.snapshot.title'),
            link: `/#reports/snapshots`
          }
          // {
          //   name: t('report.snapshot.title'),
          //   link: `/#reports/snapshots/organizations`
          // },
          // {
          //   name: t('report.datatable.title'),
          //   link: `/#reports/datatable`
          // }
        ]
      };
    }
  });


  export default new ReportsStorage();
