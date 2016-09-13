// Generated on 2015-02-21 using
// generator-webapp 0.5.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// If you want to recursively match all subfolders, use:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
  grunt.option('color', false);

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Configurable paths
  var config = {
    app: 'app',
    dist: 'dist'
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    config: config,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: ['<%= config.app %>/scripts/{,*/}*.js'],
        tasks: ['jshint', 'copy:src', 'copy:server', 'copy:bower'],
        options: {
          livereload: 35722
        }
      },
      externalJs: {
        files: ['../../cheetajs/dist/cheetajs.js'],
        tasks: ['copy:external', 'jshint']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      styles: {
        files: ['<%= config.app %>/styles/{,*/}*.scss'],
        tasks: ['sass:compile']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= config.app %>/{,*/}*.html',
          '<%= config.app %>/styles/{,*/}*.css',
          '<%= config.app %>/images/{,*/}*',
          '../../cheetajs/dist/cheetajs.js'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9010,
        open: true,
        livereload: 35722,
        // Change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              connect.static('<%= config.app %>'),
              connect().use('/cheetajs', connect.static('../../cheetajs/dist')),
              connect().use('/bower_components', connect.static('./bower_components')),
              connect.static(config.app)
            ];
          }
        }
      },
      //test: {
      //  options: {
      //    open: false,
      //    port: 9011,
      //    middleware: function(connect) {
      //      return [
      //        connect.static('test'),
      //        connect().use('/bower_components', connect.static('./bower_components')),
      //        connect.static(config.app)
      //      ];
      //    }
      //  }
      //},
      dist: {
        options: {
          base: '<%= config.dist %>',
          livereload: false
        }
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= config.dist %>/*',
            '!<%= config.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= config.app %>/scripts/{,*/}*.js',
        '!<%= config.app %>/scripts/vendor/*',
        'test/spec/{,*/}*.js'
      ]
    },

    // Automatically inject Bower components into the HTML file
    wiredep: {
      app: {
        ignorePath: /^\/|\.\.\//,
        src: ['<%= config.app %>/index.html']
      }
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= config.dist %>/scripts/{,*/}*.js',
            '<%= config.dist %>/styles/{,*/}*.css',
            '<%= config.dist %>/images/{,*/}*.*',
            '<%= config.dist %>/styles/fonts/{,*/}*.*',
            '<%= config.dist %>/*.{ico,png}'
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      options: {
        dest: '<%= config.dist %>',
        js: {
          steps: {
            js: ['concat'],
            css: ['concat']
          },
          post: {}
        }
      },
      html: '<%= config.app %>/index.html'
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      options: {
        assetsDirs: [
          '<%= config.dist %>',
          '<%= config.dist %>/images',
          '<%= config.dist %>/styles'
        ]
      },
      html: ['<%= config.dist %>/{,*/}*.html'],
      css: ['<%= config.dist %>/styles/{,*/}*.css']
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/images',
          src: '{,*/}*.{gif,jpeg,jpg,png}',
          dest: '<%= config.dist %>/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= config.dist %>/images'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
          removeAttributeQuotes: true,
          removeCommentsFromCDATA: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true,
          removeRedundantAttributes: true,
          useShortDoctype: true
        },
        files: [{
          expand: true,
          cwd: '<%= config.dist %>',
          src: '{,*/}*.html',
          dest: '<%= config.dist %>'
        }]
      }
    },

    uglify: {
      dist: {
        files: {
          '<%= config.dist %>/scripts/scripts.js': [
            '<%= config.dist %>/scripts/scripts.js'
          ]
        }
      }
    },
    concat: {
      dist: {}
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= config.app %>',
          dest: '<%= config.dist %>',
          src: [
            '*.{ico,png,txt}',
            'images/{,*/}*.webp',
            '{,*/}*.html',
            'styles/fonts/{,*/}*.*'
          ]
        }
          //,
          //  {
          //  src: 'node_modules/apache-server-configs/dist/.htaccess',
          //  dest: '<%= config.dist %>/.htaccess'
          //}
        ]
      },
      external: {
        expand: true,
        dot: true,
        cwd: '<%= config.app %>/../../../../cheetajs/dist',
        dest: '<%= config.app %>/scripts/',
        src: 'cheetajs.js'
      },
      src: {
        expand: true,
        dot: true,
        cwd: '<%= config.app %>',
        dest: '<%= config.dist %>',
        src: '{,*/}*'
      },
      server: {
        expand: true,
        dot: true,
        cwd: '<%= config.app %>',
        dest: '<%= config.dist %>/../../target/javafiddle-cloud-0.0.1',
        src: '{,*/}*'
      },
      bower: {
        expand: true,
        dot: true,
        cwd: '<%= config.app %>/..',
        src: 'bower_components/**',
        dest: '<%= config.dist %>/../../target/javafiddle-cloud-0.0.1/'
      }
    },

    // Run some tasks in parallel to speed up build process
    concurrent: {
      server: ['sass:compile'],
      dist: [
        'imagemin',
        'svgmin'
      ]
    },
    sass: {
      compile: {
        files: {
          '<%= config.app %>/styles/main.css': '<%= config.app %>/styles/main.scss'
        }
      }
    }
  });


  grunt.registerTask('serve', 'start the server and preview your app, --allow-remote for remote access', function (target) {
    if (grunt.option('allow-remote')) {
      grunt.config.set('connect.options.hostname', '0.0.0.0');
    }
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'wiredep',
      'concurrent:server',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', function (target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run([target ? ('serve:' + target) : 'serve']);
  });

  //grunt.registerTask('test', function (target) {
  //  if (target !== 'watch') {
  //    grunt.task.run([
  //      'clean:server',
  //      'concurrent:test',
  //    ]);
  //  }
  //
  //  grunt.task.run([
  //    'connect:test',
  //    'mocha'
  //  ]);
  //});

  grunt.registerTask('build-dev', [
    'copy:src',
    'copy:external'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'wiredep',
    'useminPrepare',
    'concurrent:dist',
    'concat',
    'uglify',
    'copy:dist',
    'copy:external',
    'rev',
    'usemin',
    'htmlmin'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    //'test',
    'build'
  ]);
};
