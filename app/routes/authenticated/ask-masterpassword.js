import Ember from 'ember';
import RouteHistoryMixin from 'ember-route-history/mixins/routes/route-history';

export default Ember.Route.extend(RouteHistoryMixin, {
    template: Ember.inject.service(),

    setupController: function (controller, model) {
        var that = this;
        that._super(controller, model);

        controller.setProperties({
            storage: Ember.inject.service(),
            oauth2: Ember.inject.service(),
            authenticated: Ember.inject.controller(),

            tmpMasterPassword: null,

            isOptionMemorySelected: Ember.computed.equal('storage.whereToRememberMasterPassword', 'memory'),
            isOptionSessionSelected: Ember.computed.equal('storage.whereToRememberMasterPassword', 'session'),
            isOptionLocalSelected: Ember.computed.equal('storage.whereToRememberMasterPassword', 'local'),
            isMasterPasswordValid: Ember.computed('tmpMasterPassword', 'authenticated.passwords', function () {
                return this.get('oauth2').isMasterPasswordValid(this.get('authenticated.passwords.firstObject'), this.get('tmpMasterPassword'));
            }),
            isMasterPasswordEmpty: Ember.computed.empty('tmpMasterPassword'),

            actions: {
                selectWhereToRememberMasterPassword: function (whereToRememberMasterPassword) {
                    this.set('storage.whereToRememberMasterPassword', whereToRememberMasterPassword);
                },
                doMasterPassword: function () {
                    //var lastRoute = this.get('storage.lastRoute');
                    if (this.get('isMasterPasswordValid')) {
                        this.set('storage.masterPassword', this.get('tmpMasterPassword'));
                        this.set('tmpMasterPassword', null); //TODO: Study if we can use this command after transitionToRoute
                        //if (lastRoute && that.router.router.recognizer.hasRoute(lastRoute.name)) {
                            //FIXME this.transitionToRoute(lastRoute.name, lastRoute.context);
                        //} else {
                            this.transitionToRoute('authenticated');
                        //}
                    }
                }
            }
        });
    },
    activate: function () {
        this.set('template.isHeaderVisible', false);
    }
});
