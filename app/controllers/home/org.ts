import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import CurrentSessionService from 'frontend-data-monitoring/services/current-session';

import LoketSessionService from 'frontend-data-monitoring/services/loket-session';

export default class HomeOrgReportController extends Controller {
  @service declare loketSession: LoketSessionService;
  @service declare currentSession: CurrentSessionService;

  @tracked hasFilter = false;

  @action hideFilter() {
    this.hasFilter = false;
  }

  @tracked lastHarvestingDate = '22-02-2022';
  get isMockLogin(): boolean {
    console.log(
      'isMockLogin from controller',
      this.loketSession,
      this.loketSession.isMockLoginSession
    );
    return this.loketSession.isMockLoginSession;
  }
}
