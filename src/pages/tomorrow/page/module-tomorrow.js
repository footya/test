/*
* @name: module-tomorrow.js
* @author: yujiang
* @prop: home page today list
* @date: 2013 08 28
*/

KISSY.add('page/module-tomorrow', function(S, Node, DOM, IO, Tmpl, Time) {   
	
	var $ = Node.all;

	//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+
    //+ 入口函数 - 所有逻辑在此，方便explote
    //+
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	function init() {

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
                var width = ((price+'').length+6)*8.5+30;
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
            if( item.discount && item.discount == 6 ) {
                item.currentPrice = Math.round(item.currentPrice*0.6);
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

            //获取每个tab的容器
            var tab10 = $('#tomorrow-round-10'),
                tab15 = $('#tomorrow-round-15'),
                tab20 = $('#tomorrow-round-20');

            //template
            var tplNode = $('#tpl-tomorrow-goods'); 

            //获取系统时间
            var sysTime = data.systemTime || Time.getNow();

            var hours = Time.getHours(sysTime),
                min = Time.getHours(sysTime),
                sec = Time.getHours(sysTime);

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
            //$('#qp-goods .goods-list').show();

  		}//end of render

  		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        //+
        //+ 获取数据 - 异步请求数据接口获取数据
        //+
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        function getData( callback ) {

            //data url of json data
            var url = JSON_URL_TOMORROW+'?t='+(new Date().getTime());

            //try catch
            try {

                IO.jsonp(url, function(data) {
                    if ( callback ) {
                        callback(data);
                    }
                });

            } catch(e) {

                console.log(e);

            }//end try catch

        }//end get data

        getData(function(data){
        	var data = data;
        	//修改系统时间，达到全部开始的状态（重要）
        	data.systemTime = '20130101010000';
        	render(data);
        });

	}//end of init

	return {
		init: init
	}

}, {
	requires: ['node', 'dom', 'ajax', 'widget/tmpl/index', 'widget/time/index']
});