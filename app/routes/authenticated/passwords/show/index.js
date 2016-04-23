import Ember from 'ember';
import RouteHistoryMixin from 'ember-route-history/mixins/routes/route-history';

export default Ember.Route.extend(RouteHistoryMixin, {
    setupController: function (controller, model) {
        var that = this;
        that._super(controller, model);

        controller.setProperties({
            showPassword: false,

            actions: {
                toggleShowPassword: function () {
                    this.toggleProperty('showPassword');
                },
                copyToClipboard: function (plainText) {
                    var oldOncopy = document.oncopy;
                    document.oncopy = function (event) {
                        event.clipboardData.setData('text/plain', plainText);
                        event.preventDefault();
                    };
                    document.execCommand('copy');
                    document.oncopy = oldOncopy;
                }
            }
        });
    }
});
