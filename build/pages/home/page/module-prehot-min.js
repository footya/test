KISSY.add("page/module-prehot",function(a,b,c,d){function e(){f(window).scrollTop(0),f("html").css("overflow","hidden"),f("html").css("height",c.viewportHeight()+"px"),g.show();var a="http://bbs.taobao.com/catalog/thread/16281010-263748145.htm?spm=0.0.0.0.13O45T",b='<div id="pre-hot-box">';"IE"==d.shell.toUpperCase()&&d[d.shell]<7?(b+='<img src="http://gtms02.alicdn.com/tps/i2/T1IEWDFXhgXXcEdaHx-815-246.png">',f("#qp-layer").append('<img src="about:blank">'),f("#qp-layer").css({position:"absolute",top:"0",left:"0",height:c.viewportHeight()+"px",width:"100%",zoom:"1"})):b+='<img src="http://gtms01.alicdn.com/tps/i1/T1imGHFhlXXXa5MrHV-828-264.png">',b+='<a target="_self" href="'+a+'">know new rule</a>',b+="</div>",f("body").append(f(b))}var f=b.all,g={el:f('<div id="qp-layer" style="z-index:998;"></div>'),show:function(){f("#qp-layer")[0]||f("body").append(this.el),this.el.show()},hide:function(){this.el.hide()}};return{init:e}},{requires:["node","dom","ua","page/module-prehot.css"]});