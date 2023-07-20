import PersonModel from './person-model';

describe('PersonModel', function() {
    beforeEach(function() {
        this.model = new PersonModel();
    });
    describe('.swapProperties', function() {
        it('swaps properties', function() {
            expect(this.model.get('name')).toBe('World');
            expect(this.model.get('email')).toBe('world@world.com');
            expect(this.model.swapProperties()).toBe(this.model);
            expect(this.model.get('name')).toBe('world@world.com');
            expect(this.model.get('email')).toBe('World');
        });
    });
});
