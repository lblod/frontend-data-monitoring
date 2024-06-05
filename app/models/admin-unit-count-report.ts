import Model, { AsyncBelongsTo, AsyncHasMany, attr, belongsTo, hasMany } from '@ember-data/model';
import AdministrativeUnitModel from './administrative-unit';
import GoverningBodyCountReportModel from './governing-body-count-report';

export default class AdminUnitCountReportModel extends Model {
  @attr('string') declare uuid: string;
  @attr('date') declare createdAt: Date;
  @attr('date') declare day: Date;
  @attr('string') declare prefLabel: string;
  @belongsTo('administrative-unit', { inverse: null, async: true })
  declare adminUnit: AsyncBelongsTo<AdministrativeUnitModel>;
  @hasMany('governing-body-count-report', { inverse: null, async: true,})
  declare governingBodyCountReports: AsyncHasMany<GoverningBodyCountReportModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'admin-unit-count-report': AdminUnitCountReportModel;
  }
}
