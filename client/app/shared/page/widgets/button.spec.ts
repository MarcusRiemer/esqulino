import {Button, ButtonDescription}  from './button'

describe('Page Buttons', () => {
    it('Serialization', () => {
        const m : ButtonDescription = {
            type : "button",
            action : "/",
            text : "Nochmal",
            value : "repeat"
        }

        let b = new Button(m);
        expect(b.toModel()).toEqual(m);
    });
});
