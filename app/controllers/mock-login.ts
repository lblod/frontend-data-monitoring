import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import CurrentSessionService from 'frontend-data-monitoring/services/current-session';
import LoketSessionService from 'frontend-data-monitoring/services/loket-session';
import Store from '@ember-data/store';
import AccountModel from 'frontend-data-monitoring/models/account';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';

export default class MockLoginController extends Controller {
  @service declare store: Store;
  @service declare currentSession: CurrentSessionService;
  @service declare session: LoketSessionService;
  queryParams = ['gemeente', 'page'];
  size = 10;

  @tracked gemeente = '';
  @tracked page = 0;

  @tracked declare model:
    | DS.AdapterPopulatedRecordArray<AccountModel>
    | undefined;

  queryStore = task({ drop: true }, async () => {
    const filter: Record<string, string | object> = {
      provider: 'https://github.com/lblod/mock-login-service',
    };
    if (this.gemeente) {
      filter['user'] = { groups: this.gemeente };
    }
    const accounts = await this.store.query('account', {
      include: 'user,user.groups',
      filter: filter,
      page: { size: 10, number: this.page },
      sort: 'user.family-name',
    });
    return accounts;
  });

  callLogin = task({ drop: true }, async (loginFunction, account) => {
    const user = await account.user;
    const group = (await user.groups)[0];
    const groupId = (await group).id;
    loginFunction(account.id, groupId);
  });

  updateSearch = task({ restartable: true }, async (value) => {
    await timeout(500); // Debounce
    this.page = 0;
    this.gemeente = value;
    this.model = await this.queryStore.perform();
  });
}
