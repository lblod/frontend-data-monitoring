import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { settled } from '@ember/test-helpers';
import Service from '@ember/service';

module('Unit | Route | org-report', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register(
      'service:store',
      class MockStoreService extends Service {
        query(modelName) {
          if (modelName === 'admin-unit-count-report')
            return Promise.resolve([{ governingBodyCountReport: [] }]);
          if (modelName === 'last-harvesting-execution-record')
            return Promise.resolve([
              { lastExecutionTime: '2025-10-01T12:00:00Z' }
            ]);
          if (modelName === 'decision-count-report') return Promise.resolve([]);
          if (modelName === 'maturity-level-report')
            return Promise.resolve([{ notuleUri: 'test-uri' }]);
          if (modelName === 'session-timestamp-report')
            return Promise.resolve([
              { firstSession: '2025-10-01', lastSession: '2025-10-02' }
            ]);
          return Promise.resolve([]);
        }
      }
    );

    this.owner.register(
      'service:current-session',
      class MockCurrentSessionService extends Service {
        groupClassification = { label: 'Gemeente' };
        group = { name: 'test-gemeente' };
      }
    );
  });

  test('model returns expected data structure', async function (assert) {
    const route = this.owner.lookup('route:home/org');

    const model = await route.model({
      begin: '2025-10-01',
      eind: '2025-10-30'
    });
    const data = await model.data;
    await settled();

    assert.ok(model.data, 'model has data property');
    assert.ok(Array.isArray(data), 'data is an array');
    assert.ok(model.lastHarvestingDate, 'model includes lastHarvestingDate');
    assert.ok(model.sessionTimestamps, 'model includes sessionTimestamps');
    assert.ok(model.maturityLevel, 'model includes maturityLevel');
  });

  test('getData task calculates counts correctly', async function (assert) {
    const route = this.owner.lookup('route:home/org');

    const data = await route.getData.perform(
      { begin: '2025-10-01', eind: '2025-10-30' },
      { firstSession: '2025-10-01', lastSession: '2025-10-02' },
      '2025-10-01',
      '2025-10-30'
    );

    assert.ok(Array.isArray(data), 'getData returns a list');
    assert.ok(data.length > 0, 'getData list is not empty');
    assert.ok(
      data.find((item) => item.label === 'Aantal gepubliceerde zittingen'),
      'includes session counts'
    );
  });
});
