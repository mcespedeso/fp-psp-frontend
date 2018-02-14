import Mn from 'backbone.marionette';
import Bn from 'backbone';
import $ from 'jquery';

import { debounce } from 'lodash';
import Template from './layout-template.hbs';
import CollectionView from './collection-view';
import utils from '../../utils';
import OrganizationsModel from '../model';
import OrganizationsCollection from '../collection';

export default Mn.View.extend({
  template: Template,
  collection: new CollectionView(),
  regions: {
    list: '#organization-list'
  },
  events: {
    'keyup #search': 'handleSearch'
  },
  initialize(options) {
    this.app = options.app;
    // eslint-disable-next-line no-undef
    _.bindAll(this, 'loadMore');
    // bind scroll event to window
    $(window).scroll(this.loadMore);

    this.collection = new Bn.Collection(this.model.get('list'));
    this.collection.on('remove', this.render);
    this.search = debounce(this.search, 300);
  },
  onRender() {

    setTimeout(() => {
      this.$el.find('#search').focus();
    }, 0);
    this.showList();
  },
  onAttach() {
    if (this.app.getSession().userHasRole('ROLE_HUB_ADMIN')) {
      this.$el.find('#add-new').show();
    }
  },
  getTemplate() {
    return Template;
  },
  showList() {
    this.getRegion('list').show(
      new CollectionView({ collection: this.collection })
    );
  },
  handleSearch() {
    const container = this.$el.find('.list-container').eq(0);
    const section = utils.getLoadingSection(container);
    section.loading();
    this.getRegion('list').empty();
    let self = this;
    setTimeout(() => {

      let params = {};
      if(self.app.getSession().get('user').application !== null){
        params.applicationId = self.app.getSession().get('user').application.id;
      }
      if(self.app.getSession().get('user').organization !== null){
        params.organizationId = self.app.getSession().get('user').organization.id
      }


      let moreElements = new OrganizationsCollection();
      moreElements.fetch({
        data: params,
        success(response) {
          self.collection.set(response.get('list'));
          self.showList();
          section.reset();
        }
      });
    }, 500);
  },
  search(term) {
    if (!term) {
      return null;
    }
    const filtered = this.collection.filterByValue(term);

    if (filtered && filtered.length > 0) {
      return filtered;
    }

    return null;
  },
  loadMore(e) {
    e.preventDefault();

    let scrollHeight = $(document).height();
    let scrollPosition = $(window).height() + $(window).scrollTop();
    let margin = 150; // margin to scroll from the bottom

    // if we are closer than 'margin' to the end of the content, load more books
    if (scrollPosition + margin >= scrollHeight) {
      this.searchMore();
    }
  },
  searchMore() {
    var self = this;

    // if not all organizations have been loaded
    if (self.model.get('currentPage') < self.model.get('totalPages')) {

      let params = {
        page: self.model.get('currentPage') + 1,
        per_page: 12,
        applicationId: self.app.getSession().get('user').application.id ,
        organizationId: self.app.getSession().get('user').organization.id,
      };

      let moreElements = new OrganizationsModel();
      moreElements.fetch({
        data: params,
        success(response) {
          self.collection.add(response.get('list'));
          self.model.set('currentPage', response.get('currentPage'));
        }
      });
    }
  }
});
