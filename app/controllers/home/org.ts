import Store from '@ember-data/store';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { CountResult } from 'frontend-data-monitoring/routes/home/org';
import CurrentSessionService from 'frontend-data-monitoring/services/current-session';
import LoketSessionService from 'frontend-data-monitoring/services/loket-session';
import ENV from 'frontend-data-monitoring/config/environment';
import LastHarvestingExecutionRecordModel from 'frontend-data-monitoring/models/last-harvesting-execution-record';

export default class HomeOrgReportController extends Controller {
  queryParams = ['datum'];
  @tracked datum: string | null = null;
  @service declare loketSession: LoketSessionService;
  @service declare store: Store;
  @service declare currentSession: CurrentSessionService;
  @tracked declare model: {
    data: { isRunning: boolean; isFinished: boolean; value: CountResult };
    lastHarvestingDate: LastHarvestingExecutionRecordModel;
    lastHarvestFailedDate: LastHarvestingExecutionRecordModel;
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
    const harvestDate = this.model?.lastHarvestingDate?.lastExecutionTime;
    if (
      this.model?.lastHarvestFailedDate?.lastExecutionTime >=
      this.model?.lastHarvestingDate?.lastExecutionTime
    ) {
      return 'error';
    }
    if (!this.lastHarvestingDate) {
      return 'default';
    }

    if (!(harvestDate instanceof Date)) {
      return 'default';
    }

    return 'success';
  }

  get isLoading() {
    return this.model?.data.isRunning;
  }

  get data() {
    return this.model?.data.isFinished ? this.model?.data.value : [];
  }

  get lastHarvestingDate() {
    const { lastHarvestingDate, lastHarvestFailedDate } = this.model ?? {};
    const harvestTime = lastHarvestingDate?.lastExecutionTime;
    const failedTime = lastHarvestFailedDate?.lastExecutionTime;

    if (!harvestTime && !failedTime) return null;
    if (!harvestTime) return lastHarvestFailedDate;
    if (!failedTime) return lastHarvestingDate;

    return harvestTime > failedTime
      ? lastHarvestingDate
      : lastHarvestFailedDate;
  }

  get hasLastSuccessfulHarvest(): boolean {
    const { lastHarvestingDate, lastHarvestFailedDate } = this.model ?? {};
    const harvestTime = lastHarvestingDate?.lastExecutionTime;
    const failedTime = lastHarvestFailedDate?.lastExecutionTime;

    if (harvestTime && failedTime && harvestTime < failedTime) {
      return true;
    }

    return false;
  }

  get filtersEnabled() {
    return ENV.features['filters'] === true ? true : false;
  }
}
