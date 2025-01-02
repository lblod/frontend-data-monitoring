import { action } from '@ember/object';
import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import SessionService from 'ember-simple-auth/services/session';
import { warn } from '@ember/debug';
import CurrentSessionService from 'frontend-data-monitoring/services/current-session';
export default class ApplicationRoute extends Route {
  @service declare router: RouterService;
  @service declare session: SessionService<any>;
  @service declare currentSession: CurrentSessionService;

  async beforeModel() {
    await this.session.setup();
    return this._loadCurrentSession();
  }

  async _loadCurrentSession() {
    try {
      await this.currentSession.load();
    } catch (error) {
      console.error(error);
      warn(error as string, { id: 'current-session-load-failure' });
      this.router.transitionTo('auth.logout');
    }
  }

  @action
  error(error: Error) {
    console.error('Error in application route:', error);
    this.router.transitionTo('error');
    return true;
  }
}
