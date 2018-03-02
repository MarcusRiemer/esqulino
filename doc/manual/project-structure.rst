===================
 Project Structure
===================

.. figure:: diagrams/project-structure.svg

  High-level overview about different client and server components.

At its core the project consists of two codebases:

* A Ruby-server that uses Rails (found under ``server``).
* A single page browser application that uses Typescript and Angular (found under ``client``).

But especially the client codebase is conditionally compiled into different output variants:

* The "typical" browser application. This is the code that handles the actual user interaction like drag & drop events.
* The "IDE Service" which consists of the core compiler structures. The same code is used on the server and the client to avoid roundtrips when making changes to the code.
* The "universal" application is basically a ``node.js``-compatible version of the browser application which can be run on the server. This is used to speed up initial page loading and to be at least a little bit SEO-friendly.

The actual data is stored in the database and the filesystem and separated into three different environments: ``production``, ``development`` and ``test``. No data is shared between these environments.


