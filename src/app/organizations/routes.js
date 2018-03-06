import OrganizationsView from './index/layout-view';
import HubView from './index/hubs/layout-view';
import OrganizationView from './show/view';
import NewOrganizationView from './add/view';
// import organizationsStorage from './storage';
import hubStorage from './index/hubs/storage';
import OrganizationDashboard from './dashboard/model';
import Model from './model';
import env from "../env";

const organizations = props => {
  const { app } = props;
  const routes = {
    appRoutes: {
      'collaborators(/:entity)': 'showHubs',
      'collaborators(/:entity)/:id': 'showOrganizationsByApplication',
      'organizations(/)': 'showOrganizations',
      'organizations/new': 'newOrganization',
      'organizations/:id(/:entity)': 'showOrganization'
    },
    controller: {
      // paginated organizations
      showHubs(entity) {
        hubStorage.find().then(model => {
          app.showViewOnRoute(new HubView({ model, app, entity }));
        });
      },
      showOrganizations() {
        // organizationsStorage.find().then(model => {
        //   app.showViewOnRoute(new OrganizationsView({ model, app }));
        // });

        const model = new Model();
        let params = {};
        params.applicationId = app.getSession().get('user').application.id;
        if(app.getSession().get('user').organization !== null){
          params.organizationId = app.getSession().get('user').organization.id
        }

        model.urlRoot = `${env.API}/organizations/application`;
        model
          .fetch({
            data: params
          })
          .then(() => {
            app.showViewOnRoute(
              new OrganizationsView({
                model,
                app,
              })
            );
          });

      },
      showOrganizationsByApplication(entity, applicationId) {
        const model = new Model();
        model.urlRoot = `${env.API}/organizations/application`;
        model
          .fetch({
            data: {applicationId}
          })
          .then(() => {
            app.showViewOnRoute(
              new OrganizationsView({
                model,
                app,
              })
            );
          });

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
        app.showViewOnRoute(new NewOrganizationView({app}));
      }
    }
  };
  return routes;
};

export default organizations;
