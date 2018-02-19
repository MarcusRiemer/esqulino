*******************
 Compilation Guide
*******************

This part of the documentation is aimed at people want to compile the project. As there are currently no pre-compiled distributions available, it is also relevant for administrators wanting to run their own server.

Currently it is assumed that this project will built on a UNIX-like environment. Although building it on Windows should be possible, all helper scripts (and Makefiles) make a lot of `UNIX`-centric assumptions.

Project folder structure
========================

This project consists of two main executable components: A Ruby-webserver and a Angular-client. Take a look at the ``README.md`` in the respective folders to find out how to work with these components in detail.

I know there are loads of fancy task-runners out there, but a "normal" interface to all programming-related tasks is still a ``Makefile``. Most tasks you will need to do regulary are therefore available via ``make``. Apart from that there are folders for schemas, documentation, example projects and helper scripts.

Most exchange and storage formats are documented using `JSON Schema <http://json-schema.org/>`_. These can be regenerated from the Typescript sources, but as this is quite a fragile process the specification files are also checked in to the repository.

.. _environment_dependencies:

Environment Dependencies
========================

At its core the server is a "typical" Ruby on Rails application which relies on the following software:

* `Ruby >= 2.2.2 <http://guides.rubyonrails.org/upgrading_ruby_on_rails.html#ruby-versions>`_ (Because of Rails 5.1)
* Postgres >= 9.3 (Because of JSON support)
* ImageMagick 6.9.9.34 (Version 7 is not yet properly supported by our used Ruby Library 😞)
* FileMagick 5.32
* GraphViz 2.40.1
* SQLite >= 3.15.0 (with Perl compatible regular expressions)

Compiling the client requires the following dependencies (`taken from here <https://github.com/angular/angular-cli/blob/master/package.json>`_):

* NodeJS >= 6.9.0
* npm >= 3.0.0

Alternatively you may use Docker to run the server and compile the client.
  
SQLite and PCRE
---------------

Database schemas created with BlattWerkzeug make use of regular expressions which are usually not compiled into the ``sqlite3`` binary. To work around this most distributions provide some kind of ``sqlite3-pcre``-package which provides the regex implementation.

* Ubuntu: sqlite3-pcre
* Arch Linux: `sqlite-pcre-git (AUR) <https://aur.archlinux.org/packages/sqlite-pcre-git/>`_

These packages should install a single library at ``/usr/lib/sqlite3/pcre.so`` which can be loaded with ``.load /usr/lib/sqlite3/pcre.so`` from the ``sqlite3``-REPL. If you wish, you can write the same line into a file at ``~/.sqliterc`` which will be executed by ``sqlite3`` on startup.

DNS and Subdomains
------------------

BlattWerkzeug makes use of subdomains to render the public representation of a project. The development environment assumes, that any subdomains of ``localhost.localdomain`` will be routed to the ``localhost``. The URL ``http://cyoa.localhost.localdomain`` should for example resolve to your ``localhost`` and would display the rendered index-page of the project ``cyoa``. This works out of the box on various GNU/Linux-distributions, but as this behaviour is not standardised it should not be relied upon. To reliably resolve project-subdomains you should either write custom entries for each project in ``/etc/hosts`` or use a lightweight local DNS-server like `Dnsmasq <http://www.thekelleys.org.uk/dnsmasq/doc.html>`_.

In a production environment you should run the server on a dedicated domain and route all subdomains to the same server instance.

Compiling and Running
=====================

Clone the sources from the `git repository at BitBucket <https://bitbucket.org/marcusriemer/esqulino>`_.

Running locally
---------------

* Ensure you have the "main" dependencies installed (``ruby`` and ``bundle`` for the Server, ``node`` and ``npm`` for the client).
* ``make install-deps`` will pull all further dependencies that are managed by the respective packet managers. If this fails check that your environment meets the requirements: :ref:`environment_dependencies`.
* After that, the client (and its commandline interface) need to be compiled and packaged once: ``make dist`` for a fully optimized version or ``make dist-dev`` for a development version.
* Start a PostgreSQL-server that has a user ``esqulino`` who is allowed to create databases.
* You may now run the server, to do this locally simply use ``make server-run`` and it will spin up a local server instance listening on port ``9292``.

The setup above is helpful to get the whole project running once, but if you want do develop it any further you are better of with the following options:

* Run ``NG_OPTS="--watch" make dist-dev`` in the ``client`` folder. The ``--watch`` option starts a filesystem watcher that rebuilds the client incrementally on any change, which drastically reduces subsequent compile times.
* Run ``make run-dev`` in the ``server`` folder. This starts Rails in development mode which reloads altered parts of the server before every request.



Running via Docker
------------------

There are pre-built docker images for development use on docker hub: `marcusriemer/sqlino <https://hub.docker.com/r/marcusriemer/sqlino/>`_. These are built using the various ``Dockerfile``\ s in this repository and can also be used with the ``docker-compose.yml`` file which is also part of this repository. Under the hood these containers use the same ``Makefile``\s and commands that have been mentioned above.

Depending on your local configuration you might need to run the mentioned ``Makefile`` with ``sudo``.

* ``make -f Makefile.docker pull-all`` retrieves the most recent version of all images from the `docker hub <https://hub.docker.com/r/marcusriemer/sqlino/>`_.

* ``make -f Makefile.docker run-dev`` starts docker containers that continously watch for changes to the ``server`` and ``client`` folders. It mounts the projects root folder as volumes into the containers, which allows you to edit the files in ``server`` and ``client`` in your usual environment. A third container is started for PostgreSQL.

* ``make -f Makefile.docker shell-server-dev`` opens a shell inside the docker container of the server. You might require this to do maintenance tasks with ``bin/rails`` for the server.