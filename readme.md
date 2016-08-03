# The esqulino-Project

For a lack of a better name, this is all I have got at the moment. It's meant to be a phonetic play on the `SQL`-abbreviation ending in "lino", which is used by many popular programs on the german KIKA ("KinderKanal", german for "childrens channel").

# Folder Structure

This project consists of two executable components: A Ruby-webserver and a Angular2-client. I know there are loads of fancy task-runners out there, but my "normal" interface to all programming-related tasks is still a Makefile. Apart from that there are folders for schemas, documentation, example projects and helper scripts.

## Server

Developed on a system running `ruby 2.3.0p0 (2015-12-25 revision 53290) [x86_64-linux]` and (for the moment) not tested elsewhere. That said, it uses Sinatra which should run virtually anywhere and does not make use of any too fancy Ruby features. So it will probably run on different configurations.

Requires `gem` and `bundle` to be available, dependencies are provided as a `Gemfile`.

## Client

An Angular 2.0 app, even though Angular 2.0 is still not released yet. I hope this changes once the thesis is complete ... It uses Typescript, because I really like my compiler to catch dumb errors.

## Schema

Most exchange and storage formats are documented using [JSON Schema](http://json-schema.org/). These can be regenerated from the Typescript sources, but as this is quite a fragile process the specification files are also checked in to the repository.

## Documentation

Documentation for the API is provided following the OpenAPI-Specification, an [online version of the specification](http://petstore.swagger.io/?url=https://esqulino.marcusriemer.de/doc/swagger/swagger.yaml) is also available.

# Installing, Compiling and Running

* If you have the "big" dependencies installed (`ruby` for the Server, `node.js` for the client), a simple `make install-deps` should pull all dependencies.

* After that, the client needs to be compiled and packaged once: `make dist`.

* You may now run the server, to do this locally simply use `make server-run` and it will spin up a local server instance listening on port `9292`.

## About Windows ...

Currently it is assumed that this project will built on a UNIX-like environment. Although building it on Windows should be possible, all helper scripts (and Makefiles) make a lot of UNIX-centric assumptions. But don't worry if you are only interested in *running* a esqulino instance. You will be better off using a pre-compiled distribution of the client, but running the server should work just fine.

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

# Dependencies and Licenses

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

