import OrganizationsView from './index/layout-view';
import HubView from './index/hubs/layout-view';
import OrganizationView from './show/view';
import OrganizationFormView from './add/view';
import organizationsStorage from './storage';
import hubsStorage from './index/hubs/storage';
import OrganizationDashboard from './dashboard/model';

const organizations = props => {
  const {app} = props;
  const routes = {
    appRoutes: {
      'collaborators(/:entity)': 'showHubs',
      'collaborators(/:entity)/:id': 'showOrganizationsByApplication',
      'organizations(/)': 'showOrganizations',
      'organizations/new': 'newOrganization',
      'organizations/edit/:id': 'editOrganization',
      'organizations/:id(/:entity)': 'showOrganization'
    },
    controller: {
      // paginated organizations
      showHubs(entity) {
        hubsStorage.find().then(model => {
          app.showViewOnRoute(new HubView({model, app, entity}));
        });
      },
      showOrganizations() {
        app.showViewOnRoute(new OrganizationsView({app}));
      },
      showOrganizationsByApplication(entity, applicationId) {
        app.showViewOnRoute(new OrganizationsView({app, applicationId}));
      },
      showOrganization(organizationId, entity) {
        // show the organization dashboard
        const model = new OrganizationDashboard();
        model
          .fetch({
            data: {
              organizationId
            }
          })
          .then(() => {
            app.showViewOnRoute(
              new OrganizationView({
                model,
                app,
                entity,
                organizationId
              })
            );
          });
      },
      newOrganization() {
        app.showViewOnRoute(new OrganizationFormView({app}));
      },
      editOrganization(organizationId) {
        organizationsStorage.find(organizationId).then(model => {
          app.showViewOnRoute(new OrganizationFormView({model, app}));
        });
      }
    }
  };
  return routes;
};

export default organizations;
