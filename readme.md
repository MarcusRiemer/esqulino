# The BlattWerkzeug-Project

Conventional development environments are programs that are tailored to suit the needs of professionals. Due to their complexity they do not lend themselves well to introduce pupils to programming. This project is the prototypical implementation of an educational software for database- and web-development.

To eliminate the possibility of syntactical errors while programming, the elements of the programming- or markup-languages are represented by graphical blocks, similar to the approach taken by the software [Scratch](https://scratch.mit.edu/). These blocks can be combined by using drag & drop operations. The syntactical structures of `SQL` and `HTML` are not hidden from the user, but it is not mandatory to internalize them. This approach allows pupils to program and share their own websites, without the need to type lines of code.

Not (yet?) a developer? Then you probably want to check out [BlattWerkzeug.de](http://blattwerkzeug.de) for the hosted version of this project. But beware: The current implementation of this software is **not yet ready** to be used in a classroom. It’s main purpose is to demonstrate and field test the various concepts.

## About the name ...

For a lack of a better name, this is all I have got at the moment. I simply took the very generic term "page tool" and losely translated it into german. The project used to be called "esqulino", a phonetic play on the `SQL`-abbreviation ending in "lino", which is used by many popular programs on the german KIKA ("KinderKanal", german for "childrens channel").

# Running on a development machine

This project consists of two executable components: A Ruby-webserver and a Angular2-client. I know there are loads of fancy task-runners out there, but my "normal" interface to all programming-related tasks is still a `Makefile`. Most tasks you will need to do regulary are therefore available via `make`. Apart from that there are folders for schemas, documentation, example projects and helper scripts.

* If you have the "big" dependencies installed (`ruby` and `bundle` for the Server, `node` and `npm` for the client), a simple `make install-deps` should pull all further dependencies that are managed by the respective packet managers.
* After that, the client needs to be compiled and packaged once: `make dist`.
* You may now run the server, to do this locally simply use `make server-run` and it will spin up a local server instance listening on port `9292`.

BlattWerkzeug makes use of subdomains to render the public representation of a project. The development environment assumes, that any subdomains of `localhost.localdomain` will be routed to the `localhost`. The URL `http://cyoa.localhost.localdomain` should for example resolve to your `localhost` and would display the rendered index-page of the project `cyoa`. This works out of the box on various GNU/Linux-distributions, but as this behaviour is not standardised it should not be relied upon. To reliably resolve project-subdomains you should either write custom entries for each project in `/etc/hosts` or use a lightweight local DNS-server like [Dnsmasq](http://www.thekelleys.org.uk/dnsmasq/doc.html).

## Updating

* Re-sync your local repository with the server using `git pull`.
* Ensure all dependencies are up to date by running `make clean-deps install-deps`.
* Rebuild the client using `make dist`
* If the server was running during the update, it needs to be restarted.
* You possibly need to upgrade your local projects using `make server-migrate-projects`. This is necesarry if the on-disk format for projects has changed.

## About Windows ...

Currently it is assumed that this project will built on a UNIX-like environment. Although building it on Windows should be possible, all helper scripts (and Makefiles) make a lot of UNIX-centric assumptions. But don't worry if you are only interested in *running* a BlattWerkzeug instance. You will be better off using a pre-compiled distribution of the client, but running the server should work just fine. Alternatively take a look at the virtual machine that is provided.

# Running using docker

There is a pre-built docker image for production use on docker hub: 6a7573742d6f6c65/esqulino.
It is build using the `Dockerfile` in this repository and can be used with the `docker-compose.yml` file which is also part of this repository.

The development image can be build using the `Dockerfile.development` which is also used by the `docker-compose.development.yml`. Once a container using the development image is started it expects the repos folder to be mounted as a volume at `/srv/esqulino` and the envoronment variable `TYPE` to be set to `CLIENT`, `SERVER` or `SLEEP`. The `docker-compose.development.yml` contains a service definition for client and server.

Start the development environment using `docker-compose -f docker-compose.development.yml up -d`. You can see the continuous log output using `docker logs -f <container>` where `<container>` is either the contianers id or the container name. The container id is different every time the container is created, the name is set by docker-compose using the following template: `<project name>_<service name>_<id>` where `<project name>`` is inferred from the folder name the project is in (esqulino unless you canged it), `<service name>` either `client` or `server` and `<id>` is `1` unless the scale option of docker-compose is used, which is not useful in this context.
    
## Useful locations and commands

The address [http://localhost.localdomain:9292](http://localhost.localdomain:9292) on the host machine should be mapped to the BlattWerkzeug instance running inside the virtual machine. Simply open a browser on your host machine and you are good to go.

* Projects are served under `http://projectId.localhost.localdomain`.
* If you are experiencing strange bugs please point your browser to the [unit test page](http://localhost.localdomain:9292/test.html). This will run the client-side test-suite directly in your browser. Please report any errors in this test suite immediatly!

### Paths inside the VM

* The BlattWerkeug instance is running from `/srv/esqulino`.
* The data path used by default is `/srv/esqulino/data/dev`. This will be decoupled from the BlattWerkzeug source tree once BlattWerkzeug is offcially released.

### Useful commands inside the VM

BlattWerkzeug is running as a systemd-unit. If you are familar with systemd all the standard operations you would expect to work should work. But even if you are not familar with systemd the following commands should cover all your needs.

* `sudo systemctl <start|stop|restart> esqulino.service` to start or stop esqulino.
* `sudo systemctl <status> esqulino.service` to check whether esqulino is running.
* `journalctl -u esqulino.service` to check the latest log messages. You may append the `-f` flag to keep listening for new messages.

# Project structure

Server, client and documentation are part of a single repository.

## Server

Developed on a system running Ruby 2.3.3 and (for the moment) not tested elsewhere.

Currently BlattWerkzeug uses Sinatra which should run virtually anywhere and does not make use of any too fancy Ruby features. So it will probably run on different configurations. But there are ongoing efforts to port the whole server over to a less "freestyle" Rails 5 application.

The `Makefile` requires the `gem` and `bundle` programs to be available, dependencies are described via the `Gemfile`.

## Client

An Angular 2.0 app that uses Typescript, because it is really nice to have a compiler that catches dumb errors. The app is broken up into several logical modules:

    AppModule                  Holds together the whole client
    ├─ SharedModule            Globally required functionality like icons
    ├─ FrontModule             Mainly text-pages that describe BlattWerkzeug
    └─ EditorModule            Bundles the actual editing capatabilities
       ├─ SharedEditorModule   Shared functionality like the sidebar
       ├─ PageEditorModule     Both page editors (WYSIWYG and tree)
       └─ QueryEditorModule    The query editor
       
The `Makefile` requires the `npm` program to be available, dependencies are provided via the `package.json`. The `Makefile` will install required programs like the Typescript compiler `tsc` or the Angular 2 ahead-of-time compiler `ngc` as part of the `install-deps` step.

## Schema

Most exchange and storage formats are documented using [JSON Schema](http://json-schema.org/). These can be regenerated from the Typescript sources, but as this is quite a fragile process the specification files are also checked in to the repository.

## Documentation

Documentation for the API is provided following the OpenAPI-Specification, an [online version of the specification](http://petstore.swagger.io/?url=https://esqulino.marcusriemer.de/doc/swagger/swagger.yaml) is also available.

# Testing

BlattWerkzeug aims to be thoroughly tested and does this on more or less three levels.

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
[Liquid](http://liquidmarkup.org/)                         | Server-side templating language                          | Server       | MIT
[Ruby](https://www.ruby-lang.org/)                         | Server-side scripting language                           | Server       | Ruby
[Sinatra](http://www.sinatrarb.com/)                       | HTTP Handling and routing for backend                    | Server       | MIT
[Sinatra Contrib](http://www.sinatrarb.com/contrib/)       | Config-File, Code-Reloading and JSON serialization       | Server       | MIT
[SQLite 3](https://www.sqlite.org/)                        | Database backend for projects                            | Server       | CC0
[SCrypt for Ruby](https://github.com/pbhogan/scrypt)       | Password Storage                                         | Server       | BSD 3-Clause
[Typescript](http://www.typescriptlang.org/)               | Client-side scripting language                           | Client       | Apache 2.0
[Typescript JSON Schema](https://github.com/YousefED/typescript-json-schema) | JSON Schema Generation                 | Development  | Apache 2.0

