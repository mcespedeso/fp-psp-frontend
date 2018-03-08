import View from './view';

const faq = props => {
  const { app } = props;
  const routes = {
    appRoutes: {
      faqs: 'showFaqs'
    },
    controller: {
      showFaqs() {app.showViewOnRoute(new View({}));}
    }
  };
  return routes;
};

export default faq;
