import merge from 'lodash/merge';
import BaseRouter from './baserouter';
import organizations from '../management/organizations/routes';
import surveys from '../surveys/routes';
import snapshots from '../snapshots/routes';
import logout from '../logout/routes';
import initAuthorizer from './router-authorizer';
import families from '../families/routes';
import home from '../home/routes';
import termcondpol from '../termcondpol/routes';
import faqs from '../faqs/routes';
import snapshotsDraft from '../snapshots_drafts/routes';
import reports from '../reports/routes';
import management from '../management/routes';
import map from '../map/routes';

const initRouter = props => {
  const { app, before, onAccessDenied } = props;

  const { appRoutes, controller } = merge(
    logout(props),
    organizations(props),
    surveys(props),
    snapshots(props),
    families(props),
    home(props),
    termcondpol(props),
    faqs(props),
    snapshotsDraft(props),
    reports(props),
    management(props),
    map(props)
  );
  const authorizer = initAuthorizer({
    onAccessDenied,
    session: app.getSession(),
    appRoutes
  });

  return new BaseRouter({
    appRoutes,
    controller,
    before: route => {
      authorizer.canAccess(route);
      before.apply();
    }
  });
};

export default initRouter;
