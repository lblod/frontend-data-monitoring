import Model, { AsyncHasMany, attr, belongsTo } from '@ember-data/model';
import LastHarvestingExecutionRecordModel from './last-harvesting-execution-record';

export default class LastHarvestingExecutionReportModel extends Model {
  @attr('string') declare uuid: string;
  @attr('date') declare createdAt: Date;
  @attr('date') declare day: Date;
  @attr('string') declare prefLabel: string;
  @belongsTo('last-harvesting-execution-record', { inverse: null, async: true })
  declare lastHarvestingExecutionRecord: AsyncHasMany<LastHarvestingExecutionRecordModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'last-harvesting-execution-report': LastHarvestingExecutionReportModel;
  }
}
