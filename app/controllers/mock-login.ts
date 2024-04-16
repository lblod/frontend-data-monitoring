import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import { action } from '@ember/object';
import CurrentSessionService from 'frontend-data-monitoring/services/current-session';
import LoketSessionService from 'frontend-data-monitoring/services/session';
import Store from '@ember-data/store';
import AccountModel from 'frontend-data-monitoring/models/account';
import DS from 'ember-data';

export default class MockLoginController extends Controller {
  @service declare store: Store;
  @service declare currentSession: CurrentSessionService;
  @service declare session: LoketSessionService;

  queryParams = ['gemeente', 'page'];
  size = 10;

  @tracked model: DS.AdapterPopulatedRecordArray<AccountModel> | undefined =
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

  @action
  async login(account: AccountModel) {
    // TODO: Error handling
    const user = await account.user;
    const group = (await user.groups).firstObject;
    if (!group) {
      throw new Error(
        'No admin unit associated with user. Error during login procedure (controller).'
      );
    }
    const groupId = (await group).id;
    await this.session.authenticate(
      'authenticator:mock-login',
      account.id,
      groupId
    );
  }

  updateSearch = task({ restartable: true }, async (value) => {
    await timeout(500); // Debounce
    this.page = 0;
    this.gemeente = value;

    this.model = await this.queryStore.perform();
  });
}
