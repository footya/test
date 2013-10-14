/*
* @name: module-test.js
* @author: yujiang
* @prop: ABtest
* @date: 2013 10 10 
*/

KISSY.add('page/module-test', function(S, Node, Ajax, LocalStorage) {

	var $ = Node.all;

	//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+
    //+ 入口函数 - 所有逻辑在此，方便explote
    //+
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	function init() {
		//抢拍按钮ABtest	
		var url = 'http://a.tbcdn.cn/s/fdc/xwj.js';

		KISSY.getScript(url, function(data) {

			ABtest();

		});
	}

	function getRandom(min, max) {
		return Math.floor(Math.random()*(max+1-min))+min;
	}

	//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+
    //+ ABtest - 实现按钮ABtest逻辑
    //+
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	function ABtest() {
		var btn = $('.btn-privilege-buy');
		var type = getRandom(0, 1);

		var tag = LocalStorage.getItem('qb_ab_test');

		if ( tag ) {
			type = tag;
		}

		//红色按钮
		if ( type == 0 ) {

			if ( !tag ) {
				LocalStorage.setItem('qb_ab_test', 0);
			}
			btn.addClass('btn-privilege-buy-red');
			btn.on('click', function() {
				window._ap_xwj && _ap_xwj.monitor("131008-255");
			});

		//灰色按钮
		} else if ( type == 1 ) {

			if ( !tag ) {
				LocalStorage.setItem('qb_ab_test', 1);
			}
			btn.addClass('btn-privilege-buy-gray');
			btn.on('click', function() {
				window._ap_xwj && _ap_xwj.monitor("131008-256");
			});

		} else {

		}

	}

	return {
		init: init
	}


}, {
	requires: ['node', 'ajax', 'widget/localstorage/index']	
});