/*global chrome*/

(function (self) {
    'use strict';

    Promise.all([
        self.yithlib.loading.storage
    ]).then(function () {

        var refreshExtensionIcon = function (extensionIcon) {
            if (extensionIcon === 'dark') {
                chrome.browserAction.setIcon({
                    path: {
                        "19": "/assets/favicon-19.png",
                        "38": "/assets/favicon-38.png"
                    }
                });
            } else if (extensionIcon === 'bright') {
                chrome.browserAction.setIcon({
                    path: {
                        "19": "/assets/favicon-bright-19.png",
                        "38": "/assets/favicon-bright-38.png"
                    }
                });
            }
        };

        // Add listeners
        self.yithlib.events.addListener('storagePostSetProperty', function (target, property, value) {
            // Change extension icon
            if (property === 'extensionIcon') {
                refreshExtensionIcon(value);
            }
            return true;
        });

        refreshExtensionIcon(self.yithlib.storage.extensionIcon);
    });

}(this));
