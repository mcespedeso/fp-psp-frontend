import Mn from 'backbone.marionette';
import Bn from 'backbone';
import $ from 'jquery';
import Template from './layout-template.hbs';
import utils from '../../utils';
import FamiliesCollection from '../collection';
import OrganizationsModel from '../../management/organizations/model';
import env from '../../env';
import ItemView from './item/view';
import ModalService from '../../modal/service';
import FlashesService from '../../flashes/service';

export default Mn.View.extend({
  template: Template,
  collection: new Bn.Collection(),
  organizationsCollection: new OrganizationsModel(),
  regions: {
    list: '#family-list'
  },
  events: {
    'click #submit': 'handleSubmit',
    'keypress #search': 'handleSubmit'
  },
  initialize(options) {
    this.collection = new Bn.Collection();
    this.app = options.app;
    this.fetchHouseHolds();
  },
  onRender() {
    setTimeout(() => {
      this.$el.find('#search').focus();
    }, 0);
    this.loadSelects();
  },
  fetchHouseHolds(params, section) {
    const elements = new FamiliesCollection();
    const self = this;
    elements.fetch({
      data: params,
      success(response) {
        self.collection = response;
        self.showList();
        section ? section.reset() : '';
      }
    });
  },
  showList() {
    let element = this.$el.find('#family-list');
    element.empty();

    this.collection.forEach(item => {
      let itemView = new ItemView({
        model: item,
        deleteFamily: this.deleteFamily.bind(this),
        className: 'list-container row'
      });

      // Render the view, and append its element
      // to the list/table
      element.append(itemView.render().el);
    });

    // this.getRegion('list').show(
    //   new CollectionView({ collection: this.collection })
    // );
  },
  loadSelects() {
    const self = this;
    this.organizationsCollection.urlRoot = `${env.API}/organizations/list`;
    this.organizationsCollection.fetch({
      success(response) {
        self.organizationsCollection = response.toJSON();
        $.each(self.organizationsCollection, (index, element) => {
          $('#organization').append(
            $('<option></option>')
              .attr('value', element.id)
              .text(element.name)
          );
        });
      }
    });
  },
  handleSubmit(event) {
    if (event.which === 13 || event.which === 1) {
      event.preventDefault();
      const self = this;
      const container = this.$el.find('.list-container').eq(0);
      const section = utils.getLoadingSection(container);

      self.collection.reset();
      this.getRegion('list').empty();
      section.loading();

      const params = {
        organization_id: $('#organization').val(),
        free_text: $('#search').val()
      };
      self.fetchHouseHolds(params, section);
    }
  },
  deleteFamily(model) {
    let self = this;
    ModalService.request('confirm', {
      title: t('family.manage.messages.delete-confirm-title'),
      text: t('family.manage.messages.delete-confirm')
    }).then(confirmed => {
      if (!confirmed) {
        return;
      }

      model.set('id', model.get('familyId'));
      model.destroy({
        success: () => self.handleDestroySuccess(),
        error: (item, response) => self.handleDestroyError(response),
        wait: true
      });
    });
  },
  handleDestroySuccess() {
    this.showList();
    return FlashesService.request('add', {
      timeout: 2000,
      type: 'info',
      body: t('family.manage.messages.delete-done')
    });
  },

  handleDestroyError(error) {
    return FlashesService.request('add', {
      timeout: 2000,
      type: 'danger',
      body: error.responseJSON ? error.responseJSON.message : 'Error'
    });
  }
});
