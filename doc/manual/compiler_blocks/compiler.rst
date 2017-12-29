===================================
 Compilers & Programming Languages
===================================

In order to allow the creation of easy to use block editors, BlattWerkzeug needs to define its own compilation primitives. The main reason for this re-invention the wheel is the focus of existing software: Usually compilers are focused on speed and correctness, not necessarily a friendly representation for drag & drop mutations.

Validation & Grammars
=====================

As syntaxtrees may define arbitrary tree structures, some kind of validation is necessary to ensure that certain trees conform to certain programming languages. The validation concept is losely based on ``XML Schema`` and ``RelaxNG``, the syntax of the latter is also used to describe the grammars in a user friendly textformat.

The traditional approach
------------------------

But lets take a look at the "traditional" approach first. A somewhat typical grammar to represent an ``if`` statement with an optional ``else``-statement in a nondescript language could look very similar to this:

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
2) Separating language constructs has to be carefully. This is usually done using distinctive syntactic elements that are not allowed in variable names (typically punctuation).
3) Handing out proper error messages for syntactically incorrect documents is hard.
4) As a single missing character may change the semantics of the whole document, semantic analysis is usually only possible on a syntactically correct document.
  

The BlattWerkzeug approach
--------------------------

But BlattWerkzeug is in a different position: It is not meant to create a syntax tree from some stream of tokens but rather begins with an empty syntax tree. This frees it from many of the problems that have been mentioned above:

1) There is no whitespace, only the structure of the tree.
2) There is no need for separation characters, only the structure of the tree.
3) Syntax errors equate to missing nodes and can be communicated very clearly.
4) Semantic analysis does not need to rely on heuristics on how the tree could change if blanks were filled in.

This entirely shifts the way one has to reason about the validation rules inside of BlattWerkzeug: There is no need to worry about the syntactic aspects of a certain language, the "grammar" that is required doesn't need to know anything about keywords or separating characters. Its sole job is to describe the structure and the semantics of valid trees.

An if statement can therefore be described in terms of its structure and the underlying semantics: An if statement uses a ``predicate`` to distinguish whether execution should continue on a ``positive`` branch or a ``negative`` branch.

Example AST: ``if``-Statement
-----------------------------

This is a possible syntaxtree for an ``if`` statement in some nondescript language that could look like this::

  if (a > b) then
    writeln('foo')
  else
    err(2, 'bar')

In BlattWerkzeug, an if statement would be represented by using three child groups that could be called ``predicate``, ``positive`` and ``negative``. Each of these child groups may then hast their own list of children. Note how the names of the variables and and the values are stored in properties alongside the node.

.. graphviz:: ast-example-if.graphviz

The Abstract Syntax Tree in detail
==================================

The syntax tree itself is purely a data structure and has no concept of being "valid" or "invalid" on its own. It also has no idea how to it should "look like" in its compiled form. All additional functionality is provided by specialized tools that take the tree as an input.

A single node in the syntaxtree has at least a **type** that consists of two parts: A local ``typeName`` and a ``languageName``. This type is the premier way for different tools to decide how the node in question should be treated.

The ``languageName`` is essentially a namespace that allows the use of identical ``typeName``\ s in different contexts. This is useful when describing identical concepts in different languages:

* Programming languages have some concept of branching built in, usually with a keyword called ``if``. Using the ``languageName`` as a prefix, two languages like e.g. ``Ruby`` and ``JavaScript`` may both define their concept of branches using ``if`` as the ``typename``.
* Markup languages usually have a concept of "headings" that may exist on multiple levels. No matter whether the markup language in question is ``Markdown`` or ``HTML``, both may define their own concept of a ``heading`` in their own namespace.

The children of nodes have to be organized in so called **child categories**. Each of these categories has a name and may contain any number of children. This is a rather unusual implementation of syntaxtrees, but is beneficial to ease the implementation of the user interface.
  
Additionally nodes may define so called **properties** which hold atomic values in the form of texts or integers, but never in the form of child nodes. Each of these properties needs to have a name that is unique in the scope of the current node.

Syntaxtrees may be stored as ``JSON``-documents conforming to the following schema: :doc:`../schema/index`.
             
Emitting
========

A valid syntax tree may be emitted in its "natural" representation.
