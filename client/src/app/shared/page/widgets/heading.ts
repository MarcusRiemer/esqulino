import {Page}                            from '../page'
import {HeadingDescription}              from '../page.description'
import {Widget, WidgetHost}              from '../hierarchy'

import {NumericalParameter}              from './parameters'

import {WidgetBase, WidgetDescription}   from './widget-base'

export {HeadingDescription}

/**
 * A heading. This widget directly maps the the HTML <h1> to <h6>
 * elements.
 */
export class Heading extends WidgetBase {
    private _text : string;
    private _level : number;
    
    constructor(desc : HeadingDescription, parent? : WidgetHost) {
        super({
            type : "heading",
            category : "widget",
            isEmpty : false,
            parameters : [
                new NumericalParameter({
                    name: "level",
                    getter: () => this.level,
                    setter: (v) => this.level = v
                }, 1, 6)
            ]
        }, parent);
        this._text = desc.text;
        this._level = desc.level;
    }

    /**
     * This describes a minimal Heading with localized text.
     *
     * TODO: Localize
     */
    static get emptyDescription() : HeadingDescription {
        return ({
            type : "heading",
            text : "Überschrift",
            level : 1
        })
    }

    /**
     * @return The level of this heading, always a number.
     */
    get level() : number {
        return (this._level);
    }

    /**
     * @param newLevel The new level to set.
     */
    set level(newLevel : number) {
        const oldLevel = this._level;
        
        // This is creepy ... The Angular 2 bindings may violate the
        // type system and then pass in a string to this method.
        // In order to ensure we *definetly* have a number in the end,
        // we convert the argument to something that must be a string
        // and read it back.
        this._level = parseInt("" + newLevel);

        if (this._level != oldLevel) {
            this.fireModelChange();
        }
    }

    /**
     * @return The text displayed by this heading
     */
    get text() {
        return (this._text);
    }
    
    /**
     * @param newText The text displayed by this heading
     */
    set text(newText : string) {
        if (this._text != newText) {
            this._text = newText;
            this.fireModelChange();
        }
    }

    protected toModelImpl() : WidgetDescription {
        const toReturn : HeadingDescription = {
            type : "heading",
            level : this._level,
            text : this._text
        }

        return (toReturn);
    }
}
