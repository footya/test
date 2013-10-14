<?php
//++++++++++++++++++++++++++++++++++++++++++
//+
//+ 全局header
//+
//++++++++++++++++++++++++++++++++++++++++++

$mode = isset($_GET['mode']) ? $_GET['mode'] : 'src';

$tag = '1.0.0';
$min = '';

?>
<!DOCTYPE html>
<html>
<head>
    <title>天天抢拍-<?= $title ?></title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no"/>
    <meta name="apple-mobile-web-app-capable" content="yes"/>
    <meta name="apple-mobile-web-app-status-bar-style" content="black"/>
    <meta name="format-detection" content="telephone=no"/>
    <meta name="twcClient" content="false" id="twcClient"/>

    <?php switch ($mode) {
        case 'online':
        case 'tms':
            $assets_server = "http://g.tbcdn.cn/mm/qiangpaih5";
            $assets_base = $assets_server.'/'.$tag;
            break;
        case 'daily':
            $assets_server = "http://g.assets.daily.taobao.net/mm/qiangpaih5";
            $assets_base = $assets_server.'/'.$tag;
            break;
        case 'build':
            $assets_server = '../';
            $assets_base = $assets_server.'build';
            break;
        case 'src':
        default:
            $assets_server = '../';
            $assets_base = $assets_server.'src';
            break;
    } ?>

    <?php if ($min == '-min'): ?>
    <link rel="stylesheet" href="<?= $assets_base ?>/pages/<?= $page_name ?>/page/index-min.css"/>
    <?php else: ?>
    <link rel="stylesheet" href="<?= $assets_base ?>/pages/<?= $page_name ?>/page/index.css"/>
    <?php endif; ?>

</head>

<body class="body">

<header id="header">
    <section class="home-link-wrap">
        <a class="home-link" href="http://m.taobao.com">首页</a>
    </section>
    <section class="title">
        <img src="http://gtms02.alicdn.com/tps/i2/T1xf2qFkXcXXcmqIYd-153-30.png" />
    </section>
    <section class="buy-link-wrap">
        <a class="buy-link" href="http://m.taobao.com">已拍</a>
    </section>
</header>