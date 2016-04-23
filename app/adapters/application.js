import DS from 'ember-data';
import Ember from 'ember';

export default DS.RESTAdapter.extend({
    storage: Ember.inject.service(),

    host: Ember.computed.alias('storage.serverUrl'),
    headers: Ember.computed('storage.access_token', function() {
        return {
            'Authorization': 'Bearer ' + this.get('storage.access_token')
        };
    }),
    clientId: Ember.computed.alias('storage.clientId'),
    ajax: function (url, type, hash) {
        url += '?client_id=' + this.get('clientId');
        return this._super(url, type, hash);
    }
});
