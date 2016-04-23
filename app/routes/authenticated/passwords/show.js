import Ember from 'ember';
import RouteHistoryMixin from 'ember-route-history/mixins/routes/route-history';

export default Ember.Route.extend(RouteHistoryMixin, {
    storage: Ember.inject.service(),

    // this.set('storage.lastRoute', {
    //     name: 'authenticated.passwords.show',
    //     context: {
    //         queryParams: {
    //             id: model.get('id')
    //         }
    //     }
    // });
    desactivate: function () {
        this.set('storage.lastRoute', null);
    }
});
