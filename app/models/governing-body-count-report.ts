import Model, { AsyncBelongsTo, AsyncHasMany, attr, belongsTo, hasMany } from '@ember-data/model';
import AdministrativeUnitModel from './administrative-unit';
import GoverningBodyModel from './governing-body';
import CountModel from './count';

export default class GoverningBodyCountReportModel extends Model {
  @attr('string') declare uuid: string;
  @attr('date') declare createdAt: Date;
  @attr('date') declare day: Date;
  @attr('date') declare prefLabel: string;
  @belongsTo('admin-unit', { inverse: null, async: true })
  declare adminUnit: AsyncBelongsTo<AdministrativeUnitModel>;
  @belongsTo('govering-body', { inverse: null, async: true })
  declare goveringBody: AsyncBelongsTo<GoverningBodyModel>;
  @hasMany('count', { inverse: null, async: true,})
  declare counts: AsyncHasMany<CountModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'governing-body-count-report': GoverningBodyCountReportModel;
  }
}
