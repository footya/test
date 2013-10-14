    <!--
    <cms:control template="module-control"/>
            {vmTransfer:wap_common_bottom_h5}
    -->
    <footer class="footer ishide ">
        <section class="footer-t">
            <p class="user-info">
                <span><a href="http://my.m.taobao.com/myTaobao.htm?sid=56bf5e50897aa6ac1791995c9591934d">用户名</a></span>
                <span><a href="http://login.m.taobao.com/logout.htm?sid=56bf5e50897aa6ac1791995c9591934d&amp;pds=logout%23h%23">退出</a></span>
            </p>
            <p class="gotop"><a id="J_GoTop" href="javascript:scroll(0,0)">top<b> </b></a></p>
        </section>
        <nav class="footer-l">
            <a href="http://m.taobao.com/?v=1&amp;sid=56bf5e50897aa6ac1791995c9591934d&amp;pds=stedition%23h%23"
                       title="">标准版</a>
            <a href="http://www.taobao.com/index.php?sid=56bf5e50897aa6ac1791995c9591934d&amp;from=wap&amp;pds=pcedition%23h%23&amp;sprefer=pmm302"
                        title="">电脑版</a>
            <a id="J_imgViewType" href="javascript:void(0)" class="J_dps" data-dps="hdedition%23h%23"
                       style="display:none;"></a>
        </nav>
        <p class="copyright"> &copy;2012 浙B2-20080224 <a class="cr-sv"href="http://m.taobao.com/channel/act/customerservice.html?sid=56bf5e50897aa6ac1791995c9591934d&amp;pds=service%23h%23"id="J_service">客服</a> </p>
        <p class="taofontdown" style="display:none">预加载淘+字体</p>
    </footer>
    <script src="http://a.tbcdn.cn/s/kissy/1.3.0/seed-min.js"></script>

    <?php if( $min == '-min'): ?>
    <script src="<?= $assets_base.'/common/package-config-min.js' ?>"></script>
    <script type="text/javascript">
    	KISSY.config({
    		combine: true
    	});
    </script>

    <?php else: ?>

    <script src="<?= $assets_base.'/common/package-config.js' ?>"></script>
    <script type="text/javascript">
    	KISSY.config({
    		debug: true
    	});
    </script>
    <?php endif; ?>

	<script>
		ABC.config({
			pageName: '<?= $page_name ?>',
			pub: '<?= $tag ?>',
			path: '<?= $assets_server ?>',
			charset: 'utf-8'
		});
		KISSY.use('page/init');
	</script>
</body>
</html>