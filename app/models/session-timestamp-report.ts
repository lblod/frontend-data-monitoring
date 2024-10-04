import Model, { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import AdministrativeUnitModel from './administrative-unit';

export default class SessionTimestampReportModel extends Model {
  @attr('string') declare uuid: string;
  @attr('string') declare prefLabel: string;
  @attr('date') declare createdAt: Date;
  @attr('string') declare firstSession: Date;
  @attr('string') declare lastSession: Date;
  @belongsTo('administrative-unit', { inverse: null, async: true })
  declare adminUnit: AsyncBelongsTo<AdministrativeUnitModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'session-timestamp-report': SessionTimestampReportModel;
  }
}
