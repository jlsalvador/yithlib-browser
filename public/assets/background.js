/*jslint browser: true, bitwise: true*/
/*globals chrome, moment*/

(function(yithlib, console) {
    'use strict';

    Promise.all([
        yithlib.loading.storage
    ]).then(function() {
        var
            defaultValues = {
                timeoutOAuth2: 3000,
                timeoutLogout: 5000
            },
            /*
            validateExpiresIn = function (expires_in) {
                return typeof expires_in === 'string' &&
                    moment(expires_in).isValid() &&
                    moment(expires_in).isAfter(moment());
            },
            */
            loginTabId = null,
            loginListeners = [],
            logoutTabId = null,
            logoutListeners = [];

        if (chrome.runtime.hasOwnProperty('onUpdateAvailable')) {
            chrome.runtime.onUpdateAvailable.addListener(function(details) {
                console.log('Updating to version: ' + details.version);
                chrome.runtime.reload();
            });
        }

        chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
            var
            /*doRequestByAjaxOrTab = function () {
                               // url
                               // onComplete
                               // onCancel
                               var xhr = new XMLHttpRequest(),
                                   data = new FormData();
                               xhr.open('POST', 'https://www.yithlibrary.com/oauth2/endpoints/authorization', true);
                               xhr.onload = function () {
                                   console.log(xhr);
                               };
                               xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                               xhr.setRequestHeader("Accept", "application/json");
                               data.append('client_id', '09727caf-a995-402e-9a7e-dc0874fa6559');
                               data.append('response_type', 'token');
                               data.append('scope', 'read-userinfo read-passwords write-passwords');
                               data.append('state', '6b26f39a-b3aa-4b00-8396-95e6ce51e388');
                               data.append('redirect_uri', 'https://www.yithlibrary.com/robots.txt');
                               data.append('submit', 'submit');
                               console.log(data);
                               xhr.send(data);
                           },
                           */
                doLogin = function(sendResponse) {
                    var redirectUrl = yithlib.storage.serverUrl + '/robots.txt',
                        guid = function() {
                            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                                var r = Math.random() * 16 | 0,
                                    v = (c === 'x' ? r : (r & 0x3 | 0x8));
                                return v.toString(16);
                            });
                        },
                        parsedOAuth2 = false,
                        parseTokenUrl = function(url) {
                            return {
                                access_token: url.match(/access_token=(\w+)/)[1],
                                expires_in: url.match(/expires_in=(\d+)/)[1],
                                token_type: url.match(/token_type=(\w+)/)[1],
                                state: url.match(/state=([\w\d\-]+)/)[1],
                                scope: url.match(/scope=([\w:_\+\-]+)/)[1]
                            };
                        },
                        listenerCheckForOAuth2 = function(tabId, changeInfo, tab) {
                            var tabUrl;
                            if (loginTabId === tabId && changeInfo.status === 'complete') {
                                if (tab.url.indexOf(redirectUrl) >= 0) {
                                    tabUrl = tab.url;
                                    chrome.tabs.remove(tabId);
                                    parsedOAuth2 = parseTokenUrl(tabUrl);
                                    parsedOAuth2.expires_in = moment().add(parsedOAuth2.expires_in, 's').format();
                                    loginListeners = loginListeners.filter(function(listener) {
                                        try {
                                            listener(parsedOAuth2);
                                        } catch (ignore) {}
                                        return false;
                                    });
                                } else if (tab.url.indexOf('error=') >= 0) {
                                    chrome.tabs.remove(tabId);
                                }
                            }
                        },
                        listenerCloseOAuth2 = function(tabId) {
                            if (loginTabId === tabId) {
                                loginTabId = null;
                                chrome.tabs.onUpdated.removeListener(listenerCloseOAuth2);
                                chrome.tabs.onUpdated.removeListener(listenerCheckForOAuth2);
                            }
                            if (!parsedOAuth2) {
                                loginListeners = loginListeners.filter(function(listener) {
                                    try {
                                        listener({
                                            error: 'The browser tab was closed without completing the oauth2 flow.'
                                        });
                                    } catch (ignore) {}
                                    return false;
                                });
                            }
                        };

                    loginListeners.push(sendResponse);
                    if (loginTabId === null) {
                        loginTabId = 0;
                        chrome.tabs.create({
                            url: yithlib.storage.serverUrl + '/oauth2/endpoints/authorization' +
                                '?client_id=' + yithlib.storage.clientId +
                                '&response_type=token' +
                                '&scope=' + encodeURIComponent([
                                    'read-userinfo',
                                    'read-passwords',
                                    'write-passwords'
                                ].join(' ')) +
                                '&state=' + guid() +
                                '&redirect_uri=' + encodeURIComponent(redirectUrl),
                            active: false
                        }, function(tab) {
                            loginTabId = tab.id;
                            setTimeout(function() {
                                if (!parsedOAuth2) {
                                    chrome.tabs.update(tab.id, {
                                        active: true
                                    });
                                }
                            }, defaultValues.timeoutOAuth2);
                            chrome.tabs.onRemoved.addListener(listenerCloseOAuth2);
                            chrome.tabs.onUpdated.addListener(listenerCheckForOAuth2);
                        });
                    }
                    return true;
                },
                doLogout = function(sendResponse) {
                    var logoutUrl = yithlib.storage.serverUrl + '/logout',
                        logged = true,
                        listenerCheckForLogout = function(tabId, changeInfo, tab) {
                            if (logoutTabId === tabId && changeInfo.status === 'complete' && tab.url.indexOf(logoutUrl) < 0) {
                                logged = false;
                                chrome.tabs.remove(tabId);

                                // Clean properties from storage
                                yithlib.storage.masterPassword =
                                    yithlib.storage.access_token =
                                    yithlib.storage.expires_in =
                                    yithlib.storage.token_type =
                                    yithlib.storage.state =
                                    yithlib.storage.scope = null;

                                logoutListeners = logoutListeners.filter(function (listener) {
                                    try {
                                        listener({
                                            status: true
                                        });
                                    } catch (ignore) {}
                                    return false;
                                });
                            }
                        },
                        listenerCloseLogout = function(tabId) {
                            if (logoutTabId === tabId) {
                                chrome.tabs.onUpdated.removeListener(listenerCloseLogout);
                                chrome.tabs.onUpdated.removeListener(listenerCheckForLogout);
                            }
                            if (logged) {
                                logoutListeners = logoutListeners.filter(function (listener) {
                                    try {
                                        listener({
                                            error: 'The browser tab was closed without completing the logout flow.'
                                        });
                                    } catch (ignore) {}
                                    return false;
                                });
                            }
                        };

                    logoutListeners.push(sendResponse);
                    if (logoutTabId === null) {
                        logoutTabId = 0;
                        chrome.tabs.create({
                            url: logoutUrl,
                            active: false
                        }, function(tab) {
                            logoutTabId = tab.id;
                            setTimeout(function() {
                                if (logged) {
                                    chrome.tabs.update(tab.id, {
                                        active: true
                                    });
                                }
                            }, defaultValues.timeoutLogout);
                            chrome.tabs.onRemoved.addListener(listenerCloseLogout);
                            chrome.tabs.onUpdated.addListener(listenerCheckForLogout);
                        });
                    }
                    return true;
                };

            if (typeof message !== 'object' || typeof message.action !== 'string') {
                return false;
            }
            if (message.action === 'doLogin') {
                return doLogin(sendResponse);
            }
            if (message.action === 'doLogout') {
                return doLogout(sendResponse);
            }
        });

        /*
        // Refresh token
        if (validateExpiresIn(yithlib.storage.expires_in)) {}
        */

    });

}(this.yithlib, this.console));
