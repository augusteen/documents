module.exports = function(grunt) {

    require('time-grunt')(grunt);

    grunt.initConfig({
        jsdoc: {
            ink: {
                src: ['src/*.js'],
                options: {
                    destination: 'doc',
                    configure: 'jsdoc.conf.json',
                    rescurse: true,
                    private: true,
                    template: './node_modules/ink-docstrap/template'
                        // template: './node_modules/docdash'
                }
            },
            docdash: {
                src: ['src/*.js'],
                options: {
                    destination: 'docdash',
                    configure: 'jsdoc.conf.json',
                    rescurse: true,
                    private: true,
                    // template: './node_modules/ink-docstrap/template'
                    template: './node_modules/docdash'
                }
            }
        },
        documentation: {
            default: {
                files: [{
                    "expand": true,
                    "cwd": "src",
                    "src": ["**/*.js"]
                }],
                options: {
                    destination: "docs"
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-documentation');
}
