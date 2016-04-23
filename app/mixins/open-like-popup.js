import Ember from 'ember';

export default Ember.Mixin.create({
    actions: {
        openLikePopup: function () {
            var width = 320 + 17, // window = 320px, chrome scrollbars = 17px
                height = 436;
            window.open(
                [window.location.origin, 'index.html'].join('/'),
                '_blank',
                'width=' + width + 'px,height=' + height + 'px'
            );
            window.close();
        }
    }
});
