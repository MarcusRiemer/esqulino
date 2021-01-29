.. _abstract-syntax-tree:

The Abstract Syntax Tree
========================

In order to allow the creation of easy to use block editors, BlattWerkzeug defines its own compilation primitives (syntaxtrees, grammars & validators). The main reason for this re-invention the wheel is the focus of existing software: The syntaxtrees of conventional compilers (like ``gcc``, ``llvm``, ``javac``, ...) are focused on speed and correctness, and not a friendly representation for drag & drop mutations.

BlattWerkzeug instead focuses exclusively on working with a syntaxtree that lends itself well to be (more or less) directly presented to the end user. Typical compiler tasks that have to do with lexical analysis or parsing are not relevant for BlattWerkzeug.

There are of course other block language tools out there, most notably `Google Blockly <https://developers.google.com/blockly>_` which is the basis for many other Tools such as `Scratch <https://scratch.mit.edu/>`_, the `Roberta Robotics Initiative <https://www.roberta-home.de/>`_ or as another Block-Backend for BlattWerkzeug itself. The issue with especially the Blockly representation is that it strongly mixes visual and code generation aspects with the language definitions.

Data Structure
--------------

The syntax tree itself is purely a data structure and has no concept of being "valid" or "invalid" on its own (this is the task of validators). It also has no idea how to it should "look like" in its block form (this is the task of block languages) or textual representation (this is the task of code generators).

A single node in the syntaxtree has at least a **type** that consists of two strings: A local ``name`` and a ``language``. This type is the premier way for different tools to decide how the node in question should be treated.

The ``language`` is essentially a namespace that allows the use of identical ``name``\ s in different contexts. This is useful when describing identical concepts in different languages:

* Programming languages have some concept of branching built in, usually with a keyword called ``if``. Using the ``language`` as a prefix, two languages like e.g. ``Ruby`` and ``JavaScript`` may both define their concept of branches using ``if`` as the ``name``.

* Markup languages usually have a concept of "headings" that may exist on multiple levels. No matter whether the markup language in question is ``Markdown`` or ``HTML``, both may define their own concept of a ``heading`` in their own namespace.

Nodes may define so called **properties** which hold atomic values in the form of texts or integers, but never in the form of child nodes. Each of these properties needs to have a name that is unique in the scope of the current node.

The children of nodes have to be organized in so called **child groups**. Each of these groups has a name and contains any number of subtrees. This is a rather unusual implementation of syntaxtrees, but is beneficial to ease the implementation of the user interface.

The resulting structure has a strong resemblance to an ``XML``-tree, but instead of grouping all children in a single, implicit scope, they are organised into their own-subtrees.

``JSON``-representation and datatype definition
-----------------------------------------------

In terms of Typescript-Code, the syntaxtree is defined like this:

.. literalinclude:: code/syntaxtree.ts
   :language: typescript
   :linenos:

Lines 2 - 3: The type of the node
  As mentioned earlier: Both of these strings are mandatory.

Lines 4 - 6: Optional child categories
  A dictionary that maps string-keys to lists of other nodes.

Lines 7 - 9: Optional properties
  A dictionary that maps string-keys to atomic values, which are always stored as a string.

Syntaxtrees may be stored as ``JSON``-documents conforming to the following schema (which was generated out of the ``interface``-definition above): :doc:`../schema/index`.


Visual & textual examples
-------------------------

The following examples describe one approach of how expressions could be expressed using the described structure. This series of examples is meant to introduce a visual representation of these trees and was chosen to show interesting tree constellations. It depicts a valid way to express expressions, but this approach is by no means the only way to do so!

The simplest tree consists of a single, empty node. You can infer from its name that it is probably meant to represent the ``null``-value of any programming language.

.. literalinclude:: examples/syntaxtree/ast-example-null.json

.. graphviz:: generated/ast-example-null.graphviz
   :align: center
   :caption: Expression ``null``

Properties of nodes are listed inside the node itself. The following tree corresponds to an expression that simply consists of a single variable named ``numRattles`` that is mentioned.

.. literalinclude:: examples/syntaxtree/ast-example-expr-variable.json

.. graphviz:: generated/ast-example-expr-variable.graphviz
   :align: center
   :caption: Expression ``numRattles``

Children of trees are simply denoted by arrows that are connecting them. They are grouped into named boxes that define the name of the child group in which they appear in. So the following tree represents a binary expression that has two child groups (``lhs`` for "left hand side" and ``rhs`` for "right hand side") and defines the used operation with the property ``op``. Each child group contains a sub-tree of its own and technically any node may have any number of disjoint subtrees.

.. literalinclude:: examples/syntaxtree/ast-example-expr-binary.json

.. graphviz:: generated/ast-example-expr-binary.graphviz
   :align: center
   :caption: Expression ``numRattles == null``
