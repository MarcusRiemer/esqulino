Compilers & Programming Languages
=========================================

In order to allow the creation of easy to use block editors, BlattWerkzeug needs to define its own compilation primitives. The main reason for this re-invention the wheel is the focus of existing software: Usually compilers are focussed on speed and correctness, not necessarily a friendly representation for drag & drop mutations.

The Abstract Syntax Tree
-----------------------------------------

The syntax tree itself is purely a datastructure and has no concept of beeing "valid" or "invalid" on its own. It also has no idea how to it should "look like" in its compiled form. All additional functionality is provided by specialed tools that take the tree as an input.

A single node in the syntaxtree has at least a **type** that consists of two parts: A local ``typeName`` and a ``languageName``. This type is the premier way for different tools to decide how the node in question should be treated.

The ``languageName`` is essentially a namespace that allows the use of identical ``typeName``\ s in different contexts. This is useful when describing identical concepts in different languages:

* Programming languages have some concept of branching built in, usually with a keyword called ``if``. Using the ``languageName`` as a prefix, two languages like e.g. ``Ruby`` and ``JavaScript`` may both define their concept of branches using ``if`` as the ``typename``.
* Markup languages usually have a concept of "headings" that may exist on multiple levels. No matter whether the markup language in question is ``Markdown`` or ``HTML``, both may define their own concept of a ``heading`` in their own namespace.

The children of nodes have to be organised in so called **child categories**. Each of these categories has a name and may contain any number of children. This is a rather unusual implementation of syntaxtrees, but is beneficial to ease the implementation of the user interface.
  
Additionally nodes may define so called **properties** which hold atomic values in the form of texts or integers, but never in the form of child nodes. Each of these properties needs to have a name that is unique in the scope of the current node.

Syntaxtrees may be stored as ``JSON``-documents conforming to the following schema: :doc:`json-schema-syntaxtree`.

Example AST: ``if``-Statement
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Branches in programming languages (``if``) usually consist of three different children: Two different code paths that could be executed and a boolean expression that decides whether the positive or the negative branch should be taken. In BlattWerkzeug, an if statement would be represented by using three child groups that could be called ``predicate``, ``positive`` and ``negative``. Each of these child groups may then hast their own list of children.

This is a possible syntaxtree for an ``if`` statement in some nondescript language that could look like this::

  if (a > b)
    writeln('foo')
  else
    err(2, 'bar')
    
Note how the names of the variables and and the values are stored in properties alongside the node.

.. graphviz:: ast-example-if.graphviz

Validation & Grammars
-----------------------------------------

As syntaxtrees may define arbitrary tree structures, some kind of validation is necessary to ensure that certain trees conform to certain programming languages.

Emitting
-----------------------------------------

A valid syntax tree may be emitted in its "natural" representation.
