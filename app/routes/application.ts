import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type PlausibleService from 'ember-plausible/services/plausible';
import config from 'frontend-data-monitoring/config/environment';
import LoketSessionService from 'frontend-data-monitoring/services/session';

export default class ApplicationRoute extends Route {
  @service declare plausible: PlausibleService;
  @service declare session: LoketSessionService;

  async beforeModel(): Promise<void> {
    this.startAnalytics();
    await this.session.setup();
  }

  startAnalytics(): void {
    const { domain, apiHost } = config.plausible;

    if (!domain.startsWith('{{') && !apiHost.startsWith('{{')) {
      this.plausible.enable({
        domain,
        apiHost,
      });
    }
  }
}
