import Model, { AsyncBelongsTo, AsyncHasMany, attr, belongsTo, hasMany } from '@ember-data/model';

export default class PublicationCountReportModel extends Model {
  @attr('string') declare prefLabel: string;
  @attr('string') declare targetClass: string;
  @attr('number') declare count: number;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'publication-count-report': PublicationCountReportModel;
  }
}
