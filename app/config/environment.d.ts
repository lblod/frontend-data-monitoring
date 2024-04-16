/**
 * Type declarations for
 *    import config from 'my-app/config/environment'
 */
type AcmidmParams = {
  clientId: string;
  scope: string;
  authUrl: string;
  logoutUrl: string;
  authRedirectUrl: string;
  switchRedirectUrl: string;
};

declare const config: {
  environment: string;
  modulePrefix: string;
  podModulePrefix: string;
  locationType: 'history' | 'none';
  rootURL: string;
  APP: Record<string, unknown>;
  plausible: {
    apiHost: string;
    domain: string;
  };
  features: Record<string, boolean | string>;
  acmidm: AcmidmParams;
};

export default config;
export { AcmidmParams };
