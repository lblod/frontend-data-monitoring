import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import CurrentSessionService from 'frontend-data-monitoring/services/current-session';
import LoketSessionService from 'frontend-data-monitoring/services/session';

export default class AppHeaderComponent extends Component {
  @service declare currentSession: CurrentSessionService;
  @service declare session: LoketSessionService;
}
