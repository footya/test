/*
combined files : 

widget/tmpl/index
widget/time/index
widget/countdown/index
page/module-today

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
combined files : 

gallery/countdown/1.3/timer
gallery/countdown/1.3/effect
gallery/countdown/1.3/index

*/
/**
 * 倒计时组件 - Timer Module
 * @author jide<jide@taobao.com>
 * 
 * 单例，公用的时间处理模块。负责尽量精确地计时，必要时弃帧保时。
 * Timer将统一调用时间更新函数。每更新一次时间对应一帧，对外提供add/remove帧函数的方法，
 * add 时需要 帧函数frame, 帧频率frequency，
 * remove 时只需要 帧函数frame
 *
 *
 * [+]new feature  [*]improvement  [!]change  [x]bug fix
 *
 * [x] 2012-05-02
 *     优化精确计时策略，优化高级浏览器切换tab时的效果
 * [*] 2012-04-26
 *     重构Timer模块，跟真实时间相关的逻辑只在这里处理
 * [*] 2011-01-13
 *     改为使用本地时间计时，避免额外(setInterval等导致的)误差的累计
 */
KISSY.add('widget/countdown/timer',function (S) {
        // fns 中的元素都是二元组，依次为：
        //   frame {function}   帧函数
        //   frequency {number} 二进制末位——1代表帧频率是1000次/s，0代表帧频率是100次/s
    var fns = [],
        // 操作指令
        commands = [];

    /**
     * timer
     * 调用频率为100ms一次。努力精确计时，调用帧函数
     */
    function timer() {
        // 为避免循环时受到 对fns数组操作 的影响,
        // add/remove指令提前统一处理
        while (commands.length) {
            commands.shift()();
        }

        // 计算新时间，调整diff
        var diff = (new Date().getTime()) - timer.nextTime,
            count = 1 + Math.floor(diff / 100);

        diff = 100 - diff % 100;
        timer.nextTime += 100 * count;

        // 循环处理fns二元组
        var frequency, step,
            i, len;
        for (i = 0, len = fns.length; i < len; i += 2) {
            frequency = fns[i + 1];

            // 100次/s的
            if (0 === frequency) {
                fns[i](count);
            // 1000次/s的
            } else {
                // 先把末位至0，再每次加2
                frequency += 2 * count - 1;

                step = Math.floor(frequency / 20);
                if (step > 0) { fns[i](step); }

                // 把末位还原成1
                fns[i + 1] = frequency % 20 + 1;
            }
        }

        // next
        setTimeout(timer, diff);
    }
    // 首次调用
    timer.nextTime = +new Date();
    timer();

    return {
        add: function (fn, frequency) {
            commands.push(function () {
                fns.push(fn);
                fns.push(frequency === 1000 ? 1 : 0);
            });
        },
        remove: function (fn) {
            commands.push(function () {
                var i = S.indexOf(fn, fns);
                if (i !== -1) {
                    fns.splice(S.indexOf(fn, fns), 2);
                }
            });
        }
    };
});

/**
 * NOTES: 
 * A. Firefox 5+, Chrome 11+, and Internet Explorer 10+ change timer resolution in inactive tabs to 1000 milliseconds. [http://www.nczonline.net/blog/2011/12/14/timer-resolution-in-browsers/, https://developer.mozilla.org/en/DOM/window.setTimeout#Inactive_tabs]
 * B. 校时策略：
 *    1. 避免错误累计
 *    2. 对于较大错误（比如A造成的）一次修正
 */

/**
 * 倒计时组件
 * Effects 模块
 * @author jide<jide@taobao.com>
 *
 */
/*global KISSY */

KISSY.add('widget/countdown/effect',function (S) {
    /**
     * Static attributes
     */
    var Effect = {
        // 普通的数字效果
        normal: {
            paint: function () {
                var me = this,
                    content;

                // 找到值发生改变的hand
                S.each(me.hands, function (hand) {
                    if (hand.lastValue !== hand.value) {
                        // 生成新的markup
                        content = '';

                        S.each(me._toDigitals(hand.value, hand.bits), function (digital) {
                            content += me._html(digital, '', 'digital');
                        });

                        // 并更新
                        hand.node.html(content);
                    }
                });
            }
        },
        // 滑动效果
        slide: {
            paint: function () {
                var me = this,
                    content, bits,
                    digitals, oldDigitals;

                // 找到值发生改变的hand
                S.each(me.hands, function (hand) {
                    if (hand.lastValue !== hand.value) {
                        // 生成新的markup
                        content = '';
                        bits = hand.bits;
                        digitals = me._toDigitals(hand.value, bits);
                        if (hand.lastValue === undefined) {
                            oldDigitals = digitals;
                        } else {
                            oldDigitals = me._toDigitals(hand.lastValue, bits);
                        }

                        while (bits--) {
                            if (oldDigitals[bits] !== digitals[bits]) {
                                content = me._html([me._html(digitals[bits], '', 'digital'), me._html(oldDigitals[bits], '', 'digital')], 'slide-wrap') + content;
                            } else {
                                content = me._html(digitals[bits], '', 'digital') + content;
                            }
                        }

                        // 并更新
                        hand.node.html(content);
                    }
                });
                
                Effect.slide.afterPaint.apply(me);
            },
            afterPaint: function () {
                // 找到值发生改变的hand
                S.each(this.hands, function (hand) {
                    if (hand.lastValue !== hand.value && hand.lastValue !== undefined) {
                        var node = hand.node,
                            height = node.one('.digital').height();

                        node.css('height', height);
                        node.all('.slide-wrap').css('top', -height).animate('top: 0', 0.3, 'bounceOut');
                    }
                });
            }
        },
        // 翻牌效果，
        // 逼真的话需要实现DOM节点的缩放效果，性价比不高
/*
// 只翻数字
<s class="flip-wrap">
    to be update...
</s>
// 翻指针
<s class="hand">
    <s class="handlet new">
        <s class="digital digital-1"></s>
        <s class="digital digital-9"></s>
    </s>
    <s class="handlet old">
        <s class="digital digital-2"></s>
        <s class="digital digital-0"></s>
    </s>
    <s class="handlet mask">
        <s class="digital digital-2"></s>
        <s class="digital digital-0"></s>
    </s>
</s>
*/
        flip: {
            paint: function () {
                var me = this,
                    m_mask, m_new, m_old;

                // 找到值发生改变的hand
                S.each(me.hands, function (hand) {
                    if (hand.lastValue !== hand.value) {
                        // 生成新的markup
                        m_mask = '';
                        m_new = '';
                        m_old = '';

                        S.each(me._toDigitals(hand.value, hand.bits), function (digital) {
                            m_new += me._html(digital, '', 'digital');
                        });
                        if (hand.lastValue === undefined) {
                            // 更新
                            hand.node.html(m_new);
                        } else {
                            m_new = me._html(m_new, 'handlet');
                            S.each(me._toDigitals(hand.lastValue, hand.bits), function (digital) {
                                m_old += me._html(digital, '', 'digital');
                            });
                            m_mask = me._html(m_old, 'handlet mask');
                            m_old = me._html(m_old, 'handlet');

                            // 更新
                            hand.node.html(m_new + m_old + m_mask);
                        }
                    }
                });
                
                Effect.flip.afterPaint.apply(me);
            },
            afterPaint: function () {
                // 找到值发生改变的hand
                S.each(this.hands, function (hand) {
                    if (hand.lastValue !== hand.value && hand.lastValue !== undefined) {
                        // 然后给它们添加动画效果
                        var node = hand.node,
                            ns = node.all('.handlet'),
                            n_new = ns.item(0),
                            n_old = ns.item(1),
                            n_mask = ns.item(2),
                            width = node.width(),
                            height = node.height(),
                            h_top = Math.floor(height / 2),
                            h_bottom = height - h_top;

                        // prepare
                        n_old.css({
                            clip: 'rect(' + h_top + 'px, ' + width + 'px, ' + height + 'px, 0)'
                        });

                        // 动画一，上半部分
                        n_mask.css({
                            overflow: 'hidden',
                            height: h_top + 'px'
                        });
                        n_mask.animate({
                            top: h_top + 'px',
                            height: 0
                        }, 0.15, 'easeNone', function () {
                            // 动画二，下半部分
                            n_mask.html(n_new.html());
                            n_mask.css({
                                top: 0,
                                height: h_top + 'px',
                                clip: 'rect(' + h_top + 'px, ' + width + 'px, ' + height + 'px, 0)'
                            });
                            n_mask.animate('height: ' + height + 'px', 0.3, 'bounceOut');
                        });
                    }
                });
            }
        }
    };

    return Effect;
}, {requires: []});

/**
 * @fileoverview 倒计时组件
 * @author jide<jide@taobao.com>
 * @module Countdown
 *
 *
 * [+]new feature  [*]improvement  [!]change  [x]bug fix
 *
 * [*] 2013-07-10
 *     bump version to 1.3
 * [*] 2012-04-26
 *     移除watchman，以及与真实时间有关的逻辑。修正notify无效的bug
 * [x] 2011-04-18 16:35
 *     修复初始之为0时可能出现倒计时为负数的bug by xixia.sm
 *     {{{ value = value < 0 ? 0 : value; }}}
 */

KISSY.add('widget/countdown/index',function (S, Node, Base, JSON, Timer, Effect) {
    var EVENT_AFTER_PAINT = 'afterPaint';

    /**
     * 请修改组件描述
     * @class Countdown
     * @constructor
     * @extends Base
     */
    function Countdown(config) {
        // factory or constructor
        if (!(this instanceof Countdown)) {
            return new Countdown(config);
        }

        config.el = S.one(config.el);
        if (!config.el) return;

        var cfg = config.el.attr('data-config');
        if (cfg) {
            cfg = JSON.parse(cfg.replace(/'/g, '"'));
            config = S.merge(cfg, config);
        }

        //调用父类构造函数
        Countdown.superclass.constructor.call(this, config);

        this._init();
    }

    S.extend(Countdown, Base,
        /** @lends Countdown.prototype*/{
            /**
             * 初始化
             * @private
             */
            _init: function () {//{{{
                var me = this;
                var el = me.get('el');

                // 初始化时钟.
                var hands = [];
                /**
                 * 指针结构
                 * hand: {
                 *   type: string,
                 *   value: number,
                 *   lastValue: number,
                 *   base: number,
                 *   radix: number,
                 *   bits: number,
                 *   node: S.Node
                 * }
                 */
                me.hands = hands;
                me.frequency = 1000;
                me._notify = [];

                // 分析markup
                var tmpl = el.html();
                var varRE = me.get('varRegular');
                varRE.lastIndex = 0;
                el.html(tmpl.replace(varRE, function (str, type) {
                    // 时钟频率校正.
                    if (type === 'u' || type === 's-ext') {
                        me.frequency = 100;
                    }

                    // 生成hand的markup
                    var content = '';
                    if (type === 's-ext') {
                        hands.push({type: 's'});
                        hands.push({type: 'u'});
                        content = me._html('', 's', 'handlet') +
                            me._html('.', '', 'digital') +
                            me._html('', 'u', 'handlet');
                    } else {
                        hands.push({type: type});
                    }

                    return me._html(content, type, 'hand');
                }));

                // 指针type以外属性(node, radix, etc.)的初始化.
                var clock = me.get('clock');
                S.each(hands, function (hand) {
                    var type = hand.type,
                        base = 100, i;

                    hand.node = el.one('.hand-' + type);

                    // radix, bits 初始化.
                    for (i = clock.length - 3; i > -1; i -= 3) {
                        if (type === clock[i]) {
                            break;
                        }

                        base *= clock[i + 1];
                    }
                    hand.base = base;
                    hand.radix = clock[i + 1];
                    hand.bits = clock[i + 2];
                });

                me._getLeft();
                me._reflow();

                // bind reflow to me.
                var _reflow = me._reflow;
                me._reflow = function () {
                    return _reflow.apply(me, arguments);
                };
                Timer.add(me._reflow, me.frequency);

                // 显示时钟.
                el.show();
            },//}}}
            /**
             * 获取倒计时剩余帧数
             */
            _getLeft: function () {//{{{
                var left = this.get('leftTime') * 1000;
                var end = this.get('stopPoint');        // 这个是UNIX时间戳，毫秒级
                if (!left && end) {
                    left = end - S.now();
                }

                this.left = left - left % this.frequency;
            },//}}}
            /**
             * 更新时钟
             */
            _reflow: function (count) {//{{{
                count = count || 0;

                var me = this;
                me.left = me.left - me.frequency * count;

                // 更新hands
                S.each(me.hands, function (hand) {
                    hand.lastValue = hand.value;
                    hand.value = Math.floor(me.left / hand.base) % hand.radix;
                });

                // 更新时钟.
                me._repaint();

                // notify
                if (me._notify[me.left]) {
                    S.each(me._notify[me.left], function (callback) {
                        callback.call(me);
                    });
                }

                // notify 可能更新me.left
                if (me.left < 1) {
                    Timer.remove(me._reflow);
                }

                return me;
            },//}}}
            /**
             * 重绘时钟
             * @private
             */
            _repaint: function () {//{{{
                Effect[this.get('effect')].paint.apply(this);

                this.fire(EVENT_AFTER_PAINT);
            },//}}}
            /**
             * 把值转换为独立的数字形式
             * @private
             * @param {number} value
             * @param {number} bits
             */
            _toDigitals: function (value, bits) {//{{{
                value = value < 0 ? 0 : value;

                var digitals = [];

                // 把时、分、秒等换算成数字.
                while (bits--) {
                    digitals[bits] = value % 10;

                    value = Math.floor(value / 10);
                }

                return digitals;
            },//}}}
            /**
             * 生成需要的html代码，辅助工具
             * @private
             * @param {string|Array.<string>} content
             * @param {string} className
             * @param {string} type
             */
            _html: function (content, className, type) {//{{{
                if (S.isArray(content)) {
                    content = content.join('');
                }

                switch (type) {
                    case 'hand':
                        className = type + ' hand-' + className;
                        break;
                    case 'handlet':
                        className = type + ' hand-' + className;
                        break;
                    case 'digital':
                        if (content === '.') {
                            className = type + ' ' + type + '-point ' + className;
                        } else {
                            className = type + ' ' + type + '-' + content + ' ' + className;
                        }
                        break;
                }

                return '<s class="' + className + '">' + content + '</s>';
            },//}}}
            /**
             * 倒计时事件
             * @param {number} time unit: second
             * @param {Function} callback
             */
            notify: function (time, callback) {
                time = time * 1000;
                time = time - time % (this.frequency || 1000);

                var notifies = this._notify[time] || [];
                notifies.push(callback);
                this._notify[time] = notifies;

                return this;
            }
        }, {
            ATTRS: /** @lends Countdown*/{
                el: {
                },
                // unix时间戳，单位应该是毫秒！
                stopPoint: {
                },
                leftTime: {
                    value: 0
                },
                template: {
//                    value: '${h}时${m}分${s-ext}秒'
                },
                varRegular: {
                    value: /\$\{([\-\w]+)\}/g
                },
                clock: {
                    value: ['d', 100, 2, 'h', 24, 2, 'm', 60, 2, 's', 60, 2, 'u', 10, 1]
                },
                effect: {
                    value: 'normal'
                }
            }
        });

    return Countdown;
}, {requires: ['node', 'base', 'json', './timer', './effect', './index.css']});


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
