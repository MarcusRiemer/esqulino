===================
 Compilation Guide
===================

This part of the documentation is aimed at people want to compile the project. As there are currently no pre-compiled distributions available, it is also relevant for administrators wanting to run their own server.

.. note:: Currently it is assumed that this project will built on a UNIX-like environment. Although building it on Windows should be possible, all helper scripts (and Makefiles) make a lot of `UNIX`-centric assumptions.

There are loads of fancy task-runners out there, but a "normal" interface to all programming-related tasks is still a ``Makefile``. Most tasks you will need to do regulary are therefore available via ``make``. Apart from that there are folders for schemas, documentation, example projects and helper scripts.

.. _environment_dependencies:

Environment Dependencies
========================

At its core the server is a "typical" Ruby on Rails application which relies on the following software. The given versions are a known konfiguration, more recent versions will probably work as well.

* Ruby >= 2.2.2 (`Because of Rails 5.1 <http://guides.rubyonrails.org/upgrading_ruby_on_rails.html#ruby-versions>`_)
* Postgres >= 9.4 (Because of JSON support)
* ImageMagick 7.0.8 (Version 6 should work as well)
* FileMagick 5.32
* GraphViz 2.40.1
* SQLite >= 3.15.0 (with Perl compatible regular expressions)

Compiling the client requires the following dependencies (`taken from here <https://github.com/angular/angular-cli/blob/master/package.json>`_):

* NodeJS >= 10.9.0
* npm >= 6.0.0

Alternatively you may use Docker to run the server and compile the client.

Ubuntu Packages
---------------

Execute this command to install the dependencies in a single step (works with Ubuntu 18.04)::

   sudo apt install ruby ruby-bundler ruby-dev postgresql-10 libpq-dev \
     imagemagick libmagickcore-dev libmagickwand-dev \
     magic libmagic-dev graphviz sqlite libsqlite3-dev sqlite3-pcre \
     nodejs npm


SQLite and PCRE
---------------

Database schemas created with BlattWerkzeug make use of regular expressions which are usually not compiled into the ``sqlite3`` binary. To work around this most distributions provide some kind of ``sqlite3-pcre``-package which provides the regex implementation.

* Ubuntu: ``sqlite3-pcre``
* Arch Linux: ``sqlite-pcre-git`` (`AUR <https://aur.archlinux.org/packages/sqlite-pcre-git/>`_)

These packages should install a single library at ``/usr/lib/sqlite3/pcre.so`` which can be loaded with ``.load /usr/lib/sqlite3/pcre.so`` from the ``sqlite3``-REPL. If you wish, you can write the same line into a file at ``~/.sqliterc`` which will be executed by ``sqlite3`` on startup.

DNS and Subdomains
------------------

The development environment assumes that any subdomains of ``localdomain`` will be routed to the ``localhost``. This works out of the box on various GNU/Linux-distributions, but as this behaviour is not standardised it should not be relied upon. To reliably resolve project-subdomains you should either write custom entries for each project in ``/etc/hosts`` or use a lightweight local DNS-server like `Dnsmasq <http://www.thekelleys.org.uk/dnsmasq/doc.html>`_. In a production environment you should run the server on a dedicated domain and route all subdomains to the same server instance.

These subomdains are required for under two different circumstances:

* The application itself is available in multiple languages. ``en.blattwerkzeug.localdomain`` should render the english version, ``de.blattwerkzeug.localdomain`` the german version.
* The web-projects will be rendered on their own subdomains.

PostgreSQL
----------

The actual project code is stored in a PostgreSQL database. You will need to provide a user who is able to create databases. For development you should stick to the default options that are provided in the ``server/config/database.yml`` file.

Environment Variables
---------------------

The default environment assumes a readily available database which is configured via the ``server/config/database.yml`` file which happily picks up environment variables. As long as you are happy with those defaults, there is nothing to worry about. But some services do require customized information via environment variables.

* Various login providers that work via OAuth2 require a client ID and a client secret:

  * Google: ``GOOGLE_CLIENT_ID``, ``GOOGLE_CLIENT_SECRET``, these values are available from the `Google Developer Console <https://console.developers.google.com/apis/credentials>`_ (if you are part of the BlattWerkzeug-project).

* Sending mails requires a configured ``SMTP``-server: ``SMTP_HOST``, ``SMTP_USER``, ``SMTP_PASS``

You probably want to use some tool like `direnv (available for most Linux distros) <https://github.com/direnv/direnv>`_ to automatically manage these variables. Just install a hook to ``direnv`` in the ``rc``-file of your shell and restart the shell. Then you can create a ``.envrc`` file in the server folder that contains something along the lines of::

  export GOOGLE_CLIENT_ID=foo
  export GOOGLE_CLIENT_SECRET=bar

Entering and leaving the folder will then automatically load and unload the mentioned environment variables.

Compiling and Running
=====================

Clone the sources from the `git repository at BitBucket <https://bitbucket.org/marcusriemer/esqulino>`_.

Running locally
---------------

Ensure you have the "main" dependencies installed (``ruby`` and ``bundle`` for the Server, ``node`` and ``npm`` for the client).

1. Compiling all variants of the client requires can be done by navigating to the ``client`` folder and executing the following steps.

  1. ``make install-deps`` will pull all further dependencies that are managed by the respective packet managers. If this fails check that your environment meets the requirements: :ref:`environment_dependencies`.
  2. After that, the web application need to be compiled and packaged once: ``make client-compile`` for a fully optimized version or ``make client-compile-dev`` for a development version.
  3. The server requires the special "IDE Service" variant of the client to function correctly. It can be created via ``make cli-compile``.

2. Running the server requires the following steps in the ``server`` folder:

   1. ``make install-deps`` will pull all further dependencies that are managed by the respective packet managers. If this fails check that your environment meets the requirements: :ref:`environment_dependencies`.
   2. Start a PostgreSQL-server that has a user who is allowed to create databases.
   3. Setup the database and fill the database (``make reset-live-data``). This will create all required tables and load some sample data.
   4. You may now run the server, to do this locally simply use ``make run-dev`` and it will spin up a local server instance listening on port ``9292``. You can alternatively run a production server using ``make run``.
   5. If you require administrative rights, :ref:`you can give the permissions via the Rails shell <shell-create-admin-account>`.

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

Modifying seed data
-------------------

BlattWerkzeug comes with a complex set of required objects to work properly. This includes grammars, block languages, example projects, ... The "normal" Rails way of providing those objects via ``db/seeds.rb`` does not work for these structures at all: They are simply to complex to be meaningfully edited by hand.

The ``Makefile`` therefore exposes the ``store-live-data`` target which stores the current state of the programing languages and projects in the ``seed`` folder. This allows programmers to edit grammars, block languages and projects using the web-IDE and to persist those changes in the git repository.

.. important:: The YAML-files in the ``seed``-folder are **very** prone to merge conflicts. Please make sure to only ever commit as small changes as possible. It is good practive to routinely use ``make reset-live-data run-dev`` when starting the server to ensure that your database-state is always up do date. If you run ``store-live-data`` from an old database state you may override newer changes that are part of the repository already.

Running via Docker
------------------

There are pre-built docker images for development use on docker hub: `marcusriemer/blockwerkzeug <https://hub.docker.com/r/marcusriemer/blockwerkzeug/>`_. These are built using the various ``Dockerfile``\ s in this repository and can also be used with the ``docker-compose.yml`` file which is also part of this repository. Under the hood these containers use the same ``Makefile``\s and commands that have been mentioned above.

Depending on your local configuration you might need to run the mentioned ``Makefile`` with ``sudo``.

* ``make -f Makefile.docker pull-all`` ensures that the most recent version of all images are available locally. If you don't pull the images first, the ``run-dev`` target might decide to build the required images locally instead.

* ``make -f Makefile.docker run-dev`` starts docker containers that continously watch for changes to the ``server`` and ``client`` folders. It mounts the projects root folder as volumes into the containers, which allows you to edit the files in ``server`` and ``client`` in your usual environment. A third container is started for PostgreSQL.

* ``make -f Makefile.docker shell-server-dev`` opens a shell inside the docker container of the server. You might require this to do maintenance tasks with ``bin/rails`` for the server.

Frequent Issues and Error messages
----------------------------------

These issues happen on a semi-regular scale.

I don't have any programming languages or projects available
    You probably forgot to load the initial data. Run ``make load-live-data`` in the ``server`` folder.

.. _shell-create-admin-account:

I need an admin account
    1) If you don't have a regular account yet: Register one. During development you may use the "developer" identity which does not even require a password.
    2) Assuming your display name is unique: Open a Rails console and run the following command::

         User.find_by(display_name: "<Your Display Name>").add_role(:admin)

The server wont start and shows ``Startup Error: No cli program at "../client/dist/cli/bundle.cli.js"``
    The server requires the ``cli`` version of the IDE to run. Create it using ``make compile-cli`` in the ``client`` folder. The server will make more then one attempt to find the file, so if the program is currently beeing compiled startup should work once the compilation is finished.
