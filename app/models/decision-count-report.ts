import Model, { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import AdministrativeUnitModel from './administrative-unit';

export default class DecisionCountReportModel extends Model {
  @attr('string') declare uuid: string;
  @attr('date') declare createdAt: Date;
  @attr('date') declare day: Date;
  @attr('string') declare prefLabel: string;
  @belongsTo('administrative-unit', { inverse: null, async: true })
  declare adminUnit: AsyncBelongsTo<AdministrativeUnitModel>;
  @attr('string') declare classLabel: string;
  @attr('number') declare count: number;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'decision-count-report': DecisionCountReportModel;
  }
}
