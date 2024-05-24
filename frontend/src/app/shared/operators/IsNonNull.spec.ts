import { filterOutNonNull } from "./IsNonNull";
import { of } from "rxjs";

fdescribe('isNonNull', () => {
    it('should filter out null and undefined values', () => {
        const source = of('hello', null, 123, undefined, true, {}, []);
        const expected = ['hello', 123, true, {}, []];

        source.pipe(filterOutNonNull()).subscribe((value) => {
            expect(expected.includes(value)).toBe(true);
        });
    });

    it('should return correctly typed data', () => {
        const source = of('hello');

        source.pipe(filterOutNonNull()).subscribe((value) => {
            expect(typeof value).toBe('string');
            expect(value).toBe('hello');
        });
    });
});
