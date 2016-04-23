import Ember from 'ember';
import RouteHistoryMixin from 'ember-route-history/mixins/routes/route-history';

export default Ember.Route.extend(RouteHistoryMixin, {
    template: Ember.inject.service(),

    setupController: function (controller, model) {
        this._super(controller, model);

        controller.setProperties({
            storage: Ember.inject.service(),

            isOptionMemorySelected: Ember.computed.equal('storage.whereToRememberMasterPassword', 'memory'),
            isOptionSessionSelected: Ember.computed.equal('storage.whereToRememberMasterPassword', 'session'),
            isOptionLocalSelected: Ember.computed.equal('storage.whereToRememberMasterPassword', 'local'),
            isOptionDarkSelected: Ember.computed.equal('storage.extensionIcon', 'dark'),
            isOptionBrightSelected: Ember.computed.equal('storage.extensionIcon', 'bright'),

            actions: {
                selectWhereToRememberMasterPassword: function (whereToRememberMasterPassword) {
                    this.set('storage.whereToRememberMasterPassword', whereToRememberMasterPassword);
                },
                selectExtensionIcon: function(extensionIcon) {
                    this.set('storage.extensionIcon', extensionIcon);
                }
            }
        });
    },
    activate: function () {
        this.set('template.isHeaderVisible', window.location.href.indexOf('without-navbar') < 0);
    }
});
