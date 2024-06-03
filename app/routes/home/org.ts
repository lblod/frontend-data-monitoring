import Route from '@ember/routing/route';
import { service } from '@ember/service';
import Store from '@ember-data/store';

export default class OrgReportRoute extends Route {
  @service declare store: Store;

  async model() {
    // added mock dates
    return {
      lastHarvestingDate: `${String(new Date().getDate()).padStart(
        2,
        '0'
      )}/${String(new Date().getMonth() + 1).padStart(
        2,
        '0'
      )}/${new Date().getFullYear()}`,
      amountOfPublicSessions: 0,
      firstPublishedSessionDate: `${String(new Date().getDate()).padStart(
        2,
        '0'
      )}/${String(new Date().getMonth() + 1).padStart(
        2,
        '0'
      )}/${new Date().getFullYear()}`,
      lastPublishedSessionDate: `${String(new Date().getDate()).padStart(
        2,
        '0'
      )}/${String(new Date().getMonth() + 1).padStart(
        2,
        '0'
      )}/${new Date().getFullYear()}`,
      amountOfPublicAgendaItems: 0,
      amountOfPublicAgendaItemsWithTitle: 0,
      amountOfPublicAgendaItemsWithDescription: 0,
      amountOfPublicDecisions: 0,
      amountOfPublicVotes: 0,
    };
  }
}
