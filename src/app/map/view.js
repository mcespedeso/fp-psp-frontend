import Mn from 'backbone.marionette';
import React from 'react';
import ReactDOM from 'react-dom';
import Template from './template.hbs';
import SurveyCollection from './collection';
import MapContainer from '../components/map/mapContainer';

export default Mn.View.extend({
  template: Template,
  initialize(app) {
    this.app = app.app;
    this.collection = new SurveyCollection();
  },
  onRender() {
    this.getSurveys();
  },
  renderMap(surveyData) {
    const map = this.$el.find('#map')[0];
    this.reactView = React.createElement(MapContainer, {
      surveyData,
      token: this.app.getSession().attributes.access_token
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
          return self.surveyData;
        }
      })
      .then(surveyData => self.renderMap(surveyData));
  }
});
