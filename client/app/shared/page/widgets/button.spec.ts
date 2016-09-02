import {Page, PageDescription}      from '../page'

import {Button, ButtonDescription}  from './button'

const pageModel : PageDescription = {
    id : "1",
    name: "Button Page Model",
    apiVersion : "3",
    body : {
        type : "body",
        children : [
            
        ]
    }
}

describe('Page Buttons', () => {
    it('Serialization without action', () => {
        const p = new Page(pageModel);
        
        const m : ButtonDescription = {
            type : "button",
            text : "Nochmal"
        }

        let b = new Button(m, p.body);
        expect(b.toModel()).toEqual(m);
    });

    it('Text changes', () => {
        const p = new Page(pageModel);
        
        const m : ButtonDescription = {
            type : "button",
            text : "Nochmal"
        }

        let b = new Button(m, p.body);

        let hasChanged = false;
        b.modelChanged.subscribe(_ => hasChanged = true);
        
        b.text = "anders";
        expect(b.text).toEqual("anders");
        expect(hasChanged).toEqual(true, "Change not fired");
    });
});
