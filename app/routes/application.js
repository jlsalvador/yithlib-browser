import Ember from 'ember';
import RouteHistoryMixin from 'ember-route-history/mixins/routes/route-history';
import OpenLikePopupMixin from '../mixins/open-like-popup';

export default Ember.Route.extend(RouteHistoryMixin, OpenLikePopupMixin, {
    routeHistory: Ember.inject.service(),
    storage: Ember.inject.service(),
    template: Ember.inject.service(),

    beforeModel: function (transition) {
        if (transition.targetName !== 'preferences') {
            this.transitionTo('authenticated');
        }
        return this.get('storage').readyPromise();
    },
    setupController: function (controller, model) {
        var that = this,
            isWindowPopup = window.location.href.indexOf('browser_action') >= 0;

        if (isWindowPopup && this.get('storage.alwaysOpenLikePopup')) {
            this.actions.openLikePopup();
        }

        that._super(controller, model);

        controller.setProperties({
            oauth2: Ember.inject.service(),
            authenticated: Ember.inject.controller(),
            template: that.get('template'),
            routeHistory: that.get('routeHistory'),

            isWindowPopup: isWindowPopup,

            isHeaderVisible: Ember.computed.alias('template.isHeaderVisible'),
            isGoBackHidden: Ember.computed.equal('routeHistory.current', 'authenticated.index'),
            isMasterPasswordValid: Ember.computed('authenticated.passwords', function () {
                return this.get('oauth2').isMasterPasswordValid(this.get('authenticated.passwords.firstObject'));
            }),

            actions: {
                goBack: function () {
                    if (window.history.length > 1) {
                        window.history.back();
                    } else {
                        this.transitionToRoute('authenticated');
                    }
                },
                clearFilter: function () {
                    this.set('authenticated.filterText', '');
                }
            }
        });
    }
});
