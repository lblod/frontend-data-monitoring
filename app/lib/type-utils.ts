import Route from '@ember/routing/route';
import { CountResult } from 'frontend-data-monitoring/routes/home/org';

/**
  Get the resolved type of an item.

  - If the item is a promise, the result will be the resolved value type
  - If the item is not a promise, the result will just be the type of the item
 */
export type Resolved<P> = P extends Promise<infer T> ? T : P;

/** Get the resolved model value from a route. */
export type ModelFrom<R extends Route> = Resolved<ReturnType<R['model']>>;

export const uriToResultKeyMap: Record<string, keyof CountResult> = {
  'http://data.vlaanderen.be/ns/besluit#Zitting': 'amountOfPublicSessions',
  'http://data.vlaanderen.be/ns/besluit#Agendapunt':
    'amountOfPublicAgendaItems',
  'http://data.vlaanderen.be/ns/besluit#AgendapuntTitle':
    'amountOfPublicAgendaItemsWithTitle',
  'http://data.vlaanderen.be/ns/besluit#AgendapuntDescription':
    'amountOfPublicAgendaItemsWithDescription',
  'http://data.vlaanderen.be/ns/besluit#Besluit': 'amountOfPublicDecisions',
  'http://data.vlaanderen.be/ns/besluit#AgendapuntDuplicates':
    'amountOfDuplicateAgendaItems'
};
