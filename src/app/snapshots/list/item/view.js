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

export default Mn.View.extend({
  template: Template,
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
        clazz: value.value !== null ? value.value.toLowerCase() : 'gray',
        value: value.value,
        name: value.name
      })),
      priorities: this.props.model.attributes.indicators_priorities,
      clazz:
        this.props.model.attributes.indicators_priorities <= 0 ? 'hidden' : ''
    };
  },

  handleOnDeletePriority(event) {
    const toRemoveId = $(event.currentTarget).data('id');
    const model = new PriorityModel();

    model.set({
      id: $(event.currentTarget).data('id')
    });

    ModalService.request('confirm', {
      title: 'Confirm Deletion',
      text: `Are you sure you want to delete this priority?`
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
        title: `The priority has been deleted!`
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

    var exists = [];

    exists = this.props.model.attributes.indicators_priorities.filter(
      priority => priority.indicator === indicatorSelected
    );

    if (exists.length > 0) {
      return FlashesService.request('add', {
        timeout: 2000,
        type: 'info',
        title: `The "${indicatorSelected}" indicator was previously selected`
      });

    }

    if (indicatorSelectedValue.toUpperCase() === 'GREEN') {
      return FlashesService.request('add', {
        timeout: 2000,
        type: 'info',
        title: `The "${indicatorSelected}" indicator is really good`
      });

    }else if (indicatorSelectedValue.toUpperCase() === 'NONE') {
        return FlashesService.request('add', {
          timeout: 2000,
          type: 'info',
          title: `You have chosen not to answer the question`
        });

    }
    this.showDialogPriority(indicatorSelected);
    this.priorityDialog.open();
    this.priorityDialog.on('change', data => {
      this.props.model.attributes.indicators_priorities.push(data);
      setTimeout(() => {
        this.render();
      }, 300);
      this.priorityDialog.close();
    });
  },

  showDialogPriority(indicator) {
    const dataIdConfirmOperacion = Math.random();

    this.priorityDialog = new PriorityView({
      dataId: dataIdConfirmOperacion,
      indicatorName: indicator,
      snapshotIndicatorId: this.model.attributes.snapshot_indicator_id,
      obj: this
    });

    $('#modal-region').append(this.priorityDialog.render().el);
  },

  handleShowFamilyMap() {

    if(this.model.attributes.indicators_priorities.length<1 && (this.model.attributes.count_red_indicators>0 || this.model.attributes.count_yellow_indicators>0)){

      ModalService.request('confirm', {
        title: 'Information',
        text: `You have not set any priorities yet, are sure you want to finish the survey?`
      }).then(confirmed => {
        if (!confirmed) {
          return;
        }
        this.redirect(`families/${this.props.model.attributes.family_id}/snapshots/${
          this.props.model.attributes.snapshot_economic_id
        }`);
      });

    } else {
      this.redirect(`families/${this.props.model.attributes.family_id}/snapshots/${
        this.props.model.attributes.snapshot_economic_id
      }`);
    }
  },

  finishSurvey(e){

    e.preventDefault();

    if($('#check-privacity').is(':checked')) {
      ModalService.request('confirm', {
        title: 'Information',
        text: `Your personal information has not been saved in the platform`
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
      header: '<h3>Survey Results</h3>',
      footer: null,
      base: false,
      removeScripts: true,
      copyTagClasses: true,
      doctypeString: '<!DOCTYPE html>'
    });
  }
});
