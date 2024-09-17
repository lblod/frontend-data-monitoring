import { action } from '@ember/object';
import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service declare router: RouterService;
  @action
  error(error: Error) {
    console.error('Error in application route:', error);
    this.router.transitionTo('error');
    return true;
  }
}
