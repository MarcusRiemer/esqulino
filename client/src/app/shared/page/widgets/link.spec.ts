import {Link, LinkDescription}    from './link'

describe('Page Links', () => {
    it('Serialization & representation with internal reference', () => {
        const m : LinkDescription = {
            type : "link",
            text : "This is text",
            action : {
                type : "navigate",
                internal : {
                    pageId : "12",
                    parameters : []
                }
            }
        }

        let l = new Link(m);
        expect(l.toModel()).toEqual(m);
    });

    it('Serialization & representation with external reference', () => {
        const m : LinkDescription = {
            type : "link",
            text : "This is text",
            action : {
                type : "navigate",
                external: "http://thedailywtf.com/articles/Disgruntled-Bomb-Java-Edition"
            }
        }

        let l = new Link(m);
        expect(l.toModel()).toEqual(m);
    });

    it('Text changes', () => {
        const m : LinkDescription = {
            type : "link",
            text : "This is text",
            action : {
                type : "navigate",
                internal : {
                    pageId : "12",
                    parameters : []
                }
            }
        }

        let l = new Link(m);
    
        let hasChanged = false;
        l.modelChanged.subscribe(_ => hasChanged = true);
        
        l.text = "anders";
        expect(l.text).toEqual("anders");
        expect(hasChanged).toEqual(true, "Change not fired");
    });
});

