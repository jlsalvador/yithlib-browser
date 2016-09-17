import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
    location: config.locationType,
    rootURL: config.rootURL
});

Router.map(function () {
  this.route('preferences');
  this.route('logout');
  this.route('accounts');
  this.route('authenticated', function () {
      this.route('ask-masterpassword');
      this.route('fill-form');
      this.route('generate-password');
      this.route('passwords', function () {
          this.route('show', {
              path: '/:id'
          }, function() {
            this.route('edit', function() {
              this.route('template');
            });
          });
          this.route('new');
      });
  });
  this.route('information');
});

export default Router;
