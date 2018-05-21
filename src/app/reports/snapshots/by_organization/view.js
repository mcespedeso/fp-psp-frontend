import Mn from 'backbone.marionette';
import $ from 'jquery';
import 'select2';
import Template from './template.hbs';
import Collection from './collection';
import CollectionView from './list/view';
import OrganizationModel from '../../../management/organizations/model'
import utils from '../../../utils';
import FlashesService from '../../../flashes/service';
import storage from '../../storage';
import env from "../../../env";

export default Mn.View.extend({  
  template: Template,
  organizationsCollection: new OrganizationModel(),
  events: {
    'click #submit': 'handleSearch',
    'keypress #search': 'handleSearch'
  },
  regions: {
    list: '#family-organization-list'
  },
  initialize(options){
    this.app = options.app;
    this.collection = new Collection();
    this.filters = {
        date_from: '',
        date_to: '',
        family_id:'',
        application_id:'',
        organizations:[]
    }    
  },

  onRender(){

    const headerItems = storage.getSubHeaderItems();
    this.app.updateSubHeader(headerItems);
    this.setCalendarToVariable('#dateFrom');
    this.setCalendarToVariable('#dateTo');
    this.$el.find('#organization').select2({});

    $('.sub-menu-item[href$="reports/snapshots/organizations"]')
      .parent()
      .addClass('subActive');

    this.getOrganizations();

    this.app.getSession().userHasRole('ROLE_APP_ADMIN') ? this.$el.find('#organizations').hide() : this.$el.find('#organizations').show();

  },

  getOrganizations(){
    let self = this;
    this.organizationsCollection.urlRoot = `${env.API}/organizations/list`;
    self.organizationsCollection.fetch({
      success(response) {
        self.organizationsCollection = response.attributes;
          $.each(self.organizationsCollection, (index, element) => {
            self.buildOption(element);
          });
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

  setCalendarToVariable(varName){
    let $date = this.$el.find(varName);
    $date.datetimepicker({
      format: 'DD/MM/YYYY',
      locale: this.app.getSession().get('locale') || 'es'
    });
  }, 

  handleSearch(event){
    event.preventDefault();
    let self = this;
    if (event.which === 13 || event.which === 1) {

      const container = this.$el.find('.list-container').eq(0);
      const section = utils.getLoadingSection(container);

      self.collection.reset();
      this.getRegion('list').empty();
      section.loading();

        this.filters.date_from = this.$el.find('#date1').val();
        this.filters.date_to = this.$el.find('#date2').val();
        
        let organizationArray = [];
        
        if (this.app.getSession().userHasRole('ROLE_HUB_ADMIN')){          
          $("#organization").val().forEach(element => {
            organizationArray.push(parseInt(element, 10));
          });
        }else if(this.app.getSession().userHasRole('ROLE_APP_ADMIN')){          
          organizationArray.push(this.app.getSession().get('user').organization.id);
        }

        this.filters.organizations = organizationArray;

        this.filters.application_id = this.app.getSession().get('user').application ? this.app.getSession().get('user').application.id : '';

        let errors = this.validate(this.filters);

        if (errors.length) {
          errors.forEach(error => {
            FlashesService.request('add', {
              timeout: 2000,
              type: 'warning',
              title: error
            });
          });
        } else {
          this.collection.fetch({
            data: this.filters,
            success() {
             self.showList();
             section.reset();
            }
          });
        }
    }
  },

  showList() {
    if(this.collection.models.length>0){
      this.getRegion('list').show(
        new CollectionView({ collection: this.collection.models, filters: this.filters })
      );
    } else {
      this.getRegion('list').show(`
            <br/>
            <br/>
            <p class="text-gray" style="font-size: 20px; text-align:center;">
              ${t('report.snapshot.search.not-found')}
            </p>`);
    }
  },

  validate(filters) {

    const errors = [];

    if (!filters.date_from) {
      errors.push(t('report.snapshot.messages.validation.required', {field: t('report.snapshot.search.date-from')}));
    }

    if (!filters.date_to) {
      errors.push(t('report.snapshot.messages.validation.required', {field: t('report.snapshot.search.date-to')}));
    }

    return errors;
  }

});