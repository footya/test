KISSY.add("common/reset",function(a,b,c){function d(){var a=c.viewportWidth();a>1260?h("body").addClass("w1190"):h("body").addClass("w990")}function e(){}function f(){KISSY.ready(function(){})}function g(){e(),d(),f()}var h=b.all;return{init:g}},{requires:["node","dom","event"]}),KISSY.add("widget/tmpl/index",function(a,b){function c(a,b){function c(a,b){if(e++,a[e]){var d=a[e].replace(/\[[^\]]*\]/g,""),f=/\[([\d\w]*)\]/g.exec(a[e]);return f&&void 0!=f[1]&&b[d]&&void 0!=b[d][f[1]]?c(a,b[d][f[1]]):void 0!=b[a[e]]?c(a,b[a[e]]):-1}return void 0!=b?b:-1}var d=a.split("."),e=-1;return c(d,b)}function d(a,b){a.each(function(a){for(var d=a.attr("data-watch").split(","),f=0,g=d.length;g>f;f++){var j=d[f].split(":");switch(j[0]){case"text":var k=c(j[1],b);-1!=k&&a.html(k);break;case"value":var l=c(j[1],b);-1!=l&&a.html(l);break;case"attr":var l=c(j[2],b);-1!=l&&a.attr(j[1],l);break;case"style":var l=c(j[2],b);if(-1!=l)switch(j[1]){case"left":case"right":case"top":case"bottom":case"width":case"height":case"paddingLeft":case"paddingRight":case"paddingTop":case"paddingBottom":case"marginLeft":case"marginRight":case"marginTop":case"marginBottom":a.css(j[1],l+"px");break;default:a.css(j[1],l)}break;case"class":var m=c(j[1],b);-1!=m&&(j[2]?"rm"==j[2]?a.removeClass(m):(a[0].className=a[0].className.replace(/state-[^\s]*[\s]?/gi,"").replace(/(\s)+/gi,"$1"),a.hasClass(m)||a.addClass(m)):a.addClass(m));break;case"part":var n=j[1],o=j[2],p=e(i(n).html());h[n]=p,i(o).html(b?p(b):p)}}})}function e(a){var b=[];b=a.match(/<%=include\(([^)]*)\)=%>/gi)||[];for(var c=0,d=b.length;d>c;c++)b[c]=b[c].replace("<%=include(","").replace(")=%>",""),a=i("#"+b[c])[0]?a.replace(/<%=include\(([^)]*)\)=%>/i,i("#"+b[c]).html()):a.replace(/<%=include\(([^)]*)\)=%>/i,"");var e=new Function("obj","var p=[],print=function(){p.push.apply(p,arguments);};with(obj){p.push('"+a.replace(/[\r\t\n]/g,"").split("<%").join("	").replace(/((^|%>)[^\t]*)'/g,"$1\r").replace(/\t=(.*?)%>/g,"',$1,'").split("	").join("');").split("%>").join("p.push('").split("\r").join("\\'")+"');}return p.join('');");return e}function f(a,b,c,d){var f=a.html(),g=e(f,c);b.html(c?g(c):g),d&&d(g)}function g(a,b,c){var e=a.attr("id")||"nocache";if(h[e]){var g=b.all(".node-watch");g.length<1?b.html(c?h[e](c):h[e]):d(g,c)}else f(a,b,c,function(a){h[e]=a})}var h={},i=b.all;return g},{requires:["node"]}),KISSY.add("widget/time/index",function(){function a(a,b){var c=[];if(a+="","[object String]"!=Object.prototype.toString.call(a))throw new Error("not a string");return a.length<b?c=new Array(b-a.length+1).join("0").concat(a):a}function b(a,b){if(b>=0&&59>=b){b=10>b?"0"+b:""+b;var c=d(a).split("");return c.splice(10,2,b),c=c.join("")}return a}function c(a,b){if(b>=0&&59>=b){b=10>b?"0"+b:""+b;var c=d(a).split("");return c.splice(12,2,b),c=c.join("")}return a}function d(b){var b=b+"";return a(b,14)}function e(a){return 1*d(a).substr(0,4)}function f(a){return 1*d(a).substr(4,2)}function g(a){return 1*d(a).substr(6,2)}function h(a){return 1*d(a).substr(8,2)}function i(a){return 1*d(a).substr(10,2)}function j(a){return 1*d(a).substr(12,2)}function k(a,b){var c=j(b),k=i(b),l=h(b);g(b),f(b),e(b);var m=j(a),n=i(a),o=h(a);g(a),f(a),e(a);var p=0,q=0,r=0;if(3600*l+60*k+m>3600*o+60*n+m)return-1;var s=0,t=0;m-c>=0?p=m-c:(p=m+60-c,s++),n-=s,n-k>=0?q=n-k:(q=n+60-k,t++),o-=t,r=o-l>=0?o-l:o+24-l,10>r&&(r="0"+r),10>q&&(q="0"+q),10>p&&(p="0"+p);var u=r+""+q+p;return d(u)}function l(){var b=new Date;return b.getFullYear()+a(b.getMonth()+1,2)+a(b.getDate(),2)+a(b.getHours(),2)+a(b.getMinutes(),2)+a(b.getSeconds(),2)}return{getHours:h,getMin:i,getSec:j,getYear:e,getMon:f,getDate:g,getLeftTime:k,getNow:l,setMin:b,setSec:c}},{requires:["node","dom","ajax"]}),KISSY.add("page/module-tomorrow",function(a,b,c,d,e,f){function g(){function a(a){function b(a,b){var c=Math.floor(b/10);return c>=5&&(c=6),7*a+c+1}function c(a,c,d){var e=b(a,c),f=8.5*((d+"").length+6)+30;return e>f-20&&210>e+(f-20)?e-20:f-20>=e?0:210-f}var d=a.systemTime,e=f.getHours(d),g=f.getMin(d),h=f.getSec(d),i=f.getHours(a.showTime);1*a.currentPrice&&(a.currentPrice=(1*a.currentPrice).toFixed(2));var j=[10,15,20];a.left=0,a.leftTime=0,a.discount=6,a.priceLeft=0,a.tipsLeft="state-scroll-tips-left",a.showhours=i,a.currentClass="";for(var k=0;k<j.length;k++)j[k]==i&&(e>=j[k]?e==j[k]&&30>g?(a.discount=6-Math.floor(g/5),a.left=b(g,h),a.priceLeft=c(g,h,a.currentPrice),a.currentClass=0==a.stockCount?"state-later":"state-now",a.left>=100&&(a.tipsLeft="state-scroll-tips-right")):a.currentClass="state-over":e<j[k]&&(a.currentClass=e==j[k]-1&&g>=55?"state-soon-now":"state-soon"));return a.discountC=a.discount-1,a.discount&&6==a.discount&&(a.currentPrice=Math.round(.6*a.currentPrice)),a}function b(b){var c=b.systemTime||f.getNow(),d={},e={},g={};if(d.data=[],e.data=[],g.data=[],b&&b.data){for(var h=0,i=b.data.length;i>h;h++){var j=b.data[h];switch(j.systemTime||(j.systemTime=c||0),j=a(j),f.getHours(j.showTime)){case 10:d.data.push(b.data[h]);break;case 15:e.data.push(b.data[h]);break;case 20:g.data.push(b.data[h])}}return{tab10:d,tab15:e,tab20:g}}}function c(a){var c=h("#tomorrow-round-10"),d=h("#tomorrow-round-15"),g=h("#tomorrow-round-20"),i=h("#tpl-tomorrow-goods"),j=a.systemTime||f.getNow();f.getHours(j),f.getHours(j),f.getHours(j),a=b(a);try{e(i,c.all(".goods-list"),a.tab10),e(i,d.all(".goods-list"),a.tab15),e(i,g.all(".goods-list"),a.tab20)}catch(k){console.log(k)}}function g(a){var b=JSON_URL_TOMORROW+"?t="+(new Date).getTime();try{d.jsonp(b,function(b){a&&a(b)})}catch(c){console.log(c)}}g(function(a){var a=a;a.systemTime="20130101010000",c(a)})}var h=b.all;return{init:g}},{requires:["node","dom","ajax","widget/tmpl/index","widget/time/index"]}),KISSY.add("page/index",function(a,b,c){KISSY.ready(function(){try{b.init(),c.init()}catch(a){console.log(a)}})},{requires:["common/reset","page/module-tomorrow"]});