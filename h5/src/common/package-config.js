/*
 combined files :

 common/package-config

 */
/**
 * 如何使用这个脚本
 * Step1. 引入 kissy/seed.js
 *
 * Step2. 引入 这个脚本(common/package-config.js)
 *
 * Step3. 使用下面代码 配置 ABC
 * <script>
 * ABC.config({
 *   pageName: 'list',
 *   pub: '1.1.1',
 *   path: 'http://g.tbcdn.cn/myGroup/myRepo/',
 *   charset: 'utf-8'
 * });
 * </script>
 */
(function (S) {

    window.ABC = window.ABC || {
        /**
         * Config Kissy 1.2 packages
         * of a FrontBuild Page
         * @param {Object} config
         * @param config.pageName     name of FrontBuild
         * @param config.pub      timestamp of published directory
         * @param config.path     url of you fbapp root
         * @param config.charset
         * @param config.debug    debug mode switch
         */
        config: function (config) {
            if (!config.path) {
                config.path = '';
            }

            var debug = config.debug ? true : KISSY.Config.debug;
            var debugPagePath = S.unparam(location.search.replace(/^\?/, ''))['ks-debug'];

            if ( debug ){
                if( debugPagePath ){
                    config.path = debugPagePath;
                    config.pub = "src";
                }
                else {
                    config.pub = 'src';
                }

                config.debug = true;
            }

            config.path = config.path.replace(/\/$/, '');

            var pkgs = [];
            var packageConfig = {};
            var pagePath = S.substitute('{path}/{pub}/pages/{pageName}', config);
            var widgetPath = S.substitute('{path}/{pub}', config);
            var commonPath = S.substitute('{path}/{pub}', config);
            var utilsPath = S.substitute('{path}/{pub}', config);

            //package config
            S.mix(packageConfig, config, true, [ 'charset' ]);

            //common package
            pkgs.push(S.merge(packageConfig, {
                name: 'common',
                path: commonPath
            }));

            //widget package
            pkgs.push(S.merge(packageConfig, {
                name: 'widget',
                path: widgetPath
            }));

            //utils package is only for dev mode
            if (debug) {
                pkgs.push(S.merge(packageConfig, {
                    name: 'utils',
                    path: utilsPath
                }));
            }

            //page packages
            pkgs.push(S.merge(packageConfig, {
                name: 'page',
                path: pagePath
            }));

            S.config({
                packages: pkgs
            });
        }
    };
})(KISSY);

//global setting
//http://qiang.taobao.com/json/todayItem.htm
(function(){
    if ( /\/\/qiang\.daily/ig.test(location.href) ) {
        window.JSON_URL_TODAY = '../data/todayList.php';    
    } else if ( /\/\/localhost/ig.test(location.href) ) {
        window.JSON_URL_TODAY = '../data/todayList.php';    
    } else {
        window.JSON_URL_TODAY = 'http://qiang.taobao.com/json/todayItem.htm';
    }
    window.JSON_URL_TOMORROW = 'http://qiang.taobao.com/json/tomorrowItem.htm';
    window.JSON_URL_TODAY = 'http://qiang.taobao.com/json/todayItem.htm';

    if ( !window.console ) {
        window.console = {
            log: function() {}
        }
    }
})();
