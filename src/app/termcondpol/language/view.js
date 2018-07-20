import Mn from 'backbone.marionette';
import Bn from 'backbone';
import $ from 'jquery';
import Template from './template.hbs';
import TermCondPolModel from '../model';
import TermCondPolLanguagesModel from './model';
import FlashesService from '../../flashes/service';

export default Mn.View.extend({
  template: Template,
  events: {
    'click .language-button': 'languagePressed'
  },

  initialize(options){
    this.app = options.app;
    this.surveyId = options.surveyId;
    this.applicationId = options.applicationId;
  },

  onRender(){
    // TODO Change the way Locales and Languages are obtained, make it
    // Dynamic and not Static to facilitate adding more locales and consolidating
    // all locale related request to one endpoint.
    var self = this;
    const termCondPolLanguagesModel = new TermCondPolLanguagesModel();
    termCondPolLanguagesModel.fetch({data: {applicationId: self.applicationId}})
      .then(response => {
        var possibleLangs = {};
        var keyArrayLangs = [];
        var languageText;
        var key;
        var i;

        response.forEach((obj) => {
          if (Object.prototype.hasOwnProperty.call(possibleLangs, obj.locale)){
            possibleLangs[obj.locale].push(obj.type_cod);
          } else {
            possibleLangs[obj.locale] = [obj.type_cod];
          }
        });

        keyArrayLangs = Object.keys(possibleLangs);
        for(i = 0; i<keyArrayLangs.length; i++){
          key = keyArrayLangs[i];
          if (possibleLangs[key].length === 2){
            if(key === "en_US"){
              languageText = "English (US)";
            } else if(key === "en_UK"){
              languageText = "English (UK)";
            } else {
              languageText = "Español (PY)";
            }

            $('#select-language').append(
              $(`<button type="button" type="submit" id="${  key
               }" class="language-button btn" style="margin: 8px">${
               languageText  }</button>`)
            );
          }
        }
      });
  },

  languagePressed(e){
    var self = this
    var locale = e.target.id;
    e.preventDefault();

    const termCondPolModel = new TermCondPolModel();
    termCondPolModel
      .fetch({
        data: {
          type: "TC",
          applicationId: self.applicationId,
          locale
        }
      })
      .then(() => {
        Bn.history.navigate(`/survey/${this.surveyId}/termcondpol/TC/${this.applicationId}/${locale}`, true);
      })
      .catch(() => {
        FlashesService.request('add', {
          timeout: 2000,
          type: 'error',
          title: 'Terms and Privacy Policy were not found'
        });
      });
  }
});
