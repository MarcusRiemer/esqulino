import {Select, SelectDescription}    from './select'

describe('Page <select>', () => {
    it('Serialization', () => {
        const m : SelectDescription = {
            type : "select",
            outParamName : "test",
            caption : "Test Selection",
        }

        let s = new Select(m);
        expect(s.toModel()).toEqual(m);
    });
});

