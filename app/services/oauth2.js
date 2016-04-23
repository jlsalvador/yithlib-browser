/*global chrome, moment, sjcl*/

import Ember from 'ember';

export default Ember.Service.extend({
    storage: Ember.inject.service(),

    isMasterPasswordValid: function (firstPassword, optMasterPassword) {
        if (optMasterPassword === undefined) {
            optMasterPassword = this.get('storage.masterPassword');
        }
        return !Ember.isEmpty(optMasterPassword) &&
            !Ember.isEmpty(firstPassword) &&
            this.decrypt(firstPassword.get('secret'), optMasterPassword) !== false;
    },
    isCurrentTokenDataValidPromise: function () {
        var storage = this.get('storage');
        return new Ember.RSVP.Promise(function (resolve, reject) {
            storage.readyPromise().then(function () {
                var expires_in = storage.get('expires_in');
                if (typeof expires_in === 'string' && moment(expires_in).isValid() && moment(expires_in).isAfter(moment())) {
                    resolve();
                } else {
                    reject();
                }
            }, function (reason) {
                reject(reason);
            });
        });
    },
    clean: function () {
        var that = this,
            storage = that.get('storage');
        return new Ember.RSVP.Promise(function (resolve, reject) {
            storage.readyPromise().then(function () {
                chrome.runtime.sendMessage({
                    action: 'doLogout'
                }, function (response) {
                    if (response.error) {
                        reject(response.error);
                    } else {
                        resolve();
                    }
                });
            });
        });
    },
    getTokenData: function () {
        var that = this,
            storage = that.get('storage');
        return new Ember.RSVP.Promise(function (resolve, reject) {
            that.isCurrentTokenDataValidPromise().then(function () {
                resolve(storage.getProperties([
                    'access_token',
                    'expires_in',
                    'token_type',
                    'state',
                    'scope'
                ]));
            }, function () {
                chrome.runtime.sendMessage({
                    action: 'doLogin',
                }, function (response) {
                    if (response.error) {
                        reject(response.error);
                    } else {
                        storage.setProperties(response);
                        resolve(response);
                    }
                });
            });
        });
    },
    encrypt: function (value) {
        try {
            return sjcl.encrypt(this.get('storage.masterPassword'), value);
        } catch (reason) {
            return false;
        }
    },
    decrypt: function (value, optMasterPassword) {
        if (Ember.isEmpty(optMasterPassword)) {
            optMasterPassword = this.get('storage.masterPassword');
        }
        try {
            return sjcl.decrypt(optMasterPassword, value);
        } catch (reason) {
            return false;
        }
    }
});
