import Ember from 'ember';
import OpenLikePopupMixin from '../../../mixins/open-like-popup';
import { module, test } from 'qunit';

module('Unit | Mixin | open like popup');

// Replace this with your real tests.
test('it works', function(assert) {
  let OpenLikePopupObject = Ember.Object.extend(OpenLikePopupMixin);
  let subject = OpenLikePopupObject.create();
  assert.ok(subject);
});
