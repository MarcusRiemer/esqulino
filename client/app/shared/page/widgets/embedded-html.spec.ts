import {EmbeddedHtml, EmbeddedHtmlDescription}    from './embedded-html'

describe('Page Embedded HTML', () => {
    it('Serialization', () => {
        const m : EmbeddedHtmlDescription = {
            type : "embedded-html",
            html : "<test></test>"
        }

        let h = new EmbeddedHtml(m);
        expect(h.toModel()).toEqual(m);
    });

    it('HTML changes', () => {
        const m : EmbeddedHtmlDescription = {
            type : "embedded-html",
            html : "<test></test>"
        }

        let h = new EmbeddedHtml(m);
    
        let hasChanged = false;
        h.modelChanged.subscribe(_ => hasChanged = true);
        
        h.html = "anders";
        expect(h.html).toEqual("anders");
        expect(hasChanged).toEqual(true, "Change not fired");
    });
});

