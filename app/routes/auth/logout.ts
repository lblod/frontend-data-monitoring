import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import Transition from '@ember/routing/transition';
import { inject as service } from '@ember/service';
import ENV from 'frontend-data-monitoring/config/environment';
import LoketSessionService from 'frontend-data-monitoring/services/loket-session';

export default class AuthLogoutRoute extends Route {
  @service declare router: RouterService;
  @service declare loketSession: LoketSessionService;

  async beforeModel(transition: Transition<unknown>) {
    if (this.loketSession.requireAuthentication(transition, 'auth.login')) {
      try {
        await this.loketSession.invalidate();
        const logoutUrl = this.loketSession.isMockLoginSession
          ? this.router.urlFor('auth.login')
          : ENV.acmidm.logoutUrl;
        window.location.replace(logoutUrl);
      } catch (error) {
        throw new Error(
          'Something went wrong while trying to remove the loketSession on the server'
        );
      }
    }
  }
}
