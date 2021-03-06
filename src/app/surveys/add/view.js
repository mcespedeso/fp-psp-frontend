import Mn from 'backbone.marionette';
import CodeMirror from 'codemirror';
import Bn from 'backbone';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/comment/continuecomment';
import 'codemirror/addon/comment/comment';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/lint/json-lint';

import Template from './template.hbs';
import Model from './model';
import utils from '../../utils';
import FlashesService from '../../flashes/service';

export default Mn.View.extend({
  template: Template,
  events: {
    'click #submit': 'handleSubmit'
  },
  initialize(options) {
    this.props = Object.assign({}, options);
    this.model = this.props.model || new Model();
  },
  onRender() {
    this.startCodeMirror();
  },
  startCodeMirror() {
    this.schema = CodeMirror.fromTextArea(this.$el.find('#schema-editor')[0], {
      matchBrackets: true,
      autoCloseBrackets: true,
      mode: 'application/ld+json',
      lineNumbers: true,
      lineWrapping: true,
      tabMode: 'indent'
    });
    this.schemaUI = CodeMirror.fromTextArea(
      this.$el.find('#schema-ui-editor')[0],
      {
        matchBrackets: true,
        autoCloseBrackets: true,
        mode: 'application/ld+json',
        lineNumbers: true,
        lineWrapping: true,
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
        this.saveySurvey();

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

      let validate = {
        title: this.model.get('title'),
        description: this.model.get('description'),
        survey_schema: this.schema.getValue(),
        survey_ui_schema: this.schemaUI.getValue()
      };

      let errors = this.model.validate(validate);

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
            title: 'The survey has been saved'
          });
          Bn.history.navigate(
            `/surveys`,
            true
          );
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
