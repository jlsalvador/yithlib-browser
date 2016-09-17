import Ember from 'ember';
import CopyToClipboardMixin from '../../../mixins/copy-to-clipboard';
import { module, test } from 'qunit';

module('Unit | Mixin | copy to clipboard');

// Replace this with your real tests.
test('it works', function(assert) {
  let CopyToClipboardObject = Ember.Object.extend(CopyToClipboardMixin);
  let subject = CopyToClipboardObject.create();
  assert.ok(subject);
});
