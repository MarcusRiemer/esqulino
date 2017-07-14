import { browser, element, by } from 'protractor'

describe('Editor', () => {
  const testProjectId = "test";
  const editorUrl = `/editor/${testProjectId}/`;

  // Some link to a page without a sidebar
  const someNoSidebarLink = element(by.css("ul.nav:nth-child(1) > li:nth-child(1) > a:nth-child(1)"));

  // Some editable query or page (has a sidebar)
  const someQueryLink = element(by.css(".nav-query > li:nth-child(3) > a:nth-child(1)"));
  const somePageLink = element(by.css(".nav-page > li:nth-child(1) > a:nth-child(1)"));

  const sidebarContainer = element(by.css("div.sidebar"));

  const msgErrPresent = "Sidebar shouldn't be present";
  const msgErrMissing = "Sidebar should be present";

  /*
    TODO: Fix problem with toBeTruthy() return values
    Error at /home/marcus/projects/scratch-sql/client/e2e/editor/sidebar.ts:22:14: Argument of type '() => Promise<void>' is not assignable to parameter of type '(value: any) => void | IThenable<void>'.
      Type 'Promise<void>' is not assignable to type 'void | IThenable<void>'.
        Type 'Promise<void>' is not assignable to type 'IThenable<void>'.
   */
  
  it(`doesn't break when navigation toggles the sidebar visibility`, () => {    
    // We start with a page that does not have a sidebar
    browser.get(editorUrl)
      .then( () => expect(sidebarContainer.isPresent()).toBeFalsy(`1: ${msgErrPresent}`) as any)
    // Navigate to a QueryEditor (it has a sidebar)
      .then( () => someQueryLink.click())
      .then( () => browser.waitForAngular() )
      .then( () => expect(sidebarContainer.isPresent()).toBeTruthy(`2: ${msgErrMissing}`) as any)
    // Navigate back to a page without a sidebar
      .then( () => someNoSidebarLink.click())
      .then( () => browser.waitForAngular() )
      .then( () => expect(sidebarContainer.isPresent()).toBeFalsy(`3: ${msgErrPresent}`) as any)
    // Navigate to a PageEditor (which also has a sidebar)
      .then( () => somePageLink.click() )
      .then( () => browser.waitForAngular() )
      .then( () => expect(sidebarContainer.isPresent()).toBeTruthy(`4: ${msgErrMissing}`) as any)
    ;
  });
});
