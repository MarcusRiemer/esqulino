import {Page}                  from './page'

/**
 * Renders the abstract page representation to something that could be processed
 * by a server or possibly a browser. Currently there are only concrete plans to
 * implement a single renderer, but as esqulino attempts to allow easy and
 * meaningful exports of projects the rendering step is kept flexible.
 */
export abstract class Renderer {

    /**
     * Attempt to render the given page.
     */
    renderPage(page : Page) : string {
        return (this.renderImpl(page));
    }
    
    /**
     * The actual rendering process that needs to be implemented by
     * the deriving classes.
     */
    protected abstract renderImpl(page : Page) : string;

}
