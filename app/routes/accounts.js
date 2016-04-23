import Ember from 'ember';
import RouteHistoryMixin from 'ember-route-history/mixins/routes/route-history';

export default Ember.Route.extend(RouteHistoryMixin, {
    template: Ember.inject.service(),

    activate: function () {
        this.set('template.isHeaderVisible', true);
    }
});
