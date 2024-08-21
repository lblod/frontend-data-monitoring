import Store from '@ember-data/store';
import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import LoketSessionService from 'frontend-data-monitoring/services/loket-session';
import { inject as service } from '@ember/service';
import CurrentSessionService from 'frontend-data-monitoring/services/current-session';
import ENV from 'frontend-data-monitoring/config/environment';

type MockLoginRouteParams = {
  gemeente: string;
  page: number;
};

export default class MockLoginRoute extends Route<
  unknown,
  MockLoginRouteParams
> {
  @service declare router: RouterService;
  @service declare session: LoketSessionService;
  @service declare store: Store;
  @service declare currentSession: CurrentSessionService;

  queryParams = {
    page: {
      refreshModel: true,
    },
  };

  async beforeModel() {
    await this.session.setup();
    this.session.prohibitAuthentication('index');
  }

  async model(params: MockLoginRouteParams) {
    const filter: Record<string, string | object> = {
      provider: 'https://github.com/lblod/mock-login-service',
    };

    if (params.gemeente) filter['user'] = { groups: params.gemeente };
    try {
      const accounts = await this.store.query('account', {
        include: 'user,user.groups',
        filter: filter,
        page: { size: 10, number: params.page },
        sort: 'user.family-name',
      });
      return accounts;
    } catch (error) {
      throw new Error('Something went wrong while fetching accounts:' + error);
    }
  }
}
