import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import CurrentSessionService from 'frontend-data-monitoring/services/current-session';
import LoketSessionService from 'frontend-data-monitoring/services/session';
import Store from '@ember-data/store';
import AccountModel from 'frontend-data-monitoring/models/account';
import DS from 'ember-data';
import AdministrativeUnitModel from 'frontend-data-monitoring/models/administrative-unit';

export default class MockLoginComponent extends Component {
  @service declare session: LoketSessionService;
  @tracked declare errorMessage: string;
  @tracked isRunning = false;

  @action
  async login(account: AccountModel) {
    console.log('mock-login call', { account });
    const user = await account.user;
    const groups = (await user.groups) as unknown;
    const group = (groups as AdministrativeUnitModel[])[0];
    if (!group) {
      throw new Error(
        `User requires at least one associated group (type AdminUnit).`
      );
    }

    const accountId = account.id;
    const groupId = group.id;
    this.errorMessage = '';
    this.isRunning = true;

    try {
      await this.session.authenticate(
        'authenticator:mock-login',
        accountId,
        groupId
      );
    } catch (response) {
      if (response instanceof Response)
        this.errorMessage = `Something went wrong, please try again later (status: ${response.status} ${response.statusText})`;
      else {
        if (
          typeof response === 'object' &&
          response !== null &&
          'message' in response &&
          typeof response.message === 'string'
        ) {
          this.errorMessage = response.message;
        } else {
          this.errorMessage = 'Response does not contain a message property.';
        }
      }
    } finally {
      this.isRunning = false;
    }
  }
}
