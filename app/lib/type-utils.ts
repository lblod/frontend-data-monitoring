import Route from '@ember/routing/route';

/**
  Get the resolved type of an item.

  - If the item is a promise, the result will be the resolved value type
  - If the item is not a promise, the result will just be the type of the item
 */
export type Resolved<P> = P extends Promise<infer T> ? T : P;

/** Get the resolved model value from a route. */
export type ModelFrom<R extends Route> = Resolved<ReturnType<R['model']>>;

export const URI_MAP = {
  SESSION: `http://data.vlaanderen.be/ns/besluit#Zitting`,
  AGENDA_ITEM: `http://data.vlaanderen.be/ns/besluit#Agendapunt`,
  DECISION: `http://data.vlaanderen.be/ns/besluit#Besluit`,
  VOTE: `http://data.vlaanderen.be/ns/besluit#Stemming`,
} as const;
