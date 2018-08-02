import Mn from 'backbone.marionette';
import ItemView from './item/view';
import Model from '../model';
import FlashesService from '../../../flashes/service';
import ModalService from '../../../modal/service';

export default Mn.CollectionView.extend({
  childView: ItemView,
  initialize(options) {
    this.app = options.app;
    this.collection = options.collection;
    this.isRoot = this.app
      ? this.app.getSession().userHasRole('ROLE_ROOT') === true
      : false;
  },
  childViewOptions() {
    return {
      isRoot: this.isRoot
    };
  },
  className: 'list-container ',
  childViewEvents: {
    'delete:model': 'onChildDeleteModel'
  },
  onRender() {
    this.$el.find('#search').focus();
  },
  onChildDeleteModel(childView) {
    if (this.isRoot) {
      return;
    }
    let self = this;

    ModalService.request('confirm', {
      title: t('organization.delete.confirm-title'),
      text: t('organization.delete.confirm-text')
    }).then(confirmed => {
      if (!confirmed) {
        return;
      }

      let model = new Model();
      model.set('id', childView.model.get('id'));
      model.destroy({
        success() {
          self.collection.remove(childView.model);
          FlashesService.request('add', {
            timeout: 2000,
            type: 'info',
            title: t('organization.delete.success')
          });
        },
        error() {
          FlashesService.request('add', {
            timeout: 2000,
            type: 'danger',
            title: t('organization.delete.failed')
          });
        }
      });
    });
  }
});
