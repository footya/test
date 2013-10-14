/*
combined files : 

widget/countdown/index
widget/time/index
page/module-update

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
* @name: module-update.js
* @author: yujiang
* @prop: update date
* @date: 2013 08 28
*/

KISSY.add('page/module-update', function(S, Node, DOM, IO, XTemplate, Countdown, Time) {
	
	var $ = Node.all;

	var timmer = 0;
	//the ajax is return?
	var isLoad = true;

	//export api to external
	function init() {
		getData();
		timmer = setTimeout(init, 5000);
	}

	//change status text depend on system time
	function statusTextChange(data) {

		var sysTime = data.systemTime || Time.getNow();

		var hours = Time.getHours(sysTime),
			min = Time.getMin(sysTime);

		var round = $('.goods-round');

		//clear
		round.all('.status-soon').removeClass('status-soon');
		round.all('.status-now').removeClass('status-now');
		round.all('.status-over').removeClass('status-over');

		//soon
		if ( hours < 10 ) {
			$('#goods-round-10 .title-status').addClass('status-soon');
        }
        if ( hours < 15 ) {
			$('#goods-round-15 .title-status').addClass('status-soon');
        }
        if ( hours < 20 ) {
			$('#goods-round-20 .title-status').addClass('status-soon');
		}

		//begin
		if ( hours == 10 && min < 30 ) {
			$('#goods-round-10 .title-status').addClass('status-now');
        } else if ( hours == 15 && min < 30 ) {
			$('#goods-round-15 .title-status').addClass('status-now');
        } else if ( hours == 20 && min < 30 ) {
			$('#goods-round-20 .title-status').addClass('status-now');
		}

		//over
		if ( hours > 10 || (hours == 10 && min >= 30) ) {
			$('#goods-round-10 .title-status').addClass('status-over');
		}
		if ( hours > 15 || (hours == 15 && min >= 30) ) {
			$('#goods-round-15 .title-status').addClass('status-over');
		}
		if ( hours > 20 || (hours == 20 && min >= 30) ) {
			$('#goods-round-20 .title-status').addClass('status-over');
		}

		//text
		round.all('.title-status').html('\u5F00\u62A2');
		round.all('.status-over').html('\u4F18\u60E0\u4E2D');
		round.all('.status-soon').html('\u5373\u5C06\u5F00\u59CB');
		round.all('.status-now').html('\u6B63\u5728\u62A2\u62CD');

	}

	//big count down init
    function countDownInit(sysTime) {

        var timeTips = $('.round-title .time-tips');

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

            if ( item[0] && item[0]._countdown ) {

            	item[0]._countdown.left = leftTime*1000;

            } else {

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

               if ( item[0] ) {
                    item[0]._countdown = countdown;
                }

           	}

        });

    }

	//update the tpl depend on new data
	function update(data) {

		if ( !data || !data.data ) {
			throw new Error('no data');
		}

		var list = data.data,
			sysTime = data.systemTime;	

		countDownInit(sysTime);									

	}

	function getData() {
		if ( !isLoad ) {
			return;
		}
		isLoad = false;

		//data url of json data
		var url = JSON_URL_GET+'?t='+(new Date().getTime());

		//try catch
		try {

		IO.jsonp(url, function(data) {

			isLoad = true;

			//fix time
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
			update(data);
			statusTextChange(data);
			discount();
		});

		} catch(e) {
			console.log(e);
		}//end try catch
	}

	return {
		init: init
	}

}, {
	requires: ['node', 'dom', 'ajax', 'xtemplate', 'widget/countdown/index', 'widget/time/index', 'sizzle']
});
