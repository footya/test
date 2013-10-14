/*
* @name: tomorrow page init.js
* @author: yujiang
* @prop: home page import
* @date: 2013 10 13
*/

KISSY.add(function (S, Tomorrow) {

    try {
        Tomorrow.init();
    } catch(e) {
        console.log(e);
    }

}, {
    requires: ['./module-tomorrow']
});
