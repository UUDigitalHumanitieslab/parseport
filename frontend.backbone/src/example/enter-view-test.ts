import { enableI18n } from '../test-util';

import EnterView from './enter-view';
import Person from './person-model';

describe('EnterView', function() {
    beforeAll(enableI18n);
    beforeEach(function() {
        this.view = new EnterView({model: new Person()});
    });
    it('renders a simple greeting message', function() {
        expect(this.view.render().$el.html()).toContain('World');
    });
});
