import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class ReportWrongDataComponent extends Component {
  @service store;
  @service currentSession;
  @service router;

  get queryParams() {
    const queryParams = new URLSearchParams(
      this.router.currentURL.split('?')[1]
    );
    return {
      begin: queryParams.get('begin'),
      eind: queryParams.get('eind')
    };
  }
  get subject() {
    return `Correctie van foutieve gegevens met betrekking tot ${this.currentSession.groupClassification.label} ${this.currentSession.group.name}`;
  }
  get body() {
    const periode = this.queryParams.begin
      ? `Van ${this.queryParams.begin} tot ${this.queryParams.eind}`
      : 'Alle periodes';
    return `Beste,%0D%0A%0D%0AIk wil een fout in de data melden met betrekking tot [vul hier uw vraag of opmerking in].%0D%0A%0D%0AExtra info:%0D%0ALokaal bestuur: ${this.currentSession.groupClassification.label} ${this.currentSession.group.name} %0D%0A Periode: ${periode} %0D%0A%0D%0AMet vriendelijke groet`;
  }
}
