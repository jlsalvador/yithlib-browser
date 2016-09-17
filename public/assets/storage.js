/*globals chrome*/

(function (self) {
    'use strict';

    var storage = new Proxy({
            // YithLib version
            version: null,

            // Server
            clientId: '09727caf-a995-402e-9a7e-dc0874fa6559',
            serverUrl: 'https://www.yithlibrary.com',

            // Token
            access_token: null,
            expires_in: null,
            token_type: null,
            state: null,
            scope: null,
            passwords: [],

            // Preferences
            whereToRememberMasterPassword: 'memory',
            masterPassword: null,
            millisecondsBetweenPollingForUpdates: 600000,
            millisecondsBetweenKeyUpAndFilter: 1000,
            millisecondsToDeleteMasterPasswordFromMemory: 60000,
            allowContextMenus: true,
            alwaysOpenLikePopup: false,
            rememberEncryptedPasswords: false,
            enableFavIconFetcher: true,
            extensionIcon: 'dark',
            numberOfPagedPasswords: 20,

            // Internal
            lastRoute: null
        }, {
            set: function (target, property, value) {
                if (self.yithlib.events.emit('storagePreSetProperty', arguments)) {
                    target[property] = value;
                    self.yithlib.events.emit('storagePostSetProperty', arguments);
                }
                return true;
            },
            deleteProperty: function (target, property) {
                if (self.yithlib.events.emit('storagePreDeleteProperty', arguments)) {
                    delete target[property];
                    self.yithlib.events.emit('storagePostDeleteProperty', arguments);
                }
                return true;
            }
        }),
        timerClearMasterPassword,
        readyPromise = new Promise(function (resolve) {

            // Fill storage from chrome.storage.local
            chrome.storage.local.get(Object.keys(storage), function (items) {
                var property;

                if (chrome.runtime.lastError) {
                    self.console.error(chrome.runtime.lastError);
                    return;
                }

                for (property in storage) {
                    if (storage.hasOwnProperty(property) && items.hasOwnProperty(property)) {
                        storage[property] = items[property];
                    }
                }

                // Binding local storage to chrome.storage.local
                self.yithlib.events.addListener('storagePostSetProperty', function (target, property, value) {

                    // Add or delete masterPassword for each whereToRememberMasterPassword changes
                    if (property === 'whereToRememberMasterPassword') {
                        if (value === 'local') {
                            chrome.storage.local.set({
                                masterPassword: storage.masterPassword
                            });
                        } else if (value === 'session') {
                            chrome.storage.local.remove('masterPassword');
                        } else {
                            storage.masterPassword = null;
                        }
                    }

                    // Save any property, but ignore masterPassword when whereToRememberMasterPassword not equal to "local"
                    if (property !== 'masterPassword' || storage.whereToRememberMasterPassword === 'local') {
                        var changes = {};
                        changes[property] = value;
                        chrome.storage.local.set(changes);
                    } else if (property === 'masterPassword') {
                        chrome.storage.local.remove('masterPassword');
                    }

                    return true;
                });
                self.yithlib.events.addListener('storagePostDeleteProperty', function (target, property) {
                    chrome.storage.local.remove(property);
                    return true;
                });

                // Add listeners
                self.yithlib.events.addListener('storagePreSetProperty', function (target, property, value) {

                    // Clean masterPassword with a timeout if whereToRememberMasterPassword === memory
                    if (property === 'masterPassword' || property === 'whereToRememberMasterPassword') {
                        clearTimeout(timerClearMasterPassword);
                        if (
                            (property === 'whereToRememberMasterPassword' && value === 'memory' && storage.masterPassword !== null) ||
                            (property === 'masterPassword' && value !== null && storage.whereToRememberMasterPassword === 'memory')
                        ) {
                            timerClearMasterPassword = setTimeout(function () {
                                storage.masterPassword = null;
                            }, storage.millisecondsToDeleteMasterPasswordFromMemory);
                        }
                    }

                    return true;
                });

                // Add storage binding chrome message
                chrome.runtime.onConnect.addListener(function (port) {
                    if (port.name === 'storageBinding') {
                        var observerSet = function (target, property, value) {
                                port.postMessage({
                                    action: 'updateKey',
                                    key: property,
                                    value: value
                                });
                                return true;
                            },
                            observerDelete = function (target, property) {
                                port.postMessage({
                                    action: 'updateKey',
                                    key: property,
                                    value: undefined
                                });
                                return true;
                            };
                        port.onDisconnect.addListener(function () {
                            self.yithlib.events.removeListener('storagePostSetProperty', observerSet);
                            self.yithlib.events.removeListener('storagePostSetProperty', observerDelete);
                        });
                        port.onMessage.addListener(function (message) {
                            if (typeof message !== 'object' || typeof message.action !== 'string') {
                                return false;
                            }
                            if (message.action === 'getStorage') {
                                port.postMessage({
                                    action: 'setStorage',
                                    storage: storage
                                });
                            } else if (message.action === 'updateKey') {
                                storage[message.key] = message.value;
                            }
                            return true;
                        });
                        self.yithlib.events.addListener('storagePostSetProperty', observerSet);
                        self.yithlib.events.addListener('storagePostDeleteProperty', observerDelete);
                    }
                });

                // Update storage from older versions
                if (storage.version === null) {
                    storage.serverUrl = 'https://www.yithlibrary.com';
                    storage.version = '0.1.56';
                }
                if (storage.version === '0.1.56') {
                    storage.extensionIcon = 'dark';
                    storage.numberOfPagedPasswords = 20;
                    storage.version = '0.1.57';
                }
                if (storage.version === '0.1.57') {
                    storage.version = '0.1.58';
                }
                if (storage.version === '0.1.58') {
                    storage.version = '0.1.59';
                }

                resolve();
            });
        });

    // Check yithlib existence
    if (!self.hasOwnProperty('yithlib')) {
        self.yithlib = {};
    }
    if (!self.yithlib.hasOwnProperty('loading')) {
        self.yithlib.loading = {};
    }

    // Return object
    self.yithlib.loading.storage = readyPromise;
    self.yithlib.storage = storage;

}(this));
