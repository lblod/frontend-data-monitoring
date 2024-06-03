import Model, { AsyncBelongsTo, AsyncHasMany, attr, belongsTo, hasMany } from '@ember-data/model';

export default class CountModel extends Model {
  @attr('string') declare prefLabel: string;
  @attr('string') declare targetClass: string;
  @attr('string') declare count: number;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'count': CountModel;
  }
}
