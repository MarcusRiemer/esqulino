.. _grammars-by-example:

=====================
 Grammars by Example
=====================

As syntaxtrees may define arbitrary tree structures, some kind of validation is necessary to ensure that certain trees conform to certain programming languages. The validation concept is losely based on ``XML Schema`` and ``RelaxNG``, the syntax of the latter is also used as the inspiration to describe the grammars in a user friendly textual representation.

.. _traditional_grammar:

The traditional approach
========================

A somewhat typical grammar to represent an ``if`` statement with an optional ``else``-statement in a nondescript language could look very similar to this:

.. productionlist::
   if        : 'if' <expr> 'then' <stmt> ['else' <stmt>]
   expr      : '(' <expr> <binOp> <expr> ')'
             : | <var_name>
             : | <val_const>
   expr_list : <expr>
             : | <expr> ',' <expr_list>
             : | ''
   stmt      : <var_name> = <expr>
             : | <var_name> '(' <expr_list> ')'

This approach works fine for typical compilers: They need to derive a syntax tree from any stream of tokens. It is therefore important to keep an eye on all sorts of syntactical elements. This comes with its very own set of problems:

1) The role of whitespace has to be specified.
2) Some separating characters have to be introduced very carefully. This is usually done using distinctive syntactic elements that are not allowed in variable names (typically all sorts of brackets and punctuation).
3) Handing out proper error messages for syntactically incorrect documents is hard. A single missing character may change the semantics of the whole document. This implies that semantic analysis is usually only possible on a syntactically correct document.


The BlattWerkzeug approach
==========================

But BlattWerkzeug is in a different position: It is not meant to create a syntax tree from some stream of tokens but rather begins with an empty syntax tree. This frees it from many of the problems that have been mentioned above:

1) There is no whitespace, only the structure of the tree.
2) There is no need for separation characters, only the structure of the tree.
3) Syntax errors equate to missing nodes and can be communicated very clearly. Semantic analysis does not need to rely on heuristics on how the tree could change if the "blanks" were filled in.

This entirely shifts the way one has to reason about the validation rules inside of BlattWerkzeug: There is no need to worry about the syntactic aspects of a certain language, the "grammar" that is required doesn't need to know anything about keywords or separating characters. Its sole job is to describe the structure and the semantics of trees that are valid in that specific language.

Example AST: ``if``-Statement
-----------------------------

The following example further motivates this reasoning. An if statement can be described in terms of its structure and the underlying semantics: It uses a ``predicate`` to distinguish whether execution should continue on a ``positive`` branch or a ``negative`` branch.

This is a possible syntaxtree for an ``if`` statement in some nondescript language that could look like this::

  if (a > b) then
    writeln('foo')
  else
    err(2, 'bar')

In BlattWerkzeug, an if statement could be represented by using three child groups that could be called ``predicate``, ``positive`` and ``negative``. Each of these child groups may then have their own list of children.

.. graphviz:: generated/ast-example-if.graphviz
   :align: center

Now lets see what happens if the source is invalidated by omitting the ``predicate`` and the ``then``::

  if
    writeln('foo')
  else
    err(2, 'bar')

In a typical language (tm) the most probable error would be something like "Invalid predicate: expression ``writeln('foo')`` is not of type ``boolean``" and "Missing keyword ``then``". But the chosen indentation somehow hints that using the call to `writeln` as a predicate was not what the author intended to do.

In BlattWerkzeug the predicate may be omitted without touching the ``positive`` or ``negative`` branch. It is therefore trivial to tell the user that he has forgotten to supply a predicate.

.. graphviz:: generated/ast-example-if-no-pred.graphviz
   :align: center

Grammar Examples
================

The following chapters give various examples of language grammars that could be used in BlattWerkzeug. They are meant to serve as meaningful tutorials, not as a thorugh documentation.

BlattWerkzeug uses its own grammar language that is very losely inspired by the `RelaxNG compact notation <http://relaxng.org/compact-tutorial-20030326.html>`_. The mental model however is very similar to typical grammars, but is strictly concerned with the structure of the syntaxtree. A BlattWerkzeug grammar consists of a name and multiple node definitions.

XML
---

In this example we will create a grammar that is able to describe ``XML`` like trees. Lets start with an almost empty grammar::

  grammar "ex1" {
    node "element" {
    }
  }

This grammer defines a language named ``ex1`` which allows a single node with the name ``element`` to be present in the syntax tree. This node may not have any children or properties, so the only valid syntaxtree would consist of a single node.

In order to allow nodes to be named, we introduce a ``property``::

  grammar "ex2" {
    node "element" {
      prop "name" { string }
    }
  }

The curly brackets for the property need to denote at least the type of the property, valid values are ``boolean``,  ``string`` and ``number``. The latter of these properties may be limited further, see the section :ref:`grammar_property_restrictions` for more details.

Multiple node definitions can be simply stated one after another as part of the ``grammar`` section::

  grammar "ex3" {
    node "element" {
      prop "name" { string }
    }
    node "attribute" {
      prop "name" { string }
      prop "value" { string }
    }
  }

Valid children of a node are defined via the ``children`` directive, a name and the corresponding "production rule". The production rule allows to specify sequences (using a space), alternatives (using a pipe "|") and "interleaving" (using the ampersand "&"). The mentioned elements can be quantified using the standard ``*`` (0 to unlimited), ``+`` (1 to unlimited) and ``?`` (0 or 1) multiplicity operators. This example technically defines two sequences "elements" and "attributes" that allow zero or more occurences of the respective entity::

  grammar "ex4" {
    node "element" {
      prop "name" { string }
      children "elements" ::= element*
      children "attributes" ::= attribute*
    }
    node "attribute" {
      prop "name" { string }
      prop "value" { string }
    }
  }

Grammar Visualization
=======================

So far we have seen how the structure of valid syntaxtrees can be defined with a grammar. The ``XML`` example however lacks all those pointy brackets that users associate with the language.

Hacks, Shortcomings and Caveats
===============================

Some things about grammars are not exactly nice currently.

Virtual Root
------------

Blattwerkzeug assumes that a syntaxtree is actually a tree, not a forest. Therefore quite a few documents require the use of a root node that has no intuitive meaning for the user. In the case of ``SQL``, this root node could define the general structure of a query: ``SELECT ... FROM ... WHERE ... GROUP BY ... ORDER BY`` or ``DELETE ... FROM ... WHERE``. For a typical imperative programming language this root node could provide child categories for function definitions and the actual ``main`` program.

The builtin block language works around this limitation by allowing multiple nodes to be defined when a single node is actually dragged. For Blockly, this fact can't be hidden.

Boolean Properties or Blocks
----------------------------

Sometimes nodes have more or less boolean properties, one prominent example is the ``DISTINCT`` keyword in ``SQL``: It may be specified for a whole ``SELECT`` component or as part of a function call.
