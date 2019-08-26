===================================
 AST and Grammar Design Discussion
===================================

These are open (design) questions that should be answered by the thesis.

Structural and Visual Aspects
=============================

Currently the validation grammar and the visual grammar are stored in the same model. This is bad and must change, but whats a better approach?

Apart from beeing visually pleasing in its formal grammar representation it must also be meaningfully convertible in HTML. This sadly excludes the simplest possibility of simply inserting virtual linebreaks, `because this doesn't work nicely with CSS flexboxes <https://stackoverflow.com/questions/54239033/>`_, see `minimal_indent.html </_static/playground/minimal-indent.html>`_. for an example how this fails. A more or less straightforward HTML layout is proposed at `row-col.html </_static/playground/row-col.html>`_.

Example grammars (whithout visual aspects)
---------------------------------------------

* Can't be meaningfully transformed into a block language, terminal symbols are missing

.. code-block:: javascript

  grammar "xml_1" {
    node "xml"."element" {
      prop "name" { string }
      children "elements" ::= element*
      children "attributes" ::= attribute*
    }

    node "xml"."attribute" {
      prop "name" { string }
      prop "value" { string }
    }
  }

.. code-block:: javascript

  grammar "json_1" {
    typedef "json"."value" ::= string | number | boolean | object | array | null
    node "json"."string" {
      prop "value" { string }
    }
    node "json"."number" {
      prop "value" { integer }
    }
    node "json"."boolean" {
      prop "value" { boolean }
    }
    node "json"."object" {
      children allowed "values" ::= key-value*
    }
    node "json"."key-value" {
      children allowed "key" ::= string
      children allowed "value" ::= value
    }
    node "json"."array" {
      children allowed "values" ::= value*
    }
    node "json"."null" { }
  }

Example XML grammar (with terminal symbols, current state)c
-----------------------------------------------------------

* Helpful: Syntax-aspects of XML are now known to the block editor
* Terminal symbols not enough information to turn into a block language:
  * Missing structural information line breaks or "horizontal" / "vertical" layouts.
  * No possibility to define "separators" between children
* Therefore: ``children`` command adds ``seperator``

.. code-block:: javascript

  grammar "xml_2" {
    node "xml"."element" {
      terminal "tag-open-begin" "<"
      prop "name" { string }
      children "attributes" ::= attribute*
      terminal "tag-open-end" ">"
      children "elements" ::= element*
      terminal "tag-close" "<name/>"
    }

    node "xml"."attribute" {
      prop "name" { string }
      terminal "equals" "="
      terminal "quot-begin" "\"
      prop "value" { string }
      terminal "quot-end" "\""
    }
  }

Idea: Seperate definition for "Visual Grammar"
----------------------------------------------

* Is a visual grammar and must provide visualization for all instances of ``node`` mentioned in the visualized language.
* Adds a new type of command called ``block``
* Allows to interpolate properties using ``{{ }}``
* Inserts children using the ``{{#children}}`` directive.
* Problem: Nesting of ``row`` elements not straightforward.

.. code-block:: javascript

  grammar "xml_3" visualizes "xml_1" {
    block "xml"."attribute" {
      <row>{{name}}="{{value}}"</row>
    }

    block "xml"."element" {
      <row>&lt;{{name}}{{#children attributes, sep=" "}}&gt;</row>
      <indent>{{#children elements}}</indent>
      <row>&lt;{{name}}&gt;</row>
    }
  }

Merging grammars
----------------

Sometimes languages are interweaved with one another, especially on the: ``HTML`` may contain ``CSS`` and ``JavaScript``, many languages allow embedded ``JSON`` structures. It would possibly save lots of effort to allow grammars to be combined, e.g. to use the same ``CSS`` and ``JavaScript`` grammars that are already provided when describing ``HTML``.

On a fundamental level, the grammars and the syntaxtrees have already been designed with this merging in mind: The ``language`` namespace is part of all definitions. The tricky part is the actual connection: How do we

Linked Trees
============

References between code fragments happen all the time: ``HTML`` documents reference ``CSS`` stylesheets, ``JavaScript`` files or other ``HTML`` documents, ``Ruby`` code ``requires`` other files, ``C`` loads them using ``#include`` ... The same should be possible with syntaxtrees in a hopefully generic manner, so that all block editors can either display the referenced resource inline or at least allow navigation to it.

Drop Target Resolution
======================

* Each ``block`` introduces a new drop target, dropping something on it could mean "insert in here" or "append here".

  * Especially tricky with constructs like ``if`` were both operations are sensible.

* Current default:

  * Dropping on a block prioritizes the "append" operation, insertion happens only on demand
    * Great for ``SELECT`` of ``SQL``: Children have different type then siblings
  * ``children`` introduce drop targets, may or may not be allowed to be empty

Implemented drop strategies
---------------------------

``allowExact``
  Allows a drop if the given drop location allows the insert, great (and default) for purposefully inserted drop markers.
``allowEmbrace``
  Allow the dropped thing to "embrace" the node at the given location, effectively replacing it. This is great for things like parentheses and unary or binary expressions, but can lead to bad conflicts with e.g. function calls (which are of course the general case of unary or binary expressions).
``allowReplacement``
  Allow the dropped thing to take the place of the node at the given deletion, effectively deleting it. This is useful if a location is a hole of length 1, e.g. replacing is the only syntactically sound option.
``allowAppend``
  Treat the drop as if it happened somewhere after the drop location (on a sibling level, not the child level). This is basically the default behavior of almost any visual and it is useful for lists of statements in imperative programming languages or lists of tables in SQL or lists of list items in JSON, ...
``allowAnyParent``
  Walks up the tree and checks all child groups of each parent whether an insertion would be possible. This is helpful in quite strongly typed grammars. In the current implementation of SQL it e.g. allows to drop the ``SQL`-components (``SELECT``, ``FROM``, ``WHERE``, ``GROUP BY``, ...) virtually anywhere, because there is exactly one meaningful place that they could fit. In less strictly typed grammars this is probably not as useful.

Common drop problems and ambiguities
------------------------------------

Appending vs Embracing in expressions in Lists
  If a non-leaf expression appears in a list of expressions, dropping something on that expression could mean ``append`` (add a new expression afterwards), ``embrace`` (e.g. negating the expression) or ``insertAtChild`` (e.g. adding a function call argument). The last option is not currently implemented as a strategy, because children are inserted using holes and ``allowExact``. This strategy gets tricky however if e.g. a function (like ``COUNT`` in ``SQL`` or every function call in ``JavaScript``) can take any number of arguments. The ambiguity regarding this can be reduced with a stronger type system.

Missing root nodes
  Synthetic nodes are a tricky thing to display, but are usually required at the root level. The "visual" roots of an ``SQL`` statement are either ``SELECT``, ``INSERT``, ``UPDATE`` or ``DELETE``, but these components are actually child nodes of an ``querySelect``, ``queryInsert``, ... But the user doesn't want to drop those synthetic nodes ever, so there are two possibilities:

    1. Create the synthetic root node together with the tree and never allow the user to change or delete it.
    2. Don't actually drop a single node, but offer a list of semantically equivalent options.

  Option #2 is what is currently implemented. When e.g. a ``SELECT`` component is dragged from the sidebar, two trees are actually tested for dropping: Nothing but the ``SELECT`` node or the ``SELECT`` node wrapped in the synthetic ``querySelect`` root node.

Type changes on dragging
  Dragging e.g. a function definition into a statement could be interpeted as "call this function". This however requires a change of the dragged type. The same happens in ``SQL`` when dragging a named expression from the ``SELECT`` component: The user probably doesn't want to insert ``<expr> as <name>`` into the ``GROUP BY`` component, but reference ``<name>`` there.

Dealing with ambiguity
----------------------

Combing the drop strategies mentioned above may result in more then a single operation that could be carried out. It is probably not possible in all cases to resolve every ambiguity automatically, so this requires at least a nice UI.

* A simple but sort of "brutal" version would be to simply show a modal popup with all alternatives. The minimal implementation of this is very straightforward, as the validation process generates trees for all strategies anyway. Quite a lot nicer would be a "diff" of the trees and then only the subsequent display of differences to chose from.
* A possibly nicer version would be to leave "drop ghosts" in the tree: Instead of a single proper node, multiple feint 'ghost node' are inserted into the tree. These nodes require one more user interaction (e.g. a click) to actually be manifested into a proper node. This manifestations also removes all other ghosts that could possibly have been inserted, the user has therefor cleared up the ambiguity.
