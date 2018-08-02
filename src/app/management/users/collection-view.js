import Mn from 'backbone.marionette';
import ItemView from './item/view';

export default Mn.CollectionView.extend({
  childView: ItemView,
  childViewOptions: {},
  className: 'list-container row',
  childEvents: {
    'delete:model': 'handleDelete'
  },
  onRender() {
    this.$el.find('#search').focus();
  },
  onChildviewDeleteItem(childView) {
    this.collection.remove(childView.model);
  }
});
