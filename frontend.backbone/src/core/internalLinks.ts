import { startsWith, extend } from 'lodash';
import { history } from 'backbone';

import View from './view';

// This view intercepts clicks on internal links and makes it possible
// to handle them without reloading our SPA.

export default class internalLinkEnabler extends View {
    intercept(event) {
        const href = this.$(event.target).attr('href');
        if (!href || startsWith(href, 'http') || startsWith(href, '//')) return;
        event.preventDefault();
        history.navigate(href, {trigger: true});
    }
}

extend(internalLinkEnabler.prototype, {
    el: function() {
        return document.body;
    },
    events: {
        'click a, area': 'intercept',
    },
});
