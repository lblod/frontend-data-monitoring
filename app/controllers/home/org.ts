import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

import LoketSessionService from 'frontend-data-monitoring/services/loket-session';

export default class HomeOrgReportController extends Controller {
  @service declare loketSession: LoketSessionService;

  get isMockLogin(): boolean {
    console.log(
      'isMockLogin from controller',
      this.loketSession,
      this.loketSession.isMockLoginSession
    );
    return this.loketSession.isMockLoginSession;
  }
}
