/*
combined files : 

widget/time/index

*/
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
