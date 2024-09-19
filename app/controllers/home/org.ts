import Store from '@ember-data/store';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { CountResult } from 'frontend-data-monitoring/routes/home/org';
import CurrentSessionService from 'frontend-data-monitoring/services/current-session';
import LoketSessionService from 'frontend-data-monitoring/services/loket-session';

export default class HomeOrgReportController extends Controller {
  @service declare loketSession: LoketSessionService;
  @service declare store: Store;
  @service declare currentSession: CurrentSessionService;
  @tracked declare model: {
    data: { isRunning: boolean; isFinished: boolean; value: CountResult };
    lastHarvestingDate: {
      isRunning: boolean;
      isFinished: boolean;
      value: Date | null;
    };
  };

  @tracked hasFilter = false;

  @action hideFilter() {
    this.hasFilter = false;
  }

  get isLoading() {
    return this.model?.data.isRunning;
  }

  get data() {
    return this.model?.data.isFinished ? this.model?.data.value : [];
  }

  get lastHarvestingDateIsLoading() {
    return this.model?.lastHarvestingDate.isRunning;
  }
  get lastHarvestingDate() {
    return this.model?.lastHarvestingDate.isFinished
      ? this.model?.lastHarvestingDate.value
      : [];
  }
}
