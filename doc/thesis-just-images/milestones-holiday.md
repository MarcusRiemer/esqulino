# Implementation

## General Hints

* Angulars `HTTP`-requests are observables and need to be `subscribed` in order to be executed. Each subscription results in a new `HTTP`-request, so some careful caching might be helpful.
* I have never worked with file uploads in Rails, but you will need a gem for that.

## Upload of images into projects

* Foundation is laid out in `image-upload.component.ts` on the client side. Actual upload code belongs into an `ImageService` with the appropriate schema definitions.
* Server needs to understand `multipart/form-data` messages.

## Presenting uploaded images inside of a project to a user
 
* `image-list.component.ts` should display images that belong to the current project. To retrieve the actual image metadata the `ImageService` should be used.

## Editing images, their metadata or deleting them

* No component lined out so far, create your own.

## Read-only image hierarchy

* Make some space for globally defined images and implement them using basically the same `JSON` files.
* Include some example images by placing the correct files in the correct places manually. There is no need for any kind of admin ui.
* Have some kind of "import" utility in projects that can access these images in the global namespace. When importing, the metadata will be carried over from the global definition to the project definition, but the actual image data shouldn't be copied.

## If there is time: Figure out database storage

* Image metadata should be stored in the database for projects. I suspect this will be a bumpy ride because of the following reasons:
  * Currently there is no database outside individual projects. So the "global storage" should probably remain a JSON file. This is of course at odds with the project storage, which would then be in a database.
  * Normalization will be an issue, but we ignore it for the moment. Simply create a single table in the project-space for all image metadata.

## To be done later: Integration with the HTML-rendering

* We will need to discuss this together.

# Describe the following things in your thesis

## Chapter 2: Related work

* I still have no idea where to describe docker, as it doesn't really fit with the overall theme of the thesis. Nevertheless the basic principles need to be described in this chapter.
* Briefly describe what esqulino / blattwerkzeug / "whatever it will be called in a few weeks" actually is
* Briefly describe how a REST-ful API works
* Briefly describe how rails works, according to the MVC principles.
* Briefly describe what Angular achieves (framework for single page applications, not too much details)

## Chapter 3: Requirements

* Describe the goal of the thesis: Pupils should be able to use their own or especially prepared images.
* Describe how images can come in two contexts: As static decoration (as in a header) or as dynamic assets that have a relationship to rows in a table.
* Describe how the set of required metadata was chosen on. Discuss every property we have chosen to include and maybe also name some things that we haven't included and tell the reader why they are missing. This will include some legal requirements and some practical "learning" requirements.
* For later: Describe how these things should be displayed on the page. Discuss ideas to give credits to authors (inline with images? as a list on the bottom of the page? maybe there is some standard for this?)

## Chapter 4: Implementation

* Describe all routes you had to implement on the server side
* Briefly show, possibly with screenshots, all client side components you have implemented.
* Showing too much code is not necessary, but do present interactions on a higher level. Graphs showing user interaction flows are always helpful ;)
