*********************
 Configuration Guide
*********************

This part of the documentation is aimed at people want to run the project. It assumes familarity with Linux and typical server software like databases and webservers.

Environments and Settings
=========================

All settings may be configured per environment (``PRODUCTION``, ``DEVELOPMENT``, ``TEST``). The most important options can all be found in the ``sqlino.yml``

Storage
-------

The server currently uses two places to store its data:

* The data folder may be configured via the ``data_dir`` key in ``server/conf/sqlino.yml``.
* The database is configured via Rails in ``server/conf/database.yml``

Additionaly the expects to find certain assets in configurable locations (``sqlino.yml``):

* ``client_dir`` must point to the compiled client with files like ``index.html`` and different ``*.bundle.js`` files.
* ``schema_dir`` must point to a folder that contains various ``*.json``-schema files.

Server side rendering
=====================

You may initially render pages on the server. This drastically speeds up initial load times and provides a partial fallback for users that disable JavaScript.

Backing up and seeding data
===========================

The ``server/Makefile`` contains two targets that allow to im- or export data to a running server instance: ``load-all-data`` and ``dump-all-data``. The system is *very* basic at the moment and not formally tested, for proper backup purposes.

That said, the following things need to be included in a backup for any environment:

* The Postgres-database as denoted in ``server/config/database.yml``
* The ``data_dir`` as denoted in ``server/config/sqlino.yml``

Example configuration files
===========================

This section contains some exemplary configuration files that work well for the official server at `blattwerkzeug.de <https://blattwerkzeug.de>`_.

``sqlino.yml`` at ``server/conf``
---------------------------------

.. literalinclude :: ../../server/config/sqlino.yml
   :language: yaml

``database.yml`` at ``server/conf``
-----------------------------------

.. literalinclude :: ../../server/config/database.yml
   :language: yaml

Example ``systemd`` configuration
---------------------------------

.. literalinclude :: examples/admin/blattwerkzeug.service
  :caption: blattwerkzeug.service

.. literalinclude :: examples/admin/blattwerkzeug-universal.service
  :caption: blattwerkzeug-universal.service

Example ``nginx`` configuration
-------------------------------

.. literalinclude :: examples/admin/nginx.conf
