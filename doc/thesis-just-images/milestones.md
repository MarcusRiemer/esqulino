# An foundation for image handling

The aim of this thesis is to describe and implement a foundation to work with images. As the whole project has an educational and classroom context, some additional restrictions apply:

* Images are not simply blobs of data, they have been (potentially tediously) handcrafted by authors, artists and photographers. These people must be properly credited. Possibly it would also be very meaningful to incorparate explicite licensing information.
* Images are not simply blobs of data, they show specific things, are taken at specific places, tell interesting stories, ... It must therefore be possible for pupils to add all kinds of annotations to images in their own schema.
* Images are possibly large blobs of data, that need to be properly deduplicated to make sure that they do not take up more space then actually needed.

# Roadmap

This roadmap describes a possible path that could be taken to get image handling working. The path described here aims to touch all parts necessary as soon as possible. This means the initial outcome is a (more or less) rough prototype, not a complete product.

## Making global images available

* Server: Implement an endpoint to retrieve a list of available images that are organised in some sort of categories. For the first implementation the server may simply return a `JSON`-document with a meaningful structure from memory or read it from a file.
* Server: Implement an endpoint to retrieve a single image. This endpoint exists in two variants, one for the "global" image repository and one for a specific project. If a specific project does not contain the required image it transparently checks the global repository.

## Embedding images in projects

* Concept: Come up with a table-layout to describe images.
* Server: Add a project-specific endpoint to import images from the global repository into the local images table.
* Server: Add a project-specific endpoint to upload new images and add a reference to the local images table.
* Client: Create an UI for the server endpoints mentioned above.

