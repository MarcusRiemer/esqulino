=======================
 Programming Languages
=======================

As syntaxtrees may define arbitrary tree structures, some kind of validation is necessary to ensure that certain trees conform to certain programming languages. The validation concept is losely based on ``XML Schema`` and ``RelaxNG``, the syntax of the latter is also used to describe the grammars in a user friendly textformat.

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
2) Some eeparating language constructs have to be introduced very carefully. This is usually done using distinctive syntactic elements that are not allowed in variable names (typically all sorts of brackets and punctuation).
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

In BlattWerkzeug, an if statement would be represented by using three child groups that could be called ``predicate``, ``positive`` and ``negative``. Each of these child groups may then hast their own list of children. Note how the names of the variables and and the values are stored in properties alongside the node.

.. graphviz:: generated/ast-example-if.graphviz

Now lets see what happens if the source is invalidated by omitting the ``predicate`` and the ``then``::

  if
    writeln('foo')
  else
    err(2, 'bar')

In a typical language (tm) the most probable error would be something like "Invalid predicate: expression ``writeln('foo')`` is not of type ``boolean``" and ``Missing "then"``. The chosen indentation somehow hints that using the call to `writeln` as a predicate was not what the author intended.

In BlattWerkzeug the predicate may be omitted without touching the ``positive`` or ``negative`` branch. It is therefore trivial to tell the user that he has forgotten to supply a predicate.

.. graphviz:: generated/ast-example-if-no-pred.graphviz

Grammar Validation
==================

.. todo::

   Give an example for the ``if``-statement that has been used above.

BlattWerkzeug uses its own grammar language that is very losely inspired by the `RelaxNG compact notation <http://relaxng.org/compact-tutorial-20030326.html>`_. The mental model however is very similar to typical grammars, but is strictly concerned with the structure of the syntaxtree. A BlattWerkzeug grammar consists of a name and multiple node definitions::

  grammar "ex1" {
    node "element" {
    }
  }

This grammer defines a language named ``ex1`` which allows a single node with the name ``element`` to be present in the syntax tree. Allowed properties of nodes are defined as follows::

  grammar "ex2" {
    node "element" {
      prop "name" { string }
    }
  }

The curly brackets for the property need to denote at least the type of the property, valid values are ``string`` and ``number``. Both of these properties may be limited further, see the section :ref:`property_restrictions` for more details.

Multiple node definitions can be simply stated on after another as part of the ``grammar`` section::

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

.. _property_restrictions:

Property Restrictions
---------------------

.. _children_restrictions:

Children Restrictions
---------------------


Example Grammar: ``XML``
------------------------

.. literalinclude:: ./generated/dxml.grammar
   :language: javascript

Example Grammar: ``SQL``
------------------------

.. literalinclude:: ./generated/sql.grammar
   :language: javascript
