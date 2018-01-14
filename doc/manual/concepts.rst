***************
 Core Concepts
***************

Conventional development environments are programs that are tailored to suit the needs of professionals. Due to their complexity they do not lend themselves well to introduce pupils to programming. BlattWerkzeug is a tool that is geared towards "serious learners" and is intended to be used with support from teachers or some similar form of supervision.

To eliminate the possibility of syntactical errors while programming, the elements of the programming- or markup-languages are represented by graphical blocks, similar to the approach taken by the software `Scratch <https://scratch.mit.edu/>`_. These blocks can be combined by using drag & drop operations.

The creation or adaption of existing block languages languages should be "easy", at least for the targeted audiences: Programmers with a background in compiler construction should "easily" be able to add new languages and teachers with a little bit of programming experience should "easily" be able to tweak existing languages to their liking.

Projects
========

All work in BlattWerkzeug is done in the scope of so called "projects". Projects are the main category of work and have at least a name and a user friendly description. Apart from that they bundle together various resources and assets such as databases, images and code.

Code Resources
--------------

At the very core, there are three different structures involved when a code resource is edited with a block editor:

* The abstract syntax tree represents the structure of the code that is edited.
* The selected programming language controls how the syntaxtree is validated and compiled.
* The selected language model controls how blocks used in a syntaxtree are layouted and which blocks are available in the sidebar.

Block Languages
===============

BlattWerkzeug allows advanced users to come up with their own block programming languages. Per default it comes with a variety of different languages enabled, that currently focus on web development and databases.

SQL
---

HTML
----

Definition of Programming Languages
===================================

In order to allow the creation of easy to use block editors, BlattWerkzeug needs to define its own compilation primitives. The main reason for this re-invention the wheel is the focus of existing software: Usually compilers are focused on speed and correctness, not necessarily a friendly representation for drag & drop mutations.

BlattWerkzeug instead focuses exclusively on working with a syntaxtree that lends itself well to be (more or less) directly presented to the end user. Typical compiler tasks that have to do with lexical analysis or parsing are not relevant for BlattWerkzeug.