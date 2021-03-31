===================
 Grammar Reference
===================

This section is the formal documentation of the grammar languages used by BlattWerkzeug. These grammars define the general validity of syntax trees and describe programming languages. This chapter assumes that you have read and understood the following other chapters:

* The chapter :ref:`abstract-syntax-tree` which describes the data structure that requires validation.
* The chapter :ref:`grammars-by-example` which gives an informal introduction and describes how the grammars that are described here differ from "typical" grammars as they are used in compiler construction.

Relationship to RelaxNG
=======================

The concepts of the grammar language are based on the concepts of XML validation as described by `Relax NG <https://relaxng.org/spec-20011203.html>`_. The key difference is, that ``XML`` always has exactly two types of children to consider: attributes and other elements. The grammar described in this document makes a similar distinction between so called ``properties`` and ``children``. But it additionally allows multiple so called ``child groups``, which are all individual sub-trees.

Top level type definitions
==========================

Every top level definition introduces a new type that can be referenced. Grammars and SyntaxTrees are linked via the ``language`` and ``name`` properties of a node. These properties combined form a fully qualified typename, which can be looked up in the grammar.

This lookup may yield one of two different type definitions: A definition of type ``node`` matches an actual node in an abstract syntax tree, it may define properties and children. A ``typedef`` on the other hand denotes a type that will never exist in a tree, it's a mere placeholder for a set of other types that could appear in the referenced position.

Top level: ``node``
===================

This type defines which attributes (properties or children) a certain node may have. Both types of attributes share a common namespace, it is therefore not possible to have a property **and** a child group named ``foo`` on the same ``node`` definition.

In the pretty printed form of a grammar, a node may be denoted as follows::

  node "example"."name" {
    # Attributes ("children" or "prop")
  }

.. _grammar_property_restrictions:

Property Restrictions
=====================

Properties are atomic values and may currently be ``boolean``, ``integer`` or ``string`` values. The actual values are always stored as strings in the syntaxtree, they do **not** use the corresponding ``JSON`` types.

All properties may be defined as beeing ``optional``, this is denoted by a ``?`` that follows the propertyname. If an optional property is absent from a syntaxtree during validation, this is not considered as an error.

``boolean``
-----------

Allows exactly the property values ``true`` and ``false``. In the pretty printed form of a grammar, a node with a single boolean property may be denoted as follows::

  node "example"."booleanProperty"  {
    prop "b" { boolean }
  }

``integer``
-----------

Integers may specify restrictions of type ``minInclusive`` or type ``maxInclusive``. In the pretty printed form of a grammar, a node with three diffrent ranges for integer properties may be denoted as follows::

  node "example"."intgerProperty"  {
    prop "i" { integer }
    prop "fiveOrMore" { integer ≥ 5 }
    prop "fiveOrLess" { integer ≤ 5 }
    prop "zeroToFive" {
      integer {
        ≤ 5
        ≥ 0
      }
    }
  }

``string``
----------

Strings may be restricted in the following ways:

* It must have exactly (``length``), at least (``minLength``) or at most (``maxLength``) a certain length.
* It must be exactly one value of an enumeration (``enum``).
* It must match a regular expression (``regex``). This is the most flexible option (and it can be used to express all of the other restrictions), but it does lead to hard to understand error messages.


.. _grammar_children_restrictions:

Children Restrictions
=====================

As every node in the syntaxtree may have any number of named subtrees, the grammar must be able to validate any number of subtrees for a certain type. Technically every childgroup may contain a list of subtrees in which every tree can be validated individually. Grammars may enforce rules about the order or cardinality for the types of the roots of those trees.

Childgroup Type ``sequence``
----------------------------

Sequences expect an exact series of types in a certain child group. The following example shows a sequence where a valid syntax tree must have exactly four nodes overall::

  node "sequence"."root" {
    children sequence "Children" ::= B A B
  }
  node "sequence"."B" { }
  node "sequence"."A" { }

Childgroup Type ``allowed``
---------------------------

For some kinds of subtrees the order of the following root nodes is irrelevant, but the cardinality may be very relevant. This is very common in markup languages, where many different types of children may be allowed in no particular order.

The following example defines the structure of some kind of document: It must have ``Text``, it may have exactly a single ``Figure`` and it may contain any number of ``Reference``::

  node "allowed"."Document" {
    children allowed "Children" ::= Text+ & Figure? & Reference*
  }

Limitation: No mixed groups
---------------------------

Note that it is currently **not** possible to mix e.g. ``sequence`` and ``allowed`` child groups as it would be possible with RelaxNG. This is mainly because no proper use case has surfaced that would warrant this rather complicated behavior. Under most circumstances using multiple child groups is a perfectly fine workaround. In order to add a single "Heading" for the ``Document`` type  mentioned above, one could make the following workaround::

  node "allowed"."Document" {
    children sequence "Heading" ::= Text
    children allowed "Body" ::= Text+ & Figure? & Reference*
  }

Now every ``Document`` requires a single ``Text`` node in the ``Heading`` childgroup.

Top level: ``typedef``
======================

A ``typedef`` denotes a type that will never exist in a tree, it's a mere placeholder for a set of other types that could appear in the referenced position. This is useful when in certain places different but related types could be expected. Instead of repeating sets like ``{unaryExpression, binaryExpression, constant}`` again and again, a single typedef may group these common usage together.

Technically this doesn't add new functionality to the grammar language as a whole. But it does make grammars more maintainable.