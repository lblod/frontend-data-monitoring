import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import LoketSessionService from './loket-session';
import type Store from '@ember-data/store';
import AccountModel from 'frontend-data-monitoring/models/account';
import UserModel from 'frontend-data-monitoring/models/user';
import AdministrativeUnitClasssificationCodeModel from 'frontend-data-monitoring/models/administrative-unit-classification-code';
import AdministrativeUnitModel from 'frontend-data-monitoring/models/administrative-unit';
import { Role } from 'frontend-data-monitoring/constants/roles';
import roleConfig from 'frontend-data-monitoring/config/roles-config';

function convertRole(roleString: string): Role {
  const roleDetails = roleConfig[roleString];
  return roleDetails ? Role[roleDetails.enum] : Role.Public;
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
      try {
        const accountId =
          this.session.data?.authenticated?.relationships?.account?.data?.id;
        if (accountId) {
          this.account = await this.store.findRecord('account', accountId, {
            include: 'user'
          });
        }
        this.user = await this.account.user;
        const roles = this.session.data.authenticated.data.attributes.roles as
          | string[]
          | undefined;
        this.roles = roles ? roles.map(convertRole) : [Role.Public];

        const groupId =
          this.session.data?.authenticated?.relationships?.group?.data?.id;
        if (groupId) {
          this.group = await this.store.findRecord(
            'administrative-unit',
            groupId,
            {
              include: 'classification'
            }
          );
        }
        this.groupClassification = await this.group.classification;
      } catch (error) {
        console.error('Error loading session data:', error);
      }
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

  checkAnyRole(roles: Role[]): boolean {
    return roles.some((role) => this.roles.includes(role));
  }
}

declare module '@ember/service' {
  interface Registry {
    'current-session': CurrentSessionService;
  }
}
