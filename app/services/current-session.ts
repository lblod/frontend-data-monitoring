import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import LoketSessionService from './loket-session';
import type Store from '@ember-data/store';
import AccountModel from 'frontend-data-monitoring/models/account';
import UserModel from 'frontend-data-monitoring/models/user';
import AdministrativeUnitClasssificationCodeModel from 'frontend-data-monitoring/models/administrative-unit-classification-code';
import AdministrativeUnitModel from 'frontend-data-monitoring/models/administrative-unit';

export enum Role {
  Public,
  OrgUser,
  SupplierUser,
  AbbUser,
}

const ROLE_MAPPING: Record<string, Role> = {
  'DM-AdminUnitAdministratorRole': Role.OrgUser, // Needs to be changed. Mistake in mock login generation in dispatch
  'DM-LeveranciersGebruiker': Role.SupplierUser,
  'DM-AbbGebruiker': Role.AbbUser,
} as const;

function convertRole(input: string): Role {
  return ROLE_MAPPING[input] ?? Role.Public;
}

export default class CurrentSessionService extends Service {
  @service declare session: LoketSessionService;
  @service declare store: Store;

  @tracked declare account: AccountModel;
  @tracked declare user: UserModel;
  @tracked declare group: AdministrativeUnitModel;
  @tracked
  declare groupClassification: AdministrativeUnitClasssificationCodeModel;
  @tracked roles: Role[] = [];

  async load() {
    if (this.session.isAuthenticated) {
      const accountId =
        this.session.data.authenticated.relationships.account.data.id;
      this.account = await this.store.findRecord('account', accountId, {
        include: 'user',
      });

      this.user = await this.account.user;
      const roles = this.session.data.authenticated.data.attributes.roles as
        | string[]
        | undefined;
      this.roles = roles ? roles.map(convertRole) : [Role.Public];

      const groupId =
        this.session.data.authenticated.relationships.group.data.id;
      this.group = await this.store.findRecord('administrative-unit', groupId, {
        include: 'classification',
      });
      this.groupClassification = await this.group.classification;
    }
  }

  get isMockLoginSession() {
    return this.session.isMockLoginSession;
  }

  get fullName() {
    return this.user ? this.user.fullName : 'Gebruiker aan het laden';
  }

  get groupClassificationLabel() {
    return this.groupClassification
      ? this.groupClassification.label
      : 'Classificatie aan het laden';
  }

  checkRole(role: Role): boolean {
    return this.roles.includes(role);
  }
}

declare module '@ember/service' {
  interface Registry {
    'current-session': CurrentSessionService;
  }
}
