import Mn from 'backbone.marionette';
import Template from './template.hbs';

export default Mn.View.extend({
  template: Template,
  events: {
    'click .card-menu-delete': 'handleDelete'
  },
  initialize(options) {
    this.deleteFamily = options.deleteFamily;
    this.model = options.model;
  },

  serializeData() {
    return {
      family: this.model.attributes
    };
  },

  handleDelete(event) {
    event.preventDefault();
    this.deleteFamily(this.model);
  }
});
