import Ember from 'ember';
import RouteHistoryMixin from 'ember-route-history/mixins/routes/route-history';
import CopyToClipboardMixin from '../../../../mixins/copy-to-clipboard';

export default Ember.Route.extend(RouteHistoryMixin, CopyToClipboardMixin, {
    setupController: function (controller, model) {
        var that = this;
        that._super(controller, model);

        controller.setProperties({
            showPassword: false,

            actions: {
                toggleShowPassword: function () {
                    this.toggleProperty('showPassword');
                }
            }
        });
    }
});
