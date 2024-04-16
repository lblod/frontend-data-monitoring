import EmbroiderRouter from '@embroider/router';
import config from 'frontend-data-monitoring/config/environment';

export default class Router extends EmbroiderRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('home', { path: '/' });
  this.route('auth', { path: '/authorization' }, function () {
    this.route('callback');
    this.route('callback-error');
    this.route('login');
    this.route('logout');
    this.route('switch');
  });

  // this.route('agenda-items', { path: '/agendapunten' }, function () {
  //   this.route('agenda-item', { path: '/:id' });
  //   this.route('session', { path: '/:id/zitting' });
  // });

  // this.route('sessions', { path: '/zittingen' }, function () {
  //   this.route('session', { path: '/:session_id' });
  // });
  this.route('four-oh-four', { path: '/*path' });

  this.route('disclaimer');
  this.route('help');
  this.route('cookie-notice', { path: '/cookieverklaring' });
  this.route('accessibility-statement', {
    path: '/toegankelijkheidsverklaring',
  });
  // this.route('data-quality', { path: '/data-kwaliteit' });
});
