import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import LoketSessionService from 'frontend-data-monitoring/services/loket-session';
import { inject as service } from '@ember/service';

export default class SwitchLoginRoute extends Route {
  @service declare router: RouterService;
  @service declare session: LoketSessionService;

  async beforeModel() {
    if (this.session.isAuthenticated) {
      this.router.replaceWith('auth.switch');
    } else {
      this.router.replaceWith('auth.login');
    }
  }
}
