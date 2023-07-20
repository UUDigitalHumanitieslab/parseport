import View from '../core/view';
import enterTemplate from './enter-template';

export default class EnterView extends View {
    template = enterTemplate;
    render() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
}
