# The "Lets try the Scratch-Approach for SQL"-Project

For a lack of a better name, this is all I have got at the moment.

# Installing and Running

This project consists of two components: A Ruby-webserver and a Angular2-client. I know there are loads of fancy task-runners out there, but my "normal" interface to all programming-related tasks is still a Makefile.

* If you have the "big" dependencies installed (Ruby for the Server and Node.js for the client), a simple `make install-deps` should pull all dependencies.

* After that, the client needs to be compiled once: `make client-compile`.

* You may now run the server, to do this locally simply use `make server-run` and it will spin up a local webrick instance at port `9292`.

## Server

Developed on a system running `ruby 2.3.0p0 (2015-12-25 revision 53290) [x86_64-linux]` and (for the moment) not tested elsewhere. That said, it uses Sinatra which should run virtually anywhere and does not make use of any too fancy Ruby features. So it will probably run on different configurations.

Requires `gem` and `bundle` to be available, dependencies are provided in a `Gemfile`.

## Client

An Angular 2.0 app, even though Angular 2.0 is still in beta. I hope this changes once the thesis is complete ... It uses Typescript, because I really like my compiler to catch dumb errors.

# License

This project is licensed under the terms of the [GNU Affero General Public License (AGPL)](https://www.gnu.org/licenses/agpl.html).

# Dependencies and Licenses

This project relies on a rich set of other projects, the most notable ones are listed here.

Name                                                       | Used for                                                 | Runs on      | License
---------------------------------------------------------- | -------------------------------------------------------- | ------------ | -------
[Angular 2.0](https://angular.io/)                         | Frontend GUI                                             | Client       | MIT
[Ruby](https://www.ruby-lang.org/)                         | Server-side scripting language                           | Server       | Ruby
[Sinatra](http://www.sinatrarb.com/)                       | HTTP Handling and routing for backend                    | Server       | MIT
[Sinatra Contrib](http://www.sinatrarb.com/contrib/)       | Config-File, Code-Reloading and JSON serialization       | Server       | MIT
[SQLite 3](https://www.sqlite.org/)                        | Database backend for projects                            | Both         | CC0
[Typescript](http://www.typescriptlang.org/)               | Client-side scripting language                           | Client       | Apache 2.0

