
(function (self) {
    'use strict';

    var listeners = {},
        initPropertyAsArray = function (object, property) {
            if (!object.hasOwnProperty(property)) {
                object[property] = [];
            }
        };

    // Check yithlib existence
    if (!self.hasOwnProperty('yithlib')) {
        self.yithlib = {};
    }

    self.yithlib.events = {
        addListener: function (name, callback) {
            var index;
            initPropertyAsArray(listeners, name);
            index = listeners[name].indexOf(callback);
            if (index < 0) {
                listeners[name].push(callback);
            }
        },
        removeListener: function (name, callback) {
            var index;
            initPropertyAsArray(listeners, name);
            index = listeners[name].indexOf(callback);
            if (index >= 0) {
                listeners[name].splice(index, 1);
            }
        },
        emit: function (name, args) {
            var result = true;
            initPropertyAsArray(listeners, name);
            listeners[name].forEach(function (callback) {
                if (!callback.apply(this, args)) {
                    result = false;
                }
            });
            return result;
        }
    };
}(this));
