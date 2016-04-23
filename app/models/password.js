import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
    oauth2: Ember.inject.service(),
    storage: Ember.inject.service(),

    owner: DS.attr('string'),
    user: DS.attr('string'),
    account: DS.attr('string'),
    expiration: DS.attr('number'),
    notes: DS.attr('string'),
    creation: DS.attr('date', {
        defaultValue: function () {
            return new Date();
        }
    }),
    modification: DS.attr('date'),
    service: DS.attr('string'),
    tags: DS.attr({
        defaultValue: []
    }),
    secret: DS.attr('string'),

    decryptedSecret: Ember.computed('secret', 'storage.masterPassword', {
        get() {
            return this.get('oauth2').decrypt(this.get('secret'));
        },
        set(key, value) {
            var oauth2 = this.get('oauth2'),
                changedAttributes = this.changedAttributes();
            if (
                changedAttributes.secret !== undefined &&
                oauth2.decrypt(changedAttributes.secret[0]) === value
            ) {
                this.set('secret', changedAttributes.secret[0]);
            } else {
                this.set('secret', oauth2.encrypt(value));
            }
            return value;
        }
    }),
    decryptedSecretJSON: Ember.computed('decryptedSecret', {
        get() {
            try {
                return JSON.parse(this.get('decryptedSecret'));
            } catch (ignore) {
                return false;
            }
        },
        set(key, value) {
            var decryptedSecret = this.get('decryptedSecret'),
                decryptedSecretJSON = this.get('decryptedSecretJSON');
            try {
                if (!decryptedSecretJSON && !Ember.isEmpty(decryptedSecret)) {
                    value.decryptedSecret = decryptedSecret;
                }
                this.set('decryptedSecret', JSON.stringify(value));
                return value;
            } catch (ignore) {
                return undefined;
            }
        }
    })
});
