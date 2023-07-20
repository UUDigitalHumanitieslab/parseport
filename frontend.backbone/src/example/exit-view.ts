import View from '../core/view';
import exitTemplate from './exit-template';

export default class ExitView extends View {
    template = exitTemplate;
    render() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
}
