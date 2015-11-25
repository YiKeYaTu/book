
var myScroll = (function () {
	return new IScroll('#container', {
		scrollbars: true,
	});
})();
var controlWapper = (function () {
	var controlWapper = function () {
		this.outer = $('.the-loading-wapper');
		this.loadingWapper = $('.loading-wapper');
		this.failWapper = $('.fail-wapper');
	};
	controlWapper.prototype.show = function (which) {
		this.outer.css('display','block');
		this[which].css('display','block');
	};
	controlWapper.prototype.hidden = function (which) {
		this.outer.css('display','none');
		this[which].css('display','none');
	};
	return new controlWapper();
})();

(function () {
	var flag = true,
		readingBtn = $('#reading'),
		readingBox = $('.reading-box'),
		readingIcon = $('.reading-icon');

	var rotate = function (flag) {
		if (flag) {
			readingIcon.css('-webkit-transform','rotate(0deg)');
		} else {
			readingIcon.css('-webkit-transform','rotate(180deg)');
		}
	};
	var fixed = function () {
		if (readingBox[0].children.length === 0) {
			var node = $('<div class="reading-list"></div>');
			node.html('无');
			readingBox[0].appendChild(node[0]);
		}
	};
	fixed();
	readingBtn.tap(function () {
		if (flag) {
			readingBox.css('display','block');
			readingBtn.css('border-bottom','1px solid #e5e5e5');
		} else {
			readingBox.css('display','none');
			readingBtn.css('border','none');
		}
		myScroll.refresh();
		rotate(flag);
		flag = !flag;
	});
})();

(function () {
	var flag = true;

	var	doc = document,
		userInf = $('.wapper'),
		readerInf = $('#reader-inf'),
		rankInf = $('#rank-inf'),
		userInfOuter = $('.user-inf-outer'),
		loadingWapper = $('.the-loading-wapper'),
		line = $('.line'),
		rankOuter = $('.rank-outer');

	var cache;//缓存排名

	var _getData = function () {//获取排名数据
		if (cache) {
			return;
		}
		var data,//相应数据
			node,//临时节点
			i,//计数器
			rankStyle;//排名样式

		var temp = doc.createDocumentFragment();

		controlWapper.show('loadingWapper');
		$.post($('html').attr('getinfo-url'),{searchType:'rankInfo'},function (res) {
		//$.post('hehe.php',{searchType:'rankInfo'},function (res) {
			i = -1;
			data = JSON.parse(res).data;
			while (data[++i]) {
				switch (i) {
					case 0:
						rankStyle = 'rank-frist';
						break;
					case 1:
						rankStyle = 'rank-s';
						break;
					case 2:
						rankStyle = 'rank-t';
						break;
					default :
						rankStyle = '';
				}
				node = $('<li class="rank-el"></li>');
				node.html(
					'<div class="rank-el-top">' +
						'<span class="rank ' + rankStyle +'">' +
							'第' + (i  + 1)+ '名' + 
						'</span>' + 
						'<span class="book-number topT">' +
							data[i]['rank'] +
						'</span>' +
					'</div>' +
					'<div class="rank-el-bottom">' +
						'<span class="rank-name">' +
							data[i]['name'] +
						'</span>' + 
						'<span class="rank-school">' +
							data[i]['xueyuan'] +
						'</span>' +
					'</div>'
				);
				temp.appendChild(node[0]);
			}
			cache = true;
			userInf[0].appendChild(temp);
			line.css('display','block');
			controlWapper.hidden('loadingWapper');
			myScroll.refresh();
		});
	}
	loadingWapper.css('height',window.innerHeight + 'px');
	$('.user-select-outer').tap(function (e) {
		var target = e.target;
		if (target.nodeName !== 'P') {
			return false;
		}
		if (flag) {
			line.css('display','none');
			readerInf.attr('class','user-select');
			rankInf.attr('class','user-select select-focus');
			userInfOuter.css('display','none');
			rankOuter.css('display','block');
			_getData();
		} else {
			readerInf.attr('class','user-select select-focus');
			rankInf.attr('class','user-select');
			userInfOuter.css('display','block');
			rankOuter.css('display','none');
		}
		myScroll.refresh();
		flag = !flag;
	})
})();


(function (window) {
	var searchBtn = $('.search-icon'),
		searchContent = $('.search-res');

	var doc = document,
		dFlag = true,//返回条状态锁定
		thisDataLength = 12,
		newSearch = false,
		dis = 0;//偏移
	
	var history,
		inputContentQuery,//搜索内容
		cacheAllData,
		showBottomFlag,//只要这个flag为true则代表没有更多数据锁定底部栏
		moveSearchContent,
		cacheData;

	moveSearchContent = (function () {//移动搜索接结果相关
		var	searchInput = $('.search-input'),
			searchContent = $('.search-res'),
			userSelect = $('.user-select-outer'),
			userInfOuter = $('.user-inf-outer'),
			rankOuter = $('.rank-outer');

		var infectEl = [userInfOuter,rankOuter,userSelect];
		
		var data,//相应数据
			lastChange;//被隐藏的块

		var moveSearchContent = function (flag) {//移动搜索结果栏
			if (flag) {
				myScroll.jud = true;
				searchContent.css({
					'z-index':'111',
					'-webkit-transform':'translateX(0px)'
				});
			} else {
				myScroll.jud = false;
				searchContent.css('position','absolute');
				userSelect.css('display','block');
				lastChange.css('display','block');
			}
			_reFuesed(flag);
			
		};
		var appendIt = function (data,frgment) {
			for (var i = 0,len = data.length;i < len;i++) {
				var node = $('<div class="search-inf"></div>');
				node.html(
					'<div class="book-name search-inf-content" action-id=' + (dis + i) +'>' +
						data[i]['bookName'] +
					'<i class="book-icon"></i></div>' +		
					'<div class="hidden-inf last-inf">' +
						'<div class="book-user search-inf-content">' +
							'作者' +
							'<span class="book-inner">'+ data[i]['writer'] +'</span>' +
						'</div>' + 
						'<div class="book-number search-inf-content">' +
							'编号' +
							'<span class="book-inner">'+ data[i]['code'] +'</span>' +
						'</div>' +
						'<div class="book-place search-inf-content ">' +
							'馆藏地' +
							'<span class="book-inner">'+ data[i]['place'] +'</span>' +
						'</div>' +
						'<div class="line"></div>' +
					'</div>'
				);
				frgment.appendChild(node[0]);
			}
			dis += len;
			dFlag = true;
		};
		var appendData = function (query,fn) {//添加数据
			var data;
			if (showBottomFlag) {
				return 'no more';
			}
			$.post('gaga.php',{searchType:'bookInfo',inputContent:query,begin:dis},function (res) {
			//$.post($('html').attr('getinfo-url'),{searchType:'bookInfo',inputContent:query,begin:dis},function (res) {
				var frgment = doc.createDocumentFragment();	
				data = JSON.parse(res).data || [];
				searchContent.attr('class','search-res')
				if (data.length < thisDataLength) {//thisDataLength 一次接受数据长度
					showBottomFlag = true;
					searchContent.attr('class','search-res no-more');
				}
				appendIt(data,frgment);
				searchContent[0].appendChild(frgment);
				myScroll.refresh();
				controlWapper.hidden('loadingWapper');
				fn && fn();
				if (!newSearch && data.length === 0 || !data.length) {
					controlWapper.show('failWapper');
					dFlag = false;
					newSearch = !newSearch;
					return false;
				}
			});
		};
		var _reFuesed = function (flag) {//搜索结果隐藏
			if (!flag) {
				searchContent.css('-webkit-transform','translateX(10rem)');
				myScroll.refresh();
				return;
			}
			setTimeout(function () {
				for (var i = infectEl.length - 1;i > -1;i--) {
					if (infectEl[i].css('display') === 'block') {
						lastChange = infectEl[i];
					}
					infectEl[i].css('display','none');
				}
				searchContent.css('position','static');
				myScroll.refresh();
			},400);
		};
		var _downFuesed = (function () {
			var flag,
				dFlag;//加载状态锁
			var container = $('.search-res');
			$(doc).on('touchmove',function (e) {
				if (!dFlag && myScroll.jud && myScroll.maxScrollY - myScroll.y  > window.innerHeight * 0.12) {
					if (!showBottomFlag) {
						setTimeout(function () {
							container.attr('class','search-res before-loading');
						});
						flag = true;
					}
				}
			}).on('touchend',function () {
				if (!dFlag && flag && !showBottomFlag) {
					setTimeout(function () {
						container.attr('class','search-res loading');
					});
				}
			});
			myScroll.on('scrollEnd',function () {
				if (!dFlag && flag && !showBottomFlag) {
					setTimeout(function () {
						appendData(inputContentQuery,function () {
							dFlag = false;
						});
					},1000);
					flag = !flag;
					dFlag = true;
				}
			})

		})();
		return {
			move : moveSearchContent,
			getValue : function () {
				return searchInput.val();
			},
			appendData : appendData
		}
	})();
	history = (function () {//历史记录相关

		var cacheValue;

		var	historyArr = [
				function () {
					moveSearchContent.move(false);
					doc.title = "图书馆查询系统";
				},
				function () {
					moveSearchContent.move(true);
					doc.title = "图书馆查询结果-" + cacheValue;
				}
			];
		
		var i =  0;

		setTimeout(function () {
			$(window).on('popstate',function (e) {
				if (!dFlag) {
					return false;
				}
				e.preventDefault();
				historyArr[i++]();
				if (i == 2) {
					i = 0;
				}
			})
		},100);
		return {
			reset : function (num) {
				i = num || 0;
			},
			setCache : function (s) {
				cacheValue = s;
				return s;
			}
		}
	})();


	$('.back-btn').tap(function () {
		dFlag = true;
		window.history.go(-1);
		controlWapper.hidden('failWapper');
	});

	searchBtn.tap(function () {
		var data;
		searchContent.html('');
		showBottomFlag = false;
		dFlag = false;
		newSearch = false;
		dis = 0;
		document.body.click();
		if (!this.previousElementSibling.value) {
			return;
		}
		inputContentQuery = moveSearchContent.getValue();
		controlWapper.show('loadingWapper');
		moveSearchContent.appendData(inputContentQuery);//请求查询
		moveSearchContent.move(true);
		doc.title = "图书馆查询结果-" + history.setCache(moveSearchContent.getValue());
		window.history.pushState('','','');
		history.reset();
	});
})(window);

(function () {

	var searchRes = $('.search-res'),
		rem2px = lib.flexible.rem2px;

	var headerHeight = rem2px(3.125 + 0.5625),
		elementHeight = rem2px(1.546875),
		hiddenElementHeight = rem2px(1.546875 * 3);

	var flag,
		allDis,
		lastAction;
	var animate = function (oldP,newP,speed) {
		var timeScal = 1000/60,
			count = speed / timeScal,
			distance = (newP - oldP)/count,
			timer;
		timer = setInterval(function () {
			if (oldP >= newP - 100) {
				clearInterval(timer);
			}
			myScroll.scrollTo(0,- (oldP += distance));
		},timeScal);
	};
	searchRes.tap(function (e) {//搜索结果栏展开
		var target = e.target,
			distance = $(target).attr('action-id') * elementHeight + headerHeight;
		if (target.parentNode.className === 'search-inf' && target.className === 'book-name search-inf-content') {
			if ($(target).attr('flag') == null) {
				$(target).attr('flag',true);
			}
			flag = $(target).attr('flag');
			if (flag == 'true') {
				lastAction && lastAction.trigger('tap');
				lastAction = $(target);
				allDis = window.innerHeight - myScroll.y;
				$(target.nextElementSibling).css('display','block');
				$(target).attr('flag','false');
				$(target).children('i').css('-webkit-transform','rotate(0deg)');
				myScroll.refresh();
				if (distance + hiddenElementHeight + elementHeight > allDis) {				
					if (-distance < myScroll.maxScrollY) {
						distance = Math.abs(myScroll.maxScrollY);
					}
					animate(-myScroll.y,distance,200);
				}
			} else {
				lastAction = null;
				$(target.nextElementSibling).css('display','none');
				$(target).attr('flag','true');
				$(target).children('i').css('-webkit-transform','rotate(180deg)');
			}
			myScroll.refresh();
		}
	});
})();








