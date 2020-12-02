module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    const outDir = 'dist';
    const buildTasks = ['tslint', 'ts', 'copy', 'shell:doneBuilding'];
    const typescriptFiles = ['src/**/*.ts'];

    grunt.initConfig({
        watch: {
            ts: {
                files: typescriptFiles,
                tasks: buildTasks,
            },
        },
        tslint: {
            options: {
                configuration: 'tslint.json',
            },
            files: {
                src: typescriptFiles,
            },
        },
        exec: {
            start: {
                command: `node ${outDir}/main.js`
            }
        },
        ts: {
            default: {
                tsconfig: true
            }
        },
        shell: {
            doneBuilding: {
                command: 'touch .changes'
            }
        },
        copy: {
            main: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: '*.ts',
                    dest: outDir + '/src/'
                }]
            }
        },
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            run: ['nodemon', 'watch'],
            build: ['ts']
        },
        nodemon: {
            dev: {
                script: `${outDir}/main.js`,
                options: {
                    watch: ['.changes'],
                    delay: 200,
                    legacyWatch: true
                }
            }
        }
    });

    grunt.registerTask('build', buildTasks);
    grunt.registerTask('dev', ['build', 'concurrent:run']);
    grunt.registerTask('prod', 'exec:start');
};
