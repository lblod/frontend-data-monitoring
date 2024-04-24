import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import LoketSessionService from 'frontend-data-monitoring/services/loket-session';
import { inject as service } from '@ember/service';
import Transition from '@ember/routing/transition';
import CurrentSessionService from 'frontend-data-monitoring/services/current-session';

export default class HomeRoute extends Route {
  @service declare router: RouterService;
  @service declare session: LoketSessionService;
  @service declare currentSession: CurrentSessionService;

  async beforeModel(transition: Transition) {
    console.log('Setting up session in Homeroute');
    await this.session.setup();
    await this.currentSession.load();
    this.session.requireAuthentication(transition, 'auth.login');
  }
}
