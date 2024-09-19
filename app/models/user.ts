/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods */
import Model, { AsyncHasMany, attr, hasMany } from '@ember-data/model';
import AdministrativeUnitModel from './administrative-unit';
import AccountModel from './account';

export default class UserModel extends Model {
  @attr('string') declare firstName: string;
  @attr('string') declare familyName: string;
  @hasMany('account', { inverse: null, async: true })
  declare account: AsyncHasMany<AccountModel>;
  @hasMany('administrative-unit', {
    inverse: null,
    async: true,
    polymorphic: true
  })
  declare groups: AsyncHasMany<AdministrativeUnitModel>;

  get group() {
    const groups = this.get('groups') as AdministrativeUnitModel[];
    return groups[0];
  }

  // used for mock login
  get fullName() {
    return `${this.firstName} ${this.familyName}`.trim();
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    user: UserModel;
  }
}
