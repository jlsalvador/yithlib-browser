import Ember from 'ember';

export default Ember.Mixin.create({
    actions: {
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
