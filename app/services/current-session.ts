import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import LoketSessionService from './session';
import type Store from '@ember-data/store';
import AccountModel from 'frontend-data-monitoring/models/account';
import UserModel from 'frontend-data-monitoring/models/user';
import AdministrativeUnitClasssificationCodeModel from 'frontend-data-monitoring/models/administrative-unit-classification-code';
import AdministrativeUnitModel from 'frontend-data-monitoring/models/administrative-unit';

export default class CurrentSessionService extends Service {
  @service declare session: LoketSessionService;
  @service declare store: Store;

  @tracked declare account: AccountModel;
  @tracked declare user: UserModel;
  @tracked declare group: AdministrativeUnitModel;
  @tracked
  declare groupClassification: AdministrativeUnitClasssificationCodeModel;
  @tracked roles = [];

  async load() {
    if (this.session.isAuthenticated) {
      const accountId =
        this.session.data.authenticated.relationships.account.data.id;
      this.account = await this.store.findRecord('account', accountId, {
        include: 'user',
      });

      this.user = await this.account.user;
      this.roles = this.session.data.authenticated.data.attributes.roles;

      const groupId =
        this.session.data.authenticated.relationships.group.data.id;
      this.group = await this.store.findRecord('administrative-unit', groupId, {
        include: 'classification',
      });
      this.groupClassification = await this.group.classification;
    }
  }

  get canEdit() {
    return true; // TODO: for demo purposes only -> change asap
  }

  get fullName() {
    return this.user ? this.user.fullName : 'Gebruiker aan het laden';
  }

  get groupClassificationLabel() {
    return this.groupClassification
      ? this.groupClassification.label
      : 'Classificatie aan het laden';
  }
}

declare module '@ember/service' {
  interface Registry {
    'current-session': CurrentSessionService;
  }
}
