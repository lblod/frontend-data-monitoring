import Route from '@ember/routing/route';
import Store from '@ember-data/store';

import { inject as service } from '@ember/service';
import Transition from '@ember/routing/transition';
import CurrentSessionService from 'frontend-data-monitoring/services/current-session';
import AdminUnitCountReportModel from 'frontend-data-monitoring/models/admin-unit-count-report';
import { URI_MAP } from 'frontend-data-monitoring/lib/type-utils';

export default class OrgReportRoute extends Route {
  @service declare store: Store;
  @service declare currentSession: CurrentSessionService;
  async model(params: object, transition: Transition<unknown>): Promise<object> {
    const logginInAdminUnitId = this.currentSession.group.id;
    const adminUnitCountReports = await this.store.query('admin-unit-count-report',{
      include: 'governing-body-count-report,governing-body-count-report.publication-count-report',
      filter: {
        'administrative-unit': {
          ':id:': logginInAdminUnitId,
        },
      }
    });

    let amountOfPublicSessions = 0;
    let amountOfPublicAgendaItems = 0;
    let amountOfPublicDecisions= 0;
    let amountOfPublicVotes = 0;
    for (const acm of adminUnitCountReports.toArray()) {
      const goveringBodyCountReports = await acm.governingBodyCountReport;
      for (const gcm of goveringBodyCountReports.toArray()) {
        const publicationCountReports = await gcm.publicationCountReport;
        amountOfPublicSessions += publicationCountReports.find((cm)=>cm.targetClass===URI_MAP.SESSION)?.count ?? 0;
        amountOfPublicAgendaItems += publicationCountReports.find((cm)=>cm.targetClass===URI_MAP.AGENDA_ITEM)?.count ?? 0;
        amountOfPublicDecisions += publicationCountReports.find((cm)=>cm.targetClass===URI_MAP.DECISION)?.count ?? 0;
        amountOfPublicVotes += publicationCountReports.find((cm)=>cm.targetClass===URI_MAP.VOTE)?.count ?? 0;
      }
    }

    return {
      lastHarvestingDate:null,
      firstPublishedSessionDate: NaN,
      lastPublishedSessionDate: NaN,
      amountOfPublicAgendaItemsWithTitle: NaN,
      amountOfPublicAgendaItemsWithDescription: NaN,
      amountOfPublicAgendaItems,
      amountOfPublicSessions,
      amountOfPublicDecisions,
      amountOfPublicVotes,
    }
  }
}
