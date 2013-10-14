/*
* @name: module-prehot.js
* @author: yujiang
* @prop: pre hot
* @date: 2013 09 04
*/

KISSY.add('page/module-prehot', function(S, Node, DOM, UA) {

	var $ = Node.all;
	
	//background layer object
	var Bglayer = {
		el: $('<div id="qp-layer" style="z-index:998;"></div>'),
		show: function() {
			if ( !$('#qp-layer')[0] ) {
				$('body').append(this.el);
			}
			this.el.show();	
		},
		hide: function() {
			this.el.hide();	
		}
	};

	function init() {

		//disable scroll
		$(window).scrollTop(0);
		$('html').css('overflow', 'hidden');
		$('html').css('height', DOM.viewportHeight()+'px');

		Bglayer.show();
		var url = "http://bbs.taobao.com/catalog/thread/16281010-263748145.htm?spm=0.0.0.0.13O45T";
		var el = '<div id="pre-hot-box">';

		if ( UA.shell.toUpperCase() == 'IE' && UA[UA.shell] < 7 ) {
			//ie 6
			el += '<img src="http://gtms02.alicdn.com/tps/i2/T1IEWDFXhgXXcEdaHx-815-246.png">'
			$('#qp-layer').append('<img src="about:blank">');
			$('#qp-layer').css({
				'position': 'absolute',
				'top': '0',
				'left': '0',
				'height': DOM.viewportHeight()+'px',
				'width': '100%',
				'zoom': '1'
			});

		} else {
			el += '<img src="http://gtms01.alicdn.com/tps/i1/T1imGHFhlXXXa5MrHV-828-264.png">'
		}

		el += '<a target="_self" href="'+url+'">know new rule</a>'
		el += '</div>';
		$('body').append($(el));			
	}

	return {
		init: init
	}

}, {
	requires: ['node', 'dom', 'ua', 'page/module-prehot.css']
})