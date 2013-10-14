/*
* @name : tomorrow/index.js
* @porp: tomorrow page main js
* @author: yujiang
* @date: 2013 08 31
*/

KISSY.add(function(S, RESET, Tomorrow) {

    //ready!!!
    KISSY.ready(function() {

        try {
            RESET.init();
            Tomorrow.init();
        } catch(e) {
            console.log(e); 
        }

    });


}, {
    requires: ['common/reset', 'page/module-tomorrow']
});
