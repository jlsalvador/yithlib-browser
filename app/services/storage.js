/*global chrome*/

import Ember from 'ember';

export default Ember.Service.extend({
    port: null,
    _ready: false,
    _storageObserver: function (sender, key) {
        var that = this,
            port = that.get('port');
        port.postMessage({
            action: 'updateKey',
            key: key,
            value: that.get(key)
        });
    },
    init: function () {
        var that = this,
            port = chrome.runtime.connect({
                name: 'storageBinding'
            });
        that.set('port', port);
        port.onMessage.addListener(function (message) {
            if (typeof message !== 'object' || typeof message.action !== 'string') {
                return false;
            }
            if (message.action === 'updateKey') {
                that.set(message.key, message.value);
            } else if (message.action === 'setStorage') {
                for (var property in message.storage) {
                    if (message.storage.hasOwnProperty(property)) {
                        that.set(property, message.storage[property]);
                        that.addObserver(property, that, '_storageObserver');
                    }
                }
                that.set('_ready', true);
            }
            return true;
        });
        port.postMessage({
            action: 'getStorage'
        });
    },
    readyPromise: function () {
        var that = this;
        return new Ember.RSVP.Promise(function (resolve) {
            var checkForReady = function () {
                if (that.get('_ready')) {
                    resolve(that);
                } else {
                    Ember.run.next(checkForReady);
                }
            };
            checkForReady();
        });
    }
});
