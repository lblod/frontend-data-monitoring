import Model, { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import UserModel from './user';

export default class AccountModel extends Model {
  @attr('string') declare voId: string;
  @attr('string') declare provider: string;
  @belongsTo('user', { inverse: null, async: true })
  declare user: AsyncBelongsTo<UserModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    account: AccountModel;
  }
}
