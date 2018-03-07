import Bn from 'backbone';
import Mn from 'backbone.marionette';
import $ from 'jquery';
import Template from './template.hbs';
import Model from './model';
import storage from './storage';
import utils from '../../utils';
import FlashesService from '../../flashes/service';
import env from '../../env';

export default Mn.View.extend({
  template: Template,
  events: {
    'click #submit': 'handleSubmit',
    'change #select-app': 'loadRoles',
    'change #select-org': 'loadRoles'
  },
  initialize(options) {
    this.app = options.app;
    this.props = Object.assign({}, options);
    this.model = this.props.model || new Model();
  },
  serializeData() {
    return {
      user: this.model.attributes
    };
  },
  onAttach() {
    this.loadOrgs()
  },
  loadOrgs() {
    const session = this.app.getSession();

    if (session.userHasRole('ROLE_ROOT')) {
      //  List all applications (Hubs and Partners)
      this.genericFetch(
        '/applications/hubsandpartners',
        '#select-app',
        t('user.form.select-hub'),
        'application',
        'name'
      );
    } else if (session.userHasRole('ROLE_HUB_ADMIN')) {
      //  List this Hub's organizations
      let hubId = session.get('user').application.id;
      this.genericFetch(
        `/applications/${hubId}/organizations`,
        '#select-org',
        t('user.form.select-organization'),
        'organization',
        'name'
      );
    } else if (session.userHasRole('ROLE_APP_ADMIN')) {
      this.loadRoles();
    }
  },
  loadRoles() {
    const session = this.app.getSession();

    var roles = [];
    if (session.userHasRole('ROLE_ROOT')) {
      const appSelected = $('#select-app').find(":selected");

      if (appSelected.attr('data-type') === 'hub') {
        roles.push({role: "ROLE_HUB_ADMIN"});
      } else if (appSelected.attr('data-type') === 'partner') {
        roles.push({role: "ROLE_APP_ADMIN"});
      }
    } else if (session.userHasRole('ROLE_HUB_ADMIN')) {
      roles.push({role: "ROLE_APP_ADMIN"});
    } else if (session.userHasRole('ROLE_APP_ADMIN')) {
      roles.push({role: "ROLE_USER"});
      roles.push({role: "ROLE_SURVEY_USER"});
    }

    this.loadSelect(
      roles,
      '#select-role',
      t('user.form.select-role'),
      'role',
      'role'
    );
  },
  genericFetch(path, selectId, placeholder, type, fieldDisplayed) {
    const self = this;
    var modelCollection = new Bn.Model();
    modelCollection.urlRoot = `${env.API}${path}`;
    modelCollection.fetch({
      success(response) {
        var list = response.toJSON().list || response.toJSON();
        self.loadSelect(list, selectId, placeholder, type, fieldDisplayed);
      }
    });
  },
  loadSelect(list, selectId, placeholder, type, fieldDisplayed) {
    $(`${selectId}`).show();
    $(`${selectId}-placeholder`).text(`* ${placeholder}`);
    $(selectId).val(`* ${placeholder}`);
    $(selectId)
      .find('option:not(:first)')
      .remove();

    $.each(list, (index, element) => {
      var dataType = type;
      if (dataType === 'application')
        if (element.hub)
          dataType = 'hub';
        else if (element.partner)
          dataType = 'partner';

      $(selectId).append(
        $('<option></option>')
          .attr('value', element.id)
          .attr('data-type', dataType)
          .text(element[fieldDisplayed])
      );
    });
  },
  handleSubmit(event) {
    event.preventDefault();
    const button = utils.getLoadingButton(this.$el.find('#submit'));
    const session = this.app.getSession();

    let userModel = new Model();
    this.$el
      .find('#form')
      .serializeArray()
      .forEach(element => {
        userModel.set(element.name, element.value);
      });

    if (session.userHasRole('ROLE_APP_ADMIN')) {
        let user = session.get('user');
        userModel.set('application', user.application && user.application.id);
        userModel.set('organization', user.organization && user.organization.id);
    }

    let errors = userModel.validate();

    if (errors) {
      errors.forEach(error => {
        FlashesService.request('add', {
          timeout: 3000,
          type: 'danger',
          title: error
        });
      });
      button.reset();
      return;
    }

    button.loading();

    storage
      .save(userModel)
      .then(() => {
        button.reset();
        Bn.history.navigate('users', { trigger: true });
        FlashesService.request('add', {
          timeout: 3000,
          type: 'info',
          title: t('user.form.add-success')
        });
      })
      .catch(response => {
        if (response.status === 400) {
          FlashesService.request('add', {
            timeout: 3000,
            type: 'danger',
            title: t('user.form.add-failed')
          });
        }
        button.reset();
      });
  }
});
