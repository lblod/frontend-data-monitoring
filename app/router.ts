import EmbroiderRouter from '@embroider/router';
import config from 'frontend-data-monitoring/config/environment';

export default class Router extends EmbroiderRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('index', { path: '/' }); // Public facing page suggesting login

  this.route('home', { path: '/data-monitoring' }, function () {
    this.route('org', { path: '/organisatie' });
    this.route('overview', { path: '/overzicht' });
  }); // Home page after having logged in
  this.route('auth', { path: '/authorization' }, function () {
    this.route('callback');
    this.route('callback-error');
    this.route('login');
    this.route('logout');
    this.route('switch');
  });

  if (config.acmidm.clientId === '{{OAUTH_API_KEY}}') {
    this.route('mock-login');
  }

  this.route('help');
  this.route('legal', { path: '/legaal' }, function () {
    this.route('accessibilitystatement', {
      path: '/toegangkelijkheidsverklaring'
    });
    this.route('cookiestatement', {
      path: '/cookieverklaring'
    });
    this.route('disclaimer');
  });
  this.route('404', {
    path: '/*wildcard'
  });
});
