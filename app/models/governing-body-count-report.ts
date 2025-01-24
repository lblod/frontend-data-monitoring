import Model, {
  AsyncBelongsTo,
  AsyncHasMany,
  attr,
  belongsTo,
  hasMany
} from '@ember-data/model';
import AdministrativeUnitModel from './administrative-unit';
import GoverningBodyModel from './governing-body';
import PublicationCountReportModel from './publication-count-report';

export default class GoverningBodyCountReportModel extends Model {
  @attr('string') declare uuid: string;
  @attr('string') declare prefLabel: string;
  @attr('string') declare classLabel: string;
  @attr('date') declare createdAt: Date;
  @attr('string') declare day: string;

  @belongsTo('administrative-unit', { inverse: null, async: true })
  declare adminUnit: AsyncBelongsTo<AdministrativeUnitModel>;
  @belongsTo('governing-body', { inverse: null, async: true })
  declare governingBody: AsyncBelongsTo<GoverningBodyModel>;
  @hasMany('publication-count-report', { inverse: null, async: true })
  declare publicationCountReport: AsyncHasMany<PublicationCountReportModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'governing-body-count-report': GoverningBodyCountReportModel;
  }
}
