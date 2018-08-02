import Bn from 'backbone';
import env from '../../env';

export default Bn.Model.extend({
  urlRoot: `${env.API}/termcondpol/available-term-language-pairs`
});
