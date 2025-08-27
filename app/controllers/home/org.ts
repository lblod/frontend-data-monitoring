import Store from '@ember-data/store';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { CountResult } from 'frontend-data-monitoring/routes/home/org';
import CurrentSessionService from 'frontend-data-monitoring/services/current-session';
import LoketSessionService from 'frontend-data-monitoring/services/loket-session';
import ENV from 'frontend-data-monitoring/config/environment';

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
  @tracked checked = false;

  constructor(...args: any[]) {
    super(...args);

    const saved = localStorage.getItem('view-toggle');
    if (saved !== null) {
      this.checked = saved === 'true';
    }
  }
  @action hideFilter() {
    this.hasFilter = false;
  }

  @action
  handleToggle(checked: boolean) {
    localStorage.setItem('view-toggle', String(checked));
    this.checked = checked;
  }

  get pillSkin(): string {
    const harvestDate = this.lastHarvestingDate;

    if (!(harvestDate instanceof Date)) {
      return 'default';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    harvestDate.setHours(0, 0, 0, 0);

    const diffInMs = today.getTime() - harvestDate.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInDays >= 2) {
      return 'error';
    }

    return 'success';
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
