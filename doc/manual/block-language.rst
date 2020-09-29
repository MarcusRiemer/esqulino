Block Languages
===============

Block Languages are generated from grammars and can be thought of as a visualisation function for syntaxtrees. Whilst the task of a grammar is to describe the structure of a tree, the task of a block language is to describe the visual representation.

BlattWerkzeug comes with different generators for (block) languages:

* A builtin block editor that closely resembles syntax highlighted source code.
* On the fly generated editors for `Googles Blockly <https://developers.google.com/blockly>`_.
* A text only output that can be used for code generation.

Blockly Backend
---------------

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