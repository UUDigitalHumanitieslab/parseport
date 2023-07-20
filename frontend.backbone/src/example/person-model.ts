import FancyModel from '../core/fancy-model';

export default class ExampleModel extends FancyModel {
    defaults() {
        return {
            name: 'World',
            email: 'world@world.com',
        };
    };
    swapProperties() {
        let temp = this.get('name');
        this.set('name', this.get('email'));
        this.set('email', temp);
        return this;
    }
}
