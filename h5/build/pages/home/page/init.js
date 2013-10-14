/*
combined files : 

widget/countdown/index
widget/time/index
widget/tmpl/index
page/module-playmaker
page/init

*/
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

	function getTime( time ) {

		var timmer = 0;

		var year = getYear(time),
			month = getMon(time),
			day = getDate(time),
			hours = getHours(time),
            min = getMin(time),
            sec = getSec(time);

       	if ( month < 10 ) {
       		month = '0' + month;	
       	}
       	if ( day < 10 ) {
       		day = '0' + day;
       	}
       	if ( hours < 10 ) {
       		hours = '0' + hours;
       	}
       	if ( min < 10 ) {
       		min = '0' + min;
       	}
       	if ( sec < 10 ) {
       		sec = '0' + sec;
       	}

       	timmer = year+'/'+month+'/'+day+'/'+hours+':'+min+':'+sec;

		//'2013/10/13:12:37:55'
		return Date.parse(timmer);
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
		setSec: setSec,
		getTime: getTime
	}

}, {
	requires: ['node', 'dom', 'ajax']
});
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
* @name: home page palymaker.js
* @author: yujiang
* @prop: home page play box builder
* @date: 2013 10 10
*/

KISSY.add('page/module-playmaker',function (S, Node, IO, Countdown, Time, Tmpl) {

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
	    //+ 明日预告
	    //+
	    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	    function buildTomorrow() {

	    	var url = JSON_URL_TOMORROW+'?t='+(new Date()).getTime();
	    	IO.jsonp(url, function(data) {
	    		build(data);
	    	});

	    	function build(data) {
		   		var sysTime = data.systemTime;

				var tplTo = $('#tomorrow-list');
				var tpl = $('#tpl-play-list');

				//处理数据
				var data = filterData(data);

				//渲染
				Tmpl(tpl, tplTo, data);
	    	
	    	}	

	    }

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
	    			} else if ( tmp == 'soon' ) {
	    				ftLeft.html('10:00场预告');
	    			} else {
	    				ftLeft.html('10:00场优惠购买');
	    			}

	    			var tmp2 = getTabStatus(20);
	    			if ( tmp2 == 'now' ) {
	    				ftRight.html('20:00场抢拍中');
	    			} else if ( tmp == 'soon' ) {
	    				ftCenter.html('20:00场预告');
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
                		leftTime = s_sysTime-s_showTime;
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

                			this.left = 0;
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

			//遍历数据，根据时间遍历数据
			KISSY.each(list.data, function(item, index) {

				if ( !item.endTime ) {
					item.endTime = item.showTime*1+3000;
				}

				item.sysTime = sysTime;
				item.picUrl = item.picUrl.replace(/(\.jpg)|(\.png)/ig, '_290x290$1');

				item.tab = Time.getHours(item.showTime);

				item.discount = 6;
				item.discount_c = item.discount-1;

				switch( getStatus( item ) ) {
					case 'soon':
						item.currentClass = 'status-soon';
					break;
					case 'soon-now':
						item.currentClass = 'status-soon-now';
					break;
					case 'now':
						item.currentClass = 'status-now';
						item.discount = Math.floor( (item.originalPrice*1) / (item.currentPrice*1) );
						item.discount_c = item.discount-1;
					break;
					case 'later':
						item.currentClass = 'status-later';
						item.discount = Math.floor( (item.originalPrice*1) / (item.currentPrice*1) );
						item.discount_c = item.discount-1;
					break;
					case 'over':
						item.currentClass = 'status-over';
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
	    	var hours = Time.getHours(sysTime);

	    	if ( hours < 12 ) {
	    		$('#tab-item-10').fire('click');	
	    	} else if ( 12 <= hours && hours <= 17 ) {
	    		$('#tab-item-15').fire('click');
	    	} else {
	    		$('#tab-item-20').fire('click');
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
/*
* @name: home page init.js
* @author: yujiang
* @prop: home page import
* @date: 2013 10 09
*/

KISSY.add('page/init',function (S, PlayMaker) {

	try {
		PlayMaker.init();
	} catch(e) {
		console.log(e);
	}

}, {
    requires: ['./module-playmaker']
});

