/*
* @name: home page palymaker.js
* @author: yujiang
* @prop: home page play box builder
* @date: 2013 10 10
*/

KISSY.add(function (S, Node, IO, Countdown, Time, Tmpl) {

	var $ = Node.all;

	var once_flag = true;
	
	//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+
    //+ 入口函数 - 所有逻辑在此，方便explote
    //+
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	function init() {
		var tpl = $('#tpl-play');

		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	    //+
	    //+ Tab选取
	    //+
	    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	    function tabChoose(sysTime) {
	    	var tab = $('.tab-item');
	    	var list = $('.round-goods-list');

	    	var statusInfoNode = $('.status-info-wrap');

	    	var footerTab = $('.footer-tab');
	    	var ftLeft = footerTab.all('.footer-tab-left'),
	    		ftCenter = footerTab.all('.footer-tab-center'),
	    		ftRight = footerTab.all('.footer-tab-right');

	    	//改变tips文案
	    	function changeStatusText(tabFlag) {

	    		var hours = Time.getHours(sysTime),
	    			min = Time.getMin(sysTime);

    			statusInfoNode.removeClass('.status-wrap-soon').
    			removeClass('.status-wrap-now').
    			removeClass('.status-wrap-over').
    			removeClass('.status-wrap-tomorrow');

    			if ( tabFlag == 'tomorrow' ) {
	    			statusInfoNode.addClass('.status-wrap-tomorrow');
	    		} else if ( hours == tabFlag ) {
	    			if ( min < 30 ) {
		    			statusInfoNode.addClass('.status-wrap-now');
	    			} else {
	    				statusInfoNode.addClass('.status-wrap-over');
	    			}
	    		} else if ( hours < tabFlag ) {
    				statusInfoNode.addClass('.status-wrap-soon');
	    		} else {
    				statusInfoNode.addClass('.status-wrap-over');
	    		}

	    	}

	    	//底部文案切换
	    	function footerTabChange(tabFlag) {

	    		var hours = Time.getHours(sysTime),
	    			min = Time.getMin(sysTime);

	    		$('.footer-tab-status').hide();

	    		var ftLeft = $('.footer-tab-left'),
	    			ftCenter = $('.footer-tab-center'),
	    			ftRight = $('.footer-tab-right');

	    		if ( tabFlag == 10 ) {
	    			var tmp = getTabStatus(15);
	    			if ( tmp == 'now' ) {
	    				ftCenter.html('15:00场抢拍中');
	    			} else if ( tmp == 'soon' ) {
	    				ftCenter.html('15:00场预告');
	    			} else {
	    				ftCenter.html('15:00场优惠购买');
	    			}
	    			ftCenter.attr('data-tab', 15);
	    			ftCenter.css('display', 'inline-block');
	    		} else if ( tabFlag == 15 ) {
	    			var tmp1 = getTabStatus(10);
	    			if ( tmp1 == 'now' ) {
	    				ftLeft.html('10:00场抢拍中');
	    			} else if ( tmp1 == 'soon' ) {
	    				ftLeft.html('10:00场预告');
	    			} else {
	    				ftLeft.html('10:00场优惠购买');
	    			}

	    			var tmp2 = getTabStatus(20);
	    			if ( tmp2 == 'now' ) {
	    				ftRight.html('20:00场抢拍中');
	    			} else if ( tmp2 == 'soon' ) {
	    				ftRight.html('20:00场预告');
	    			} else {
	    				ftRight.html('20:00场优惠购买');
	    			}

	    			ftLeft.attr('data-tab', 10);
	    			ftRight.attr('data-tab', 20);
	    			ftLeft.css('display', 'inline-block');
	    			ftRight.css('display', 'inline-block');
	    		} else if ( tabFlag == 20 ) {
	    			var tmp = getTabStatus(15);
	    			if ( tmp == 'now' ) {
	    				ftLeft.html('15:00场抢拍中');
	    			} else if ( tmp == 'soon' ) {
	    				ftLeft.html('15:00场预告');
	    			} else {
	    				ftLeft.html('15:00场优惠购买');
	    			}
    				ftRight.html('明日预告');

    				ftLeft.attr('data-tab', 15);
	    			ftRight.attr('data-tab', 'tomorrow');
	    			ftLeft.css('display', 'inline-block');
	    			ftRight.css('display', 'inline-block');
	    		} else {

	    		}//end of if

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

	    	}

	    	//选取商品显示
	    	function changeRoundGoods(tabFlag) {
	    		//商品列表class
	    		list.removeClass('show-tab-10').
	    		removeClass('show-tab-15').
	    		removeClass('show-tab-20').
	    		removeClass('show-tab-tomorrow').
	    		addClass('show-tab-'+tabFlag);
	    	}

	    	//tab样式切换
	    	function headerTabChange(tabFlag) {
	    		//自身状态
	    		$('.tab-list').all('.tab-active').removeClass('.tab-active');
	    		$('.tab-item-'+tabFlag).addClass('.tab-active');
	    	}

	    	//点击切换
	    	tab.on('click', function(e) {
	    		var target = $(this);
	    		var tabFlag = target.attr('data-tab');

	    		headerTabChange(tabFlag);
	    		changeRoundGoods(tabFlag);
	    		changeStatusText(tabFlag);
	    		footerTabChange(tabFlag);

	    	});

	    	$('.footer-tab-status').on('click', function(e) {
	    		e.preventDefault();

	    		var target = $(this);
	    		var tabFlag = target.attr('data-tab');

	    		if ( tabFlag == 'tomorrow' ) {
	    			location.href = "./tomorrow.php";
	    		}

	    		headerTabChange(tabFlag);
	    		changeRoundGoods(tabFlag);
	    		changeStatusText(tabFlag);
	    		footerTabChange(tabFlag);
	    	});
	    }

		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	    //+
	    //+ 设置倒计时
	    //+
	    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	    function setDiscount( sysTime ) {

	    	var sysTime = sysTime;

	    	var s_sysTime = Time.getTime(sysTime);

	    	//折扣范围
	    	var bdis = 6,
	    		edis = 1;
	    	//周期-分钟
	    	var cycle = 5;

	    	var timeNode = $('#round-play-wrap').all('.countdown-text');

	    	timeNode.each(function(item, index) {

	    		//if is visible then countdown it
                if ( $(item).css('display') != 'none' &&
                    $(item).css('visibility') != 'hidden' ) {

                	var el = item.all('.countdown-time'),
                		discountEl = item.all('.txt-zhe'),
                		discount = item.all('.dis-num').html()*1,
                		showTime = item.attr('data-showtime')*1,
                		endTime = item.attr('data-endtime')*1;

                	var leftTime = 0;

                	var s_showTime = Time.getTime(showTime);
                	var s_endTime = Time.getTime(endTime);

                	//倒计时的总时间
                	var totalTime = s_endTime - s_showTime;

                	if ( totalTime <= 0 ) {
                		return;
                	}

                	//每折之间相差的时间
                	var partTime = totalTime/(bdis+1-edis);

               		//剩余时间
               		var resumeTime = s_endTime - s_sysTime;

                	//即将开始倒计时
                	if ( s_showTime-s_sysTime < 300000 && s_showTime-s_sysTime > 0 ) {
                		leftTime = s_showTime - s_sysTime;
                	//进行中
                	} else {
                		leftTime = resumeTime - Math.floor(resumeTime/partTime)*partTime;
                	}

                	//如果已经生成计时器
                	if ( !el[0]._countdown ) {

                		leftTime = leftTime/1000;
	                	var countdown = new Countdown({
	                        el: el,
	                        leftTime: leftTime
	                    });		
	                	//倒计时为0
	                	countdown.notify(0, function(){

                			var el = this.get('el');

                			var discount = el.all('.dis-num').html()*1;
                			var elzhe = el.all('.txt-zhe');

                			//结束了
                			if ( discount == edis ) {
                				elzhe.html('\u7ED3\u675F');
                			}
                			if ( !discount ) {
	                			this.stop = 1;
                			}

                			console.log('countdown-over');

                		});

	                    el[0]._countdown = countdown;

                	} else {

                		el[0]._countdown.left = leftTime;

                	}


                }//end of if 

	    	});//end of each

	    }//end of setDiscount

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

			var list = data;
			var sysTime = data.systemTime || Time.getNow();

			//根据时间获取进度条位置
			function getScrollLeft(sysTime, showTime, endTime, width) {
				var left = 1,
					width = width || 141;

				var s_sysTime = Time.getTime(sysTime),
					s_showTime = Time.getTime(showTime),
					s_endTime = Time.getTime(endTime);

				var totalTime = s_endTime-s_showTime;
				var passTime = s_sysTime-s_showTime;
				var ratio = 0;

				if ( passTime > 0 && totalTime > 0 ) {
					ratio = passTime/totalTime;
					left = width * ratio;
				} 

				return left;
			}

			//遍历数据，根据时间遍历数据
			KISSY.each(list.data, function(item, index) {

				if ( !item.endTime ) {
					item.endTime = item.showTime*1+3000;
				}

				item.sysTime = sysTime;
				item.picUrl = item.picUrl+'_290x290.jpg';

				item.tab = Time.getHours(item.showTime);

				item.discount = 6;
				item.discount_c = item.discount-1;

				item.scrollLeft = getScrollLeft(sysTime, item.showTime, item.endTime);

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

			var tplTo = $('#round-play-wrap');

			//处理数据
			var data = filterData(data);

			//渲染
			Tmpl(tpl, tplTo, data);

			//倒计时
			try {
				setDiscount(sysTime);
			} catch (e) {
				console.log(e);
			}

			//选取标签
			if ( once_flag ) {
				once_flag = false;
				tabChoose(sysTime);
				setting(sysTime);
			}

			setTimeout(getData, 5000);

		}//end of render

		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	    //+
	    //+ 首次载入 初始化tab切换等
	    //+
	    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	    function setting(sysTime) {

	    	var hash = location.hash;

	    	if ( hash == '#tab10' ) {
	    		$('#tab-item-10').fire('click');	
	    	} else if ( hash == '#tab15' ) {
	    		$('#tab-item-15').fire('click');
	    	} else if ( hash == '#tab20' ) {
	    		$('#tab-item-20').fire('click');
	    	} else {

		    	var hours = Time.getHours(sysTime);

		    	if ( hours < 12 ) {
		    		$('#tab-item-10').fire('click');	
		    	} else if ( 12 <= hours && hours <= 17 ) {
		    		$('#tab-item-15').fire('click');
		    	} else {
		    		$('#tab-item-20').fire('click');
		    	}

	    	}

	    }

		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	    //+
	    //+ 获取数据函数 - 异步请求数据
	    //+
	    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	    function getData() {
	    	var url = window.JSON_URL_TODAY;
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
    requires: ['node', 'ajax',
    'widget/countdown/index', 'widget/time/index', 'widget/tmpl/index']
});