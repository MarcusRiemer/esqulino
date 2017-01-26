import {Paragraph, ParagraphDescription}    from './paragraph'

describe('Page Paragraphs', () => {
    it('Serialization', () => {
        const m : ParagraphDescription = {
            type : "paragraph",
            text : "This is text"
        }

        let p = new Paragraph(m);
        expect(p.toModel()).toEqual(m);
    });

    it('Text changes', () => {
        const m : ParagraphDescription = {
            type : "paragraph",
            text : "This is text"
        }

        let p = new Paragraph(m);
    
        let hasChanged = false;
        p.modelChanged.subscribe(_ => hasChanged = true);
        
        p.text = "anders";
        expect(p.text).toEqual("anders");
        expect(hasChanged).toEqual(true, "Change not fired");
    });
});

