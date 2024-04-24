import Controller from '@ember/controller';
import RouterService from '@ember/routing/router-service';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import CurrentSessionService, {
  Role,
} from 'frontend-data-monitoring/services/current-session';

export default class HomeController extends Controller {
  @service declare router: RouterService;
  @service declare currentSession: CurrentSessionService;

  get roles(): string {
    return JSON.stringify(this.currentSession.roles);
  }
}
