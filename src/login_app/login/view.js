/* eslint camelcase: 0 */
import Mn from 'backbone.marionette';
import $ from 'jquery';
import Template from './template.hbs';
import env from '../env';
import session from '../../common/session';
import { getLoadingButton } from '../../common/utils';
import FlashesService from '../../common/flashes/service';

export default Mn.View.extend({
  template: Template,
  regions: {
    container: '#container',
    flashes: '#flashes'
  },
  events: {
    'click #btn-login': 'doLogin',
    'click #link-email': 'entryEmail',
    'click #back-login': 'backLogin',
    'click #btn-recovery': 'sendEmail'
  },

  initialize(options) {
    this.app = options.app;
    this.localeConfiguration = options.localeConfiguration;

    session.fetch();
    
    if(this.localeConfiguration){
      session.set('locale',this.localeConfiguration.locale);
      session.set('messages',this.localeConfiguration.messages);
    }

    FlashesService.setup({
      container: this.getRegion('flashes')
    });

  },
  onRender() {
    setTimeout(() => {
      this.$el.find('#login-username').focus();
    }, 0);

  },
  entryEmail(){
    $(".login").hide();
    $(".recovery").show();
    this.$el.find('#login-email').focus();

  },
  backLogin(){
    $(".login").show();
    $(".recovery").hide();
    this.$el.find('#login-username').focus();
  },

  doLogin(event) {

    let self = this;

    event.preventDefault();

    const loginBtn = this.$el.find('#btn-login');
    const button = getLoadingButton(loginBtn);

    let username = $('#login-username').val();
    let password = $('#login-password').val();

    let url = `${
      env.API_AUTH
    }/token?username=${username}&password=${password}&grant_type=password`;

    let clientid = 'barClientIdPassword';
    let clientsecret = 'secret';
    button.loading();
    $.ajax({
      url,
      type: 'POST',
      dataType: 'json',
      headers: {
        Authorization: `Basic ${btoa(`${clientid}:${clientsecret}`)}`
      },

      success: data => {
        if (data.error) {
          $('.alert-error')
            .text(data.error.text)
            .show();
        } else {
          const { access_token, refresh_token, user } = data;
          session.save({ access_token, refresh_token, user });

          const fragment = session.getLoggedUserHomeRoute();
          window.location.replace(`/#${fragment}`);
        }
      },
      error(xmlHttpRequest, textStatus) {
        if (xmlHttpRequest && xmlHttpRequest.status === 0) {
          self.showError("danger", t('login.server-connection-error'));
          return;
        }
        if (textStatus === 'Unauthorized') {
          self.showError("warning", t('login.server-unauthorized-error'));
        } else {
          self.showError("warning", t('login.server-wrong-credentials'));
          $('#login-username').val('');
          $('#login-password').val('');
          $('#login-username').focus();
        }
      },
      complete: () => {
        button.reset();
      }
    });
  },

  sendEmail(event) {
    event.preventDefault();
    let self = this;
    const rcoveryBtn = this.$el.find('#btn-recovery');
    const button = getLoadingButton(rcoveryBtn);

    let email = $('#login-email').val();

    let url = `${
      env.API_PUBLIC
    }/password/resetPassword?email=${email}`;

    button.loading();
    $.ajax({
      url,
      type: 'POST',
      success() {
          self.showError("success", t('mail-reset-success', {email}));
          self.backLogin();
      },
      error(xmlHttpRequest, statusText) {
        if (xmlHttpRequest && xmlHttpRequest.status === 0) {          
          self.showError("danger", t('login.server-connection-error'));
          return;
        }

        if (statusText === 'Unauthorized') {
          self.showError("warning", t('login.server-unauthorized-error'));
        } else {
          let jsonResponse = JSON.parse(xmlHttpRequest.responseText);
          let message = jsonResponse.message;
          self.showError("warning", message);
        }
      },
      complete: () => {
        $('#login-email').val('');
        button.reset();
      }
    });
  },

  // showError(type, message){    
  //   $(`#login-alert-${type}`).css("display","block");
  //   $(`#login-alert-${type}`).text(message);
  //   $(`#login-alert-${type}`).fadeTo(2500, 500).slideUp(500, () =>{
  //     $(`#login-alert-${type}`).css("display","none");
  //   });
  // },

  showError(type, message) {
    $(`#login-alert`)
      .attr('class', `alert alert-${type}`)
      .text(message)
      .show()
      .fadeTo(2500, 500).slideUp(500, () => $(`#login-alert`).hide());
  }

});
