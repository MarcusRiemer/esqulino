import {Heading, HeadingDescription}    from './heading'

describe('Page Headings', () => {
    it('Serialization', () => {
        const m : HeadingDescription = {
            type : "heading",
            level : 1,
            text : "This is text"
        }

        let c = new Heading(m);
        expect(c.toModel()).toEqual(m);
    });
});
