module.exports = function (grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-contrib-watch');

  var destPath =  '../dist/client/';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    ts: {
      default: {
        tsconfig: 'tsconfig.json'
      }
    },

    watch: {
      scripts: {
        files: ['**/*.ts', '!**/node_modules/**'],
        tasks: ['ts'],
        options: {
          spawn: false,
        },
      },
      css: {
        files: ['**/*.css'],
        tasks: ['copy'],
        options: {
          spawn: false,
        },
      },
      css: {
        files: ['**/*.html'],
        tasks: ['copy'],
        options: {
          spawn: false,
        },
      },
    },
    
    copy: {
      main: {
        files: [
          {
            expand: true,
            src: ['index.html', 'test.html', 'app/**/*.html', 'app/**/*.ts', 'app/**/*.css'],
            dest: destPath,
            filter: 'isFile'
          },
          {
            expand: true,
            src: ['vendor/**'],
            dest: destPath,
            filter: 'isFile'
          },
          {
            expand: true,
            src: ['node_modules/es6-shim/**/*.js',
                  'node_modules/jasmine-core/**/*.js',
                  'node_modules/jasmine-core/**/*.css',
                  'node_modules/systemjs/dist/**/*.js',
                  'node_modules/rxjs/bundles/**/*.js',
                  'node_modules/angular2/bundles/**/*.js'],
            dest: destPath,
            filter: 'isFile'
          }
        ],
      },
    }
  });

  grunt.registerTask('default', ['copy', 'ts']);
}
