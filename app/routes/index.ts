import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import CurrentSessionService, {
  Role,
} from 'frontend-data-monitoring/services/current-session';
import LoketSessionService from 'frontend-data-monitoring/services/loket-session';

export default class ApplicationRoute extends Route {
  @service declare session: LoketSessionService;
  @service declare currentSession: CurrentSessionService;
  @service declare router: RouterService;

  async beforeModel(): Promise<void> {
    await this.session.setup();
    await this.currentSession.load();
    if (this.session.isAuthenticated) {
      if (this.currentSession.checkRole(Role.OrgUser)) {
        this.router.transitionTo('home.org');
      } else if (
        this.currentSession.checkRole(Role.SupplierUser) ||
        this.currentSession.checkRole(Role.AbbUser)
      ) {
        this.router.transitionTo('home.overview');
      } else {
        throw new Error(
          'Logged in but not with the correct role. Defaulted to public role and there is no content for this type of role.'
        );
      }
      return;
    }
  }
}
