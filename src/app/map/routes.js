import View from './view';

const map = props => {
  const { app } = props;
  const routes = {
    appRoutes: {
      map: 'showMap'
    },
    controller: {
      showMap() {
        app.showViewOnRoute(new View({ app }));
      }
    }
  };
  return routes;
};

export default map;
