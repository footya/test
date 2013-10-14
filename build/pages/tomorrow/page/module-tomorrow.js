/*
combined files : 

widget/tmpl/index
widget/time/index
page/module-tomorrow

*/
/*
** @prop: Dynamic Reverse Template Engine for KISSY
** @author: yujiang
** @data: 2013 09 22
** @quote: Simple JavaScript Templating John Resig - http://ejohn.org/ - MIT Licensed
*/

KISSY.add('widget/tmpl/index', function(S, Node) {

    //缓存，用来缓存编译过的模板，因为使用的new Function的内置js解析器
    var cache = {};

    //like jquery
    var $ = Node.all;

    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+
    //+ 数据转换函数 - 将a.b.c的类似字符串转换成data[a][b][c]
    //+ 如果数据为空，那么将返回-1表示数据没找到
    //+
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    function translateData(arg, data) {
        var arr = arg.split('.');
        var count = -1;

        //递归实现a.b.c=>data[a][b][c]
        function t(arr, data) {

            count++;

            if ( arr[count] ) {
                //处理数组
                var key = arr[count].replace(/\[[^\]]*\]/g, '');
                var index = /\[([\d\w]*)\]/g.exec(arr[count]);

                if ( index && (index[1]!=undefined) && data[key] && (data[key][index[1]]!=undefined) ) {
                    return t(arr, data[key][index[1]]);
                } else {
                    if ( (data[arr[count]]!=undefined) ) {
                        return t(arr, data[arr[count]]);
                    } else {
                        //如果没有此变量就返回字符串
                        return -1;
                    }
                }//end of if

            } else {
                //如果没有此变量就返回字符串
                return (data!=undefined) ? data : -1;

            }//end of if

        }//end of t

        return t(arr, data);

    }//end of translateData
 
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+
    //+ 动态更新视图 - 查找.node-watch节点，分析data-watch属性
    //+ 根据其type来实现相应的更新
    //+ class如果有第三个参数且不是'rm'，那么将进入状态模式（不重复添加class）
    //+
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    function update(nodes, data) {

        nodes.each(function(item, index) {

            var watchNum = item.attr('data-watch').split(',');

            for ( var i = 0, len = watchNum.length; i < len; i++ ) {

                //args[0]:type, args[1]:key, args[2]:value
                var args = watchNum[i].split(':');

                //根据类型更新
                switch( args[0] ) {
                    case 'text':
                        var txt = translateData(args[1], data);
                        if ( txt != -1 ) {
                            item.html(txt);
                        }
                    break;

                    case 'value':
                        var val = translateData(args[1], data);
                        if ( val != -1 ) {
                            item.html(val);
                        }
                    break;

                    case 'attr':
                        var val = translateData(args[2], data);
                        if ( val != -1 ) {
                            item.attr(args[1], val);
                        }
                    break;

                    case 'style':
                        var val = translateData(args[2], data);
                        if ( val != -1 ) {
                            switch( args[1] ) {
                                case 'left':
                                case 'right':
                                case 'top':
                                case 'bottom':
                                case 'width':
                                case 'height':
                                case 'paddingLeft':
                                case 'paddingRight':
                                case 'paddingTop':
                                case 'paddingBottom':
                                case 'marginLeft':
                                case 'marginRight':
                                case 'marginTop':
                                case 'marginBottom':
                                    item.css(args[1], val + 'px');
                                break;
                                default:
                                    item.css(args[1], val);
                                break;
                            }
                        }
                    break;

                    case 'class':
                        var clazz = translateData(args[1], data);
                        if ( clazz != -1 ) {
                            if ( args[2] ) {
                                if ( args[2] == 'rm') {
                                    item.removeClass(clazz);
                                } else {
                                    item[0].className = item[0].className.
                                        replace(/state-[^\s]*[\s]?/ig, '').
                                        replace(/(\s)+/ig, '$1');
                                    if ( !item.hasClass(clazz) ) {
                                        item.addClass(clazz);
                                    }
                                }
                            } else {
                                item.addClass(clazz);
                            }
                        }
                    break;

                    //局部全体更新，需要重新编译
                    case 'part':
                        var target = args[1],
                            to = args[2];
                            
                            var result = compileTpl($(target).html());
                            cache[target] = result;
                            $(to).html( data ? result(data) : result);
                    break;

                    default:
                    break;
                }//end of switch

            }//end of for

        });//end of each

    }//end of update

    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+
    //+ 编译函数 - 返回的是个function
    //+ 段代码基于John Resig 的 Simple JavaScript Templating
    //+ 可在 http://ejohn.org/ 看到
    //+
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    function compileTpl(str) {

        //子模板引入
        var tmp,
            subs = [];
        subs = str.match(/<%=include\(([^)]*)\)=%>/ig) || [];

        for( var i=0, len=subs.length; i<len; i++ ) {
            subs[i] = subs[i].replace('<%=include(', '').replace(')=%>', '');
            //如果有子模板替换，没有就为空
            if ( $('#'+subs[i])[0] ) {
                str = str.replace(/<%=include\(([^)]*)\)=%>/i, $('#'+subs[i]).html());
            } else {
                str = str.replace(/<%=include\(([^)]*)\)=%>/i, '');
            }
        }
        
        //利用Function构造函数创建js解析器，动态解析js
        var fn = new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};" +
       
        "with(obj){p.push('" +
       
        str.replace(/[\r\t\n]/g, "").
            split("<%").join("\t").
            replace(/((^|%>)[^\t]*)'/g, "$1\r").
            replace(/\t=(.*?)%>/g, "',$1,'").
            split("\t").join("');").
            split("%>").join("p.push('").
            split("\r").join("\\'") +
            "');}return p.join('');");

        return fn;

    }//end of comileTpl

    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+
    //+ 渲染函数 - 编译模板并添加到dom
    //+
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    function render( tpl, target, data, callback ) {

        var html = tpl.html();

        //编译
        var result = compileTpl(html, data);

        //添加到模板
        target.html( data ? result(data) : result );

        //回调传出fn
        if ( callback ) {
            callback(result);
        }

    }//end of render


    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+
    //+ 入口函数 - 对外接口
    //+ 第一次调用会全部渲染，第二次开始会去缓存，如果有动态视图更新，那
    //+ 么将进行动态视图渲染
    //+
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    function Tmpl(tpl, target, data){

        //str表示缓存key，一般用id，如果没有id，则不保留缓存
        var str = tpl.attr('id') || 'nocache';

        //局部更新数据，说明已经生成节点
        if ( cache[str] ) {

            //遍历寻找需要动态修改的节点
            var nodes = target.all('.node-watch');

            //如果没有动态更新的节点，就用缓存重绘视图
            if ( nodes.length < 1 ) {

                target.html( data ? cache[str]( data ) : cache[str] );

            } else {
                //局部更新
                update(nodes, data);
            }

        } else {

            //渲染
            render(tpl, target, data, function(fn) {
                //生成cache
                cache[str] = fn;
            });

        }//end of if

    }//end of Tmpl

    //暴露入口接口
    return Tmpl;
  
}, {
    requires: ['node']
});


/*
* @name: widget/time/index.js
* @author: yujiang
* @prop: time operate
* @date: 2013 08 28
*/

KISSY.add('widget/time/index', function(S, Node, DOM, IO) { 

	//fill str of the special length
	function fillStr(str, len) {
		var arr = [];
		str += '';
		if ( Object.prototype.toString.call(str) != '[object String]' ) {
			throw new Error('not a string');	
		}
		if ( str.length < len ) {
			arr = new Array(len-str.length+1).join('0').concat(str);
			return arr;
		} else {
			return str;
		}
	}

	function setMin( time, min ) {
		if ( 0 <= min && min <= 59 ) {
			if ( min < 10 ) {
				min = '0'+min;
			} else {
				min = ''+min;
			}
			var arr = format(time).split('');
			arr.splice(10, 2, min);
			arr = arr.join('');
			return arr;
		} else {
			return time;
		}
	}
	function setSec( time, sec ) {
		if ( 0 <= sec && sec <= 59 ) {
			if ( sec < 10 ) {
				sec = '0'+sec;
			} else {
				sec = ''+sec;
			}
			var arr = format(time).split('');
			arr.splice(12, 2, sec);
			arr = arr.join('');
			return arr;
		} else {
			return time;
		}
	}

	//20130827100000
	function format( time ) {
		var time = (time+'');
		return fillStr(time, 14);
	}
	function getYear( time ) {
		return format(time).substr(0, 4)*1;
	}
	function getMon( time ) {
		return format(time).substr(4, 2)*1;
	}
	function getDate( time ) {
		return format(time).substr(6, 2)*1;
	}
	function getHours( time ) {
		return format(time).substr(8, 2)*1;
	}
	function getMin( time ) {
		return format(time).substr(10, 2)*1;
	}
	function getSec( time ) {
		return format(time).substr(12, 2)*1;
	}
	function getLeftTime( ntime, otime ) {

		var oSec = getSec(otime),
			oMin = getMin(otime),
			oHour = getHours(otime),
			oDate = getDate(otime),
			oMon = getMon(otime),
			oYear = getYear(otime);

		var nSec = getSec(ntime),
			nMin = getMin(ntime),
			nHour = getHours(ntime),
			nDate = getDate(ntime),
			nMon = getMon(ntime),
			nYear = getYear(ntime); 

		var rSec = 0,
			rMin = 0,
			rHour = 0,
			rDate = 0,
			rMon = 0,
			rYear = 0;

		//
		if ( nHour*3600+nMin*60+nSec < oHour*3600+oMin*60+nSec) {
			return -1;
		}

		//carry
		var toMin = 0,
			toHour = 0,
			toDate = 0,
			toMon = 0,
			toYear = 0;

		//sec
		if ( (nSec-oSec)>=0 ) {
			rSec = nSec-oSec;
		} else {
			rSec = nSec+60-oSec;
			toMin++;
		}

		//min
		nMin = nMin - toMin;
		if ( (nMin-oMin)>=0 ) {
			rMin = nMin-oMin;
		} else {
			rMin = nMin+60-oMin;
			toHour++;
		}

		//hour
		nHour = nHour - toHour;
		if ( (nHour-oHour)>=0 ) {
			rHour = nHour-oHour;
		} else {
			rHour = nHour+24-oHour;
			//toDay++;
		}

		if ( rHour < 10 ) {
			rHour = '0'+rHour;
		}
		if ( rMin < 10 ) {
			rMin = '0'+rMin;
		}
		if ( rSec < 10 ) {
			rSec = '0'+rSec;
		}

		var rem = rHour+''+rMin+rSec;
		return format(rem);

	}

	function getNow() {
		var now = new Date();
		return now.getFullYear()+
			fillStr((now.getMonth()+1), 2)+
			fillStr(now.getDate(), 2)+
			fillStr(now.getHours(), 2)+
			fillStr(now.getMinutes(), 2)+
			fillStr(now.getSeconds(), 2);
	}

	return {
		getHours: getHours,
		getMin: getMin,
		getSec: getSec,
		getYear: getYear,
		getMon: getMon,
		getDate: getDate,
		getLeftTime: getLeftTime,
		getNow: getNow,
		setMin: setMin,
		setSec: setSec
	}

}, {
	requires: ['node', 'dom', 'ajax']
});
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
