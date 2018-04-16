import Mn from 'backbone.marionette';
import CodeMirror from 'codemirror';
import Bn from 'backbone';
import $ from 'jquery';
import 'select2';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/comment/continuecomment';
import 'codemirror/addon/comment/comment';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/lint/json-lint';

import Template from './template.hbs';
import Model from './model';
import utils from '../../utils';
import FlashesService from '../../flashes/service';
import OrganizationsModel from '../../management/organizations/model';
import ApplicationModel from '../../applications/model';
import ModalService from "../../modal/service";

export default Mn.View.extend({
  template: Template,
  organizationsCollection: new OrganizationsModel(),
  applicationsCollections: new ApplicationModel(),
  events: {
    'click #submit': 'handleSubmit'
  },
  initialize(options) {
    this.props = Object.assign({}, options);
    this.model = this.props.model || new Model();
    this.app = this.props.app;

    this.app.getSession().userHasRole('ROLE_ROOT') ? this.getApplications() : this.getOrganizations();
  },
  getApplications(){
    let self = this;
    self.applicationsCollections.fetch({
      success(response) {
        self.applicationsCollections = response.get('list');
          $.each(self.applicationsCollections, (index, element) => {
            self.buildOption(element);
           });
          if(!$.isEmptyObject(self.model.attributes)){
            if(!$.isEmptyObject(self.model.attributes.applications)){
              self.$el.find('#organization').val(self.getValuesIdArray()).trigger("change");
            }
            self.schema.setValue(JSON.stringify(self.model.attributes.survey_schema, null, 3));
            self.schemaUI.setValue(JSON.stringify(self.model.attributes.survey_ui_schema, null, 3));
        }
      }
    });
  },
  getOrganizations(){
    let self = this;
    self.organizationsCollection.fetch({
      success(response) {
        self.organizationsCollection = response.get('list');
          $.each(self.organizationsCollection, (index, element) => {
            self.buildOption(element);
           });
          if(!$.isEmptyObject(self.model.attributes)){
            if(!$.isEmptyObject(self.model.attributes.organizations)){
              self.$el.find('#organization').val(self.getValuesIdArray()).trigger("change");
            }
            self.schema.setValue(JSON.stringify(self.model.attributes.survey_schema, null, 3));
            self.schemaUI.setValue(JSON.stringify(self.model.attributes.survey_ui_schema, null, 3));
        }
      }
    });
  },
  buildOption(element){
    $('#organization').append(
      $('<option></option>')
        .attr('value', element.id)
        .text(element.name)
    );
  },
  getValuesIdArray(){
    let array = [];
    if(this.app.getSession().userHasRole('ROLE_ROOT')){
      this.model.attributes.applications.forEach(element => {
        array.push(element.id)
      });
    }else{
      this.model.attributes.organizations.forEach(element => {
        array.push(element.id)
      });
    }
    return array;
  },
  onRender() {
    this.startCodeMirror();
     setTimeout(() => {
       this.$el.find('#organization').select2({
         placeholder: t('survey.add.assign-survey-placeholder')
       });

       if(!$.isEmptyObject(this.model.attributes)){
         if (this.app.getSession().userHasRole('ROLE_ROOT')) {
           this.$el.find('.inputdisable').attr('disabled', false);
           this.schema.setOption('readOnly', false);
           this.schemaUI.setOption('readOnly', false);
         } else {
           this.$el.find('.inputdisable').attr('disabled',true);
           this.schema.setOption('readOnly', true);
           this.schemaUI.setOption('readOnly', true);
         }
        this.$el.find('#organization').val(this.getValuesIdArray()).trigger('change');
       }

     }, 0);

  },
  startCodeMirror() {
    this.schema = CodeMirror.fromTextArea(this.$el.find('#schema-editor')[0], {
      matchBrackets: true,
      autoCloseBrackets: true,
      mode: 'application/ld+json',
      lineNumbers: true,
      lineWrapping: false,
      tabMode: 'indent'
    });
    this.schemaUI = CodeMirror.fromTextArea(
      this.$el.find('#schema-ui-editor')[0],
      {
        matchBrackets: true,
        autoCloseBrackets: true,
        mode: 'application/ld+json',
        lineNumbers: true,
        lineWrapping: false,
        tabMode: 'indent'
      }
    );
    this.schema.refresh();
    this.schemaUI.refresh();
  },
  serializeData() {
    return {
      survey: this.model.attributes
    };
  },
  handleSubmit(event) {
      try {
        event.preventDefault();

        ModalService.request('confirm', {
          title: t('survey.save.confirm-title'),
          text: t('survey.save.confirm-text')
        }).then(confirmed => {
          if (!confirmed) {
            return;
          }
          this.saveySurvey();
        });
      } catch (e) {
        FlashesService.request('add', {
          timeout: 2000,
          type: 'warning',
          title: e
        });
      }
    },

    saveySurvey(){
      const button = utils.getLoadingButton(this.$el.find('#submit'));
      button.loading();

      // We manually add form values to model,
      // the form -> model binding should ideally
      // be done automatically.
      this.$el
      .find('#form')
      .serializeArray()
      .forEach(element => {
        this.model.set(element.name, element.value);
      });

      let organizationArray = [];
      let applicationArray = [];

      if(!this.app.getSession().userHasRole('ROLE_ROOT')){
        $("#organization").val().forEach(element => {
          organizationArray.push(
            {id: element,
               application:{id: this.app.getSession().get('user').application.id}
          })
        });
      }else{
        $("#organization").val().forEach(element => {
          applicationArray.push({id: element})
        });
      }

      this.model.set('organizations', organizationArray);
      this.model.set('applications', applicationArray);
      this.model.set('survey_schema', this.schema.getValue());
      this.model.set('survey_ui_schema', this.schemaUI.getValue());

      let errors = this.model.validate();

      if (errors) {
        errors.forEach(error => {
           if (error.required)  this.$el.find(`#${error.field}`).parent().addClass('has-error');
          FlashesService.request('add', {
            timeout: 2000,
            type: 'warning',
            title: error.message
          });
        });
        button.reset();
        return;
      }

      this.model.set('survey_schema', JSON.parse(this.schema.getValue()));
      this.model.set('survey_ui_schema', JSON.parse(this.schemaUI.getValue()));

      this.model
      .save()
      .then(
        () => {
          FlashesService.request('add', {
            timeout: 2000,
            type: 'info',
            title: t('survey.save.success')
          });
          Bn.history.navigate(
            `/surveys`,
            true
          );
          this.model.fetch();
        },
        error => {
          FlashesService.request('add', {
            timeout: 2000,
            type: 'warning',
            title: error.responseJSON.message
          });
        }
      )
      .always(() => button.reset());

    }

});
