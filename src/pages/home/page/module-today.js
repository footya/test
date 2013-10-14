/*
* @name: module-today.js
* @author: yujiang
* @prop: home page today list
* @date: 2013 08 28
*/

KISSY.add('page/module-today', function(S, Node, DOM, IO, Tmpl, Time, Countdown) {   

	//like jq
	var $ = Node.all;

    //setTimeout的清理时间
    var timer = 0;

    //是否需要加载
    var isLoad = true;

    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+
    //+ 入口函数 - 所有逻辑在此，方便explote
    //+
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	function init ( initcallback ) {	

        //页面场次大型倒计时初始化
        function countDownInit(sysTime) {

            var timeTips = $('.round-title').all('.time-tips');

            var hours = Time.getHours(sysTime),
                min = Time.getMin(sysTime);

            //show the countdown
            timeTips.each(function(item, index) {

                var showTime = item.attr('data-time')*1,
                    leftTime = 0;

                if ( !showTime ) {
                    throw new Error('countdown has no data-time');
                    return;
                }

                if ( !(hours == (showTime-1) && min >= 30) ) {
                    return;
                }

                leftTime = 3600 - ( Time.getMin(sysTime)*60 + Time.getSec(sysTime) );

                //已经存在，修改剩余时间即可
                if ( item[0] && item[0]._countdown ) {
                    item[0]._countdown.left = leftTime*1000;
                    return;
                }

                var countdown = new Countdown({
                    el: item,
                    effect: 'slide',
                    leftTime: leftTime
                });

                countdown.notify(0, function(){

                    var el = countdown.get('el');
                    el.hide();

                    this.left = 0;

                });

                if ( item[0] && !item[0]._countdown ) {
                    item[0]._countdown = countdown;
                }

            });

        }//end of countDownInit

        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        //+
        //+ 商品设置倒计时 - 设置商品倒计时，初始化和更新都在此
        //+
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        function setDiscount ( sysTime ) {

            try{

            var leftTime = 0;

            var hours = Time.getHours(sysTime),
                min = Time.getMin(sysTime),
                sec = Time.getSec(sysTime);

            $('#qp-goods .scroll-tips').each(function(item, index) {

                //if is visible then countdown it
                if ( $(item).css('display') != 'none' &&
                    $(item).css('visibility') != 'hidden' ) {

                    var el = item.all('.scroll-time'),
                        showTime = item.attr('data-showtime')*1,
                        discount = item.all('.scroll-discount');

                    //即将开始的倒计时
                    if ( hours == (showTime-1) && min >= 55 ) {

                        el.attr('data-discount', 6);
                        leftTime = 3600-min*60-sec;

                    //进行中的倒计时
                    } else if ( hours == showTime && min < 30 ) {

                        var minCount = Math.floor(min/5);

                        leftTime = ((minCount+1)*5-min-1)*60 + (60-sec);

                        //多少折
                        if ( 5-minCount != 0 ) {
                            el.attr('data-discount', 5-minCount);
                            discount.all('em').html(5-minCount);
                        } else if( 5-minCount == 0 ) {
                            //据结束
                            discount.html('\u7ED3\u675F');
                        } else {
                            el._countdown.left = 0;
                            item.remove();
                            return;
                        }

                    //不显示倒计时
                    } else {
                        leftTime = 0; 
                        return;
                    }

                    //如果已经存在实例，更新其时间
                    if ( el[0] && el[0]._countdown ) {
                        el[0]._countdown.left = leftTime*1000; 
                        return;
                    }

                    var countdown = new Countdown({
                        el: el,
                        leftTime: leftTime
                    });

                    if ( el[0] ) {
                        el[0]._countdown = countdown;
                    }

                    //倒计时为0触发的无时间
                    countdown.notify(0, function(){
                        var el = this.get('el');
                        //打折计数
                        var disc = el.attr('data-discount')*1;
                        disc = disc - 1;
                        if ( disc == 5 ) {
                            el.parent('.item-info').removeClass('state-soon-now').addClass('state-now');
                        }

                        //减小一折
                        if ( disc ) {

                            el.attr('data-discount', disc);
                            el.parent('.scroll-tips').all('.scroll-discount').all('em').html(disc);
                            this.left = 300000;

                        //最后一折，距离结束
                        } else if ( disc == 0) {

                            //距离结束
                            el.attr('data-discount', disc);
                            el.parent('.scroll-tips').all('.scroll-discount').html('\u7ED3\u675F');
                            this.left = 300000;

                        //没有折数，说明已完结或未开始，消除倒计时
                        } else {

                            this.left = 0;
                            //el.parent('.item-info').removeClass('state-now').removeClass('state-later').addClass('state-over');
                            //el.parent('.scroll-tips').remove();

                        }
                    });

                }//end if

            });//end each

            } catch(e) {
                console.log(e);
            }//end try catch

        }//end of setDiscount

        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        //+
        //+ 设置数据 - 根据模板需要的数据进行数据封装和计算
        //+
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        function setData ( item ) {
            var systemTime = item['systemTime'],
                hours = Time.getHours(systemTime),
                min = Time.getMin(systemTime),
                sec = Time.getSec(systemTime);

            var showTime = Time.getHours(item['showTime']);

            //currentPrice
            if ( item['currentPrice']*1 ) {
                item['currentPrice'] = (item['currentPrice']*1).toFixed(2);
            } else {
            }

            var cases = [10, 15, 20];

            //获取进度条
            function getDis( min, sec ) {
                var getSec = Math.floor(sec/10);
                if ( getSec >= 5 ) {
                    getSec = 6;
                }
                return min*7+getSec+1;
            }
            //获取折数价格位置
            function getPriceLeft(min, sec, price) {

                var dis = getDis(min, sec);
                var width = ((price+'').length+3)*8.5+30;

                if ( dis > (width-20) && dis+(width-20) < 210 ) {
                    return dis-20;
                } else if( dis <= (width-20) ) {
                    return 0;
                } else {
                    return 210-width;
                }
            }

            item.left = 0;
            item.leftTime = 0;
            item.discount = 6;
            item.priceLeft = 0;
            item.tipsLeft = 'state-scroll-tips-left';
            item.showhours = showTime;
            item.currentClass = '';

            for ( var i = 0; i < cases.length; i++ ) {
                if ( cases[i] == showTime ) {

                    if ( hours >= cases[i] ) {
                        //进行中
                        if ( hours == cases[i] && min < 30) {
                            item.discount = 6-Math.floor(min/5);
                            item.left = getDis(min, sec);
                            item.priceLeft = getPriceLeft(min, sec, item['currentPrice']);

                            if ( item['stockCount'] == 0 ) {
                                item.currentClass = 'state-later';
                            } else {
                                item.currentClass = 'state-now';
                            }

                            if ( item.left >= 100 ) {
                                item.tipsLeft = 'state-scroll-tips-right';
                            }

                        //结束
                        } else {
                            item.currentClass = 'state-over';
                        }
                    } else if ( hours < cases[i] ) {
                        //即将开始-倒计时
                        if ( hours == (cases[i]-1) && min >= 55 ) {
                            item.currentClass = 'state-soon-now';
                        //即将开始
                        } else {
                            item.currentClass = 'state-soon';
                        }
                    }//end if

                }//end if 
            }//end for

            //用于显示距离xx折
            item.discountC = item.discount-1;

            //修正价格
            if( (item.currentClass == 'state-soon' ||
                item.currentClass == 'state-soon-now') &&
                item.discount && item.discount == 6 ) {

                item.currentPrice = Math.round(item.currentPrice*0.6).toFixed(2);

            }

            return item;

        }//setData

        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        //+
        //+ 过滤数据 - 根据tab分装数据，然后转入setData进行数据设置
        //+
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        function filterData ( data ) {

            //获取系统时间
            var sysTime = data.systemTime || Time.getNow();

            //分装数据
            var tab_10_items = {},
                tab_15_items = {},
                tab_20_items = {};

            tab_10_items.data = [];
            tab_15_items.data = [];
            tab_20_items.data = [];

            //如果没有数据就返回，容错处理
            if ( !data || !data.data ) {
                return;
            }

            //数据处理
            //1.添加系统时间
            //2.根据数据情况动态修改数据以展示操作视图

            for( var i = 0,len=data.data.length; i<len; i++ ) {

                var item = data.data[i]; 

                //添加system time       
                if ( !item['systemTime'] ) {
                    item['systemTime'] = sysTime || 0;
                }

                //设置数据
                item = setData(item);

                //分发数据
                switch ( Time.getHours(item['showTime']) ) {
                    case 10: 
                        tab_10_items.data.push(data.data[i]);
                    break;
                    case 15:
                        tab_15_items.data.push(data.data[i]);
                    break;
                    case 20:
                        tab_20_items.data.push(data.data[i]);
                    break;
                    default:
                    break;
                }
            }

            return {
                tab10: tab_10_items,
                tab15: tab_15_items,
                tab20: tab_20_items
            };

        }//end of filterData

        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        //+
        //+ 渲染函数 - 把过滤后的数据根据时间场次渲染到DOM
        //+
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  		function render ( data ) {
            var wrap = $("#qp-goods");

            //获取每个tab的容器
            var tab10 = $('#goods-round-10'),
                tab15 = $('#goods-round-15'),
                tab20 = $('#goods-round-20');

            //template
            var tplNode = $('#tpl-today-goods'); 

            //获取系统时间
            var sysTime = data.systemTime || Time.getNow();

            var hours = Time.getHours(sysTime),
                min = Time.getHours(sysTime),
                sec = Time.getHours(sysTime);

            if ( hours < 12 ) {
                wrap.prepend(tab10);
            } else if ( hours >=12 && hours < 17 ) {
                wrap.prepend(tab20);
                wrap.prepend(tab15);
            } else {
                wrap.prepend(tab20);
            }

            //处理数据
            data = filterData(data);

            //添加到dom
            try{
                Tmpl(tplNode, tab10.all('.goods-list'), data['tab10']);
                Tmpl(tplNode, tab15.all('.goods-list'), data['tab15']);
                Tmpl(tplNode, tab20.all('.goods-list'), data['tab20']);
            } catch (e) {
                console.log(e);
            }

            //显示
            $('#qp-goods .goods-round').show();

            //设置倒计时
            setDiscount(sysTime);

            //设置标题状态
            statusTextChange(sysTime);

            //标题大倒计时
            countDownInit(sysTime);

            if ( initcallback ) {
                initcallback();
            }

            //update
            timer = setTimeout(function() {
                getData(function(data) {
                    update(data);
                });
            }, 5000);

  		}//end of render

        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        //+
        //+ 获取数据 - 异步请求数据接口获取数据，需要修复时间
        //+
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        function getData( callback, debug ) {
            if ( !isLoad ) {
                return;
            }
            isLoad = false;

            //data url of json data
            var url = JSON_URL_TODAY+'?t='+(new Date().getTime());

            if ( debug ) {
                url = JSON_URL_GET+'?t='+(new Date().getTime());
            }

            //try catch
            try {

                IO.jsonp(url, function(data) {

                    isLoad = true;

                    //时间容错处理（后时间比前时间小）
                    if ( !window.TBQP.oldTime ) {
                        window.TBQP.oldTime = data.systemTime || Time.getNow();
                    }

                    var omin = Time.getMin(window.TBQP.oldTime);
                    var osec = Time.getSec(window.TBQP.oldTime);
            
                    var nmin = Time.getMin(data.systemTime);
                    var nsec = Time.getSec(data.systemTime);

                    if ( omin*60+osec <= nmin*60+nsec ) {
                        window.TBQP.oldTime = data.systemTime;
                    } else {
                        console.log(window.TBQP.oldTime);
                        console.log(data.systemTime);
                        var rsec = Time.getSec(data.systemTime);
                        var rmin = Time.getMin(data.systemTime);
                        rsec += 5;
                        if ( rsec > 59 ) {
                            rsec = rsec - 60;
                            rmin += 1;
                            data.systemTime = Time.setSec( data.systemTime, rsec );
                            data.systemTime = Time.setMin( data.systemTime, rmin );
                        } else {
                            data.systemTime = Time.setSec( data.systemTime, rsec );
                        }   
                    }

                    //exec
                    if ( callback ) {
                        callback(data);
                    }
                });

            } catch(e) {

                console.log(e);

            }//end try catch

        }//end get data

        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        //+
        //+ 更改title状态文本 - 根据时间来切换title的文本.good-round .title-status
        //+
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        function statusTextChange ( sysTime ) {

            var hours = Time.getHours(sysTime),
                min = Time.getMin(sysTime);

            var round = $('.goods-round'),
                tab_10_title = $('#goods-round-10 .title-status'),
                tab_15_title = $('#goods-round-15 .title-status'),
                tab_20_title = $('#goods-round-20 .title-status');

            //clear
            round.all('.status-soon').removeClass('status-soon');
            round.all('.status-now').removeClass('status-now');
            round.all('.status-over').removeClass('status-over');

            //soon
            if ( hours < 10 ) {
                tab_10_title.addClass('status-soon');
            }
            if ( hours < 15 ) {
                tab_15_title.addClass('status-soon');
            }
            if ( hours < 20 ) {
                tab_20_title.addClass('status-soon');
            }

            //begin
            if ( hours == 10 && min < 30 ) {
                tab_10_title.addClass('status-now');
            } else if ( hours == 15 && min < 30 ) {
                tab_15_title.addClass('status-now');
            } else if ( hours == 20 && min < 30 ) {
                tab_20_title.addClass('status-now');
            }

            //over
            if ( hours > 10 || (hours == 10 && min >= 30) ) {
                tab_10_title.addClass('status-over');
            }
            if ( hours > 15 || (hours == 15 && min >= 30) ) {
                tab_15_title.addClass('status-over');
            }
            if ( hours > 20 || (hours == 20 && min >= 30) ) {
                tab_20_title.addClass('status-over');
            }

            //text
            round.all('.title-status').html('\u5F00\u62A2');
            //round.all('.status-over').html('\u4F18\u60E0\u4E2D');
            round.all('.status-over').html('\u62A2\u62CD\u5DF2\u7ED3\u675F\uFF0C\u4F18\u60E0\u8FDB\u884C\u4E2D');
            round.all('.status-soon').html('\u5373\u5C06\u5F00\u59CB');
            round.all('.status-now').html('\u6B63\u5728\u62A2\u62CD');

        }//end of statusTextChange

        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        //+
        //+ 更新逻辑 - 每5秒运行一次，根据新数据宣渲染该渲染的页面
        //+ 局部刷新 - Tmpl插件完成
        //+
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        function update ( data ) { 

            //获取系统时间
            var sysTime = data.systemTime || Time.getNow();

            statusTextChange(sysTime);

            countDownInit(sysTime);

            //获取每个tab的容器
            var tab10 = $('#goods-round-10'),
                tab15 = $('#goods-round-15'),
                tab20 = $('#goods-round-20');

            //template
            var tplNode = $('#tpl-today-goods'); 

            //处理数据
            data = filterData(data);

            //更新到dom
            try{
                Tmpl(tplNode, tab10.all('.goods-list'), data['tab10']);
                Tmpl(tplNode, tab15.all('.goods-list'), data['tab15']);
                Tmpl(tplNode, tab20.all('.goods-list'), data['tab20']);
            } catch (e) {
                console.log(e);
            }

            //更新商品倒计时
            setDiscount(sysTime);

            timer = setTimeout(function() {
                getData(function(data) {
                    update(data);
                });
            }, 5000);
        }//end updata

		//get data && render it
		getData(function(data) {
            render(data);
        });	  		
	}

   	return {
   		init: init
   	}

}, {
	requires: ['node', 'dom', 'ajax', 'widget/tmpl/index', 'widget/time/index', 'widget/countdown/index']
});