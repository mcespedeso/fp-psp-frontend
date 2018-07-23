import Mn from 'backbone.marionette';
import Template from './template.hbs';
import ListView from './list/view';
import AddView from './add/view';
import storage from './storage';

export default Mn.View.extend({
  template: Template,
  regions: {
    surveysContent: '#surveys-content'
  },
  initialize(app) {
    this.app = app.app;
  },
  onRender() {
    let headerItems;
    if (this.app.getSession().userHasRole('ROLE_SURVEY_USER')) {
      headerItems = storage.getUserSubHeaderItems();
    } else {
      headerItems = storage.getSubHeaderItems();
    }
    this.app.updateSubHeader(headerItems);
    this.list();
  },
  list() {
    const listView = new ListView({
      app: this.app,
      add: this.add.bind(this)
    });
    this.getRegion('surveysContent').show(listView);
  },

  add(model) {
    const addView = new AddView({
      model,
      listSurveys: this.list.bind(this)
    });
    this.getRegion('surveysContent').show(addView);
  }
});
