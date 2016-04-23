import Ember from 'ember';
import RouteHistoryMixin from 'ember-route-history/mixins/routes/route-history';

export default Ember.Route.extend(RouteHistoryMixin, {
    oauth2: Ember.inject.service(),
    storage: Ember.inject.service(),

    beforeModel: function () {
        return this.get('oauth2').getTokenData();
    },
    model: function () {
        return this.store.findAll('password');
    },
    afterModel: function (model) {
        var oauth2 = this.get('oauth2'),
            lastRoute = this.get('storage.lastRoute');

        if (!oauth2.isMasterPasswordValid(model.get('firstObject'))) {
            this.transitionTo('authenticated.ask-masterpassword');
        } else if (lastRoute && this.router.router.recognizer.hasRoute(lastRoute.name)) {
            //FIXME this.transitionTo(lastRoute.name, lastRoute.context);
        }
    },
    setupController: function(controller, model) {
        var that = this;
        this._super(controller, model);

        controller.setProperties({
            passwords: model.sortBy('service'),
            filter: '',
            filterText: '',

            allTags: Ember.computed('passwords.@each.tags', function () {
                var allTags = [],
                splitByBackslash = /([^\\\][^\\]|\\\\)+/g,
                matches;
                this.get('passwords').forEach(function (password) {
                    var tags = password.get('tags');
                    tags.forEach(function (tag) {
                        allTags.push(tag);
                        matches = tag.match(splitByBackslash);
                        for (var i = 1; i < matches.length; i++) {
                            allTags.push(matches.slice(0, i).join('\\'));
                        }
                    });
                });
                return allTags.uniq().sort();
            })
        });
        controller.addObserver('filter', function () {
            if (!Ember.isBlank(controller.get('filter'))) {
                that.transitionTo('authenticated.passwords');
            }
        });
        controller.addObserver('filterText', function () {
            Ember.run.debounce(that, function () {
                controller.set('filter', controller.get('filterText'));
            }, that.get('storage.millisecondsBetweenKeyUpAndFilter'));
        });
    }
});
