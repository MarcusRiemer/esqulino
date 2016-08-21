import {Button, ButtonDescription}  from './button'

describe('Page Buttons', () => {
    it('Serialization with action', () => {
        const m : ButtonDescription = {
            type : "button",
            text : "Nochmal",
            action : {
                type : "query",
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

    it('Text changes', () => {
        const m : ButtonDescription = {
            type : "button",
            text : "Nochmal",
            action : undefined
        }

        let b = new Button(m, undefined);

        let hasChanged = false;
        b.modelChanged.subscribe(_ => hasChanged = true);
        
        b.text = "anders";
        expect(b.text).toEqual("anders");
        expect(hasChanged).toEqual(true, "Change not fired");
    });
});
