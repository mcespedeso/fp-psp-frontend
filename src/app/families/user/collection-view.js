import Mn from 'backbone.marionette';
import ItemView from './item/view';

export default Mn.CollectionView.extend({
  childView: ItemView,
  childViewOptions: {},
  className: 'list-container row'
});
