The Abstract Syntax Tree
========================

In order to allow the creation of easy to use block editors, BlattWerkzeug needs to define its own compilation primitives (syntaxtrees, grammars & validators). The main reason for this re-invention the wheel is the focus of existing software: Usually compilers are focused on speed and correctness, not necessarily a friendly representation for drag & drop mutations. BlattWerkzeug instead focuses exclusively on working with a syntaxtree that lends itself well to be (more or less) directly presented to the end user. Typical compiler tasks that have to do with lexical analysis or parsing are not relevant for BlattWerkzeug.

The syntax tree itself is purely a data structure and has no concept of being "valid" or "invalid" on its own (this is the task of validators). It also has no idea how to it should "look like" in its compiled form (this is the task of block languages).

A single node in the syntaxtree has at least a **type** that consists of two parts: A local ``typeName`` and a ``languageName``. This type is the premier way for different tools to decide how the node in question should be treated.

The ``languageName`` is essentially a namespace that allows the use of identical ``typeName``\ s in different contexts. This is useful when describing identical concepts in different languages:

* Programming languages have some concept of branching built in, usually with a keyword called ``if``. Using the ``languageName`` as a prefix, two languages like e.g. ``Ruby`` and ``JavaScript`` may both define their concept of branches using ``if`` as the ``typename``.
* Markup languages usually have a concept of "headings" that may exist on multiple levels. No matter whether the markup language in question is ``Markdown`` or ``HTML``, both may define their own concept of a ``heading`` in their own namespace.

The children of nodes have to be organized in so called **child categories**. Each of these categories has a name and may contain any number of children. This is a rather unusual implementation of syntaxtrees, but is beneficial to ease the implementation of the user interface.

Additionally nodes may define so called **properties** which hold atomic values in the form of texts or integers, but never in the form of child nodes. Each of these properties needs to have a name that is unique in the scope of the current node.

Syntaxtrees may be stored as ``JSON``-documents conforming to the following schema: :doc:`../schema/index`.

