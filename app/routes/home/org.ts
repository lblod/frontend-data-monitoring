import Route from '@ember/routing/route';
import Store from '@ember-data/store';

import { inject as service } from '@ember/service';
import Transition from '@ember/routing/transition';

type OrgModel = {
  adminUnitCountReports: Awaited<ReturnType<Store["query"]>>;
}

export default class OrgReportRoute extends Route {
  @service declare store: Store;
  async model(params: object, transition: Transition<unknown>): Promise<OrgModel> {
    const adminUnitCountReports = await this.store.query('admin-unit-count-report', {
      page: { size:10,number:0 },
    });
    return {
      adminUnitCountReports
    }

  }
}
