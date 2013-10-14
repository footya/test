/*
* @name : home/index.js
* @porp: home page main js
* @author: yujiang
* @date: 2013 08 31
*/

//begin

KISSY.add(function(S, TODAY, TEST,
    RESET ) {

    //ready!!!
    KISSY.ready(function() {

        //try catch
        try {

            //reset 
            RESET.init();
            TODAY.init(function() {
                //ab test
                TEST.init();
            });

        } catch(e) {
            console.log(e); 
        }// end try catch

    });

}, {
    requires: ['page/module-today', 'page/module-test',
        'common/reset']
});