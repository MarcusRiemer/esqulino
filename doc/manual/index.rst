.. BlattWerkzeug documentation master file, created by
   sphinx-quickstart on Fri Dec  1 09:01:54 2017.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

   
BlattWerkzeug Manual
=========================================

This guide is mainly technical documentation for developers, system administrators or advanced users that want to develop their own language flavors inside BlattWerkzeug. It is *not* a guide for pupils or other end users that want to know how to program *using* BlattWerkzeug.

Contrary to "normal" compilers, BlattWerkzeug only operates on abstract syntax trees. Every code resource (``SQL``, ``HTML``, a regular expression, ...) that exists within BlattWerkzeug is, at its core, simply a syntaxtree. All operations that are described in this manual work with the syntaxtrees of these code resources in one way or another.


.. toctree::
   
   concepts
   ast
   grammar
   language-model
   compilation
   configuration
   glossary
   schema/index
