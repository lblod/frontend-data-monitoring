import Controller from '@ember/controller';
import RouterService from '@ember/routing/router-service';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class HomeController extends Controller {
  @service declare router: RouterService;
}
