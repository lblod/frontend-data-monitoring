import Store from '@ember-data/store';
import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import LoketSessionService from 'frontend-data-monitoring/services/loket-session';
import { inject as service } from '@ember/service';

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
    // This code needs a refactor. Copied code from contactgegevens not correct
    const filter: Record<string, string | object> = {
      provider: 'https://github.com/lblod/mock-login-service',
    };

    if (params.gemeente) filter['user'] = { groups: params.gemeente };
    const accounts = await this.store.query('account', {
      include: 'user,user.groups',
      filter: filter,
      page: { size: 10, number: params.page },
      sort: 'user.first-name',
    });
    return accounts;
  }
}
