import Mn from 'backbone.marionette';
import 'eonasdan-bootstrap-datetimepicker';
import Bn from 'backbone';
import $ from 'jquery';
import moment from 'moment';
import 'moment-timezone';

import Template from './template.hbs';
import PriorityView from './priority/view';
import FlashesService from '../../../flashes/service';
import PriorityModel from './priority/model';
import SnapshotModel from '../../add/model';
import ModalService from '../../../modal/service';
import Storage from './storage';
import ParameterModel from '../../../parameter/model';

export default Mn.View.extend({
  template: Template,
  parameterModel: new ParameterModel(),
  events: {
    'click #circle': 'handlerOnClickIndicator',
    'click #delete': 'handleOnDeletePriority',
    'click #finish-snapshot': 'finishSurvey',
    'click #print': 'printSnapshot'
  },

  initialize(options) {
    this.props = Object.assign({}, options);
    this.model = this.props.model;
    this.app = this.props.app;
    this.model.on('sync', this.render);
  },

  onRender(){
    const self = this;    
    this.parameterModel = new ParameterModel();
    this.parameterModel.fetch({
      data: { keyParameter: 'minimum_priority'},
      success(response) {
        self.parameterModel = response.toJSON();
      }
    });
  },

  serializeData() {
    var self = this;

    const headerItems = Storage.getSubHeaderItems(this.model);
    this.app.updateSubHeader(headerItems);

    this.props.model.attributes.indicators_priorities.forEach(value => {
      var date = self.formartterOnlyDate(value.estimated_date);
      value.estimated_date = date;
    });

    return {
      header: {
        date: this.formartterWithTime(this.model.attributes.created_at),
        data: this.model.attributes // ,
      },
      data: this.model.attributes.indicators_survey_data.map(value => ({
        classNames: this.getClassNames(value.value),
        value: value.value,
        name: value.name,
        priority: this.getPriorityClass(value.name, value.value)

      })),
      priorities: this.props.model.attributes.indicators_priorities,
      tablePriorityClassNames: this.getTableClass(false),
      tableAchievedClassNames: this.getTableClass(true)
    };
  },

  getPriorityClass(name, value){
    const isPriority = this.model.attributes.indicators_priorities.find(data => data.indicator === name);
    return isPriority && `priority-indicator-${value.toLowerCase()}`;
  },
  getClassNames(value) {
    return value !== null ? value.toLowerCase() : 'none ' ;
  },
  getTableClass(ban){
    const isPriority = this.model.attributes.indicators_priorities.find(data => data.is_attainment === ban);
    return isPriority ? '' : 'hidden';
  },

  handleOnDeletePriority(event) {
    const toRemoveId = $(event.currentTarget).data('id');
    const model = new PriorityModel();

    model.set({
      id: $(event.currentTarget).data('id')
    });

    ModalService.request('confirm', {
      title: t('survey.priority.messages.delete-confirm-title'),
      text: t('survey.priority.messages.delete-confirm')
    }).then(confirmed => {
      if (!confirmed) {
        return;
      }

      model.destroy().then(() => {
        var elements = this.props.model.attributes.indicators_priorities;
        elements = elements.filter(
          priority => priority.snapshot_indicator_priority_id !== toRemoveId
        );
        this.props.model.attributes.indicators_priorities = elements;
        setTimeout(() => {

          this.render();
        }, 300);
      });

      return FlashesService.request('add', {
        timeout: 2000,
        type: 'info',
        title: t('survey.priority.messages.delete-done')
      });

    });
  },

  formartterWithTime(date) {
    if (!date) {
      return null;
    }

       return moment.tz(date, "Etc/GMT").clone().tz(moment.tz.guess()).format('DD/MM/YYYY HH:mm:ss');

  },

  formartterOnlyDate(date) {
    if (!date) {
      return null;
    }
    return moment(date, ['YYYY-MM-DD', 'DD/MM/YYYY']).format('DD/MM/YYYY');
  },

  handlerOnClickIndicator(e) {
    const indicatorSelected =
      e.target.parentNode.children['indicator-name'].innerHTML;
    const indicatorSelectedValue =
      e.target.parentNode.children['indicator-value'].innerHTML;

    let success = false;
    var exists = [];


    exists = this.props.model.attributes.indicators_priorities.filter(
      priority => priority.indicator === indicatorSelected
    );

    if (exists.length > 0) {
      return FlashesService.request('add', {
        timeout: 2000,
        type: 'info',
        title: t('survey.priority.messages.previous-selected', {indicator: indicatorSelected})
      });

    }

    if (indicatorSelectedValue.toUpperCase() === 'NONE') {
        return FlashesService.request('add', {
          timeout: 2000,
          type: 'info',
          title: t('survey.priority.messages.indicator-not-answered')
        });
    }

    success = indicatorSelectedValue.toUpperCase() === 'GREEN' ;

    this.showDialogPriority(indicatorSelected, success );
    this.priorityDialog.open();
    this.priorityDialog.on('change', data => {
      this.props.model.attributes.indicators_priorities.push(data);

      setTimeout(() => {
        this.render();
      }, 300);

      this.priorityDialog.close();
    });
  },

  showDialogPriority(indicator, success) {
    const dataIdConfirmOperacion = Math.random();

    this.priorityDialog = new PriorityView({
      app: this.app,
      dataId: dataIdConfirmOperacion,
      indicatorName: indicator,
      isAttainment: success,
      snapshotIndicatorId: this.model.attributes.snapshot_indicator_id,
      obj: this
    });

    $('#modal-region').append(this.priorityDialog.render().el);
  },

  handleShowFamilyMap() {

    if(this.model.attributes.indicators_priorities.length <= 0 && (this.model.attributes.count_red_indicators>0 || this.model.attributes.count_yellow_indicators>0)){
      ModalService.request('confirm', {
        title: t('general.messages.information'),
        text: t('survey.priority.messages.without-priorities')
      }).then(confirmed => {
        if (!confirmed) {
          return;
        }
        this.savedNotification();
        this.redirect(`families/${this.props.model.attributes.family_id}/snapshots/${
          this.props.model.attributes.snapshot_economic_id
        }`);
      });

    } else {
      let totalRedYellowIndicator = this.model.attributes.count_red_indicators + this.model.attributes.count_yellow_indicators;
      if(this.model.attributes.indicators_priorities.length > 0){
        if(totalRedYellowIndicator >= this.parameterModel.value ){
          if(this.model.attributes.indicators_priorities.length < this.parameterModel.value){
            return FlashesService.request('add', {
              timeout: 2000,
              type: 'warning',
              title: t('survey.priority.messages.min-priorities', {min: this.parameterModel.value})
            });
          }
        }
      }

      this.savedNotification();
      this.redirect(`families/${this.props.model.attributes.family_id}/snapshots/${
        this.props.model.attributes.snapshot_economic_id
      }`);
    }
  },
  savedNotification(){
    FlashesService.request('add', {
      timeout: 4000,
      type: 'info',
      title: t('survey.summary.messages.finish', {code: `${this.props.model.attributes.family.code}`} )
    });
  },

  finishSurvey(e){

    e.preventDefault();


    if($('#check-privacity').is(':checked')) {
      ModalService.request('confirm', {
        title: t('general.messages.information'),
        text: t('survey.summary.messages.not-save')
      }).then(confirmed => {
        if (!confirmed) {
          return;
        }
        // delete snapshot
       const model = new SnapshotModel();
        model.set("id", `${this.props.model.attributes.snapshot_economic_id}`);
        model.destroy();
        this.redirect(`surveys`);


      });
    } else {
      this.handleShowFamilyMap();

    }
  },

  redirect(url){
    Bn.history.navigate(
      url,
      true
    );
  },
  printSnapshot(event) {
    var id = `#${event.target.value}`;
    $(id).printThis({
      loadCSS: ['/css/main.css'],
      importCSS: true,
      debug: false,
      importStyle: true,
      pageTitle: '',
      header: `<h3> &nbsp; ${t('survey.summary.print-header')}</h3>`,
      footer: null,
      base: false,
      removeScripts: true,
      copyTagClasses: true,
      doctypeString: '<!DOCTYPE html>'
    });
  }
});
