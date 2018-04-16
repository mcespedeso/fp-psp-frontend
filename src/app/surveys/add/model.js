import Bn from 'backbone';
import _ from 'lodash';
import env from '../../env';

export default Bn.Model.extend({
  urlRoot: `${env.API}/surveys`,


  validate() {
    const errors = [];

    if (this.attributes.title === '' ) {
      errors.push({field: 'title', message: t('survey.form.title-required'), required: true});
      return errors;
    }

    if (this.attributes.survey_schema === '') {
      errors.push({field: 'title', message: t('survey.form.schema-required'), required: true});
      return errors;
    }

    if (!this.isValidJson(this.toString(this.attributes.survey_schema))) {
      errors.push({field: 'title', message: t('survey.form.schema-format-not-valid'), required: true});
      return errors;
    }

    if (this.attributes.survey_ui_schema === '') {
      errors.push({field: 'title', message: t('survey.form.schema-ui-required'), required: true});
      return errors;
    }

    if (!this.isValidJson(this.toString(this.attributes.survey_ui_schema))) {
      errors.push({field: 'title', message: t('survey.form.schema-ui-format-not-valid'), required: true});
      return errors;
    }

    return errors.length > 0 ? errors : undefined;
  },
  toString(schema) {
    if (typeof schema === 'object')
      return JSON.stringify(schema);
    return schema;
  },
  isValidJson(str) {
    return !_.isError(this.parseLodash(str));
  },
  parseLodash(str) {
    return _.attempt(JSON.parse.bind(null, str));
  }
});
