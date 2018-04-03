*********************
 The Online Platform
*********************

One of the main reasons for the development of BlattWerkzeug was the barrier of entry when a pupil attempts to make her or his first steps. Databases need to be obtained, possibly configured, servers need to be installed and maintained ... The web-based nature of BlattWerkzeug simplifies this process to basicly "surf to this page and get going". But offering BlattWerkzeug as a web application comes with additional benefits other than simplicity: The code is available from every computer and pupils can trivially share the results of their work with the rest of the world.

But these benefits do come with a prize: In order to work properly BlattWerkzeug needs to implement and maintain a lot of things that are very atypical for an IDE. The most prominent requirement is a robust way to separate data from different users. This can obviously be solved via some kind of user registration & login process, which is more a design than a technical challenge.

Types of Users
==============

The `masters thesis of Marcus Riemer <https://blattwerkzeug.de/about/academia>`_ describes a very rough outline of possible user groups in chapter 3.4.3. These considerations are however strictly limited to projects, as the online platform was considered to be out of scope for the masters thesis.

Without getting into details considering rights management we expect every registered user to take at least one of the following roles:

Learners
  want to create stuff using the IDE. They are busy creating new content that they want to demonstrate to their peers (or they actually want to learn something for the sake of learning, which would also be nice) [#f1]_.

Educators
  want to demonstrate programming concepts using the IDE. They are busy creating new content that they want to show to learners so those can adapt and remix them.

Moderators
  are required to ensure that the platform is not abused. They ensure that e.g. no copyrighted or pornographic content is shared via the platform.

With these roles in mind we can take a look at the different groups of people that make up the target audience:

Teachers in a classroom setting
  are immediately responsible for a set of pupils. These students are very likely to be tasked with the same assignment so it needs to be as easy as possible to "share" the same project to multiple users.

Pupils in a classroom setting
  are supervised by a teacher and are expected to fulfill predetermined tasks.

Independent Creators
  want to create programs that are actually useful for some kind of problem that they have.

Independent Educators
  want to share their knowledge.

Visitors
  are not interested in the IDE itself, but in the things that have been created using the IDE. 

Inspiration
===========

With the rise of decentralized version control systems like Git and Mercurial came quite a few online platforms that offer some mixture of repository hosting and "social" features that ease collaboration. As BlattWerkzeug strives to be a learning environment it should be as easy as possible (and encouraged) to learn from other peoples code.

The following questions may be helpful when thinking about the community and online platform aspects:

* How do users discover content that is relevant to them?

* What information should a user page contain?
  
  * Should there be different user pages depending on the role?
  * How can a user give a spotlight to her or his most relevant projects?

* How or where do users communicate?

  * Should there be a possibility to comment on users, projects, databases, ...?
  * Should there be any form of free-form discussion [#f2]_?

* How can projects be shared among multiple users?

  * Is "cloning" or "forking" a viable concept?
  * Should certain resources be read-only in forked projects?
    
Technical Requirements
======================

BlattWerkzeug technically consists of two different codebases: A Ruby on Rails application for the server and an Angular 2 application for the client. See :doc:`project-structure` for the general overview.

As the server uses the so called ``API``-mode of Rails quite a few of the "standard" gems for user authentication won't work without some degree of customization. The model & controller functionality of gems like `devise <https://github.com/plataformatec/devise>`_ may be helpful, but due to the Angular Client there is no view rendering available.


.. rubric:: Footnotes

.. [#f1] Note to self: Is there a distinction between "creators" and "learners" in established didactic concepts?

.. [#f2] Technical detail: Maybe an existing application like `Discourse <https://www.discourse.org/>`_ would be a good fit?