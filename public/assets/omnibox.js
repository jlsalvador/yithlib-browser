/*global chrome*/

(function () {
    'use strict';

    chrome.omnibox.setDefaultSuggestion({
        description: '(Coming Soon...) Search: %s'
    });

    chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
        var suggestions = [{
            content: 'go-to-url ' + text,
            description: '(Coming Soon...) Go to url: ' + text
        }, {
            content: 'copy-username ' + text,
            description: '(Coming Soon...) Copy username: ' + text
        }, {
            content: 'copy-password ' + text,
            description: '(Coming Soon...) Copy password: ' + text
        }, {
            content: 'edit-secret ' + text,
            description: '(Coming Soon...) Edit secret: ' + text
        }];
        suggest(suggestions);
    });

    chrome.omnibox.onInputEntered.addListener(function (text) {
        console.log('omnibox.onInputEntered', text);
    });

}());
