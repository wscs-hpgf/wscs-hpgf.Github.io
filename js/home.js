(function() {

	// alert( "布局窗口:"+document.documentElement.clientWidth + "-视觉窗口:" + window.innerWidth + "-DPR:" + window.devicePixelRatio);
	if($(".doc .page-cont").height()<60){
		//  安卓vh识别BUG
		$(".doc .page-cont").css('height',$(window).height());
		$(".doc .page-gmod").css('height',$(window).height());
		setTimeout(function(){$(".doc-text").show();},1000);
	}else{
		$(".doc-text").show();
	}
	
	$('.new-year').html(new Date().getFullYear());
    $.debounce = function(fn, timeout, invokeAsap, ctx) {

        if(arguments.length == 3 && typeof invokeAsap != 'boolean') {
            ctx = invokeAsap;
            invokeAsap = false;
        }

        var timer;

        return function() {

            var args = arguments;
            ctx = ctx || this;

            invokeAsap && !timer && fn.apply(ctx, args);

            clearTimeout(timer);

            timer = setTimeout(function() {
                !invokeAsap && fn.apply(ctx, args);
                timer = null;
            }, timeout);

        };

    },

    $.throttle = function(fn, timeout, ctx) {

        var timer, args, needInvoke;

        return function() {

            args = arguments;
            needInvoke = true;
            ctx = ctx || this;

            if(!timer) {
                (function() {
                    if(needInvoke) {
                        fn.apply(ctx, args);
                        needInvoke = false;
                        timer = setTimeout(arguments.callee, timeout);
                    }
                    else {
                        timer = null;
                    }
                })();
            }

        };

    }
})();

$(function() {
	// 首屏问题
	var winH = $(window).height(), 
		isIE678 = /msie (6|7|8)/i.test(navigator.userAgent);

	var edges = [], elemsH = [];

	// resize
	(function() {
		var resizeFn = $.debounce(function(){
			// 首屏问题
			winH = $(window).height();
			isIE678 && $('.page-bg,.page-gmod').height(winH);

			if( isIE678 ) { return ; }
			// 计算边界
			$('.doc-bg .page-bg').each(function() {
				var $elem = $(this);
				elemsH.push( $elem.height() );
				edges.push( $elem.offset().top );
			});
			edges.push(edges[edges.length-1] + elemsH[elemsH.length-1]);
		}, 50);
		$(window).on('resize', resizeFn);
		resizeFn();
	})();

	// scroll事件
	(function() {
		if( isIE678 ) { return ; }
		var bgList = $('.doc-bg .page-bg .page-cont'), 
			maskList = $('.doc-bg .page-bg .page-cont-mask'), 
			textList = $('.doc-text .page-gmod'),
			pageRule = $('.page-rule');

		var scrollFn = $.throttle(function() {
			var st = $(window).scrollTop();
			var startIndex = -1, endIndex = -1;
			var alpha = 0.75, beta = 0.08;

			// 上下边界 出现 alpha 时 增加样式 剩下 alpha 时 去除样式
			for( var len=edges.length, i=0; i<len-1; i++ ) {
				// console.log(i, edges[i]+elemsH[i]*alpha - winH, edges[i+1]-elemsH[i]*alpha);
				if( st > edges[i]+elemsH[i]*alpha - winH && 
					st < edges[i+1]-elemsH[i]*alpha ) {
					bgList.eq(i).addClass('trans scale');
					
					textList.eq(i).find('h1,h2,h3,.desc,.flink').removeClass('opshow-ok')
						.addClass('trans opshow');
					if( i == 0 ) {
						maskList.eq(i).removeClass('mask mask-ok').addClass('trans_slow mask-zero');
						textList.eq(i).find('h1').addClass('trans_slow scale');
					} else {
						maskList.eq(i).removeClass('mask-zero mask-ok').addClass('trans_slow mask');
					}
				} else {
					bgList.eq(i).removeClass('scale');

					maskList.eq(i).removeClass('mask mask-zero').addClass('trans_slow mask-ok');
					textList.eq(i).find('h1,h2,h3,.desc,.flink').removeClass('opshow')
						.addClass('trans opshow-ok');

					textList.eq(i).find('h1').removeClass('scale');
				}
			}

			// 元素的中点在页面偏上 translateY为负值 否则为正值
			for( var len=elemsH.length, i=0; i<len; i++ ) {
				var mid = (edges[i] + edges[i+1])/2;
				var delta = (st+winH)/2-mid;
				var ty = delta * beta;

				// textList.eq(i).css({
				// 	'transform': 'translateY(' + ty + 'px)'
				// });
			}
			// banner
			// pageRule.css({
			// 	'transform': 'translateY(' + st*200/winH + 'px)'
			// });
		}, 10);
		$(window).on('scroll', scrollFn);

		setTimeout(function() {
			scrollFn();
		}, 50);
	})();
});