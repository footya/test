KISSY.add("widget/slide/slide-util",function(a){"use strict";a.mix(a,{setHash:function(a,b){var c,d;"object"==typeof a?(c=window.location.href,b=a):c=a,c.indexOf("#")<0&&(c+="#");var e=this.getHash(c);for(d in b)e[d]=b[d];c=c.split("#")[0]+"#";for(d in e)c+=d+"="+e[d]+"&";return c=c.substr(0,c.length-1)},getHash:function(b){var c=b||window.location.href;if(c.indexOf("#")<0)return{};var d=c.split("#")[1];if(""===d)return{};"&"==d[d.length-1]&&(d=d.substr(0,d.length-1)),d=d.replace(/"/gi,"'"),d=d.replace(/=/gi,'":"'),d=d.replace(/&/gi,'","'),d+='"',d='{"'+d+"}";var e=a.JSON.parse(d);return e},_globalEval:function(a){if(a&&/\S/.test(a)){var b=document.getElementsByTagName("head")[0]||document.getElementsByTagName("body")[0],c=document.createElement("script");c.text=a,b.insertBefore(c,b.firstChild),setTimeout(function(){b.removeChild(c)},1)}},execScript:function(b){var c,d,e,f,g,h,i=this,j=new RegExp(/<script([^>]*)>([^<]*(?:(?!<\/script>)<[^<]*)*)<\/script>/gi),k=a.one("head").getDOMNode(),l=/\ssrc=(['"])(.*?)\1/i,m=/\scharset=(['"])(.*?)\1/i;for(j.lastIndex=0;c=j.exec(b);)d=c[1],e=d?d.match(l):!1,e&&e[2]?(g=document.createElement("script"),g.src=e[2],(f=d.match(m))&&f[2]&&(g.charset=f[2]),g.async=!0,k.appendChild(g)):(h=c[2])&&h.length>0&&i._globalEval(h)},isDaily:function(){return/daily\.taobao\.net/.test(window.location.hostname)?!0:!1}})},{requires:["node","sizzle","json","event"]}),KISSY.add("widget/slide/kissy2yui",function(a){"use strict";a.augment(a.Node,{_delegate:function(){var b=this;return a.isFunction(arguments[1])?b.delegate(arguments[0],arguments[2],arguments[1]):b.delegate.apply(b,arguments),b},indexOf:function(b){var c=this;if(a.isUndefined(b))return null;b[0]&&(b=b[0]);var d=0;return c.each(function(a,c){a[0]===b&&(d=c)}),d},size:function(){return this.length},set:function(a,b){return"innerHTML"===a?this.html(b):this.attr(a,b),this},get:function(a){var b=this,c={innerHTML:function(){return b.html()},region:function(){return{height:b.height(),width:b.width()}}};return a in c?c[a]():void 0},appendChild:function(){return this.append.apply(this,arguments),this},setStyle:function(){return this.css.apply(this,arguments),this},setStyles:function(){return this.css.apply(this,arguments),this},cloneNode:function(){return this.clone.apply(this,arguments)}}),a.Node.create=function(b){return a.Node(b)}},{requires:["node","event"]}),KISSY.add("widget/slide/base",function(a){"use strict";a.Node.all;var b=function(){if(!(this instanceof b))throw new Error('please use "new Slide()"');this.init.apply(this,arguments)};return b.plug=function(){},a.augment(b,a.Event.Target,{init:function(b,c){var d=this;if(a.isObject(b))d.con=b;else if(/^#/i.test(b))d.con=a.one(b);else if(a.one("#"+b))d.con=a.one("#"+b);else{if(!a.one(b))throw new Error("Slide Container Hooker not found");d.con=a.one(b)}if(d.buildParam(c),d.buildHTML(),d.bindEvent(),d.fire("ready",{index:0,navnode:d.tabs.item(0),pannelnode:d.pannels.item(0)}),d.reverse){var e;e=d.previous,d.previous=d.next,d.next=e}if(d.carousel)for(var f=0;f<d.colspan;f++)d.fix_for_transition_when_carousel(2*f);return d.fixSlideSize(),d.layerSlide&&d.initLayer(),d.renderPannelTextarea(d.currentTab),this},setWrapperSize:function(b){var c=this;a.isUndefined(b)&&(b=0),c.pannels=c.con.all("."+c.contentClass+" ."+c.pannelClass),c.length=c.pannels.length;var d={none:function(){},vSlide:function(){var a=c.animcon.get("region");c.animwrap.setStyles({height:(c.length+b)*a.height/c.colspan+"px"})},hSlide:function(){var a=c.animcon.get("region");c.animwrap.setStyles({width:(c.length+b)*a.width/c.colspan+"px"})},fade:function(){}};return d[c.effect](),a.isUndefined(b)||c.relocateCurrentTab(),this},add:function(b,c){var d=this;return(a.isUndefined(c)||c>d.length)&&(c=d.length),a.isString(b)&&(b=a.one(b)),d.transitions&&b.css({visibility:"hidden"}),c==d.length?(setTimeout(function(){d.setWrapperSize(1)},0),b.insertAfter(d.pannels[c-1])):b.insertBefore(d.pannels[c]),d.setWrapperSize(),d.fixSlideSize(d.currentTab),d.transitions&&b.css({visibility:""}),d.transitions,this},remove:function(b){var c=this;if(1!==c.length)return b<=c.currentTab&&(c.currentTab--,c.length--),c.transitions&&c.con.css({display:"none"}),a.one(c.pannels[b]).remove(),c.setWrapperSize(),c.transitions&&c.con.css({display:"block"}),c.fixSlideSize(c.currentTab),this},removeLast:function(){var a=this;return a.remove(a.length-1),a},renderLazyData:function(b){if(b.setStyle("display","none"),"1"!=b.attr("lazy-data")){b.attr("lazy-data","1");var c=(a.stamp(d),b.get("innerHTML").replace(/&lt;/gi,"<").replace(/&gt;/gi,">")),d=a.Node.create("<div>"+c+"</div>");a.DOM.insertBefore(d,b),a.execScript(c)}},renderPannelTextarea:function(b){var c=this;if(c.pannels.item(b))for(var d=function(b){a.one(c.pannels.item(b));var d=c.pannels.item(b).all(".data-lazyload");d&&d.each(function(a){c.renderLazyData(a)})},e=0;e<c.colspan;e++)d(b+e)},buildWrap:function(){var b=this;return b.animwrap=a.Node.create('<div style="position:absolute;"></div>'),b.animwrap.set("innerHTML",b.animcon.get("innerHTML")),b.animcon.set("innerHTML",""),b.animcon.appendChild(b.animwrap),b.pannels=b.con.all("."+b.contentClass+" ."+b.pannelClass),b},doEffectInit:function(){var a=this,b={none:function(){a.pannels=a.con.all("."+a.contentClass+" ."+a.pannelClass),a.pannels.setStyles({display:"none"}),a.pannels.item(a.defaultTab).setStyles({display:"block"})},vSlide:function(){a.buildWrap();var b=a.animcon.get("region");a.pannels.setStyles({"float":"none",overflow:"hidden"}),a.animwrap.setStyles({height:a.length*b.height/a.colspan+"px",overflow:"hidden",top:-1*a.defaultTab*b.height+"px"})},hSlide:function(){a.buildWrap();var b=a.animcon.get("region");a.pannels.setStyles({"float":"left",overflow:"hidden"}),a.animwrap.setStyles({width:a.length*b.width/a.colspan+"px",overflow:"hidden",left:-1*a.defaultTab*b.width+"px"})},fade:function(){a.pannels=a.con.all("."+a.contentClass+" ."+a.pannelClass),a.pannels.setStyles({position:"absolute",zIndex:0}),a.pannels.each(function(b,c){c==a.defaultTab?b.setStyles({opacity:1,display:"block"}):b.setStyles({opacity:0,diaplay:"none"})})}};return b[a.effect](),this},buildHTML:function(){var b=this,c=b.con;b.tabs=c.all("."+b.navClass+" "+b.triggerSelector);var d=c.all("."+b.contentClass+" ."+b.pannelClass);if(b.length=d.size(),c.one("."+b.navClass)||a.Node('<ul class="'+b.navClass+'" style="display:none"></ul>').appendTo(b.con),0===b.tabs.size()){for(var e=c.all("."+b.navClass),f="",g=0;g<b.length;g++){var h="";0===g&&(h=b.selectedClass),f+='<li class="'+h+'"><a href="javascript:void(0);">'+(g+1)+"</a></li>"}e.set("innerHTML",f)}return b.tabs=c.all("."+b.navClass+" "+b.triggerSelector),b.animcon=c.one("."+b.contentClass),b.animwrap=null,b.doEffectInit(),b.fixSlideSize(b.currentTab),b.hightlightNav(b.getWrappedIndex(b.currentTab)),b.autoSlide===!0&&b.play(),this},getCurrentPannel:function(){var b=this;return a.one(b.pannels[b.currentTab])},renderWidth:function(){var a=this,b=a.animcon.get("region").width;return"hSlide"==a.effect&&(b/=a.colspan),a.pannels.setStyles({width:b+"px"}),this},renderHeight:function(){var a=this,b=a.animcon.get("region").height;return"vSlide"==a.effect&&(b/=a.colspan),a.pannels.setStyles({height:b+"px"}),this},relocateCurrentTab:function(b){var c=this;return a.isUndefined(b)&&(b=c.currentTab),"hSlide"==c.effect?(c.transitions?c.animwrap.setStyles({"-webkit-transition-duration":"0s","-webkit-transform":"translate3d("+-1*b*c.animcon.get("region").width/c.colspan+"px,0,0)","-webkit-backface-visibility":"hidden"}):c.animwrap.setStyles({left:-1*b*c.animcon.get("region").width/c.colspan}),c.currentTab=b,this):void 0},fixSlideSize:function(a){var b=this;return b.adaptive_fixed_width&&b.renderWidth(),b.adaptive_fixed_height&&b.renderHeight(),b.adaptive_fixed_size&&b.renderHeight().renderWidth(),b.resetSlideSize(a),this},removeHeightTimmer:function(){var b=this;a.isNull(b.heightTimmer)||(clearInterval(b.heightTimmer),b.heightTimmer=null)},addHeightTimmer:function(){var b=this;a.isNull(b.heightTimmer)||(clearInterval(b.heightTimmer),b.heightTimmer=null);var c=function(){"hSlide"==b.effect&&b.animcon.setStyles({height:b.pannels.item(b.currentTab).get("region").height+"px"})};b.heightTimmer=setInterval(c,100),c()},resetSlideSize:function(a){var b,c,d=this;return("undefined"==typeof a||null===a)&&(a=d.currentTab),"hSlide"==d.effect||"vSlide"==d.effect?("hSlide"==d.effect&&(b=d.adaptive_width?d.adaptive_width():d.animcon.get("region").width,c=d.pannels.item(a).get("region").height,b/=d.colspan,d.pannels.setStyles({width:b+"px",display:"block"}),d.animcon.setStyles({width:b*d.colspan+"px",overflow:"hidden"}),d.animWrapperAutoHeightSetting&&d.animcon.setStyles({height:c+"px"})),"vSlide"==d.effect&&(b=d.pannels.item(a).get("region").width,c=d.adaptive_height?d.adaptive_height():d.animcon.get("region").height,c/=d.colspan,d.pannels.setStyles({height:c*d.colspan+"px",display:"block"}),d.animcon.setStyles({height:c*d.colspan+"px",overflow:"hidden"}),d.animWrapperAutoHeightSetting&&d.animcon.setStyles({width:b+"px"})),this):void 0},getWrappedIndex:function(a){var b=this,c=0;return c=b.carousel?a<b.colspan?b.length-3*b.colspan+a:a>=b.length-b.colspan?a-(b.length-b.colspan):a-b.colspan:a},getMousePosition:function(){var b=this,c=function(a){b._t_mouseX=a.clientX,b._t_mouseY=a.clientY};a.Event.on(document,"mousemove",c),setTimeout(function(){a.Event.detach(window,"mouseover",c)},b.triggerDelay)},massTrigger:function(b,c){var d=this;return a.inArray(d.eventType,["mouseover","mouseenter"])?(d.getMousePosition(),a.isUndefined(d._fired)||a.isNull(d._fired)?d._fired=setTimeout(function(){d.inRegion([d._t_mouseX,d._t_mouseY],a.one(c))&&b(a.one(c)),d._fired=null},d.triggerDelay):(clearTimeout(d._fired),d._fired=setTimeout(function(){d.inRegion([d._t_mouseX,d._t_mouseY],a.one(c))&&b(a.one(c)),d._fired=null},d.triggerDelay)),void 0):(b(a.one(c)),void 0)},getMaxAnimDelay:function(b){var c=this,d=0;if(c.sublayers)return a.each(c.sublayers[b],function(a){a.durationout+a.delayout>d&&(d=a.durationout+a.delayout)}),d},inRegion:function(a,b){var c=b.offset(),d={width:b.width(),height:b.height()};return a[0]>=c.left&&a[0]<=c.left+d.width&&a[1]>=c.top&&a[1]<=c.top+d.height?!0:!1},bindEvent:function(){var b=this;a.inArray(b.eventType,["click","mouseover","mouseenter"])&&b.con._delegate(b.eventType,function(a){a.preventDefault(),b.massTrigger(function(a){var c=Number(b.tabs.indexOf(a));b.carousel&&(c=(c+1)%b.length),b.go(c),b.autoSlide&&b.stop().play()},a.currentTarget)},"."+b.navClass+" "+b.triggerSelector),b.hoverStop&&(b.con._delegate("mouseover",function(){b.autoSlide&&b.stop()},"."+b.contentClass+" ."+b.pannelClass),b.con._delegate("mouseout",function(){b.autoSlide&&b.play()},"."+b.contentClass+" ."+b.pannelClass));try{a.Event.on("resize",function(){b.fixSlideSize(b.currentTab),b.relocateCurrentTab()},window)}catch(c){}if(b.on("beforeSwitch",function(){return this.layerSlide&&this.isAming()?!1:void 0}),"ontouchstart"in document.documentElement){if(!b.touchmove)return this;b.con._delegate("touchstart",function(a){b.stop(),b.touching=!0,b.is_last()&&b.carousel&&b.fix_next_carousel(),b.is_first()&&b.carousel&&b.fix_pre_carousel(),b.startX=a.changedTouches[0].clientX,b.startY=a.changedTouches[0].clientY,b.animwrap.setStyles({"-webkit-transition-duration":"0s"}),b.startT=Number(new Date)},"."+b.contentClass),b.con._delegate("touchend",function(a){b.touching=!1;var c=a.changedTouches[0].clientX,d=Number(b.animcon.get("region").width);b.deltaX=Math.abs(c-b.startX);var e=Math.abs(c)<Math.abs(b.startX),f=!e,g=b.carousel?!1:b.is_last()&&e||b.is_first()&&f,h=function(){b.animwrap.setStyles({"-webkit-transition-duration":Number(b.speed)/2+"s","-webkit-transform":"translate3d("+-1*b.currentTab*b.animcon.get("region").width/b.colspan+"px,0,0)"})},i=function(){var a=b.animcon.get("region").width/b.colspan,c=parseInt((b.deltaX-a/2)/a,10);e?(c>=1&&b.length>2&&(b.currentTab+=c+1,b.currentTab>=b.length-b.colspan&&(b.currentTab=b.length-b.colspan-1)),b.next()):(c>=1&&b.length>2&&(b.currentTab+=-1*c-1,b.currentTab<=0&&(b.currentTab=1)),b.previous())};return b.touchmove&&b.deltaX<30?(h(),void 0):(!g&&(b.touchmove&&b.deltaX>d/3||!b.touchmove&&b.carousel||!b.carousel&&b.touchmove&&"hSlide"==b.effect||!b.touchmove&&!b.carousel||Number(new Date)-b.startT<550)?i():h(),b.autoSlide&&b.play(),void 0)},"."+b.contentClass),b.touchmove&&(b.con._delegate("touchmove",function(a){if(!(a.touches.length>1)){b.deltaX=a.touches[0].clientX-b.startX;var c=b.is_last()&&b.deltaX<0||b.is_first()&&b.deltaX>0;if(!b.carousel&&"hSlide"==b.effect&&c&&(b.deltaX=b.deltaX/3),b.isScrolling=Math.abs(b.deltaX)<Math.abs(a.touches[0].clientY-b.startY)?!0:!1,!b.isScrolling){a.preventDefault(),b.stop();var d=Number(b.animcon.get("region").width/b.colspan),e=b.deltaX-b.currentTab*d;b.animwrap.setStyles({"-webkit-transition-duration":"0s","-webkit-transform":"translate3d("+e+"px,0,0)"})}}},"."+b.contentClass),b.animwrap.on("webkitTransitionEnd",function(){}))}return this},initLayer:function(){var b=this;if(!("ontouchstart"in document.documentElement||a.UA.ie>0&&a.UA.ie<9)){var c=["durationin","easingin","durationout","easingout","delayin","delayout","slideindirection","slideoutdirection","offsetin","offsetout","alpha","easeInStrong","easeOutStrong","easeBothStrong","easeNone","easeIn","easeOut","easeBoth","elasticIn","elasticOut","elasticBoth","backIn","backOut","backBoth","bounceIn","bounceOut","bounceBoth","left","top","right","bottom"],d={durationin:1e3,easingin:"easeIn",durationout:1e3,easingout:"easeOut",delayin:300,delayout:300,slideindirection:"right",slideoutdirection:"left",alpha:!0,offsetin:50,offsetout:50},e=function(b){function e(a,b){var c=h[b];f[b]=void 0===c||null===c?a:c}var f=this,g=b.attr("rel").replace(/"'/gi,"").replace(new RegExp("("+c.join("|")+")","ig"),'"$1"'),h=a.JSON.parse("{"+g+"}");a.each(d,e),this.el=b,this.left=Number(b.css("left").replace("px","")),this.top=Number(b.css("top").replace("px","")),this.animIn=function(){var b=this,c=b.offsetin,d=b.slideindirection,e={left:function(){b.el.css({left:b.left-c})},top:function(){b.el.css({top:b.top-c})},right:function(){b.el.css({left:b.left+c})},bottom:function(){b.el.css({top:b.top+c})}};e[d](),setTimeout(function(){var c={left:{left:b.left},top:{top:b.top},bottom:{top:b.top},right:{left:b.left}},e={};a.mix(e,c[d]),b.alpha&&a.mix(e,{opacity:1}),a.Anim(b.el,e,b.durationin/1e3,b.easingin,function(){}).run()},b.delayin),b.alpha&&b.el.css({opacity:0})},this.animOut=function(){var b=this,c=b.offsetout,d=b.slideoutdirection,e={left:function(){b.el.css({left:b.left})},top:function(){b.el.css({top:b.top})},right:function(){b.el.css({left:b.left})},bottom:function(){b.el.css({top:b.top})}};e[d](),setTimeout(function(){var e={left:{left:b.left+c},top:{top:b.top+c},bottom:{top:b.top-c},right:{left:b.left-c}},f={};a.mix(f,e[d]),b.alpha&&a.mix(f,{opacity:0}),a.Anim(b.el,f,b.durationout/1e3,b.easingout,function(){}).run()},b.delayout),b.alpha&&b.el.css({opacity:1})}};b.sublayers=[],b.pannels.each(function(a,c){return("vSlide"==b.effect||"hSlide"==b.effect)&&a.css({position:"relative"}),0===a.all('[alt="sublayer"]').length?(b.sublayers[c]=[],void 0):(void 0===b.sublayers[c]&&(b.sublayers[c]=[]),a.all('[alt="sublayer"]').each(function(a){b.sublayers[c].push(new e(a))}),void 0)}),b.on("beforeSwitch",function(a){return a.index===b.currentTab?!1:(b.subLayerRunin(a.index),void 0)}),b.on("beforeTailSwitch",function(a){return b.subLayerRunout(a.index),b.getMaxAnimDelay(a.index)})}},subLayerRunin:function(b){var c=this,d=c.sublayers[b];a.each(d,function(a){a.animIn()})},subLayerRunout:function(b){var c=this,d=c.sublayers[b];a.each(d,function(a){a.animOut()})},buildParam:function(b){function c(a,c){var e=b[c];d[c]=void 0===e||null===e?a:e}var d=this;return(void 0===b||null===b)&&(b={}),a.each({autoSlide:!1,speed:500,timeout:3e3,effect:"none",eventType:"click",easing:"easeBoth",hoverStop:!0,selectedClass:"selected",conClass:"t-slide",navClass:"tab-nav",triggerSelector:"li",contentClass:"tab-content",pannelClass:"tab-pannel",carousel:!1,reverse:!1,touchmove:!1,adaptive_fixed_width:!1,adaptive_fixed_height:!1,adaptive_fixed_size:!1,adaptive_width:!1,adaptive_height:!1,defaultTab:0,layerSlide:!1,layerClass:"tab-animlayer",colspan:1,animWrapperAutoHeightSetting:!0,webkitOptimize:!0,triggerDelay:300},c),a.mix(d,{tabs:[],animcon:null,pannels:[],timmer:null,touching:!1}),d.speed=d.speed/1e3,0!==d.defaultTab&&(d.defaultTab=Number(d.defaultTab)-1),d.carousel&&(d.defaultTab=d.colspan,d.effect="hSlide"),d.currentTab=d.defaultTab,d.transitions="webkitTransition"in document.body.style&&d.webkitOptimize,d},fix_for_transition_when_carousel:function(a){var b=this;"undefined"==typeof a&&(a=0);var c=b.con;if(b.animcon=b.con.one("."+b.contentClass),b.animwrap=b.animcon.one("div"),b.pannels=c.all("."+b.contentClass+" ."+b.pannelClass),"hSlide"==b.effect){var d=Number(b.animcon.get("region").width/b.colspan);Number(b.animcon.get("region").height),b.animwrap.setStyle("width",b.pannels.size()*d+2*d);var e=b.pannels.item(a).cloneNode(!0),f=b.pannels.item(b.pannels.size()-1-a).cloneNode(!0);b.animwrap.append(e),b.animwrap.prepend(f),b.transitions?b.animwrap.setStyles({"-webkit-transition-duration":"0s","-webkit-transform":"translate3d("+-1*d*(a/2+1)+"px,0,0)","-webkit-backface-visibility":"hidden",left:"0"}):b.animwrap.setStyle("left",-1*d*(a/2+1))}return b.pannels=c.all("."+b.contentClass+" ."+b.pannelClass),b.length=b.pannels.size(),this},isAming:function(){var a=this;return a.anim?a.anim.isRunning():!1},previous:function(a){var b=this;try{if(b.isAming()&&b.carousel)return this}catch(c){}var d=b.currentTab+b.length-1-(b.colspan-1);return d>=b.length-b.colspan+1&&(d%=b.length-b.colspan+1),b.carousel&&b.is_first()?(b.fix_pre_carousel(),b.previous.call(b),this):(b.go(d,a),this)},is_last:function(){var a=this;return a.currentTab==a.length-(a.colspan-1)-1?!0:!1},is_first:function(){var a=this;return 0===a.currentTab?!0:!1},next:function(a){var b=this;try{if(b.isAming()&&b.carousel)return this}catch(c){}var d=b.currentTab+1;return d>=b.length-b.colspan+1&&(d%=b.length-b.colspan+1),b.carousel&&b.is_last()?(b.fix_next_carousel(),b.next.call(b),this):(b.go(d,a),this)},fix_next_carousel:function(){var a=this;a.currentTab=a.colspan;var b=a.con;"none"!=a.effect&&(a.pannels=b.all("."+a.contentClass+" ."+a.pannelClass));var c="-"+Number(a.animcon.get("region").width).toString()+"px";"hSlide"==a.effect?a.transitions?a.animwrap.setStyles({"-webkit-transition-duration":"0s","-webkit-transform":"translate3d("+c+",0,0)"}):a.animwrap.setStyle("left",c):"vSlide"==a.effect},fix_pre_carousel:function(){var a=this;a.currentTab=a.length-1-2*a.colspan+1;var b=a.con;"none"!=a.effect&&(a.pannels=b.all("."+a.contentClass+" ."+a.pannelClass));var c="-"+(Number(a.animcon.get("region").width/a.colspan)*a.currentTab).toString()+"px";"hSlide"==a.effect?a.transitions?a.animwrap.setStyles({"-webkit-transition-duration":"0s","-webkit-transform":"translate3d("+c+",0,0)"}):a.animwrap.setStyle("left",c):"vSlide"==a.effect},hightlightNav:function(a){var b=this;return b.carousel&&b.colspan>1?this:(b.tabs.item(a)&&(b.tabs.removeClass(b.selectedClass),b.tabs.item(a).addClass(b.selectedClass)),this)},switch_to:function(b,c){var d=this;if(c===!1)var e=!1;else var e=!0;var f=function(){a.isFunction(c)&&c.call(d,d),d.fire("afterSwitch",{index:d.currentTab,navnode:d.tabs.item(d.getWrappedIndex(d.currentTab)),pannelnode:d.pannels.item(d.currentTab)})},g=d.fire("beforeTailSwitch",{index:d.currentTab,navnode:d.tabs.item(d.getWrappedIndex(d.currentTab)),pannelnode:d.pannels.item(d.currentTab)});if(d.fixSlideSize(b),d.autoSlide&&d.stop().play(),b>=d.length&&(b%=d.length),b==d.currentTab)return this;if(d.anim)try{d.anim.stop(),d.anim=null}catch(h){}var i={none:function(a){d.pannels.setStyles({display:"none"}),d.pannels.item(a).setStyles({display:"block"}),f()},vSlide:function(b){d.transitions?(d.animwrap.setStyles({"-webkit-transition-duration":(e?d.speed:"0")+"s","-webkit-transform":"translate3d(0,"+-1*b*d.animcon.get("region").height/d.colspan+"px,0)","-webkit-backface-visibility":"hidden"}),e?(d.anim=a.Anim(d.animwrap,{opacity:1},d.speed,d.easing,function(){f()}),d.anim.run()):f()):e?(d.anim=a.Anim(d.animwrap,{top:-1*b*d.animcon.get("region").height/d.colspan},d.speed,d.easing,function(){f()}),d.anim.run()):(d.animwrap.css({top:-1*b*d.animcon.get("region").height/d.colspan}),f())},hSlide:function(b){d.transitions?(d.animwrap.setStyles({"-webkit-transition-duration":(e?d.speed:"0")+"s","-webkit-transform":"translate3d("+-1*b*d.animcon.get("region").width/d.colspan+"px,0,0)","-webkit-backface-visibility":"hidden"}),e?(d.anim=a.Anim(d.animwrap,{opacity:1},d.speed,d.easing,function(){f()}),d.anim.run()):f()):e?(d.anim=a.Anim(d.animwrap,{left:-1*b*d.animcon.get("region").width/d.colspan},d.speed,d.easing,function(){f()}),d.anim.run()):(d.animwrap.css({left:-1*b*d.animcon.get("region").width/d.colspan}),f())},fade:function(b){var c=d.currentTab;d.anim=a.Anim(d.pannels.item(b),{opacity:1},e?d.speed:.01,d.easing,function(){d.pannels.item(c).setStyle("zIndex",0),d.pannels.item(b).setStyle("zIndex",1),d.pannels.item(c).setStyle("opacity",0),d.pannels.item(c).setStyles({display:"none"}),f()}),d.pannels.item(b).setStyles({display:"block"}),d.pannels.item(b).setStyle("opacity",0),d.pannels.item(c).setStyle("zIndex",1),d.pannels.item(b).setStyle("zIndex",2),d.anim.run()}},j=function(){var a=d.fire("beforeSwitch",{index:b,navnode:d.tabs.item(b),pannelnode:d.pannels.item(b)});a!==!1&&(b+d.colspan>d.pannels.size()&&(b=d.pannels.size()-d.colspan),i[d.effect](b),d.currentTab=b,d.hightlightNav(d.getWrappedIndex(b)),d.fire("switch",{index:b,navnode:d.tabs.item(d.getWrappedIndex(b)),pannelnode:d.pannels.item(b)}),d.renderPannelTextarea(b))};a.isNumber(g)?setTimeout(function(){j()},g):j()},go:function(a,b){var c=this;return c.switch_to(a,b),this},play:function(){var a=this;return null!==a.timer&&clearTimeout(a.timer),a.timer=setTimeout(function(){a.next().play()},Number(a.timeout)),this},stop:function(){var a=this;return clearTimeout(a.timer),a.timer=null,this}}),b},{requires:["node","event","json","./slide-util","./kissy2yui"]}),KISSY.add("widget/slide/index",function(a,b){return b},{requires:["./base"]}),KISSY.add("widget/localstorage/index",function(a){function b(){h=localStorage,i=function(a,b){h.setItem(a,b)},j=function(a){return h.getItem(a)},k=function(a){h.removeItem(a)},l=function(){h.clear()}}function c(){var a="IELocalDataStore";d(),i=function(b,c){try{h.setAttribute(b,c),h.save(a)}catch(d){}},j=function(b){try{return h.load(a),h.getAttribute(b)}catch(c){}},k=function(b){try{h.removeAttribute(b),h.save(a)}catch(c){}},l=function(){try{h.expires=f(),h.save(a),e()}catch(b){}}}function d(){var a=document;h=a.createElement("link"),h.addBehavior&&(h.style.behavior="url(#default#userData)",a.getElementsByTagName("head")[0].appendChild(h))}function e(){if(h)try{document.body.removeChild(h)}catch(a){}d()}function f(){var a=new Date;return a.setMinutes(a.getMinutes()-1),a.toUTCString()}function g(){"undefined"!=typeof localStorage?b():a.UA.ie<8&&c()}var h,i,j,k,l;g();var m={setItem:i,getItem:j,removeItem:k,clear:l};return m},{requires:["ua"],attach:!1}),KISSY.add("common/module-guide",function(a,b,c,d,e,f){function g(){i(window).scrollTop(0),i("html").css("overflow","hidden"),i("html").css("height",c.viewportHeight()+"px"),j.show(),k.init()}function h(){f.getItem("qp_fish_guide")||"IE"==d.shell.toUpperCase()&&d[d.shell]<7||(f.setItem("qp_fish_guide",1),g()),i("#J_palyrule").on("click",function(){g()})}var i=b.all,j={el:i('<div id="qp-layer"></div>'),show:function(){i("#qp-layer")[0]||i("body").append(this.el),this.el.show()},hide:function(){this.el.hide(),i("html").css("overflow","auto"),i("html").css("height","auto")}},k={el:"",add:function(a){var b=this.el.all(".tab-content");b.append(a)},build:function(){var a='<div id="hd-guide-slider">';a+='<span class="btn-close"></span>',a+='<a class="btn-prev"><span class="icon"></span></a>',a+='<a class="btn-next"><span class="icon"></span></a>',a+='<ul class="tab-nav"></ul><div class="tab-content"></div>',a+="</div>",this.el=i(a);var b=[];b.push("http://gtms01.alicdn.com/tps/i1/T1djCDFl8fXXXXH6bx-708-264.png"),b.push("http://gtms03.alicdn.com/tps/i3/T1ctCEFfpdXXa3p7v8-729-266.png"),b.push("http://gtms02.alicdn.com/tps/i2/T1xOqEFjBeXXbHCs.7-767-302.png"),b.push("http://gtms04.alicdn.com/tps/i4/T1bMWHFXhaXXbbXsQU-762-277.png"),b.push("http://gtms03.alicdn.com/tps/i3/T11leFFfJcXXcnZBLH-581-319.png");for(var c="",d=0;d<b.length;d++)c='<div class="tab-pannel" id="guide-item-'+d+'">',c+='<img src="'+b[d]+'">',c+=d==b.length-1?'<div class="guide-next">next</div><div id="hd-guide-slider-over">over</div>':'<div class="guide-next">next</div>',c+="</div>",this.add(c)},hide:function(){this.el.remove()},init:function(){this.build(),i("body").append(this.el);var a=new e("hd-guide-slider",{effect:"fade",speed:100});this.el.all(".btn-next").on("click",function(){a.next()}),this.el.all(".btn-prev").on("click",function(){a.previous()}),this.el.all(".guide-next").on("click",function(){a.next()}),this.el.all(".btn-close").on("click",function(){j.hide(),k.hide()}),i("#hd-guide-slider-over").on("click",function(){j.hide(),k.hide()})}};return{init:h,show:g}},{requires:["node","dom","ua","widget/slide/index","widget/localstorage/index","common/module-guide.css"]});