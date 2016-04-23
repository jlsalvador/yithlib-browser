import Ember from 'ember';

export default Ember.TextField.extend({
    attributeBindings: [
        'autofocus'
    ],
    autofocus: true,

    init: function () {
        this.on('didInsertElement', function () {
            this.$().focus();
        });
        this._super.apply(this, arguments);
    }
});
