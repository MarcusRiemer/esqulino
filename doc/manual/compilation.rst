*******************
 Compilation Guide
*******************

This part of the documentation is aimed at people want to compile the project. As there are currently no pre-compiled distributions available, it is also relevant for administrators wanting to run their own server.

.. note:: Currently it is assumed that this project will built on a UNIX-like environment. Although building it on Windows should be possible, all helper scripts (and Makefiles) make a lot of `UNIX`-centric assumptions.

There are loads of fancy task-runners out there, but a "normal" interface to all programming-related tasks is still a ``Makefile``. Most tasks you will need to do regulary are therefore available via ``make``. Apart from that there are folders for schemas, documentation, example projects and helper scripts.

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

PostgreSQL
----------

The actual project code is stored in a PostgreSQL database. You will need to provide a user who is able to create databases.

Compiling and Running
=====================

Clone the sources from the `git repository at BitBucket <https://bitbucket.org/marcusriemer/esqulino>`_.

Running locally
---------------

* Ensure you have the "main" dependencies installed (``ruby`` and ``bundle`` for the Server, ``node`` and ``npm`` for the client).

1. Compiling all variants of the client requires can be done by navigating to the ``client`` folder and executing the following steps.
   
  1. ``make install-deps`` will pull all further dependencies that are managed by the respective packet managers. If this fails check that your environment meets the requirements: :ref:`environment_dependencies`.
  2. After that, the web application need to be compiled and packaged once: ``make client-compile`` for a fully optimized version or ``make client-compile-dev`` for a development version.
  3. The server requires the special "IDE Service" variant of the client to function correctly. It can be created via ``make cli-compile``.

2. Running the server requires the following steps in the ``server`` folder:
   
   1. ``make install-deps`` will pull all further dependencies that are managed by the respective packet managers. If this fails check that your environment meets the requirements: :ref:`environment_dependencies`.
   2. Start a PostgreSQL-server that has a user ``esqulino`` who is allowed to create databases. You can alternatively specify your own user (see :ref:`database_configuration`).
   3. Setup the database (`make setup-database`). This will create all required tables.
   4. You may now run the server, to do this locally simply use ``make run-dev`` and it will spin up a local server instance listening on port ``9292``. You can alternatively run a production server using ``make run``.
      
3. You then need to seed the initial data that is part of this instance using ``make load-all-data``. This will setup a pre-configured environment with some programming languages, block languages and projects.

The setup above is helpful to get the whole project running once, but if you want do develop it any further you are better of with the following options:

* Relevant targets in the ``client`` folder:
  * Run ``NG_OPTS="--watch" make client-compile-dev`` in the ``client`` folder. The ``--watch`` option starts a filesystem watcher that rebuilds the client incrementally on any change, which drastically reduces subsequent compile times.
  * Run ``make client-test-watch`` to continously run the client testcases in the background.
* Relevant targets in the ``server`` folder:
  * Run ``make test-watch`` to continously run the server testcases in the background. This requires a running PostgreSQL database server.
  

Testing and code coverage
-------------------------

Calling ``make test`` in the ``client`` folder will run the tests once against a headless version of Google Chrome and Firefox.
  
* ``make test-watch`` will run the tests continously after every change to the clients code.
* The environment variable ``TEST_BROWSERS`` controls which browsers will run the test, multiple browsers may be specified using a ``,`` and spaces are not allowed. The following values should be valid:
  
  * ``Firefox`` and ``Chrome`` for the non-headless variants that open dedicated browser windows.
  * ``FirefoxHeadless`` and ``ChromeHeadless`` that run in the background without any visible window.

After running tests the folder ``coverage`` will contain a navigateable code coverage report:

.. image :: screenshots/dev-coverage-client.png

Tests for the server are run in the same fashion: Call ``make test`` in the ``server`` folder to run them once, ``make test-watch`` run them continously. And again the folder ``coverage`` will contain a code coverage report:

.. image :: screenshots/dev-coverage-server.png

Running via Docker
------------------

There are pre-built docker images for development use on docker hub: `marcusriemer/sqlino <https://hub.docker.com/r/marcusriemer/sqlino/>`_. These are built using the various ``Dockerfile``\ s in this repository and can also be used with the ``docker-compose.yml`` file which is also part of this repository. Under the hood these containers use the same ``Makefile``\s and commands that have been mentioned above.

Depending on your local configuration you might need to run the mentioned ``Makefile`` with ``sudo``.

* ``make -f Makefile.docker pull-all`` retrieves the most recent version of all images from the `docker hub <https://hub.docker.com/r/marcusriemer/sqlino/>`_.

* ``make -f Makefile.docker run-dev`` starts docker containers that continously watch for changes to the ``server`` and ``client`` folders. It mounts the projects root folder as volumes into the containers, which allows you to edit the files in ``server`` and ``client`` in your usual environment. A third container is started for PostgreSQL.

* ``make -f Makefile.docker shell-server-dev`` opens a shell inside the docker container of the server. You might require this to do maintenance tasks with ``bin/rails`` for the server.
