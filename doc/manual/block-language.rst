Block Languages
===============

Block Languages are built with specific grammars in mind and can be thought of as an "representation layer" for syntaxtrees. Whilst the task of a grammar is to describe the structure of a tree, the task of a block language is to describe the visual representation. It does this via its own meta-description that may be either generated and maintained by hand or automatically generated from a grammar and some generation instructions.

This section of the manual initially describes the widgets that are available to represent a specific syntax tree. It then continues to describe how meaningful block languages may be automatically generated from a grammar.

Available widgets
-----------------

The formal definition of the available widgets is part of the Typescript-namespace ``VisualBlockDescriptions``. All available widgets are defined as a ``JSON``-object that must at least define the ``blockType``.

Additionally every widget may be styled using arbitrary ``DOM``-properties using the optional ``style``-object. The given properties will be applied directly to the given ``DOM``-nodes, there is currently no support for "real" ``CSS``.

Constant
~~~~~~~~

Displays a constant value in the editor. This is meant to be used for keywords or keyword-like delimiters that may never be edited by the user. Constants are routinely meant to be styled with regards to their text colour and similar textual properties.

.. code-block:: json

   {
     "blockType": "constant",
     "text": "FROM",
     "style": {
       "color": "#0000ff",
       "width": "9ch",
       "display": "inline-block"
     }
   }

.. figure :: screenshots/sql-blocks-constants.png

  Constants in the ``SQL`` language

Interpolated Values
~~~~~~~~~~~~~~~~~~~

Displays a property of a node that is represented in its block form. Although the result looks pretty much like a constant text on the outside, the value that is actually displayed will be determined depending on the syntaxtree that is loaded.

.. graphviz:: generated/ast-sql-column-name.graphviz
   :align: center
   :caption: Tree to visualize

.. code-block:: json

   {
     "blockType": "interpolated",
     "property": "columName"
   }

.. figure :: screenshots/sql-blocks-interpolated.png

  Interpolated values in the ``SQL`` language

Editable Values
~~~~~~~~~~~~~~~

This property works almost like an interpolated value: It displays the value of a property. But if the user clicks the value an editor is opened.

.. code-block:: json

   {
     "blockType": "input",
     "property": "columName"
   }

.. figure :: screenshots/sql-blocks-input.png

  Editing a value

Blocks
~~~~~~

The actual blocks have no default appearance of their own but they may define child widgets that should be rendered. These blocks usually correspond to distinct types in grammars.

Iterating over children
~~~~~~~~~~~~~~~~~~~~~~~

So far every presented widget worked on atomic properties of a node. Child groups are rendered using an iterator which specifies the name of the child group to render.

Block Language Generation
-------------------------

Although it is possible to create block languages by hand, this approach does not scale too nicely with the idea of dynamically restricted programming environments. It would mean that e.g. different variants of ``SQL`` (that all share a common grammar) would require loads of duplicated effort to maintain.



