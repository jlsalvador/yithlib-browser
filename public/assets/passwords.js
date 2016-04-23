(function (self) {
    'use strict';

    Promise.all([
        self.yithlib.loading.storage
    ]).then(function () {
        var passwords = self.yithlib.storage.passwords ? self.yithlib.storage.passwords : [],
            getPasswords = function () {
                return new Promise(function (resolve, reject) {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', 'https://www.yithlibrary.com/passwords?client_id=' + self.yithlib.storage.clientId, true);
                    xhr.setRequestHeader('Authorization', 'Bearer ' + self.yithlib.storage.access_token);
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === XMLHttpRequest.DONE) {
                            if (xhr.status === 200) {
                                resolve(xhr.responseText);
                            } else {
                                reject(xhr.responseText);
                            }
                        }
                    };
                    xhr.send();
                });
            },
            getPassword = function (id) {
                //TODO
            },
            pollingForUpdates = function () {
                passwords = getPasswords();
                setTimeout(pollingForUpdates, self.yithlib.storage.millisecondsBetweenPollingForUpdates);
            };

        // Add listeners
        self.yithlib.events.addListener('storagePostSetProperty', function (target, property, value) {
            // Update pollingForUpdates timeout
            if (property === 'millisecondsBetweenPollingForUpdates') {
                clearTimeout(pollingForUpdates);
                if (value >= 60000) {
                    setTimeout(pollingForUpdates, value);
                }
            }

            // Clean passwords
            if (property === 'rememberEncryptedPasswords' && !value) {
                target.passwords = [];
            }
            return true;
        });

        // Return object
        self.yithlib.passwords = {
            get: function (id) {
                if (id !== undefined) {
                    return getPassword(id);
                } else {
                    return getPasswords();
                }
            }
        };
    });

}(this));
