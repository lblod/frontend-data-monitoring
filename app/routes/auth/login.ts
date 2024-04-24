import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import ENV, { AcmidmParams } from 'frontend-data-monitoring/config/environment';
import LoketSessionService from 'frontend-data-monitoring/services/loket-session';

export default class AuthLoginRoute extends Route {
  @service declare session: LoketSessionService;

  beforeModel() {
    if (this.session.prohibitAuthentication('index')) {
      window.location.replace(buildLoginUrl(ENV.acmidm));
    }
  }
}

function buildLoginUrl({
  authUrl,
  clientId,
  authRedirectUrl,
  scope,
}: AcmidmParams) {
  const loginUrl = new URL(authUrl);
  const searchParams = loginUrl.searchParams;
  searchParams.append('response_type', 'code');
  searchParams.append('client_id', clientId);
  searchParams.append('redirect_uri', authRedirectUrl);
  searchParams.append('scope', scope);

  return loginUrl.href;
}
