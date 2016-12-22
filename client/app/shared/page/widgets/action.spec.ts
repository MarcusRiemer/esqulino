import {
    NavigateAction, NavigateActionDescription,
} from './action'

import {
    Widget
} from '../hierarchy'

import {
    Page
} from '../page'

describe('Page NavigateAction', () => {
    it ('Serialization with internal reference', () => {

        let w : Widget = {
            type : "Mock",
            category : "structural",
            isEmptyElement : true,
            parent : undefined,
            page : undefined,
            toModel : () => this 
        }
        
        const m : NavigateActionDescription = {
            type : "navigate",
            internal : {
                pageId : "12",
                parameters : [{ parameterName : "foo", providingName : "bar" }]
            }
        }

        let a = new NavigateAction(m, w);
        expect(a.isInternal).toEqual(true);
        expect(a.isExternal).toEqual(false);
        expect(a.toModel()).toEqual(m);
    });

    it ('Serialization with external reference', () => {
        const m : NavigateActionDescription = {
            type : "navigate",
            external : "http://thedailywtf.com/articles/the-inner-json-effect"
        }

        let a = new NavigateAction(m, undefined);
        expect(a.isInternal).toEqual(false);
        expect(a.isExternal).toEqual(true);
        expect(a.toModel()).toEqual(m);
    });

    it ('URL generation for internal URLs', () => {
        // Sadly this can't quite be tested yet, a full project
        // would be required.
        let w : Widget = {
            type : "Mock",
            category : "structural",
            isEmptyElement : true,
            parent : undefined,
            page : undefined,
            toModel : () => this 
        }
        
        const m : NavigateActionDescription = {
            type : "navigate",
            internal : {
                pageId : "12",
                parameters : [{ parameterName : "foo", providingName : "bar" }]
            }
        }

        let a = new NavigateAction(m, w);
        expect(() => a.targetUrl).toThrowError(); // .toEqual("/12?foo=bar");
    });

    it('Invalid: Action with internal and external reference', () => {
        const m : NavigateActionDescription = {
            type : "navigate",
            external : "http://thedailywtf.com/articles/Directive-595",
            internal : {
                pageId : "13",
                parameters : []
            }
        }

        expect( () => new NavigateAction(m, undefined)).toThrowError();
    });

    it('Changes type when switching between internal and external', () => {
        const m : NavigateActionDescription = {
            type : "navigate",
            external : "http://thedailywtf.com/articles/Disgruntled-Bomb-Java-Edition"
        }

        // Start with an external action
        let a = new NavigateAction(m, undefined);
        expect(a.isExternal).toEqual(true);
        expect(a.isInternal).toEqual(false);

        // Stay external
        a.externalUrl = "http://elsewhere";
        expect(a.isExternal).toEqual(true);
        expect(a.isInternal).toEqual(false);

        // Go internal
        a.internalPageId = "123";
        expect(a.isExternal).toEqual(false);
        expect(a.isInternal).toEqual(true);

        // Stay internal
        a.internalPageId = "1234";
        expect(a.isExternal).toEqual(false);
        expect(a.isInternal).toEqual(true);

        // Go external
        a.externalUrl = "http://elsewhere";
        expect(a.isExternal).toEqual(true);
        expect(a.isInternal).toEqual(false);
    })
});
