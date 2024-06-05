import { inject as service } from '@ember/service';
import CurrentSessionService from './current-session';
import SessionService from 'ember-simple-auth/services/session';

// TODO: eslint disable. This code was adapted from JS. Session data type not known yet. Type needs to be defined
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class LoketSessionService extends SessionService<any> {
  @service declare currentSession: CurrentSessionService;

  get isMockLoginSession(): boolean {
    console.log(
      'isMockLoginSession getter from session',
      this.data.authenticated.authenticator
    );
    return this.isAuthenticated
      ? this.data.authenticated.authenticator === 'authenticator:mock-login'
      : false;
  }

  async handleAuthentication(routeAfterAuthentication: string) {
    // We wait for the currentSession to load before navigating. This fixes the empty index page since the data might not be loaded yet.
    await this.currentSession.load();
    super.handleAuthentication(routeAfterAuthentication);
  }

  handleInvalidation() {
    // No operation
    // We don't want the default redirecting logic of the base class since we handle this ourselves in other places already.
    // We can't do the logic here since we don't know which authenticator did the invalidation and we don't receive the arguments that are passed to `.invalidate` either.
    // This is needed to be able to support both normal logouts, switch logouts (and as a bonus,also mock logouts).
  }
}

declare module '@ember/service' {
  interface Registry {
    session: LoketSessionService;
  }
}
