import Bn from 'backbone';
import SnapshotsView from './view';
import NewSnapshot from './add/view';
import SnapshotView from './list/item/view';
import SnapshotItemModel from './list/item/model';
import FamilytModel from '../families/model';

const snapshots = props => {
  const { app } = props;

  const routes = {
    appRoutes: {
      'snapshots/:id': 'showSnapshots',
      'survey/:id/answer': 'answerSurvey',
      'survey/:id/snapshot/:idSnap': 'showSnapshot',
      'survey/:id/reanswer/:familyId': 'reAnswerSurvey'
    },
    controller: {
      showSnapshots(hash) {
        const surveyId = parseInt(hash, 10);
        app.showViewOnRoute(new SnapshotsView({ surveyId }));
      },
      answerSurvey(hash) {

      const surveyId = parseInt(hash, 10);
        if(app.getSession().get('termCond') && app.getSession().get('termCond')>0 && app.getSession().get('priv') && app.getSession().get('priv')>0){
          const newSnapshotView = new NewSnapshot({
            organizationId: app.getSession().get('user').organization
              ? app.getSession().get('user').organization.id
              : null,
            surveyId,
            handleCancel() {
              Bn.history.navigate(`/surveys`, true);
            },
            app
          });

          app.showViewOnRoute(newSnapshotView);
        } else if(!app.getSession().get('termCond') || app.getSession().get('termCond')<1){
            Bn.history.navigate(`/survey/${surveyId}/termcondpol/TC`, true);
        } else if(app.getSession().get('termCond') && app.getSession().get('termCond')>0){
          Bn.history.navigate(`/survey/${surveyId}/termcondpol/PRIV`, true);
        }

      },
      showSnapshot(hash, hashSnapshot) {


        const snapshotId = parseInt(hashSnapshot, 10);

        const model = new SnapshotItemModel();
        model
          .fetch({
            data: {
              snapshot_id: snapshotId
            }
          })
          .then(() => {
            app.showViewOnRoute(new SnapshotView({ model, app }));
          });
      },

      reAnswerSurvey(hash, familyId) {
        const surveyId = parseInt(hash, 10);

        let model =  new FamilytModel();
        model.set('id', familyId);
        model.fetch().then(() => {

          app.getSession().save({termCond: 0, priv: 0});
          app.getSession().save({reAnswer: false, formData: null});

          const newSnapshot = new NewSnapshot({

                surveyId,
                handleCancel() {
                    Bn.history.navigate(`/surveys`, true);
                },
                app,
                reAnswer: true,
                formData: this.getJsonData(model.attributes)
          });

          app.showViewOnRoute(newSnapshot);

        });

      },

      getJsonData(model){
        let data = {};
        data.firstName = model.snapshot_indicators.family.person.firstName;
        data.lastName = model.snapshot_indicators.family.person.lastName;
        data.identificationNumber = model.snapshot_indicators.family.person.identificationNumber;
        data.identificationType = model.snapshot_indicators.family.person.identificationType;
        data.birthdate = model.snapshot_indicators.family.person.birthdate;
        data.countryOfBirth = model.snapshot_indicators.family.person.countryOfBirth.alfa2Code;
        data.phoneNumber = model.snapshot_indicators.family.person.phoneNumber;
        data.familyId = model.snapshot_indicators.family.familyId;
        return data;
      },
    }
  };

  return routes;
};

export default snapshots;
