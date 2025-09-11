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
import { tracked } from '@glimmer/tracking';

export type CountResult = {
  amountOfPublicSessions: number;
  amountOfPublicAgendaItems: number;
  amountOfPublicDecisions: number;
  amountOfPublicVotes: number;
  amountOfPublicAgendaItemsWithTitle: number;
  amountOfPublicAgendaItemsWithDescription: number;
  amountOfDuplicateAgendaItems: number;
};
export type dataResult = {
  gridData: CountResult;
  listData: ListData;
};
enum ClassificationLabel {
  Burgemeester = 'Burgemeester',
  Gemeenteraad = 'Gemeenteraad',
  CollegeVanBurgemeesterEnSchepenen = 'College van Burgemeester en Schepenen'
}
interface ListItem {
  type: string;
  label: string;
  value: number;
  url?: string;
  valueType?: 'number' | 'string' | 'date';
  tooltip?: string;
}

interface MetaData {
  count: number;
  pagination: {
    first: { number: number };
    last: { number: number };
  };
}

interface ListData extends Array<ListItem> {
  meta?: MetaData;
}
export default class OrgReportRoute extends Route {
  @service declare store: Store;
  @service declare currentSession: CurrentSessionService;
  @tracked listData: ListData = [];
  queryParams = {
    begin: {
      refreshModel: true
    },
    eind: {
      refreshModel: true
    }
  };

  async model(params: { begin: string; eind: string }): Promise<object> {
    const sessionTimestamps = await this.getSessionTimestamps.perform();
    return {
      lastHarvestingDate: this.getLastHarvestingDate.perform(),
      sessionTimestamps,
      data: this.getData.perform(params, sessionTimestamps),
      maturityLevel: this.getMaturityLevel.perform()
    };
  }

  getDecisions = task({ drop: true }, async () => {
    const decisions = await this.store.query('decision-count-report', {
      page: { size: 1000 },
      sort: '-day'
    });
    return decisions;
  });

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

  getData = task(
    { drop: true },
    async (params, sessionTimestamps): Promise<ListData> => {
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
        amountOfCollegeVanBurgemeesterEnSchepenenDecisions: 0,
        amountOfDuplicateAgendaItems: 0
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

        // Aggregate counts
        for (const adminUnitCountReport of adminUnitCountReports.slice()) {
          const governingBodyCountReports: ArrayProxy<GoverningBodyCountReportModel> =
            await adminUnitCountReport.governingBodyCountReport;

          for (const governingBodyCountReport of governingBodyCountReports.slice()) {
            const publicationCountReports: ArrayProxy<PublicationCountReportModel> =
              await governingBodyCountReport.publicationCountReport;

            publicationCountReports.forEach((report) => {
              const targetClass = report.targetClass;
              const resultKey = uriToResultKeyMap[targetClass];

              if (resultKey) {
                const count = report.get('count') ?? 0;
                countResult[resultKey] += count;
              }
            });
          }
        }
        const decisions = await this.getDecisions.perform();
        countResult.amountOfBurgemeesterDecisions = decisions.reduce(
          (sum, d) => (d.classLabel === 'Burgemeester' ? sum + d.count : sum),
          0
        );
        countResult.amountOfGemeenteraadDecisions = decisions.reduce(
          (sum, d) => (d.classLabel === 'Gemeenteraad' ? sum + d.count : sum),
          0
        );
        countResult.amountOfCollegeVanBurgemeesterEnSchepenenDecisions =
          decisions.reduce(
            (sum, d) =>
              d.classLabel === 'College van Burgemeester en Schepenen'
                ? sum + d.count
                : sum,
            0
          );
        const result: ListData = [
          {
            type: 'Zittingen',
            label: 'Aantal gepubliceerde zittingen',
            value: countResult.amountOfPublicSessions,
            url: `${this.lokaalBeslistUrl}zittingen?gemeentes=${this.currentSession.group.name}`,
            valueType: 'number'
          },
          {
            type: 'Zittingen',
            label: 'Eerste gepubliceerde zitting',
            value: sessionTimestamps?.firstSession ?? 'Niet opgegeven',
            valueType: 'date'
          },
          {
            type: 'Zittingen',
            label: 'Laatste gepubliceerde zitting',
            value: sessionTimestamps?.lastSession ?? 'Niet opgegeven',
            valueType: 'date'
          },
          {
            type: 'Stemmingen',
            label: 'Aantal gepubliceerde stemmingen',
            value: countResult.amountOfPublicVotes,
            valueType: 'number'
          },
          {
            type: 'Besluiten',
            label: 'Aantal gepubliceerde besluiten',
            value: countResult.amountOfPublicDecisions,
            valueType: 'number'
          },
          {
            type: 'Besluiten per orgaan',
            label: 'Burgemeester',
            value: countResult.amountOfBurgemeesterDecisions,
            valueType: 'number'
          },
          {
            type: 'Besluiten per orgaan',
            label: 'Gemeenteraad',
            value: countResult.amountOfGemeenteraadDecisions,
            valueType: 'number'
          },
          {
            type: 'Besluiten per orgaan',
            label: 'College van burgemeester en schepenen',
            value:
              countResult.amountOfCollegeVanBurgemeesterEnSchepenenDecisions,
            valueType: 'number'
          },
          {
            type: 'Agendapunten',
            label: 'Aantal gepubliceerde agendapunten',
            value: countResult.amountOfPublicAgendaItems,
            url: `${this.lokaalBeslistUrl}agendapunten?gemeentes=${this.currentSession.group.name}`,
            valueType: 'number'
          },
          {
            type: 'Agendapunten',
            label: 'Agendapunten zonder titel',
            value: countResult.amountOfPublicAgendaItemsWithTitle,
            url: `${this.lokaalBeslistUrl}agendapunten?gemeentes=${this.currentSession.group.name}&trefwoord=-title*`,
            valueType: 'number',
            tooltip:
              'Agendapunten zonder titel zijn agendapunten die geen titel bevatten. Dit kan het gevolg zijn van onvolledige of incorrecte gegevensinvoer.'
          },
          {
            type: 'Agendapunten',
            label: 'Agendapunten zonder beschrijving',
            value: countResult.amountOfPublicAgendaItemsWithDescription,
            url: `${this.lokaalBeslistUrl}agendapunten?gemeentes=${this.currentSession.group.name}&trefwoord=-description*`,
            valueType: 'number'
          },
          {
            type: 'Agendapunten',
            label: 'Aantal dubbele agendapunten',
            value: countResult.amountOfDuplicateAgendaItems,
            valueType: 'number'
          }
        ];

        (result as ListData).meta = {
          count: result.length,
          pagination: {
            first: { number: 0 },
            last: { number: 0 }
          }
        };

        return result;
      } catch (error) {
        console.error('Error fetching data:', error);
        return [];
      }
    }
  );

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

  get lokaalBeslistUrl() {
    if (ENV.lokaalBeslistUrl !== '{{LOKAALBESLIST_URL}}') {
      return ENV.lokaalBeslistUrl;
    }
    if (ENV.environment === 'test') {
      return 'http://localhost:4200/';
    } else if (ENV.environment === 'development') {
      return 'https://dev.lokaalbeslist.lblod.info/';
    }
    return 'https://lokaalbeslist.vlaanderen.be/';
  }
}
