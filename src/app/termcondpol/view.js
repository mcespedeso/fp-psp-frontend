import Mn from 'backbone.marionette';
import Bn from 'backbone';
import $ from 'jquery';
import Template from './template.hbs';
import FlashesService from '../flashes/service';
import TermCondPolModel from './model';
import NewSnapshot from '../snapshots/add/view';

export default Mn.View.extend({
  template: Template,
  events: {
    'click #accept': 'handleNext',
    'change #agree': 'showNextButton',
    'change #dontAgree': 'showNextButton'
  },

  initialize(options) {
    this.model = options.model;
    this.app = options.app;
    this.surveyId = options.surveyId;
    this.reAnswer = options.reAnswer;
    this.formData = options.formData;
    this.locale = options.locale;
    if(this.app.getSession().attributes.user.application !== null) {
      this.currentApplicationId = this.app.getSession().attributes.user.application.id;
    }
  },

  onRender() {
    this.$el.find('#text').append(this.model.attributes.html);

    if (this.reAnswer) {
      this.app.getSession().save({
        reAnswer: this.reAnswer,
        formData: this.formData
      });
    }
  },

  showNextButton(event) {
    event.preventDefault();
    let checked = $('#response input:radio:checked').val();
    if (checked) {
      $('#accept').removeClass('disabled');
    }
  },

  reCheckPriv() {
    $('#response input:radio').prop('checked', false);
    $('#accept').addClass('disabled');
    this.$el.find('#text').empty();

    const termCondPolModel = new TermCondPolModel();
    termCondPolModel
      .fetch({
        data: {
          type: 'PRIV',
          applicationId: this.currentApplicationId,
          locale: this.locale
        }
      })
      .then(() => {
        this.model = termCondPolModel;
        this.$el.find('#text').append(termCondPolModel.attributes.html);
      });

    Bn.history.navigate(
      `/survey/${this.surveyId}/termcondpol/PRIV/${this.currentApplicationId}/${this.locale}`
    );
  },

  reAnswerSurvey() {
    const newSnapshot = new NewSnapshot({
      surveyId: this.surveyId,
      handleCancel() {
        Bn.history.navigate(`/surveys`, true);
      },
      app: this.app,
      reAnswer: this.reAnswer,
      formData: this.formData
    });

    this.app.showViewOnRoute(newSnapshot);

    Bn.history.navigate(
      `/survey/${this.surveyId}/reanswer/${this.formData.familyId}`
    );
  },

  handleNext(event) {
    event.preventDefault();
    let checked = $('#response input:radio:checked').val();
    if (!checked) {
      return FlashesService.request('add', {
        timeout: 2000,
        type: 'info',
        title: t('termcondpol.messages.not-answer')
      });
    } else if (checked) {
      if (checked === 'Yes' && this.model.attributes.type_cod === 'TC') {
        this.app.getSession().save({ termCond: this.model.attributes.id });
        if (this.reAnswer) {
          this.reCheckPriv();
          return;
        }
        Bn.history.navigate(
          `/survey/${this.surveyId}/termcondpol/PRIV/${this.currentApplicationId}/${this.locale}`,
          true
        );
      } else if (
        checked === 'Yes' &&
        this.model.attributes.type_cod === 'PRIV'
      ) {
        if (
          this.app.getSession().get('termCond') &&
          this.app.getSession().get('termCond') > 0
        ) {
          this.app.getSession().save({ priv: this.model.attributes.id });
          if (this.reAnswer) {
            this.reAnswerSurvey();
            return;
          }
          Bn.history.navigate(`/survey/${this.surveyId}/answer`, true);
        } else {
          return FlashesService.request('add', {
            timeout: 2000,
            type: 'info',
            title: t('termcondpol.messages.answer-validation')
          });
        }
      } else if (checked === 'No') {
        Bn.history.navigate(`/surveys`, true);
      }
    }
  }
});
