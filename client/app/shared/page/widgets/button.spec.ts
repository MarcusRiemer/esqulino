import {Button, ButtonDescription}  from './button'

describe('Page Buttons', () => {
    it('Serialization with action', () => {
        const m : ButtonDescription = {
            type : "button",
            text : "Nochmal",
            action : {
                mapping : [],
                queryName : "Test"
            }
        }

        let b = new Button(m, undefined);
        expect(b.toModel()).toEqual(m);
    });
    
    it('Serialization without action', () => {
        const m : ButtonDescription = {
            type : "button",
            text : "Nochmal",
            action : undefined
        }

        let b = new Button(m, undefined);
        expect(b.toModel()).toEqual(m);
    });
});
