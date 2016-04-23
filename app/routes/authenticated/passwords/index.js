import Ember from 'ember';
import RouteHistoryMixin from 'ember-route-history/mixins/routes/route-history';

export default Ember.Route.extend(RouteHistoryMixin, {
    storage: Ember.inject.service(),
    queryParams: {
        tag: {}
    },

    setupController: function (controller, model) {
        this._super(controller, model);

        controller.setProperties({
            authenticated: Ember.inject.controller(),
            storage: this.get('storage'),
            queryParams: ['tag'],

            tag: '',
            showTags: true,
            showFirstlyTags: true,
            numPagedFilteredPasswords: this.get('storage.numberOfPagedPasswords'),

            filteredTags: Ember.computed('authenticated.allTags', 'authenticated.filter', 'tag', function () {
                var tags = this.get('authenticated.allTags'),
                    filters = this.get('authenticated.filter').toLowerCase().split(' '),
                    selectedTag = this.get('tag');
                return tags.filter(function (tag) {
                    var result = true;

                    // Filter by filters
                    if (result && filters.length > 0) {
                        result = filters.every(function (filter) {
                            return tag.toLowerCase().indexOf(filter) >= 0;
                        });
                    }

                    // Filter by selectedTag
                    if (result && selectedTag) {
                        result = tag !== selectedTag && tag.indexOf(selectedTag) === 0;
                    }

                    return result;
                });
            }),
            filteredPasswords: Ember.computed('authenticated.passwords', 'authenticated.filter', 'tag', function () {
                var passwords = this.get('authenticated.passwords'),
                    filters = String(this.get('authenticated.filter')).toLowerCase().split(' '),
                    selectedTag = this.get('tag');
                return passwords.filter(function (password) {
                    var result = true;

                    // Filter by filters
                    if (result && filters.length > 0) {
                        result = filters.every(function (filter) {
                            return String(password.get('service')).toLowerCase().indexOf(filter) >= 0 ||
                                String(password.get('account')).toLowerCase().indexOf(filter) >= 0 ||
                                String(password.get('url')).toLowerCase().indexOf(filter) >= 0;
                        });
                    }

                    // Filter by selectedTag
                    if (result && selectedTag) {
                        result = password.get('tags').contains(selectedTag);
                    }

                    return result;
                });
            }),
            pagedFilteredPasswords: Ember.computed('numPagedFilteredPasswords', 'filteredPasswords', function () {
                return this.get('filteredPasswords').slice(0, this.get('numPagedFilteredPasswords'));
            }),
            isMoreToLoad: Ember.computed('numPagedFilteredPasswords', 'filteredPasswords', function () {
                return this.get('numPagedFilteredPasswords') < this.get('filteredPasswords').length;
            }),
            isEmptyList: Ember.computed('filteredTags', 'filteredPasswords', function () {
                return this.get('filteredTags').length + this.get('filteredPasswords').length === 0;
            }),
            actions: {
                toggleShowTags: function () {
                    this.toggleProperty('showTags');
                },
                toggleFirstlyTags: function () {
                    this.toggleProperty('showFirstlyTags');
                },
                selectTag: function (tag) {
                    this.set('authenticated.filter', '');
                    this.set('authenticated.filterText', '');
                    this.set('numPagedFilteredPasswords', this.get('storage.numberOfPagedPasswords'));
                    this.transitionToRoute({
                        queryParams: {
                            tag: tag
                        }
                    });

                    Ember.$.scrollTo(0, 1000, {
                        interrupt: true
                    });
                },
                loadMore: function () {
                    this.incrementProperty('numPagedFilteredPasswords', parseInt(this.get('storage.numberOfPagedPasswords')));
                }
            }
        });
    }
});
