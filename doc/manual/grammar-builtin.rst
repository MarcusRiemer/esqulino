==================
 Builtin Grammars
==================

These grammars are currently shipped with the project.

``SQL``
-------

Basic ``SQL`` as it is teached in most schools, no support for all sorts of imperative constructs.

.. literalinclude:: ./generated/sql.grammar
   :language: javascript

Trucklino Program
-----------------

The "Truck Programming Language", first described in the Bachelors Thesis of Sebastian Popp.

.. literalinclude:: ./generated/trucklino-program.grammar
   :language: javascript

``JSON``
--------

This grammar is based upon the formal grammar definition found at `json.org <https://www.json.org>`_. It mimics the exact same structure but does not bother with whitespace.

.. literalinclude:: ./generated/json.grammar
   :language: javascript

``CSS``
-------

Definition of ``CSS`` stylesheets, which are basicly a set of rules which in turn are defined by selectors and declarations.

.. literalinclude:: ./generated/css.grammar
   :language: javascript


Dynamic ``XML``
---------------

.. literalinclude:: ./generated/dxml.grammar
   :language: javascript
