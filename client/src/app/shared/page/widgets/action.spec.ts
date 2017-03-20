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
    it ('Serialization without any references', () => {
        const m : NavigateActionDescription = {
            type : "navigate"
        }

        let a = new NavigateAction(undefined, m);
        expect(a.isInternal).toEqual(false);
        expect(a.isExternal).toEqual(false);
        expect(a.toModel()).toEqual(m);
    });

    
    it ('Serialization with internal reference', () => {
        let w : Widget = {
            type : "Mock",
            category : "structural",
            isEmptyElement : true,
            parent : undefined,
            page : undefined,
            toModel : () => this,
            parameters : []
        }
        
        const m : NavigateActionDescription = {
            type : "navigate",
            internal : {
                pageId : "12",
                parameters : [{ parameterName : "foo", providingName : "bar" }]
            }
        }

        let a = new NavigateAction(w, m);
        expect(a.isInternal).toEqual(true);
        expect(a.isExternal).toEqual(false);
        expect(a.toModel()).toEqual(m);
    });

    it ('Serialization with external reference', () => {
        const m : NavigateActionDescription = {
            type : "navigate",
            external : "http://thedailywtf.com/articles/the-inner-json-effect"
        }

        let a = new NavigateAction(undefined, m);
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
            toModel : () => this,
            parameters : []
        }
        
        const m : NavigateActionDescription = {
            type : "navigate",
            internal : {
                pageId : "12",
                parameters : [{ parameterName : "foo", providingName : "bar" }]
            }
        }

        let a = new NavigateAction(w, m);
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

        expect( () => new NavigateAction(undefined, m)).toThrowError();
    });
});
