import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import CurrentSessionService from 'frontend-data-monitoring/services/current-session';
import LoketSessionService from 'frontend-data-monitoring/services/loket-session';
import Store from '@ember-data/store';
import AccountModel from 'frontend-data-monitoring/models/account';

import { v4 as uuidv4 } from 'uuid';
import { DS } from 'ember-data';

export default class MockLoginController extends Controller {
  @service declare store: Store;
  @service declare currentSession: CurrentSessionService;
  @service declare session: LoketSessionService;
  queryParams = ['gemeente', 'page'];
  size = 10;

  @tracked accounts: DS.AdapterPopulatedRecordArray<AccountModel> | undefined =
    undefined;
  @tracked gemeente = '';
  @tracked page = 0;

  queryStore = task(async () => {
    // This code needs a refactor. Copied code from contactgegevens not correct
    const filter: Record<string, string | object> = {
      provider: 'https://github.com/lblod/mock-login-service',
    };
    if (this.gemeente) {
      filter['user'] = {
        'family-name': this.gemeente,
      };
    }
    const accounts = await this.store.query('account', {
      include: 'user,user.groups',
      filter: filter,
      page: { size: this.size, number: this.page },
      sort: 'user.first-name',
    });
    return accounts;
  });

  updateSearch = task({ restartable: true }, async (value) => {
    await timeout(500); // Debounce
    this.page = 0;
    this.gemeente = value;

    this.accounts = await this.queryStore.perform();
  });

  generateUuid() {
    return uuidv4();
  }
}
