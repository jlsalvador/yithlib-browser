/*global chrome, console*/

(function (self, yithlib) {
    'use strict';

    Promise.all([
        yithlib.loading.storage
    ]).then(function () {
        var extractDomain = function (url) {
                var domain;
                if (url.indexOf("://") > -1) {
                    domain = url.split('/')[2];
                } else {
                    domain = url.split('/')[0];
                }
                return domain.replace(/www\./gi, '').split(':')[0];
            },
            refreshContextMenus = function () {
                chrome.tabs.query({
                    'active': true,
                    'currentWindow': true
                }, function (tabs) {
                    if (tabs.length > 0) {
                        var tab = tabs[0],
                            domain;
                        if (tab.highlighted && tab.status === 'complete') {
                            domain = extractDomain(tab.url);
                            //console.log('refreshContextMenus', domain, tab.title);

                            chrome.contextMenus.removeAll(function () {
                                if (yithlib.storage.allowContextMenus) {
                                    chrome.contextMenus.create({
                                        'contexts': [
                                            'link',
                                            'image',
                                            'video',
                                            'audio',
                                            'editable',
                                            'page',
                                            'selection'
                                        ],
                                        'id': 'yithlib-parentMenu',
                                        'title': 'YithLib'
                                    }, function () {
                                        return chrome.runtime.lastError;
                                    });
                                    chrome.contextMenus.create({
                                        'contexts': ['editable'],
                                        'id': 'yithlib-secret-' + domain,
                                        'parentId': 'yithlib-parentMenu',
                                        'title': 'Secret associated with ' + domain,
                                        'onclick': function (info, tab) {
                                            console.log(info, tab);
                                        }
                                    }, function () {
                                        return chrome.runtime.lastError;
                                    });
                                    chrome.contextMenus.create({
                                        'contexts': ['editable'],
                                        'id': 'yithlib-parentMenuSeparador',
                                        'parentId': 'yithlib-parentMenu',
                                        'type': 'separator'
                                    }, function () {
                                        return chrome.runtime.lastError;
                                    });
                                    chrome.contextMenus.create({
                                        'contexts': [
                                            'link',
                                            'image',
                                            'video',
                                            'audio',
                                            'editable',
                                            'page',
                                            'selection'
                                        ],
                                        'id': 'yithlib-addUrlMenu',
                                        'parentId': 'yithlib-parentMenu',
                                        'title': 'Add ' + domain + ' to your library',
                                        'onclick': function (info, tab) {
                                            console.log(info, tab);
                                        }
                                    }, function () {
                                        return chrome.runtime.lastError;
                                    });
                                }
                            });
                        }
                    }
                });
            };

        // Add listeners
        self.yithlib.events.addListener('storagePostSetProperty', function (target, property) {
            // Refresh context menus on storage.allowContextMenus changes
            if (property === 'allowContextMenus') {
                refreshContextMenus();
            }
            return true;
        });

        // Refresh context menu on tab or window changes
        chrome.tabs.onActivated.addListener(function () {
            refreshContextMenus();
        });
        chrome.tabs.onUpdated.addListener(function () {
            refreshContextMenus();
        });
        chrome.windows.onFocusChanged.addListener(function () {
            refreshContextMenus();
        });

        // Check yithlib existence
        if (!self.hasOwnProperty('yithlib')) {
            self.yithlib = {};
        }

        //Return object
        self.yithlib.contextMenus = {
            refresh: refreshContextMenus
        };

    });

}(this, this.yithlib));
