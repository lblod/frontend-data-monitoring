import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import LoketSessionService from 'frontend-data-monitoring/services/session';
import { inject as service } from '@ember/service';
import Transition from '@ember/routing/transition';

export default class HomeRoute extends Route {
  @service declare router: RouterService;
  @service declare session: LoketSessionService;

  async beforeModel(transition: Transition) {
    await this.session.setup();
    this.session.requireAuthentication(transition, 'login');
  }
}
