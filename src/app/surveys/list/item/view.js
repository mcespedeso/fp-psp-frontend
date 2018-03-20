import Mn from 'backbone.marionette';
import Bn from 'backbone';
import moment from 'moment';

import Template from './template.hbs';
import session from '../../../../common/session';

export default Mn.View.extend({
  template: Template,
  events: {
    'click .card-menu-edit': 'handleEdit',
    'click .card-menu-delete': 'handleDelete',
    'click #show-snaps': 'handleShowSnapshots',
    'click .answer-area': 'handlerTermsAndConditions'
  },
  className: 'col-lg-2 col-md-4 col-sm-6 col-xs-12',
  initialize(options) {
    this.deleteSurvey = options.deleteSurvey;
    this.model = options.model;
    this.model.attributes.created_at = this.formartterWithTime(this.model.attributes.created_at);
  },

  serializeData() {
    return {
      survey: this.model.attributes,
      count_indicators: this.countIndicators()
    };
  },

  countIndicators(){
    var indicators = this.model.attributes.survey_ui_schema["ui:group:indicators"];
    return Object.keys(indicators).length;
  },

  formartterWithTime(date) {
    if (!date) {
      return null;
    }
    return moment(date).format('MM/DD/YYYY HH:mm');
  },

  handleEdit(event) {
    event.preventDefault();
    Bn.history.navigate(`/surveys/${this.model.attributes.id}/edit`, true);

  },
  handleDelete(event) {
    event.preventDefault();
    this.deleteSurvey(this.model);
  },
  handleShowSnapshots(event) {
    if (event.target.tagName.toLowerCase() !== 'a') {
      return;
    }
    event.preventDefault();
    const route = event.target.getAttribute('href');
    Bn.history.navigate(route, true);
  },

  handlerTermsAndConditions(event){
    event.preventDefault();
      if (!session.userHasRole('ROLE_USER') && !session.userHasRole('ROLE_SURVEY_USER')) {
        return;
      }
    Bn.history.navigate(`/survey/${this.model.attributes.id}/termcondpol/TC`, true);
  },

  handleAnswer(event) {
    event.preventDefault();
    Bn.history.navigate(`/survey/${this.model.attributes.id}/answer`, true);
  }
});
