# The BlattWerkzeug-Project

Conventional development environments are programs that are tailored to suit the needs of professionals. Due to their complexity they do not lend themselves well to introduce pupils to programming. This project is the prototypical implementation of an educational software for database- and web-development.

To eliminate the possibility of syntactical errors while programming, the elements of the programming- or markup-languages are represented by graphical blocks, similar to the approach taken by the software [Scratch](https://scratch.mit.edu/). These blocks can be combined by using drag & drop operations. The syntactical structures of `SQL` and `HTML` are not hidden from the user, but it is not mandatory to internalize them. This approach allows pupils to program and share their own websites, without the need to type lines of code.

Not (yet?) a developer? Then you probably want to check out [BlattWerkzeug.de](http://blattwerkzeug.de) for the hosted version of this project. But beware: The current implementation of this software is **not yet ready** to be used in a classroom. It’s main purpose is to demonstrate and field test the various concepts.

## About the name ...

For a lack of a better name, this is all I have got at the moment. I simply took the very generic term "page tool" and losely translated it into german. The project used to be called "esqulino", a phonetic play on the `SQL`-abbreviation ending in "lino", which is used by many popular programs on the german KIKA ("KinderKanal", german for "childrens channel").

# Project Setup

This project consists of two main executable components: A Ruby-webserver and a Angular-client. Take a look at the `README.md` in the respective folders to find out how to work with these components in detail.

I know there are loads of fancy task-runners out there, but my "normal" interface to all programming-related tasks is still a `Makefile`. Most tasks you will need to do regulary are therefore available via `make`. Apart from that there are folders for schemas, documentation, example projects and helper scripts.

Most exchange and storage formats are documented using [JSON Schema](http://json-schema.org/). These can be regenerated from the Typescript sources, but as this is quite a fragile process the specification files are also checked in to the repository.

## A word about subdomains

BlattWerkzeug makes use of subdomains to render the public representation of a project. The development environment assumes, that any subdomains of `localhost.localdomain` will be routed to the `localhost`. The URL `http://cyoa.localhost.localdomain` should for example resolve to your `localhost` and would display the rendered index-page of the project `cyoa`. This works out of the box on various GNU/Linux-distributions, but as this behaviour is not standardised it should not be relied upon. To reliably resolve project-subdomains you should either write custom entries for each project in `/etc/hosts` or use a lightweight local DNS-server like [Dnsmasq](http://www.thekelleys.org.uk/dnsmasq/doc.html).

## A word about `REGEXP` and SQLite

Database schemas created with BlattWerkzeug make use of regular expressions which are usually not compiled into the `sqlite3` binary. To work around this most distributions provide some kind of `sqlite3-pcre`-package which provides the regex implementation.

* Ubuntu: sqlite3-pcre
* Arch Linux: [sqlite-pcre-git (AUR)](https://aur.archlinux.org/packages/sqlite-pcre-git/)

These packages should install a single library at `/usr/lib/sqlite3/pcre.so` which can be loaded with `.load /usr/lib/sqlite3/pcre.so` from the `sqlite3`-REPL. If you wish, you can write the same line into a file at `~/.sqliterc` which will be executed by `sqlite3` on startup.

## Running on your local machine

If you have the "big" dependencies installed (`ruby` and `bundle` for the Server, `node` and `npm` for the client) you should have no trouble running everything locall.

* `make install-deps` will pull all further dependencies that are managed by the respective packet managers.
* After that, the client needs to be compiled and packaged once: `make dist` for a fully optimized version or `make dist-dev` for a development version.
* You may now run the server, to do this locally simply use `make server-run` and it will spin up a local server instance listening on port `9292`.

The setup above is helpful to get the whole project running once, but if you want do develop it any further you are better of with the following options:

* Run `NG_OPTS="--watch" make dist-dev` in the `client` folder. The `--watch` option starts a filesystem watcher that rebuilds the client incrementally on any change, which drastically reduces subsequent compile times.
* Run `make run-dev` in the `server` folder. This starts Rails in development mode which reloads altered parts of the server before every request.

## Running via Docker

There are pre-built docker images for development use on docker hub: [marcusriemer/sqlino](https://hub.docker.com/r/marcusriemer/sqlino/). These are built using the various `Dockerfile`s in this repository and can also be used with the `docker-compose.yml` file which is also part of this repository. Under the hood these containers use the same `Makefile`s and commands that have been mentioned above.

* `sudo make -f Makefile.docker run-dev` starts two docker containers that continously watch for changes to the `server` and `client` folders. It mounts the projects root ordner as volumes into the containers, which allows you to edit the files in `server` and `client` in your usual environment.

## Updating

* Re-sync your local repository with the server using `git pull`.
* Ensure all dependencies are up to date by running `make install-deps`. If things start to throw awfully funny error messages around you might want to get rid of dependencies first by calling `make clean-deps`.
* Rebuild the client using `make dist`
* If the server was running during the update, it needs to be restarted.
* You possibly need to upgrade your local projects using `make server-migrate-projects`. This is necesarry if the on-disk format for projects has changed.

## About Windows ...

Currently it is assumed that this project will built on a UNIX-like environment. Although building it on Windows should be possible, all helper scripts (and Makefiles) make a lot of `UNIX`-centric assumptions. But don't worry if you are only interested in *running* a BlattWerkzeug instance. You will be better off using a pre-compiled distribution of the client, but running the server should work just fine. Alternatively take a look at the docker images that are provided.

# Testing

BlattWerkzeug aims to be thoroughly tested and does this on more or less three levels. All tests can be invoked together by simply calling `make test` in the `client` or `server` directory. These tests are also executed on every built that is pushed to BitBucket (via `bitbucket-pipelines.yml) or GitHub (via `.travis.yml`).

## Client-Side Unit Tests

Running `make test` in the `client` folder executes the Angular-tests in a (per default) headless Chrome browser.

## Server-Side Unit Tests

Running `make test` in the `server` folder executes the Rails-tests.

## End-To-End (e2e) Tests

Untested and not running for the moment :(

# License

This project itself is licensed under the terms of the [GNU Affero General Public License (AGPL)](https://www.gnu.org/licenses/agpl.html). The documentation, including the masters thesis, is licensed under [CC-BY-SA](https://creativecommons.org/licenses/by-sa/4.0/).

## Dependencies and Licenses

This project relies on a rich set of other projects, the most notable ones are listed here in alphabetical order.

Name                                                       | Used for                                                 | Site         | License
---------------------------------------------------------- | -------------------------------------------------------- | ------------ | -------
[Angular 2.0](https://angular.io/)                         | Frontend GUI                                             | Client       | MIT
[Font Awesome](http://fontawesome.io)                      | Icons for the Frontend User Interface                    | Client       | SIL Open Font
[Liquid](http://liquidmarkup.org/)                         | Server-side templating language                          | Server       | MIT
[Rails](http://rubyonrails.org/)                           | Server-side web framework                                | Server       | MIT
[Ruby](https://www.ruby-lang.org/)                         | Server-side scripting language                           | Server       | Ruby
[SQLite 3](https://www.sqlite.org/)                        | Database backend for projects                            | Server       | CC0
[SCrypt for Ruby](https://github.com/pbhogan/scrypt)       | Password Storage                                         | Server       | BSD 3-Clause
[Typescript](http://www.typescriptlang.org/)               | Client-side scripting language                           | Client       | Apache 2.0
[Typescript JSON Schema](https://github.com/YousefED/typescript-json-schema) | JSON Schema Generation                 | Development  | Apache 2.0

