import {Paragraph, ParagraphDescription}    from './paragraph'

describe('Page Paragraphs', () => {
    it('Serialization', () => {
        const m : ParagraphDescription = {
            type : "paragraph",
            text : "This is text"
        }

        let c = new Paragraph(m);
        expect(c.toModel()).toEqual(m);
    });
});

