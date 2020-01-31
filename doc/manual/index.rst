BlattWerkzeug Manual
====================

This guide is mainly technical documentation for developers, system administrators or advanced users that want to develop their own language flavors inside BlattWerkzeug. It is *not* a guide for pupils or other end users that want to know how to program *using* BlattWerkzeug.

Contrary to "normal" compilers, BlattWerkzeug only operates on abstract syntax trees. Every code resource (``SQL``, ``HTML``, a regular expression, ...) that exists within BlattWerkzeug is, at its core, simply a syntaxtree. All operations that are described in this manual work with the syntaxtrees of these code resources in one way or another.


.. toctree::
   :caption: For Users

   concepts

.. toctree::
   :caption: For Language Creators

   ast
   grammar-by-example
   grammar
   grammar-builtin
   block-language

.. toctree::
   :caption: For Programmers

   project-structure
   compilation
   guidelines
   configuration
   seed-manager

.. toctree::
   :caption: Design Documents

   online-platform
   ast-grammar-design

.. toctree::
   :caption: Appendix

   schema/index
   glossary
