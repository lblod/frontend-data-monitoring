import Route from '@ember/routing/route';
import Store from '@ember-data/store';

import { inject as service } from '@ember/service';
import CurrentSessionService from 'frontend-data-monitoring/services/current-session';
import { task } from 'ember-concurrency';
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
  CollegeVanBurgemeesterEnSchepenen = 'College van Burgemeester en Schepenen',
  ProvincieRaad = 'Provincieraad',
  Deputatie = 'Deputatie',
  Governeur = 'Gouverneur'
}
type ValueType = 'string' | 'number' | 'date';
interface ListItem {
  type: string;
  label: string;
  value: number;
  url?: string;
  valueType?: ValueType;
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
    datum: {
      refreshModel: true
    }
  };

  async model(params: { datum: string }): Promise<object> {
    const formatDate = (date: Date | string | undefined, fallback: Date) =>
      (date ? new Date(date) : fallback).toISOString().split('T')[0];

    const endDate = params.datum ? new Date(params.datum) : null;
    const lastHarvestingDate = await this.getLastHarvestingDate.perform();
    const lastHarvestFailedDate = await this.getLastHarvestFailedDate.perform();
    const toDate = formatDate(endDate ?? new Date(), new Date());
    const sessionTimestamps = await this.getSessionTimestamps.perform(toDate);
    return {
      lastHarvestFailedDate,
      lastHarvestingDate,
      sessionTimestamps,
      data: this.getData.perform(
        params,
        sessionTimestamps,
        toDate,
        lastHarvestingDate
      ),
      maturityLevel: this.getMaturityLevel.perform()
    };
  }

  getDecisions = task(
    { drop: true },
    async (params, toDate, lastHarvestingDate) => {
      const formatDay = (date: Date) => date.toLocaleDateString('en-CA');

      const resolveDate = () => {
        if (!params.datum) {
          const date = lastHarvestingDate?.lastExecutionTime
            ? new Date(lastHarvestingDate.lastExecutionTime)
            : new Date();
          return date;
        }

        const to = new Date(toDate);

        if (lastHarvestingDate.lastExecutionTime) {
          const last = new Date(lastHarvestingDate.lastExecutionTime);
          if (to > last) {
            return last;
          }
        }

        return to;
      };
      const day = formatDay(resolveDate());
      const decisions = await this.store.query('decision-count-report', {
        filter: { day },
        page: { size: 1000 },
        sort: '-day'
      });

      return { decisions };
    }
  );

  getLastHarvestFailedDate = task({ drop: true }, async () => {
    const lastHarvestingExecutionRecord = await this.store.query(
      'last-harvesting-execution-record',
      {
        filter: {
          status: 'http://redpencil.data.gift/id/concept/JobStatus/failed'
        },
        page: { size: 1 },
        sort: '-last-execution-time'
      }
    );
    return lastHarvestingExecutionRecord.slice()[0];
  });

  getLastHarvestingDate = task({ drop: true }, async () => {
    const lastHarvestingExecutionRecord = await this.store.query(
      'last-harvesting-execution-record',
      {
        filter: {
          status: 'http://redpencil.data.gift/id/concept/JobStatus/success'
        },
        page: { size: 1 },
        sort: '-last-execution-time'
      }
    );
    return lastHarvestingExecutionRecord.slice()[0];
  });

  getData = task(
    { drop: true },
    async (
      params,
      sessionTimestamps,
      toDate,
      lastHarvestingDate
    ): Promise<ListData> => {
      const initialCounts = {
        amountOfPublicSessions: 0,
        amountOfPublicAgendaItems: 0,
        amountOfPublicDecisions: 0,
        amountOfPublicVotes: 0,
        amountOfPublicAgendaItemsWithTitle: 0,
        amountOfPublicAgendaItemsWithDescription: 0,
        amountOfBurgemeesterDecisions: 0,
        amountOfGemeenteraadDecisions: 0,
        amountOfCollegeVanBurgemeesterEnSchepenenDecisions: 0,
        amountOfDuplicateAgendaItems: 0,
        amountOfProvincieraadDecisions: 0,
        amountOfDeputatieDecisions: 0,
        amountOfGouverneurDecisions: 0
      };

      try {
        const oldReports = await this.store.query('admin-unit-count-report', {
          include:
            'governing-body-count-report,governing-body-count-report.publication-count-report',
          sort: '-created-at',
          filter: {
            ':lt:day': toDate
          },
          page: { size: 1 }
        });
        const oldReport = oldReports.slice()[0];

        const countResult = { ...initialCounts };

        if (oldReport) {
          const governingBodyCountReports =
            await oldReport.governingBodyCountReport;
          for (const governingBodyCountReport of governingBodyCountReports.slice()) {
            const publicationCountReports =
              await governingBodyCountReport.publicationCountReport;

            publicationCountReports.forEach(
              (report: PublicationCountReportModel) => {
                const key = uriToResultKeyMap[report.targetClass];
                if (key) {
                  countResult[key] += report.get('count') ?? 0;
                }
              }
            );
          }
        }

        // --- Aggregate decisions ---
        const { decisions } = await this.getDecisions.perform(
          params,
          toDate,
          lastHarvestingDate
        );
        const sumByClass = (label: ClassificationLabel) => {
          if (decisions) {
            return (
              decisions.reduce(
                (sum, d) => (d.classLabel === label ? d.count : sum),
                0
              ) || 0
            );
          }
          return 0;
        };

        if (this.currentSession.groupClassification.label === 'Provincie') {
          countResult.amountOfProvincieraadDecisions = sumByClass(
            ClassificationLabel.ProvincieRaad
          );
          countResult.amountOfDeputatieDecisions = sumByClass(
            ClassificationLabel.Deputatie
          );
          countResult.amountOfGouverneurDecisions = sumByClass(
            ClassificationLabel.Governeur
          );
        } else {
          countResult.amountOfBurgemeesterDecisions = sumByClass(
            ClassificationLabel.Burgemeester
          );
          countResult.amountOfGemeenteraadDecisions = sumByClass(
            ClassificationLabel.Gemeenteraad
          );
          countResult.amountOfCollegeVanBurgemeesterEnSchepenenDecisions =
            sumByClass(ClassificationLabel.CollegeVanBurgemeesterEnSchepenen);
        }
        // --- Build result list ---
        const conditionalItems: ListData =
          this.currentSession.groupClassification.label === 'Provincie'
            ? [
                {
                  type: 'Besluiten per orgaan',
                  label: 'Provincieraad',
                  value: countResult.amountOfProvincieraadDecisions,
                  valueType: 'number'
                },
                {
                  type: 'Besluiten per orgaan',
                  label: 'Deputatie',
                  value: countResult.amountOfDeputatieDecisions,
                  valueType: 'number'
                },
                {
                  type: 'Besluiten per orgaan',
                  label: 'Gouverneur',
                  value: countResult.amountOfGouverneurDecisions,
                  valueType: 'number'
                }
              ]
            : [
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
                }
              ];
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
          ...conditionalItems,
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

        // attach metadata
        result.meta = {
          count: result.length,
          pagination: { first: { number: 0 }, last: { number: 0 } }
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

  getSessionTimestamps = task({ drop: true }, async (toDate) => {
    const sessionTimestamps = await this.store.query(
      'session-timestamp-report',
      {
        filter: {
          ':lt:created-at': toDate
        },
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
