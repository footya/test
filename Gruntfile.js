var KISSYCake= require( 'abc-gruntfile-helper').kissycake;

module.exports = function (grunt) {

    var ABCConfig = grunt.file.readJSON('abc.json');

    /**
     *  分析用户给定的参数
     *  @example
     *      打包common：    `grunt common`
     *      单个：
     *          打包page：  `grunt build --page home --widget tooltip`
     *          watch：    `grunt watch --page home--widget tooltip
     *      多个：
     *          打包：     `grunt build --page home,intro --widget tooltip,scroll`
     *          watch:    `grunt watch --page home,intro --widget tooltip,scroll`
     */
    var options = KISSYCake.parse( grunt, ABCConfig._kissy_cake.defaults );

    /**
     * 对每个具体任务进行配置
     */
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        buildBase: 'build',
        srcBase: 'src',
        // 包名
        packageName: 'page',
        // 页面名称
        pageName: options.pageName,
        // Widget名称
        widgetName: options.widgetName,

        // 用于页面打包路径
        pageSrcBase: '<%= srcBase %>/pages/<%= pageName %>/<%= packageName %>',
        widgetSrcBase: '<%= srcBase %>/widget/<%= widgetName %>',
        commonSrcBase: '<%= srcBase %>/common',
        utilsSrcBase: '<%= srcBase %>/utils',

        // 打包输出目录
        pageBuildBase: '<%= buildBase %>/pages/<%= pageName %>/<%= packageName %>',
        widgetBuildBase: '<%= buildBase %>/widget/<%= widgetName %>',
        commonBuildBase: '<%= buildBase %>/common',

        /**
         * 进行KISSY 打包
         * @link https://github.com/daxingplay/grunt-kmc
         */
        kmc: {
            options: {
                packages: [
                    {
                        name: '<%= packageName %>',
                        path: '<%= srcBase %>/pages/<%= pageName %>'
                    },
                    {
                        name: 'widget',
                        path: './<%= srcBase %>'
                    },
                    {
                        name: 'utils',
                        path: './<%= srcBase %>'
                    },
                    {
                        name: 'common',
                        path: './<%= srcBase %>'
                    }
                ]
            },



            page: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= pageSrcBase %>',
                        src: [ '*.js', '!*.combo.js', '!*-min.js', '!*-tpl.js' ],
                        dest: '<%= pageBuildBase %>/'
                    }
                ]
            },

            widget: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= widgetSrcBase %>',
                        src: [ '*.js', '!*.combo.js', '!*-min.js', '!*-tpl.js' ],
                        dest: '<%= widgetBuildBase %>/'
                    }
                ]
            },

            common: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= commonSrcBase %>',
                        src: [ '**/*.js', '!**/*.combo.js', '!**/_*.js', '!**/*-min.js', '!**/*-tpl.js' ],
                        dest: '<%= commonBuildBase %>'
                    }
                ]
            }
        },

        /**
         * 将HTML编译为KISSY 模块
         * @link https://github.com/maxbbn/grunt-kissy-template
         */
        ktpl: {
            page: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= pageSrcBase %>',
                        dest: '<%= pageSrcBase %>',
                        src: '**/*-tpl.html',
                        ext: '.js'
                    }
                ]
            },

            widget: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= widgetSrcBase %>',
                        dest: '<%= widgetSrcBase %>',
                        src: '**/*-tpl.html',
                        ext: '.js'
                    }
                ]
            },

            utils: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= utilsSrcBase %>',
                        dest: '<%= utilsSrcBase %>',
                        src: '**/*-tpl.html',
                        ext: '.js'
                    }
                ]
            },

            common: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= commonSrcBase %>',
                        dest: '<%= commonSrcBase %>',
                        src: '**/*-tpl.html',
                        ext: '.js'
                    }
                ]
            }
        },
        /**
         * CSS Combo
         * @link https://github.com/daxingplay/grunt-css-combo
         */
        css_combo: {
            options: {
                paths: [ '<%= srcBase %>' ]
            },
            page: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= pageSrcBase %>',
                        src: '*.css',
                        dest: '<%= pageBuildBase %>'
                    }
                ]
            },

            widget: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= widgetSrcBase %>',
                        src: '*.css',
                        dest: '<%= widgetBuildBase %>'
                    }
                ]
            },

            common: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= commonSrcBase %>',
                        src: [ '**/*.css', '!**/_*.css' ],
                        dest: '<%= commonBuildBase %>'
                    }
                ]
            }
        },

        /**
         * 对JS文件进行压缩
         * @link https://github.com/gruntjs/grunt-contrib-uglify
         */
        uglify: {
            options: {
                beautify: {
                    ascii_only: true
                }
            },
            page: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= pageBuildBase %>',
                        src: ['**/*.js', '!**/*-min.js'],
                        dest: '<%= pageBuildBase %>',
                        ext: '-min.js'
                    }
                ]
            },
            widget: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= widgetBuildBase %>',
                        src: ['**/*.js', '!**/*-min.js'],
                        dest: '<%= widgetBuildBase %>',
                        ext: '-min.js'
                    }
                ]
            },
            common: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= commonBuildBase %>',
                        src: ['**/*.js', '!**/*-min.js'],
                        ext: ['-min.js'],
                        dest: '<%= commonBuildBase %>'
                    }
                ]
            }
        },

        /**
         * 对CSS 文件进行压缩
         * @link https://github.com/gruntjs/grunt-contrib-cssmin
         */
        cssmin: {
            page: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= pageBuildBase %>',
                        src: ['**/*.css', '!**/*-min.css'],
                        dest: '<%= pageBuildBase %>',
                        ext: '-min.css'
                    }
                ]
            },
            widget: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= widgetBuildBase %>',
                        src: ['**/*.css', '!**/*-min.css'],
                        dest: '<%= widgetBuildBase %>',
                        ext: '-min.css'
                    }
                ]
            },
            common: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= commonBuildBase %>',
                        src: ['**/*.css', '!**/*-min.css'],
                        dest: '<%= commonBuildBase %>',
                        ext: '-min.css'
                    }
                ]
            }
        },

        /**
         * 对文件进行监控
         * watch的一个trick是，如果两个定义的files一样，那么只会执行最后一个的task
         * watch这块的定义比较复杂，简要说明：
         *      命名：
         *          资源类型 位置 针对目标: 如 JS_utils_widget
         *          JS代表是JS文件，utils说明是uitls文件夹中的js文件，widget说明这个位置的js文件变更只进行widget的打包
         *      动态配置：
         *          根据执行的任务不同，脚本中会动态去设置下面的配置，如只watch widget，就会将非_widget的配置项都删除
         */
        watch: {
            // 所有在utils中的js文件变更将重新build widget
            'js_utils_widget': {
                files: [ '<%= utilsSrcBase %>/**/*.js' ],
                tasks: [ 'kmc:widget', 'uglify:widget' ]
            },
            // 所有在utils中的js文件变更将重新build page
            'js_utils_page': {
                files: [ '<%= utilsSrcBase %>/**/*.js' ],
                tasks: [ 'kmc:page', 'uglify:page' ]
            },
            // 所有在utils中的js文件变更将重新build common
            'js_utils_common': {
                files: [ '<%= utilsSrcBase %>/**/*.js' ],
                tasks: [ 'kmc:common', 'uglify:common' ]
            },
            // 所有在某个widget中的js文件变更将重新build对应的 widget
            'js_widget_widget': {
                files: [ '<%= widgetSrcBase %>/**/*.js' ],
                tasks: [ 'kmc:widget', 'uglify:widget' ]
            },
            // 任意widget中的js文件变更将重新build page
            'js_widget_page': {
                files: [ '<%= srcBase %>/widget/**/*.js' ],
                tasks: [ 'kmc:page', 'uglify:page' ]
            },
            // 所有在某个page中的js文件变更将重新build对应的 page
            'js_page': {
                files: [ '<%= pageSrcBase %>/**/*.js' ],
                tasks: [ 'kmc:page', 'uglify:page' ]
            },
            // 所有在某个common中的js文件变更将重新build common
            'js_common': {
                files: [ '<%= commonSrcBase %>/**/*.js' ],
                tasks: [ 'kmc:common', 'uglify:common' ]
            },
            // 所有位置的tpl变更，都只需要重新编译自己就可以了，因为tpl的编译会触发js的变更
            'tpl_utils_widget': {
                files: [ '<%= utilsSrcBase %>/**/*-tpl.html' ],
                tasks: [ 'ktpl:utils' ]
            },
            'tpl_utils_page': {
                files: [ '<%= utilsSrcBase %>/**/*-tpl.html' ],
                tasks: [ 'ktpl:utils' ]
            },
            'tpl_utils_common': {
                files: [ '<%= utilsSrcBase %>/**/*-tpl.html' ],
                tasks: [ 'ktpl:utils' ]
            },
            'tpl_widget_widget': {
                files: [ '<%= widgetSrcBase %>/**/*-tpl.html' ],
                tasks: [ 'ktpl:widget' ]
            },
            'tpl_widget_page': {
                files: [ '<%= srcBase %>/widget/**/*-tpl.html' ],
                tasks: [ 'ktpl:widget' ]
            },
            'tpl_page': {
                files: [ '<%= pageSrcBase %>/**/*-tpl.html' ],
                tasks: [ 'ktpl:page' ]
            },
            'tpl_common': {
                files: [ '<%= commonSrcBase %>/**/*-tpl.html' ],
                tasks: [ 'ktpl:common' ]
            },
            // utils目录中的CSS文件变更，就build widget
            'css_utils_widget': {
                files: [ '<%= utilsSrcBase %>/**/*.css' ],
                tasks: [ 'css_combo:widget', 'cssmin:widget' ]
            },
            // utils目录中的CSS文件变更，就build page
            'css_utils_page': {
                files: [ '<%= utilsSrcBase %>/**/*.css' ],
                tasks: [ 'css_combo:page', 'cssmin:page' ]
            },
            'css_utils_common': {
                files: [ '<%= utilsSrcBase %>/**/*.css' ],
                tasks: [ 'css_combo:common', 'cssmin:common' ]
            },
            // 某个widget目录中的CSS文件变更，就build 对应的widget
            'css_widget_widget': {
                files: [ '<%= widgetSrcBase %>/**/*.css' ],
                tasks: [ 'css_combo:widget', 'cssmin:widget' ]
            },
            // 任意widget目录中的CSS文件变更，就build page
            'css_widget_page': {
                files: [ '<%= srcBase %>/widget/**/*.css' ],
                tasks: [ 'css_combo:page', 'cssmin:page' ]
            },
            // 某个page目录中的CSS文件变更，就build对应的page
            'css_page': {
                files: [ '<%= pageSrcBase %>/**/*.css' ],
                tasks: [ 'css_combo:page', 'cssmin:page' ]
            },
            'css_common': {
                files: [ '<%= commonSrcBase %>/**/*.css' ],
                tasks: [ 'css_combo:common', 'cssmin:common' ]
            }
        }
    });

    /**
     * 载入使用到的通过NPM安装的模块
     */
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    /**
     * 注册基本任务
     */
    grunt.registerTask('default', [ 'all' ]);

    /**
     * 对page进行打包
     *      html -> js, KISSY pkg, js compression, less/sass compile, css compression.
     */
    grunt.registerTask('page', [ 'ktpl:utils', 'ktpl:page', 'kmc:page', 'uglify:page', 'css_combo:page', 'cssmin:page']);
    /**
     * 对widget进行打包
     *      html -> js, KISSY pkg, js compression, less/sass compile, css compression.
     */
    grunt.registerTask('widget', [ 'ktpl:utils', 'ktpl:widget', 'kmc:widget', 'uglify:widget', 'css_combo:widget', 'cssmin:widget']);
    /**
     * 对common进行打包
     *      html -> js, KISSY pkg, js compression, less/sass compile, css compression.
     */
    grunt.registerTask('common', [ 'ktpl:utils', 'ktpl:common', 'kmc:common', 'uglify:common', 'css_combo:common', 'cssmin:common']);

    /**
     * 初始化KISSY-Cake的任务注册
     */
    KISSYCake.taskInit();
};