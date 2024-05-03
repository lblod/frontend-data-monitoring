import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class DashboardComponent extends Component {
  @tracked agendas: any = undefined;

  loadAgendasTask = task(async () => {
    const response = await fetch(
      'https://lokaalbeslist.lblod.info/agenda-items/search?page[size]=10&page[number]=0&filter[:has:search_location_id]=t&sort[session_planned_start.field]=desc'
    );
    console.log('response', response);
    this.agendas = response;
  });

  constructor(owner: any, args: any) {
    super(owner, args);
    this.loadAgendasTask.perform();
  }
}
