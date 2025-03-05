import Route from '@ember/routing/route';
import Store from '@ember-data/store';

import { inject as service } from '@ember/service';
import CurrentSessionService from 'frontend-data-monitoring/services/current-session';
import { task } from 'ember-concurrency';
import AdminUnitCountReportModel from 'frontend-data-monitoring/models/admin-unit-count-report';
import GoverningBodyCountReportModel from 'frontend-data-monitoring/models/governing-body-count-report';
import ArrayProxy from '@ember/array/proxy';
import PublicationCountReportModel from 'frontend-data-monitoring/models/publication-count-report';
import ENV from 'frontend-data-monitoring/config/environment';
import {
  validatePublication,
  fetchDocument,
  getExampleOfDocumentType
} from '@lblod/lib-decision-validation';
import { getBlueprintOfDocumentType } from '@lblod/lib-decision-validation/dist/queries.js';
import { uriToResultKeyMap } from 'frontend-data-monitoring/lib/type-utils';

export type CountResult = {
  amountOfPublicSessions: number;
  amountOfPublicAgendaItems: number;
  amountOfPublicDecisions: number;
  amountOfPublicVotes: number;
  amountOfPublicAgendaItemsWithTitle: number;
  amountOfPublicAgendaItemsWithDescription: number;
};
enum ClassificationLabel {
  Burgemeester = 'Burgemeester',
  Gemeenteraad = 'Gemeenteraad',
  CollegeVanBurgemeesterEnSchepenen = 'College van Burgemeester en Schepenen'
}
export default class OrgReportRoute extends Route {
  @service declare store: Store;
  @service declare currentSession: CurrentSessionService;
  queryParams = {
    begin: {
      refreshModel: true
    },
    eind: {
      refreshModel: true
    }
  };
  async model(params: { begin: string; eind: string }): Promise<object> {
    return {
      lastHarvestingDate: this.getLastHarvestingDate.perform(),
      data: this.getData.perform(params),
      maturityLevel: this.getMaturityLevel.perform(),
      sessionTimestamps: this.getSessionTimestamps.perform()
    };
  }

  getLastHarvestingDate = task({ drop: true }, async () => {
    const lastHarvestingExecutionRecord = await this.store.query(
      'last-harvesting-execution-record',
      {
        page: { size: 1 },
        sort: '-last-execution-time'
      }
    );
    const lastHarvestingDate = lastHarvestingExecutionRecord.slice()[0];
    return lastHarvestingDate?.lastExecutionTime;
  });

  getData = task({ drop: true }, async (params): Promise<CountResult> => {
    const fromDate = params.begin
      ? new Date(params.begin).toISOString().split('T')[0]
      : new Date(0).toISOString().split('T')[0];

    const toDate = params.eind
      ? new Date(params.eind).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    const countResult = {
      amountOfPublicSessions: 0,
      amountOfPublicAgendaItems: 0,
      amountOfPublicDecisions: 0,
      amountOfPublicVotes: 0,
      amountOfPublicAgendaItemsWithTitle: 0,
      amountOfPublicAgendaItemsWithDescription: 0,
      amountOfBurgemeesterDecisions: 0,
      amountOfGemeenteraadDecisions: 0,
      amountOfCollegeVanBurgemeesterEnSchepenenDecisions: 0
    };
    try {
      const adminUnitCountReports: ArrayProxy<AdminUnitCountReportModel> =
        await this.store.query('admin-unit-count-report', {
          include:
            'governing-body-count-report,governing-body-count-report.publication-count-report',
          sort: '-created-at',
          filter: {
            'governing-body-count-report': {
              ':gte:day': fromDate,
              ':lte:day': toDate
            }
          }
        });

      if (adminUnitCountReports.length === 0) return countResult;

      for (const adminUnitCountReport of adminUnitCountReports.slice()) {
        const governingBodyCountReports: ArrayProxy<GoverningBodyCountReportModel> =
          await adminUnitCountReport.governingBodyCountReport;

        for (const governingBodyCountReport of governingBodyCountReports.slice()) {
          const classificationLabel = governingBodyCountReport.classLabel;
          const publicationCountReports: ArrayProxy<PublicationCountReportModel> =
            await governingBodyCountReport.publicationCountReport;

          publicationCountReports.forEach((report) => {
            const targetClass = report.targetClass;
            const resultKey = uriToResultKeyMap[targetClass];

            if (resultKey) {
              const count = report.get('count') ?? 0;
              countResult[resultKey] += count;
              if (
                uriToResultKeyMap[targetClass] === 'amountOfPublicDecisions'
              ) {
                switch (classificationLabel) {
                  case ClassificationLabel.Burgemeester:
                    countResult.amountOfBurgemeesterDecisions += count;
                    break;
                  case ClassificationLabel.Gemeenteraad:
                    countResult.amountOfGemeenteraadDecisions += count;
                    break;
                  case ClassificationLabel.CollegeVanBurgemeesterEnSchepenen:
                    countResult.amountOfCollegeVanBurgemeesterEnSchepenenDecisions +=
                      count;
                    break;
                  default:
                    break;
                }
              }
            }
          });
        }
      }
      return countResult;
    } catch (error) {
      console.error('Error fetching data:', error);
      return countResult;
    }
  });

  getMaturityLevel = task({ drop: true }, async () => {
    const maturityLevels = await this.store.query('maturity-level-report', {
      page: { size: 1 },
      sort: '-created-at'
    });
    const maturityLevel = maturityLevels.slice()[0];
    if (!maturityLevel) return null;
    const blueprint = await getBlueprintOfDocumentType('Notulen');
    const example = await getExampleOfDocumentType('Notulen');
    const publication = await fetchDocument(
      maturityLevel.notuleUri,
      ENV.CORS_PROXY_URL
    );

    const validationResult = await validatePublication(
      publication,
      blueprint,
      example
    );
    const regex = /\d+/;
    const match = regex.exec(validationResult.maturity);
    if (match) {
      const level = parseInt(match[0], 10).toString();
      return level;
    } else {
      return null;
    }
  });

  getSessionTimestamps = task({ drop: true }, async () => {
    const sessionTimestamps = await this.store.query(
      'session-timestamp-report',
      {
        page: { size: 1 },
        sort: '-created-at'
      }
    );
    return sessionTimestamps.slice()[0];
  });
}
