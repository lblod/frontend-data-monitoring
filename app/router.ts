import EmbroiderRouter from '@embroider/router';
import config from 'frontend-data-monitoring/config/environment';

export default class Router extends EmbroiderRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
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
  this.route('mock-login');
  this.route('lougout');

  this.route('index', { path: '/' }); // Public facing page suggesting login

  this.route('four-oh-four', { path: '/*path' });

  this.route('disclaimer');
  this.route('help');
  this.route('cookie-notice', { path: '/cookieverklaring' });
  this.route('accessibility-statement', {
    path: '/toegankelijkheidsverklaring',
  });
  // this.route('data-quality', { path: '/data-kwaliteit' });
});
