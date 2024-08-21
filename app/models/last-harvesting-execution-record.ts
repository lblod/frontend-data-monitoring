import Model, { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import AdministrativeUnitModel from './administrative-unit';

export default class LastHarvestingExecutionRecordModel extends Model {
  @attr('string') declare uuid: string;
  @attr('date') declare createdAt: Date;
  @attr('date') declare lastExecutionTime: Date;
  @attr('string') declare prefLabel: string;
  @belongsTo('administrative-unit', { inverse: null, async: true })
  declare adminUnit: AsyncBelongsTo<AdministrativeUnitModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'last-harvesting-execution-record': LastHarvestingExecutionRecordModel;
  }
}
