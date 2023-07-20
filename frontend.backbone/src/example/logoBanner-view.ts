import { extend } from 'lodash';

import View from '../core/view';
import bannerTemplate from './logoBanner-template';

export default class LogoBannerView extends View {
    template = bannerTemplate;
    render() {
        this.$el.html(this.template());
        return this;
    }
}

extend(LogoBannerView.prototype, {
    tagName: 'footer',
});
