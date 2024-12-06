import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';
import LoketSessionService from 'frontend-data-monitoring/services/loket-session';

type AuthCallbackRouteParams = {
  code: string;
};

export default class AuthCallbackRoute extends Route<
  unknown,
  AuthCallbackRouteParams
> {
  @service declare session: LoketSessionService;
  @service declare router: RouterService;

  beforeModel() {
    this.session.prohibitAuthentication('index');
  }

  async model({ code }: AuthCallbackRouteParams) {
    if (code) {
      try {
        await this.session.authenticate('authenticator:acm-idm', code);
      } catch (error) {
        throw new Error(
          'Something went wrong while authenticating the user in the backend. The token might be expired.'
        );
      }
    } else {
      this.router.replaceWith('auth.login');
    }
  }
}
