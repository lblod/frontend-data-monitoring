import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import Transition from '@ember/routing/transition';
import { inject as service } from '@ember/service';
import ENV, { AcmidmParams } from 'frontend-data-monitoring/config/environment';
import LoketSessionService from 'frontend-data-monitoring/services/session';

export default class AuthSwitchRoute extends Route {
  @service declare router: RouterService;
  @service declare session: LoketSessionService;

  async beforeModel(transition: Transition<unknown>) {
    this.session.requireAuthentication(transition, 'login');
    try {
      const wasMockLoginSession = this.session.isMockLoginSession;
      await this.session.invalidate();
      const logoutUrl = wasMockLoginSession
        ? this.router.urlFor('mock-login')
        : buildSwitchUrl(ENV.acmidm);

      window.location.replace(logoutUrl);
    } catch (error) {
      throw new Error(
        `Something went wrong while trying to remove the session on the server\n${error}`
      );
    }
  }
}

function buildSwitchUrl({
  logoutUrl,
  clientId,
  switchRedirectUrl,
}: AcmidmParams) {
  const switchUrl = new URL(logoutUrl);
  const searchParams = switchUrl.searchParams;

  searchParams.append('switch', 'true');
  searchParams.append('client_id', clientId);
  searchParams.append('post_logout_redirect_uri', switchRedirectUrl);

  return switchUrl.href;
}
