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

    it('Text changes', () => {
        const m : HeadingDescription = {
            type : "heading",
            level : 1,
            text : "This is text"
        }
        
        let h = new Heading(m);
    
        let hasChanged = false;
        h.modelChanged.subscribe(_ => hasChanged = true);
        
        h.text = "anders";
        expect(h.text).toEqual("anders");
        expect(hasChanged).toEqual(true, "Change not fired");
    });

    it('Level changes', () => {
        const m : HeadingDescription = {
            type : "heading",
            level : 1,
            text : "This is text"
        }
        
        let h = new Heading(m);
    
        let hasChanged = false;
        h.modelChanged.subscribe(_ => hasChanged = true);

        // Actually dont change the level
        h.level = 1;
        expect(hasChanged).toEqual(false, "Change fired for same level");

        // Do change the level
        h.level = 2;
        expect(h.level).toEqual(2);
        expect(hasChanged).toEqual(true, "Change not fired");
    });
});
