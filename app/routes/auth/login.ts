import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';
import ENV, { AcmidmParams } from 'frontend-data-monitoring/config/environment';
import LoketSessionService from 'frontend-data-monitoring/services/loket-session';

export default class AuthLoginRoute extends Route {
  @service declare router: RouterService;
  @service declare session: LoketSessionService;
  beforeModel() {
    if (this.session.prohibitAuthentication('index')) {
      if (isValidAcmidmConfig(ENV.acmidm)) {
        window.location.replace(buildLoginUrl(ENV.acmidm));
      } else {
        this.router.replaceWith('mock-login');
      }
    }
  }
}

function buildLoginUrl({
  authUrl,
  clientId,
  authRedirectUrl,
  scope
}: AcmidmParams) {
  const loginUrl = new URL(authUrl);
  const searchParams = loginUrl.searchParams;
  searchParams.append('response_type', 'code');
  searchParams.append('client_id', clientId);
  searchParams.append('redirect_uri', authRedirectUrl);
  searchParams.append('scope', scope);

  return loginUrl.href;
}

function isValidAcmidmConfig(acmidmConfig: AcmidmParams) {
  return Object.values(acmidmConfig).every(
    (value) =>
      typeof value === 'string' &&
      value.trim() !== '' &&
      !value.startsWith('{{')
  );
}
