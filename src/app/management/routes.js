import ManagementView from './view';
// Applications
import ApplicationsView from './hubs/index/layout-view';
import applicationsStorage from './hubs/storage';
import ApplicationFormView from './hubs/add/view';
// Users
import UsersView from './users/view';
import NewUserView from './users/add/view';
import usersStorage from './users/storage';

const management = props => {
  const { app } = props;
  const routes = {
    appRoutes: {
      management: 'showManagement',
      'management/applications(/)': 'showApplications',
      'management/applications/new': 'newApplication',
      'management/applications/edit/:id': 'editApplication',
      'management/users(/)': 'showUsers',
      'management/users/new': 'newUser',
      'management/users/edit/:userId': 'editUser'
    },
    controller: {
      showManagement() {
        app.getSession().save({ termCond: 0, priv: 0 });
        app.getSession().save({ reAnswer: false, formData: null });
        app.showViewOnRoute(new ManagementView({ app }));
      },
      showApplications() {
        app.showViewOnRoute(new ApplicationsView({ app }));
      },
      newApplication() {
        app.showViewOnRoute(new ApplicationFormView({ app }));
      },
      editApplication(applicationId) {
        applicationsStorage.find(applicationId).then(model => {
          app.showViewOnRoute(new ApplicationFormView({ model, app }));
        });
      },
      showUsers() {
        usersStorage.find().then(model => {
          app.showViewOnRoute(new UsersView({ model, app }));
        });
      },
      newUser() {
        app.showViewOnRoute(new NewUserView({ app }));
      },
      editUser(userId) {
        usersStorage.find(userId).then(model => {
          app.showViewOnRoute(new NewUserView({ model, app }));
        });
      }
    }
  };
  return routes;
};

export default management;
