/*global chrome*/

(function (yithlib) {
    'use strict';

    Promise.all([
        yithlib.loading.storage
    ]).then(function () {

        chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {
            if (notificationId === 'notificationFirstInstallation') {
                if (buttonIndex === 0) { // Go to Yith Library server
                    chrome.tabs.create({
                        url: yithlib.storage.serverUrl,
                        active: true
                    });
                } else if (buttonIndex === 1) { // Go to preferences
                    chrome.tabs.create({
                        url: chrome.extension.getURL('index.html#/preferences'),
                        active: true
                    });
                }
            }
        });

        // Notify to login on first installation
        chrome.runtime.onInstalled.addListener(function (details) {
            if (details.reason === 'install') {
                chrome.notifications.create('notificationFirstInstallation', {
                    type: 'basic',
                    iconUrl: '/assets/favicon.png',
                    title: 'Please, log in your Yith Library',
                    message: 'You can change this server in the YithLib Preferences.',
                    // contextMessage: 'Thank you for use YithLib!',
                    isClickable: false,
                    buttons: [{
                        title: 'Log in ' + yithlib.storage.serverUrl
                    }, {
                        title: 'YithLib Preferences'
                    }]
                });
            }
        });
    });

}(this.yithlib));
