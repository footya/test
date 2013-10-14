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