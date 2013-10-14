/*
* @name : reset.js
* @porp: global setting js
* @author: yujiang
* @date: 2013 08 31
*/

KISSY.add('common/reset', function (S, Node, DOM, Event) {
	
	var $ = Node.all;


	//add mark in body for view port width
	function markView() {
		var viewPortWidth = DOM.viewportWidth();
		if ( viewPortWidth > 1260 ) {
			$('body').addClass('w1190');	
		} else {
			$('body').addClass('w990');	
		}
	}

	function globalSet() {
		/*
		Event.delegate(document, 'click', '.btn-disable', function(e){
			e.preventDefault();
		});
		*/
	}

	function readySet() {
		KISSY.ready(function(){
			//Guide.init();
		});
	}

	//import
	function init() {
		globalSet();
		markView();
		readySet();
	}

	return {
		init: init
	}

}, {
	requires: ['node', 'dom', 'event']
});
