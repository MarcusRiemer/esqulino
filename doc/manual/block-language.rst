===============
Block Languages
===============

Block Languages are generated from grammars and can be thought of as a visualisation function for syntaxtrees. Whilst the task of a grammar is to describe the structure of a tree, the task of a block language is to describe the visual representation.

BlattWerkzeug comes with different generators for (block) languages:

* A builtin block editor that closely resembles syntax highlighted source code.
* On the fly generated editors for `Googles Blockly <https://developers.google.com/blockly>`_.
* A text only output that can be used for code generation.

Design Choices, Hacks, Shortcomings and Caveats
===============================================

Some things about grammars and the visualisation are not exactly nice currently.

Virtual Root
------------

Blattwerkzeug assumes that a syntaxtree is actually a tree, not a forest. This is a great match for e.g. ``HTML`` where a document per definition also works with a single root node. But programs in some less fitting languages require the use of a "virtual" root node that has no intuitive meaning for the user. In the case of ``SQL``, this root node could define the general structure of a query like ``SELECT ... FROM ...``::

    node "sql"."querySelect" {
      children sequence "select" ::= select
      children sequence "from" ::= from
      children sequence "where" ::= where?
      children sequence "groupBy" ::= groupBy?
      children sequence "orderBy" ::= orderBy?
    }

There are of course alternative ways to model this. For ``SQL`` it would be possible to define ``FROM`` and the following clauses as children of the ``SELECT`` node. This doesn't change the semantics of the generated program, but it changes the semantics of the created block editor. With the modelling approach taken in the ``sql.querySelect`` example above, each of the components can be swapped out individually. If the ``SELECT`` node would have the other nodes as children, the ``SELECT`` component itself can not be removed without also removing the children.

This kind of modelling with a virtual root node is not excluisve to ``SQL``. For a typical imperative programming language this root node could define child categories for function definitions and the actual ``main`` program.

The builtin block language editor has a special workaround for virtual root nodes builtin. It allows multiple nodes to be defined when a single node is actually dragged, typically from the sidebar. For Blockly, these virtual blocks can not be meaningfully hidden because each block always has a visual representation, even if no terminal symbols are defined at all.

In Blockly this kind of modelling results in an undescripted and seemingly useless block.

.. figure:: examples/blockly/blockly-sql-virtual-root.png
   :scale: 40%

   Blockly: A visible virtual root block without description.

.. figure:: examples/builtin-editor/builtin-sql-virtual-root.png
   :scale: 40%

   Builtin Editor: A visible virtual root block without description.


Properties or Blocks
--------------------

Some nodes have properties that may occur either exactly once or optionally once. One prominent example for such a ``boolean`` property is the ``DISTINCT`` keyword in ``SQL``: It may be specified for a whole ``SELECT`` component or as part of a function call. There are different semantically equivalent but structurally different ways to model this in the grammar.

1. Use a ``boolean`` property directly on the ``SELECT`` component. This will be rendered as a checkbox by the backend and is therefore always visible in the block language.
2. Introduce an empty block type fot the ``DISTINCT`` keyword and allow this as a single occuring element in a childgroup. In that case the user needs to drop a dedicated block into a hole of the ``SELECT`` component.



Blockly Backend: (Inline) Values are not meant to be continued
--------------------------------------------------------------



Blockly Backend: All or none continuation
-----------------------------------------

Blockly defines compatible inputs and outputs on a per-block level, no matter the context. The outputs of a block also define their orientation (horizontal or vertical), which is not always compatible with BlockWerkzeug. In BlockWerkzeug a single type may be used in two different contexts. One example would be references to tables in ``SQL``.

The following snippet shows, how such a component could be modelled::

   node "sql"."from" {
     // First: One or more tables
     children sequence "tables" ::= tableIntroduction+
     // Afterwards: Sophisticated joins
     children sequence "joins" ::= innerJoinOn*
   }

   node "sql"."tableIntroduction" {
     prop "name" { string }
   }

   node "sql"."innerJoinOn" {
     children sequence "table" ::= tableIntroduction
     children sequence "on" ::= expression
   }

In this example the node ``sql.tableIntroduction`` may have nodes of the same type that follow it (when introducing multiple tables without sophisticated joins) but in the context of ``sql.innerJoinOn`` only a single node of that type is permitted. To the best of my knowledge this can't be expressed with a single type in Blockly.

Blockly Backend: All or none inline
-----------------------------------

Blockly allows values to be rendered as either "inline" or "external" inputs.

.. figure:: examples/blockly/blockly-inputs-inline-external.png

   Google Blockly example for internal and external inputs.
