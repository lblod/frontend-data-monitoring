/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import JSONAPISerializer from '@ember-data/serializer/json-api';
import Store from '@ember-data/store';

// Code coped and adapted from https://github.com/mu-semtech/ember-data-table/blob/master/addon/mixins/serializer.js
// Mixins are no longer in fashion. And the plugin was not compatible with this one.

export default class JSONAPIWithMetaSerializer extends JSONAPISerializer {
  serializeAttribute(snapshot: any, json: any, key: string, attributes: any) {
    if (key !== 'uri')
      super.serializeAttribute(snapshot, json, key, attributes);
  }

  normalizeQueryResponse(
    store: Store,
    clazz: any,
    payload: any,
    id: string | number,
    requestType: string
  ) {
    const result: any = super.normalizeQueryResponse(
      store,
      clazz,
      payload,
      id,
      requestType
    );
    result.meta = result.meta || {};

    if (payload.links) {
      result.meta.pagination = this.createPageMeta(payload.links);
    }
    if (payload.meta) {
      result.meta.count = payload.meta.count;
    }

    return result;
  }

  /**
     Transforms link URLs to objects containing metadata
     E.g.
     {
         previous: '/streets?page[number]=1&page[size]=10&sort=name
         next: '/streets?page[number]=3&page[size]=10&sort=name
     }

     will be converted to

     {
         previous: { number: 1, size: 10 },
         next: { number: 3, size: 10 }
     }
   */
  createPageMeta(links: Record<string, string>) {
    const meta: Record<string, Record<string, number | string>> = {};

    Object.keys(links).forEach((type) => {
      const link = links[type];
      if (link) {
        //extracts from '/path?foo=bar&baz=foo' the string: foo=bar&baz=foo
        const query = link.split(/\?(.+)/)[1] || '';
        meta[type] = {};

        query.split('&').forEach((pairs) => {
          const [param, value] = pairs.split('=');
          if (param && decodeURIComponent(param) === 'page[number]') {
            meta[type]!['number'] = parseInt(value ?? '0');
          } else if (param && decodeURIComponent(param) === 'page[size]') {
            meta[type]!['size'] = parseInt(value ?? '10');
          }
        });
      }
    });

    return meta;
  }
}
