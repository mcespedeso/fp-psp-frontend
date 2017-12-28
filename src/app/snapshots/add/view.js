import Mn from 'backbone.marionette';
import Template from './template.hbs';
import Form from '../../components/form';
import React from 'react';
import ReactDOM from 'react-dom';
import SurveyModel from '../../surveys/add/model';
import SnapshotModel from './model';
import _ from 'lodash';
import $ from 'jquery';
import Bn from 'backbone';

export default Mn.View.extend({
  template: Template,

  events: {
    'change #survey-id': 'onSurveySelectChange',
    'click #goback-btn': 'onGoBack'
  },

  initialize(options) {
    const { organizationId, surveyId, handleCancel } = options;
    this.surveyModel = new SurveyModel({ id: surveyId });
    this.surveyModel.on('sync', () => this.renderForm());
    this.surveyModel.fetch();

    this.props = {};
    this.props.handleCancel = handleCancel;
    this.props.surveyId = surveyId;
    this.props.organizationId = organizationId;
  },

  getLocalizedSchema(unlocalizedSchema) {
    const newSchema = Object.assign({}, unlocalizedSchema);
    // schema = {
    //   properties: {
    //    XYZ:
    //        { title: { es : value},
    //          type: string
    //        }
    //   }
    // transformar a:
    // newSchema.properties.XYZ.title = value;
    const newProps = _.mapValues(newSchema.properties, obj => {
      // obj = XYZ
      return _.mapValues(obj, obj2 => {
        // obj2 = title
        if (_.isObject(obj2) && obj2.hasOwnProperty('es')) {
          return obj2.es;
        }else  if (_.isObject(obj2) && obj2.hasOwnProperty('en'))  {
          return obj2.en;
        }
        return obj2;
      });
    });
    newSchema.properties = newProps;
    return newSchema;
  },
  renderForm() {
    const placeHolder = this.$el.find('#new-survey')[0];
    const { survey_schema } = this.surveyModel.attributes;
    const localizedSchema = this.getLocalizedSchema(survey_schema);
    const uiSchema = this.surveyModel.attributes.survey_ui_schema;

    this.reactView = React.createElement(Form, {
      schema: localizedSchema,
      uiSchema: uiSchema,
      handleSubmit: this.hadleSubmit.bind(this),
      handleCancel: this.props.handleCancel,
      view: this
    });
    ReactDOM.unmountComponentAtNode(placeHolder);
    ReactDOM.render(this.reactView, placeHolder);
  },

  onGoBack() {
    this.props.handleCancel();
  },
  onSurveySelectChange() {
    this.renderForm();
  },
  getPersonal(formData) {
    return _.pick(
      formData,
      this.surveyModel.get('survey_ui_schema')['ui:group:personal']
    );
  },
  getIndicators(formData) {
    return _.pick(
      formData,
      this.surveyModel.get('survey_ui_schema')['ui:group:indicators']
    );
  },
  getEconomics(formData) {
    return _.pick(
      formData,
      this.surveyModel.get('survey_ui_schema')['ui:group:economics']
    );
  },

  fixedGalleryFieldValue(formData){
      var self = this;
      var galleryFields = [];
      var customFields = this.surveyModel.attributes.survey_ui_schema['ui:custom:fields'];

      $.each(customFields, function(i, item) {
        if(item['ui:field'] && item['ui:field']==='gallery'){
          var itemSelected = formData[i];
          if(itemSelected && itemSelected!==undefined && Array.isArray(itemSelected)){
            formData[i] = itemSelected[0]['value'];
          }
          //self.surveyModel.attributes.survey_schema.properties[i]['type'] = 'string';

        }
        /*console.log(self);
        self.surveyModel.attributes.survey_schema.properties[i]['type'] =
          'string';*/

    });
  },

  hadleSubmit(formResult) {
    //Convert from array to string, using property "value"
    this.fixedGalleryFieldValue(formResult);

    const snapshot = {
      survey_id: this.props.surveyId,
      organization_id : this.props.organizationId,
      personal_survey_data: this.getPersonal(formResult),
      indicator_survey_data: this.getIndicators(formResult),
      economic_survey_data: this.getEconomics(formResult)
    };

    new SnapshotModel().save(snapshot).then(snapshot => {
      Bn.history.navigate(`/survey/${snapshot.survey_id}/snapshot/${snapshot.snapshot_economic_id}`, true);
    });
  }
});
