/*
* @name: home page init.js
* @author: yujiang
* @prop: home page import
* @date: 2013 10 09
*/

KISSY.add(function (S, PlayMaker) {

	try {
		PlayMaker.init();
	} catch(e) {
		console.log(e);
	}

}, {
    requires: ['./module-playmaker']
});
