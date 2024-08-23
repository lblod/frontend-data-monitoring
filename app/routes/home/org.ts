import Route from '@ember/routing/route';
import Store from '@ember-data/store';

import { inject as service } from '@ember/service';
import CurrentSessionService from 'frontend-data-monitoring/services/current-session';
import { task } from 'ember-concurrency';
import { URI_MAP } from 'frontend-data-monitoring/lib/type-utils';

export default class OrgReportRoute extends Route {
  @service declare store: Store;
  @service declare currentSession: CurrentSessionService;
  async model(): Promise<object> {
    return {
      lastHarvestingDate: this.getLastHarvestingDate.perform(),
      data: this.getData.perform(),
    };
  }

  getLastHarvestingDate = task({ drop: true }, async () => {
    const logginInAdminUnitId = this.currentSession.group.id;
    const lastHarvestingExecutionRecord = await this.store.query(
      'last-harvesting-execution-record',
      {
        filter: {
          'administrative-unit': {
            ':id:': logginInAdminUnitId,
          },
        },
        limit: 1,
        sort: '-last-execution-time',
      }
    );
    const lastHarvestingDate = lastHarvestingExecutionRecord.slice()[0];
    return lastHarvestingDate?.lastExecutionTime;
  });

  getData = task({ drop: true }, async () => {
    const logginInAdminUnitId = this.currentSession.group.id;
    const adminUnitCountReports = await this.store.query(
      'admin-unit-count-report',
      {
        include:
          'governing-body-count-report,governing-body-count-report.publication-count-report',
        filter: {
          'administrative-unit': {
            ':id:': logginInAdminUnitId,
          },
        },
      }
    );

    let amountOfPublicSessions = 0;
    let amountOfPublicAgendaItems = 0;
    let amountOfPublicDecisions = 0;
    let amountOfPublicVotes = 0;

    for (const acm of adminUnitCountReports.slice()) {
      const governingBodyCountReports = await acm.governingBodyCountReport;
      for (const gcm of governingBodyCountReports.slice()) {
        const publicationCountReports = await gcm.publicationCountReport;
        amountOfPublicSessions +=
          publicationCountReports.find(
            (cm) => cm.targetClass === URI_MAP.SESSION
          )?.count ?? 0;
        amountOfPublicAgendaItems +=
          publicationCountReports.find(
            (cm) => cm.targetClass === URI_MAP.AGENDA_ITEM
          )?.count ?? 0;
        amountOfPublicDecisions +=
          publicationCountReports.find(
            (cm) => cm.targetClass === URI_MAP.DECISION
          )?.count ?? 0;
        console.log(
          publicationCountReports.find((cm) => cm.targetClass === URI_MAP.VOTE)
            ?.count
        );
        amountOfPublicVotes +=
          publicationCountReports.find((cm) => cm.targetClass === URI_MAP.VOTE)
            ?.count ?? 0;
      }
    }
    return {
      firstPublishedSessionDate: NaN,
      lastPublishedSessionDate: NaN,
      amountOfPublicAgendaItemsWithTitle: NaN,
      amountOfPublicAgendaItemsWithDescription: NaN,
      amountOfPublicAgendaItems,
      amountOfPublicSessions,
      amountOfPublicDecisions,
      amountOfPublicVotes,
    };
  });
}
