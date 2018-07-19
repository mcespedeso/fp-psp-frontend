import Mn from 'backbone.marionette';
import React from 'react';
import ReactDOM from 'react-dom';
import Template from './template.hbs';
import SurveyCollection from './list/collection';
import ListView from './list/view';
import AddView from './add/view';
import storage from './storage';
import MapWrapper from '../components/map/mapWrapper';

export default Mn.View.extend({
  template: Template,
  regions: {
    surveysContent: '#surveys-content'
  },
  initialize(app) {
    this.app = app.app;
    this.collection = new SurveyCollection();
    this.getSurveys();
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
    this.renderMap();
  },
  renderMap() {
    const map = this.$el.find('#map')[0];
    this.reactView = React.createElement(MapWrapper, {
      token: this.app.getSession().attributes.access_token,
      surveyData: this.surveyData
    });
    ReactDOM.unmountComponentAtNode(map);
    ReactDOM.render(this.reactView, map);
  },
  getSurveys() {
    let self = this;
    this.collection
      .fetch({
        success(response) {
          self.surveyData = response.models.map(item => item.attributes);
        }
      })
      .then(self.render);
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
