/*
* @name: home page palymaker.js
* @author: yujiang
* @prop: home page play box builder
* @date: 2013 10 10
*/

KISSY.add(function (S, Node, DOM, IO, Countdown, Time, Tmpl) {

	var $ = Node.all;

	var once_flag = true;
	
	//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+
    //+ 入口函数 - 所有逻辑在此，方便explote
    //+
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	function init() {
		var tpl = $('#tpl-play-list');

		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	    //+
	    //+ 懒加载
	    //+
	    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	    function lazyLoad() {

	    	var lazybox = {};

	    	var round10 = $('#round-tomorrow-10'),
	    		round15 = $('#round-tomorrow-15'),
	    		round20 = $('#round-tomorrow-20');

	    	lazybox.list10 = round10.all('.item-img');
	    	lazybox.list15 = round15.all('.item-img');
	    	lazybox.list20 = round20.all('.item-img');

	    	var round15_top = round15.offset().top;
	    	var round20_top = round20.offset().top;

	    	var devHeight = DOM.viewportHeight();

	    	//显示round10
	    	lazybox.list10.each(function(item, index) {
				showImg(item);	    		
	    	});

	    	//显示图片
	    	function showImg(img) {
	    		var src = img.attr('data-src');
	    		img[0].src = src;
	    		img.show();
	    	}

	    	//滚动回调
	    	var timmer = 0;
	    	var isRlease = true;
	    	function needShow() {

		    	var scrollTop = $(window).scrollTop() + devHeight;

		    	//不需要scroll了
		    	if ( round15.hasClass('show-all') && round20.hasClass('show-all') ) {
		    		$(window).detach('scroll', scrollFunc);
		    	}

		    	if ( scrollTop >= round15_top && !round15.hasClass('show-all') ) {
	    			round15.addClass('show-all', 1);
	    			lazybox.list15.each(function(item, index){
	    				showImg(item);
	    			});
		    	}

		    	if ( scrollTop >= round20_top && !round20.hasClass('show-all') ) {
	    			round20.addClass('show-all', 1);
	    			lazybox.list20.each(function(item, index){
	    				showImg(item);
	    			});
		    	}

	    		isRlease = true;
	    	}//end needshow

	    	function scrollFunc() {
	    		if ( isRlease ) {
	    			isRlease = false;
			    	timmer = setTimeout(needShow, 100);
	    		}
	    	}//end scrollFunc
	    	$(window).on('scroll', scrollFunc);

	    }//end of lazyload

		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	    //+
	    //+ 底部tab状态显示
	    //+
	    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	    function footerTabStatus( sysTime ) {
	    	var wrap = $('#tomorrow-footer-tab');
	   		var tabs = wrap.all('.footer-tab');

	   		var hours = Time.getHours(sysTime);

	   		function getTabStatus(tabFlag) {

				if ( hours == tabFlag ) {
		    		//now
		    		if ( min < 30 ) {
		    			return 'now';
		    		//over
		    		} else {
		    			return 'over';
		    		}
		    	//soon
		    	} else if ( hours < tabFlag ) {
		    		return 'soon';
		    	//over
		    	} else {
		    		return 'over';
		    	}

	    	}//end of getTabStatus

	    	//更改文本
	    	function changeTabStatus( arr ) {

	    		var wrap = $('#tomorrow-footer-tab');

	    		for ( var i = arr.length; i--; ) {

	    			var tab = wrap.all('.footer-tab-'+arr[i]);

			   		if ( getTabStatus(arr[i]) == 'soon' ) {
			   			tab.addClass('tab-green');
			   			tab.html(arr[i]+':00场预告');
			   		} else if ( getTabStatus(arr[i]) == 'now' ) {
			   			tab.html(arr[i]+':00场进行中');
	   				} else {
			   			tab.html(arr[i]+':00场优惠购');
	   				}
	    		}
	    	}

	   		$('.tab-green').removeClass('tab-green');
	   		changeTabStatus([10, 15, 20]);

	   		wrap.show();
	    }

		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	    //+
	    //+ 根据商品信息获取当前商品的状态
	    //+
	    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	    function getStatus( item ) {

	    	var showTime = Time.getTime(item.showTime),
	    		sysTime = Time.getTime(item.sysTime);

	    	//即将开始
	    	if ( item.sellStatus == 0 ) {
	    		if ( (showTime - sysTime) < 300000 && (showTime - sysTime) > 0 ) {
	    			return 'soon-now';
	    		}
	    		return 'soon';
	    	}

	    	//进行中
	    	if ( item.sellStatus == 1 ) {
	    		if ( item.stockCount <= 0 ) {
	    			return 'later';
	    		} else {
	    			return 'now';
	    		}
	    	}

	    	//优惠购买
	    	if ( item.sellStatus >= 3 ) {
	    		return 'over';	
	    	}

	    }

		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	    //+
	    //+ 处理数据函数，为了满足动态视图更新，需要处理数据
	    //+
	    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		function filterData( data ) {

			var list = {
				tab10: {},
				tab15: {},
				tab20: {}
			};
			list.tab10.data = [];
			list.tab15.data = [];
			list.tab20.data = [];
			var sysTime = data.systemTime || Time.getNow();

			//遍历数据，根据时间遍历数据
			KISSY.each(data.data, function(item, index) {

				if ( !item.endTime ) {
					item.endTime = item.showTime*1+3000;
				}

				var tab = Time.getHours(item.showTime);

				item.sysTime = sysTime;
				item.picUrl = item.picUrl+'_290x290.jpg';

				item.tab = Time.getHours(item.showTime);

				item.discount = 6;
				item.discount_c = item.discount-1;

				switch( getStatus( item ) ) {
					case 'soon':
						item.currentClass = 'state-soon';
					break;
					case 'soon-now':
						item.currentClass = 'state-soon-now';
					break;
					case 'now':
						item.currentClass = 'state-now';
						item.discount = Math.round( (item.currentPrice*1)/(item.originalPrice*1)*10 );
						item.discount_c = item.discount-1;
					break;
					case 'later':
						item.currentClass = 'state-later';
						item.discount = Math.round( (item.currentPrice*1)/(item.originalPrice*1)*10 );
						item.discount_c = item.discount-1;
					break;
					case 'over':
						item.currentClass = 'state-over';
					break;
					default:

					break;
				}

				//分装数据
				if ( tab == 10 ) {
					list.tab10.data.push(item);
				} else if ( tab == 15 ) {
					list.tab15.data.push(item);
				} else {
					list.tab20.data.push(item);
				}

			});

			return list;
		}//end of filterData

		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	    //+
	    //+ 渲染函数 - 负责渲染页面通过TMPL
	    //+
	    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		function render( data ) {

			var sysTime = data.systemTime;

			var tplTo10 = $('#round-tomorrow-10'),
				tplTo15 = $('#round-tomorrow-15'),
				tplTo20 = $('#round-tomorrow-20'); 

			//处理数据
			var data = filterData(data);

			var data10 = data.tab10,
				data15 = data.tab15,
				data20 = data.tab20;

			//渲染
			Tmpl(tpl, tplTo10.all('.round-goods-wrap'), data10);
			Tmpl(tpl, tplTo15.all('.round-goods-wrap'), data15);
			Tmpl(tpl, tplTo20.all('.round-goods-wrap'), data20);

			lazyLoad();

			try{
				footerTabStatus(sysTime);
			} catch(e) {
				console.log(e);
			}

		}//end of render


		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	    //+
	    //+ 获取数据函数 - 异步请求数据
	    //+
	    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	    function getData() {
	    	var url = window.JSON_URL_TOMORROW;
	    	IO.jsonp(url, function(data) {
				render(data);
			});//end of ajax
	    }//end of getData

	    //触发获取数据
	    try {
		    getData();
	    } catch(e) {
	    	console.log(e);
	    }

	}//end of init

	return {
		init: init
	}

}, {
    requires: ['node', 'dom', 'ajax',
    'widget/countdown/index', 'widget/time/index', 'widget/tmpl/index']
});