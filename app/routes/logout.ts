import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import Transition from '@ember/routing/transition';
import { inject as service } from '@ember/service';
import ENV from 'frontend-data-monitoring/config/environment';
import LoketSessionService from 'frontend-data-monitoring/services/session';

export default class AuthLogoutRoute extends Route {
  @service declare router: RouterService;
  @service declare session: LoketSessionService;

  async beforeModel(transition: Transition) {
    if (this.session.requireAuthentication(transition, 'login')) {
      try {
        const wasMockLoginSession = this.session.isMockLoginSession;
        await this.session.invalidate();
        const logoutUrl = wasMockLoginSession
          ? this.router.urlFor('mock-login')
          : ENV.acmidm.logoutUrl;

        window.location.replace(logoutUrl);
      } catch (error) {
        throw new Error(
          `Something went wrong while trying to remove the session on the server\n${error}`
        );
      }
    }
  }
}
