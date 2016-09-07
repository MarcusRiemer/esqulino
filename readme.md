# The esqulino-Project

For a lack of a better name, this is all I have got at the moment. It's meant to be a phonetic play on the `SQL`-abbreviation ending in "lino", which is used by many popular programs on the german KIKA ("KinderKanal", german for "childrens channel").

# Running on a development machine

This project consists of two executable components: A Ruby-webserver and a Angular2-client. I know there are loads of fancy task-runners out there, but my "normal" interface to all programming-related tasks is still a `Makefile`. Most tasks you will need to do regulary are therefore available via `make`. Apart from that there are folders for schemas, documentation, example projects and helper scripts.

* If you have the "big" dependencies installed (`ruby` and `bundle` for the Server, `node` and `npm` for the client), a simple `make install-deps` should pull all further dependencies that are managed by the respective packet managers.
* After that, the client needs to be compiled and packaged once: `make dist`.
* You may now run the server, to do this locally simply use `make server-run` and it will spin up a local server instance listening on port `9292`.

## Updating

* Re-sync your local repository with the server using `git pull`.
* Ensure all dependencies are up to date by running `make clean-deps install-deps`.
* Rebuild the client using `make dist`
* You possibly need to upgrade your local projects using `make server-migrate-projects`. This is necesarry if the on-disk format for projects has changed.

## About Windows ...

Currently it is assumed that this project will built on a UNIX-like environment. Although building it on Windows should be possible, all helper scripts (and Makefiles) make a lot of UNIX-centric assumptions. But don't worry if you are only interested in *running* a esqulino instance. You will be better off using a pre-compiled distribution of the client, but running the server should work just fine. Alternatively take a look at the virtual machine that is provided.

# Running using a virtual machine

If you don't want to go through the hassle of setting up `ruby`, `bundle`, `node` and `npm` and their respective dependencies yourself you may want to take a look at the [pre-packaged virtual machine `esqulino.ova`](http://playground.marcusriemer.de/esqulino.ova). This VM is distributed in the [Open Virtualization Format](http://www.dmtf.org/standards/ovf) which can be imported by all popular VM hypervisors like [VirtualBox](https://www.virtualbox.org) or [vmware](http://www.vmware.com/).

Once you have imported and started the `esqulino.ova` image with your favourite hypervisor esqulino has automatically been started. The greeting message above the prompt should look something like this:

    Welcome to Ubuntu 16.04.1 LTS (GNU/Linux 4.4.0-31-generic x86_64)
    
    ● esqulino.service - esqulino - A SQL IDE targeted at pupils
       Loaded: loaded (/etc/systemd/system/esqulino.service; enabled; vendor preset: enabled)
       Active: active (running) since Wed 2016-09-07 08:04:24 UTC; 1min 9s ago
     Main PID: 1633 (make)
       CGroup: /system.slice/esqulino.service
               ├─1633 /usr/bin/make run
               ├─1734 /bin/sh -c RACK_ENV="production" /home/vagrant/.gem/ruby/2.3.0/bin/bundle exec rackup
               └─1735 ruby2.3 /usr/local/bin/rackup
    
    Sep 07 08:04:24 vagrant systemd[1]: Started esqulino - A SQL IDE targeted at pupils.
    Sep 07 08:04:25 vagrant make[1633]: RACK_ENV="production" /home/vagrant/.gem/ruby/2.3.0/bin/bundle exec rackup
    Last login: Wed Sep  7 07:31:55 2016 from 10.0.2.2

As you can see the provided image is based on Ubuntu 16.04 and displays the current state of the esqulino instance on every startup. You have been immediatly logged in as a user called `vagrant` and may use the commandline to interact with the server as described in the "normal" developer documentation.
    
## Useful locations and commands

The address [http://localhost.localdomain:9292](http://localhost.localdomain:9292) on the host machine should be mapped to the esqulino instance running inside the virtual machine. Simply open a browser on your host machine and you are good to go.

* Projects are served under `http:<projectId>.localhost.localdomain`.
* If you are experiencing strange bugs please point your browser to the [unit test page](http://localhost.localdomain:9292/test.html). This will run the client-side test-suite directly in your browser. Please report any errors in this test suite immediatly!

### Paths inside the VM

* The esqulino instance is running from `/srv/esqulino`.
* The data path used by default is `/srv/esqulino/data/dev`. This will be decoupled from the esqulino source tree once esqulino is offcially released.

### Useful commands inside the VM

esqulino is running as a systemd-unit. If you are familar with systemd all the standard operations you would expect to work should work. But even if you are not familar with systemd the following commands should cover all your needs.

* `sudo systemctl <start|stop|restart> esqulino.service` to start or stop esqulino.
* `sudo systemctl <status> esqulino.service` to check whether esqulino is running.
* `journalctl -u esqulino.service` to check the latest log messages. You may append the `-f` flag to keep listening for new messages.

# Project structure

Server, client and documentation are part of a single repository.

## Server

Developed on a system running `ruby 2.3.0p0 (2015-12-25 revision 53290) [x86_64-linux]` and (for the moment) not tested elsewhere. That said, it uses Sinatra which should run virtually anywhere and does not make use of any too fancy Ruby features. So it will probably run on different configurations.

Requires `gem` and `bundle` to be available, dependencies are provided as a `Gemfile`.

## Client

An Angular 2.0 app, even though Angular 2.0 is still not released yet. I hope this changes once the thesis is complete ... It uses Typescript, because I really like my compiler to catch dumb errors.

## Schema

Most exchange and storage formats are documented using [JSON Schema](http://json-schema.org/). These can be regenerated from the Typescript sources, but as this is quite a fragile process the specification files are also checked in to the repository.

## Documentation

Documentation for the API is provided following the OpenAPI-Specification, an [online version of the specification](http://petstore.swagger.io/?url=https://esqulino.marcusriemer.de/doc/swagger/swagger.yaml) is also available.

# Testing

esqulino aims to be thoroughly tested and does this on more or less three levels.

## Client-Side Unit Tests

Every time `make dist` is run, all unit tests are part of the resulting compilation. They can be run in the browser using the `test.html` page that should be served by the normal server. These files are also part of the 

## Server-Side Unit Tests

As the server logic more or less always includes some disk-IO, these are tricky to route. Currently there are not many server side tests, but they could be run by executing the `*.spec.rb` files with ruby.

## End-To-End (e2e) Tests

These tests build upon Angular Protractor and Selenium to run certain tests in real browsers. Most of these tests wreck havoc on the supplied `test`-project which should be restored to the original state after each run. Usually these end-to-end tests are run like this from the `client` folder:

    make E2E_ARGS="--suite=projectSettings" test-e2e

The `Makefile` ensures that the `test` project is in a clean state, allows to specify certain suites to be executed and builds the client before actually running the tests.

# License

This project itself is licensed under the terms of the [GNU Affero General Public License (AGPL)](https://www.gnu.org/licenses/agpl.html). For the documentation, including the masters thesis, is licensed under [CC-BY-SA](https://creativecommons.org/licenses/by-sa/4.0/).

## Dependencies and Licenses

This project relies on a rich set of other projects, the most notable ones are listed here in alphabetical order.

Name                                                       | Used for                                                 | Site         | License
---------------------------------------------------------- | -------------------------------------------------------- | ------------ | -------
[Angular 2.0](https://angular.io/)                         | Frontend GUI                                             | Client       | MIT
[Font Awesome](http://fontawesome.io)                      | Icons for the Frontend User Interface                    | Client       | SIL Open Font
[Ruby](https://www.ruby-lang.org/)                         | Server-side scripting language                           | Server       | Ruby
[Sinatra](http://www.sinatrarb.com/)                       | HTTP Handling and routing for backend                    | Server       | MIT
[Sinatra Contrib](http://www.sinatrarb.com/contrib/)       | Config-File, Code-Reloading and JSON serialization       | Server       | MIT
[SQLite 3](https://www.sqlite.org/)                        | Database backend for projects                            | Server       | CC0
[SCrypt for Ruby](https://github.com/pbhogan/scrypt)       | Password Storage                                         | Server       | BSD 3-Clause
[Typescript](http://www.typescriptlang.org/)               | Client-side scripting language                           | Client       | Apache 2.0
[Typescript JSON Schema](https://github.com/YousefED/typescript-json-schema) | JSON Schema Generation                 | Development  | Apache 2.0

