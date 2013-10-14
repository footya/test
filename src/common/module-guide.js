/*
* @name: module-guide.js
* @author: yujiang
* @prop: fish guid
* @date: 2013 09 02
*/

KISSY.add('common/module-guide', function(S, Node, DOM, UA, Slide, LocalStorage) {

	var $ = Node.all;
	
	//background layer object
	var Bglayer = {
		el: $('<div id="qp-layer"></div>'),
		show: function() {
			if ( !$('#qp-layer')[0] ) {
				$('body').append(this.el);
			}
			this.el.show();	
		},
		hide: function() {
			this.el.hide();	

			//disable scroll
			$('html').css('overflow', 'auto');
			$('html').css('height', 'auto');
		}
	}

	//guide slider
	var Slider = {
		el: '',
		add: function(tpl) {
			var content = this.el.all('.tab-content');	
			content.append(tpl);
		},
		build: function() {

			var sliderEl = '<div id="hd-guide-slider">';
				sliderEl += '<span class="btn-close"></span>';
				sliderEl += '<a class="btn-prev"><span class="icon"></span></a>';
				sliderEl += '<a class="btn-next"><span class="icon"></span></a>';
				sliderEl += '<ul class="tab-nav"></ul><div class="tab-content"></div>';
				sliderEl += '</div>';	

			this.el = $(sliderEl);

			//img src
			var src = [];
			src.push('http://gtms01.alicdn.com/tps/i1/T1djCDFl8fXXXXH6bx-708-264.png');
			src.push('http://gtms03.alicdn.com/tps/i3/T1ctCEFfpdXXa3p7v8-729-266.png');
			src.push('http://gtms02.alicdn.com/tps/i2/T1xOqEFjBeXXbHCs.7-767-302.png');
			src.push('http://gtms04.alicdn.com/tps/i4/T1bMWHFXhaXXbbXsQU-762-277.png');
			src.push('http://gtms03.alicdn.com/tps/i3/T11leFFfJcXXcnZBLH-581-319.png');

			var html = '';

			for ( var i = 0; i < src.length; i++ ) {
				html = '<div class="tab-pannel" id="guide-item-'+i+'">';
				html += '<img src="'+src[i]+'">';
				if ( i == src.length-1 ) {
					html += '<div class="guide-next">next</div><div id="hd-guide-slider-over">over</div>';
				} else {
					html += '<div class="guide-next">next</div>';
				}
				html += '</div>';

				this.add(html);
			}
		},
		hide: function() {
			this.el.remove();
		},
		init: function() {

			this.build();

			$('body').append(this.el);

			var s = new Slide('hd-guide-slider', {
				effect: 'fade',
				speed: 100
			});

			this.el.all('.btn-next').on('click', function() {
				s.next();
			});
			this.el.all('.btn-prev').on('click', function() {
				s.previous();
			});
			this.el.all('.guide-next').on('click', function() {
				s.next();
			});
			this.el.all('.btn-close').on('click', function() {
				Bglayer.hide();
				Slider.hide();
			});
			$('#hd-guide-slider-over').on('click', function() {
				Bglayer.hide();
				Slider.hide();
			});
		}
	}

	function build() {

		//disable scroll
		$(window).scrollTop(0);
		$('html').css('overflow', 'hidden');
		$('html').css('height', DOM.viewportHeight()+'px');

		Bglayer.show();	
		Slider.init();
	}

	function init() {
		//fix bug
		if ( !LocalStorage.getItem('qp_fish_guide') && 
			!(UA.shell.toUpperCase() == 'IE' && UA[UA.shell] < 7) ) {

			LocalStorage.setItem('qp_fish_guide', 1);
			build();
		}

		//
		$('#J_palyrule').on('click', function() {
			build();
		});
	}

	return {
		init: init,
		show: build
	}

}, {
	requires: ['node', 'dom', 'ua', 'widget/slide/index', 'widget/localstorage/index',
		'common/module-guide.css']	
});