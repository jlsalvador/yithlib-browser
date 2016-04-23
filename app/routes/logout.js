import Ember from 'ember';
import RouteHistoryMixin from 'ember-route-history/mixins/routes/route-history';

export default Ember.Route.extend(RouteHistoryMixin, {
    oauth2: Ember.inject.service(),
    template: Ember.inject.service(),

    beforeModel() {
        var that = this;
        that.get('oauth2').clean().then(function () {
            //that.transitionTo('authenticated');
            window.close();
        });
    },
    activate: function () {
        this.set('template.isHeaderVisible', false);
    }
});
