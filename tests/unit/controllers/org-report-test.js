import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Controller from '@ember/controller';

module('Unit | Controller | home/org', function (hooks) {
  setupTest(hooks);

  test('it exists and has default properties', function (assert) {
    const controller = this.owner.lookup('controller:home/org');
    assert.ok(controller instanceof Controller, 'controller is created');
    assert.strictEqual(controller.begin, null, 'begin defaults to null');
    assert.strictEqual(controller.eind, null, 'eind defaults to null');
    assert.false(controller.hasFilter, 'hasFilter defaults to false');
    assert.false(controller.checked, 'checked defaults to false');
  });

  test('handleToggle() updates localStorage and tracked property', function (assert) {
    const controller = this.owner.lookup('controller:home/org');
    controller.handleToggle(true);
    assert.true(controller.checked, 'checked is updated');
    assert.strictEqual(
      localStorage.getItem('view-toggle'),
      'true',
      'localStorage updated'
    );
  });

  test('hideFilter() sets hasFilter to false', function (assert) {
    const controller = this.owner.lookup('controller:home/org');
    controller.hasFilter = true;
    controller.hideFilter();
    assert.false(controller.hasFilter, 'hasFilter is set to false');
  });

  module('computed properties', function () {
    test('pillSkin returns correct skin based on lastHarvestingDate', function (assert) {
      const controller = this.owner.lookup('controller:home/org');

      controller.model = {
        lastHarvestingDate: { isFinished: true, value: 'not-a-date' }
      };
      assert.strictEqual(
        controller.pillSkin,
        'default',
        'returns default for invalid date'
      );

      controller.model = {
        lastHarvestingDate: { isFinished: true, value: new Date() }
      };
      assert.strictEqual(
        controller.pillSkin,
        'success',
        'returns success for today'
      );

      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 3);
      controller.model = {
        lastHarvestingDate: { isFinished: true, value: oldDate }
      };
      assert.strictEqual(
        controller.pillSkin,
        'error',
        'returns error for old date'
      );
    });

    test('isLoading and data getters work correctly', function (assert) {
      const controller = this.owner.lookup('controller:home/org');

      controller.model = {
        data: { isRunning: true, isFinished: false, value: [] },
        lastHarvestingDate: {
          isRunning: false,
          isFinished: false,
          value: null
        }
      };

      assert.true(controller.isLoading, 'isLoading true when data is running');
      assert.deepEqual(controller.data, [], 'data empty when not finished');

      controller.model.data.isRunning = false;
      controller.model.data.isFinished = true;
      controller.model.data.value = [{ item: 1 }];
      assert.deepEqual(
        controller.data,
        [{ item: 1 }],
        'data returns value when finished'
      );
    });

    test('lastHarvestingDate and lastHarvestingDateIsLoading work correctly', function (assert) {
      const controller = this.owner.lookup('controller:home/org');
      controller.model = {
        data: { isRunning: false, isFinished: true, value: [] },
        lastHarvestingDate: {
          isRunning: true,
          isFinished: false,
          value: null
        }
      };

      assert.true(
        controller.lastHarvestingDateIsLoading,
        'loading true when running'
      );
      assert.deepEqual(
        controller.lastHarvestingDate,
        [],
        'returns [] when not finished'
      );

      controller.model.lastHarvestingDate.isRunning = false;
      controller.model.lastHarvestingDate.isFinished = true;
      controller.model.lastHarvestingDate.value = new Date();
      assert.ok(
        controller.lastHarvestingDate instanceof Date,
        'returns Date when finished'
      );
    });
  });
});
