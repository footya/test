
# 淘宝天天抢拍

## 目录结构

* -build：代码输出目录（依据kissy-cake规范）

* -src：代码源目录
    + -common：通用资源
    + -pages：页级资源
        + -home：首页页面
        + -tomorrow：明日预告页面
        + -merchantApply：商家入驻
        + -activity：活动页面（但是一般不会用到，直接再写TMS里）
    + -utils：工具
    + -widget：组件
        + -countdown：从gallery上挖过来的倒计时组件（gallery的服务器你懂得！）
        + -localstorage：本地存贮兼容性处理（IE6+）
        + -slide：kissy gallery的slide组件
        + -time：应用于业务的时间处理接口
        + -tmpl：应用于动态反向模板

* -Gruntfile.js：部署脚本

## 构建说明
项目构建
    + 前端构建模板：[Kissy-cake](http://abc.f2e.taobao.net/ "Kissy-Cake")
	+ 后台数据模板模拟：[vmarket](http://v.taobao.net/ "vmarket")

## 项目架构	
前端框架
	+ [Kissy 1.3.0](http://docs.kissyui.com/ "Kissy")
	+ [Less](http://www.lesscss.net/article/home.html/ "Less")

### host绑定
	+ #预发
	10.235.136.37    g.tbcdn.cn
	172.21.99.94     qiang.taobao.com

	+ #local
	10.125.1.123     qiang.daily.taobao.net
	127.0.0.1        assets.daily.taobao.net

## 项目信息
 * 前端负责人：禺疆
 * 项目云盘资源：[进入](http://yunpan.taobao.com/group/162594?spm=0.0.0.0.jS3aMT "项目资源")
 * 项目统计：
 	+ 浏览器：[进入](http://beta.wpo.taobao.net/ap/?app=a2151.6734197&ticket=26bdf33d-c549-4de8-8665-8c68ec2658aa&type=br "浏览器统计")
 	+ 点击数：[进入](http://shuju.taobao.ali.com/atpanel2/atpanel.htm?ticket=0bc475a2-1b8e-464e-8c52-acbe429e416b&spm=0.0.0.0.Pezb13#this "点击数")
 	+ PV/UV：[进入](http://tongji.cnzz.com/main.php?c=user&a=tip&code=1000#!/1378972260674/site/overview/1/30086301/2013-09-12/2013-09-12 pv)

### 更新ing...
