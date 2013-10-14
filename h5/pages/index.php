<?php
$page_name = 'home';
$title = '首页';
?>

<?php
include_once(dirname(__FILE__) . '/common/header.php');
?>

<section id="content">
	<section class="round-tab">
		<ul class="tab-list">
			<li id="tab-item-10" class="tab-item tab-item-10" data-tab="10">
				<a href="#tab10">10:00</a>
				<b class="tab-line"></b>
			</li>
			<li id="tab-item-15" class="tab-item tab-item-15" data-tab="15">
				<a href="#tab15">15:00</a>
				<b class="tab-line"></b>
			</li>
			<li id="tab-item-20" class="tab-item tab-item-20" data-tab="20">
				<a href="#tab20">20:00</a>
				<b class="tab-line"></b>
			</li>
			<li id="tab-item-tomorrow" class="tab-item tab-item-tomorrow" data-tab="tomorrow">
				<a href="./tomorrow.php">明日预告</a>
				<b class="tab-line"></b>
			<li>
		</ul>
	</section>
	<section id="round-play-wrap" class="round-play wrapper"></section>
</section>

<script id="tpl-play" type="text/template">
<section class="round-play-box">
	<section class="status-info-wrap">
		<p class="status-info status-info-soon">即将开拍，6折起降，5分钟降1折</p>
		<p class="status-info status-info-now">抢拍中，请拍下5分钟内付款，否则订单会被取消</p>
		<p class="status-info status-info-over">抢拍已结束，立即优惠价购买，只限今日</p>
		<p class="status-info status-info-tomorrow">明天10:00开始，六折起降</p>
	</section>
	<%=include(tpl-play-list)=%>
	<section class="footer-tab">
		<a href="" class="footer-tab-status footer-tab-left"></a>
		<a href="" class="footer-tab-status footer-tab-center"></a>
		<a href="" class="footer-tab-status footer-tab-right"></a>
	</section>
<section>
</script>
<script id="tpl-play-list" type="text/template">
	<section class="round-goods">
		<ul class="round-goods-list">
		<% for(var i=0, len=data.length; i<len; i++){ %>
			<li id="item-id-<%=data[i].itemId%>" class="round-goods-item-<%=data[i].tab%> round-goods-item node-watch <%=data[i].currentClass%>" data-tab="<%=data[i].tab%>" data-watch="class:data[<%=i%>].currentClass:state" >
				<p class="title">
					<a targe="_self" href="http://h5.m.taobao.com/awp/core/detail.htm?id=<%=data[i].itemId%>"><%=data[i].title%></a>
				</p>	
				<div class="img-box">
					<a target="_self" class="img-link" href="http://h5.m.taobao.com/awp/core/detail.htm?id=<%=data[i].itemId%>">
						<img alt="<%=data[i].title%>" src="<%=data[i].picUrl%>">
					</a>
					<div class="countdown-text" data-showtime="<%=data[i].showTime%>" data-endtime="<%=data[i].endTime%>">
						<p class="countdown-time">${m}分${s}秒后<span class="txt-soon">开抢</span><span class="txt-zhe"><i class="node-watch dis-num" data-watch="text:data[<%=i%>].discount_c"><%=data[i].discount_c%></i>折</span></p>
					</div>
					<div class="scroll-bar">
						<div class="scroll-flag node-watch" data-watch="style:width:data[<%=i%>].scrollLeft" style="width:<%=data[i].scrollLeft%>px"></div>
					</div>
				</div>
				<div class="meta">
					<span class="item-discount"><i><%=data[i].discount%></i>折</span>
					<span class="item-discount-soon">即将6折</span>
					<span class="item-currentprice">&yen;<i><%=data[i].currentPrice%></i></span>
					<a class="btn-pai" href="http://h5.m.taobao.com/awp/core/detail.htm?id=<%=data[i].itemId%>" target="_self">抢拍</a>
					<a class="btn-buy" href="http://h5.m.taobao.com/awp/core/detail.htm?id=<%=data[i].itemId%>" target="_self">优惠购</a>
					<span class="item-text-later">还有机会</span>
				</div>
				<div class="info">
					<span class="item-oprice">&yen;<i class="node-watch" data-watch="text:data[<%=i%>].originalPrice"><%=data[i].originalPrice%></i></span>
					<span class="item-remain-num item-num">剩余<i class="node-watch" data-watch="text:data[<%=i%>].stockCount"><%=data[i].stockCount%></i>件<i class="l-line"></i></span>
					<span class="item-pai-num item-num">刚拍走<i class="node-watch" data-watch="text:data[<%=i%>].soldCount"><%=data[i].soldCount%></i>件<i class="l-line"></i></span>
					<span class="item-stock-num item-num">限量<i class="node-watch" data-watch="text:data[<%=i%>].stockCount"><%=data[i].stockCount%></i>件<i class="l-line"></i></span>
					<span class="item-pai-over">已拍完，有订单未付款</span>
				</div>
			</li>
		<% } %>
		</ul>
	</section>
</script>

<?php
include_once(dirname(__FILE__) . '/common/footer.php');
?>