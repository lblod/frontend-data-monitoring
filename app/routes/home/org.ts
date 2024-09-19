import Route from '@ember/routing/route';
import Store from '@ember-data/store';

import { inject as service } from '@ember/service';
import CurrentSessionService from 'frontend-data-monitoring/services/current-session';
import { task } from 'ember-concurrency';
import { URI_MAP } from 'frontend-data-monitoring/lib/type-utils';
import AdminUnitCountReportModel from 'frontend-data-monitoring/models/admin-unit-count-report';
import GoverningBodyCountReportModel from 'frontend-data-monitoring/models/governing-body-count-report';
import ArrayProxy from '@ember/array/proxy';
import PublicationCountReportModel from 'frontend-data-monitoring/models/publication-count-report';

export type CountResult = {
  firstPublishedSessionDate: number;
  lastPublishedSessionDate: number;
  amountOfPublicSessions: number;
  amountOfPublicAgendaItems: number;
  amountOfPublicDecisions: number;
  amountOfPublicVotes: number;
  amountOfPublicAgendaItemsWithTitle: number;
  amountOfPublicAgendaItemsWithDescription: number;
};

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
      data: this.getData.perform(params)
    };
  }

  getLastHarvestingDate = task({ drop: true }, async () => {
    const lastHarvestingExecutionRecord = await this.store.query(
      'last-harvesting-execution-record',
      {
        limit: 1,
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
      firstPublishedSessionDate: NaN,
      lastPublishedSessionDate: NaN,
      amountOfPublicSessions: 0,
      amountOfPublicAgendaItems: 0,
      amountOfPublicDecisions: 0,
      amountOfPublicVotes: 0,
      amountOfPublicAgendaItemsWithTitle: NaN,
      amountOfPublicAgendaItemsWithDescription: NaN
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
          const publicationCountReports: ArrayProxy<PublicationCountReportModel> =
            await governingBodyCountReport.publicationCountReport;

          const findCount = (targetClass: string): number =>
            publicationCountReports.find(
              (report) => report.targetClass === targetClass
            )?.count ?? 0;

          countResult.amountOfPublicSessions += findCount(URI_MAP.SESSION);
          countResult.amountOfPublicAgendaItems += findCount(
            URI_MAP.AGENDA_ITEM
          );
          countResult.amountOfPublicDecisions += findCount(URI_MAP.DECISION);
          countResult.amountOfPublicVotes += findCount(URI_MAP.VOTE);
        }
      }
      return countResult;
    } catch (error) {
      return countResult;
    }
  });
}
