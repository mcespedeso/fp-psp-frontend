import TermCondPolView from './view';
import TermCondPolModel from './model';
import LangView from './language/view'

const termcondpol = props => {
  const { app } = props;
  const routes = {
    appRoutes: {
        'survey/:id/termcondpol/:applicationId': 'showTermCondPolLanguageSelect',
        'survey/:id/termcondpol/:type/:applicationId/:locale': 'showTermCondPol'
    },
    controller: {
      showTermCondPolLanguageSelect(hashSurvey, applicationId) {
        const surveyId = parseInt(hashSurvey, 10);

        app.showViewOnRoute(new LangView({app, surveyId, applicationId}));
      },

      showTermCondPol(hashSurvey, hashType, hashApplicationId, locale) {
        const model = new TermCondPolModel();
        const surveyId = parseInt(hashSurvey, 10);
        const formData = app.getSession().get('formData');
        const reAnswer = app.getSession().get('reAnswer');
        model
          .fetch({
            data: {
              type: hashType,
              surveyId,
              applicationId: hashApplicationId,
              locale
            }
          })
          .then(() => {
            app.showViewOnRoute(new TermCondPolView({
               model, app, surveyId, reAnswer, formData, locale
             }));
          });
      }
    }
  };
  return routes;
};

export default termcondpol;
