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
      include: 'governing-body-count-report,governing-body-count-report.count',
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
    console.log('acms',adminUnitCountReports.toArray());
    for (const acm of adminUnitCountReports.toArray()) {
      const countReports = await acm.governingBodyCountReports;
      console.log('AdminUnitCountReport',acm, countReports.toArray());
      for (const gcm of countReports.toArray()) {
        const counts = await gcm.counts;
        console.log('Govbodycountreport',gcm,counts.toArray());
        amountOfPublicSessions += counts.find((cm)=>cm.targetClass===URI_MAP.SESSION)?.count ?? 0;
        amountOfPublicAgendaItems += counts.find((cm)=>cm.targetClass===URI_MAP.AGENDA_ITEM)?.count ?? 0;
        amountOfPublicDecisions += counts.find((cm)=>cm.targetClass===URI_MAP.DECISION)?.count ?? 0;
        amountOfPublicVotes += counts.find((cm)=>cm.targetClass===URI_MAP.VOTE)?.count ?? 0;
      }
    }

    return {
      lastHarvestingDate:new Date('2024-06-03T12:00+02:00'),
      amountOfPublicSessions,
      firstPublishedSessionDate: 0,
      lastPublishedSessionDate: 0,
      amountOfPublicAgendaItems,
      amountOfPublicAgendaItemsWithTitle: 0,
      amountOfPublicAgendaItemsWithDescription: 0,
      amountOfPublicDecisions,
      amountOfPublicVotes,
    }
  }
}
