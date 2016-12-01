
~function (argument) {
	var HtmlFormat = {
		tempResultHtml:'',
		tempResultSuffixArr:[],
		currLevel:0,
		target:'',
		type:'html',
		/**
		 * [init description]
		 * @param  {[type]}  doms      [节点id集合]
		 * @param  {[type]}  needRoot  [是否需要根节点]
		 * @param  {[type]}  suffix    [显示节点ID的后缀]
		 * @return {[type]}            [description]
		 */
		switchHtmlJade:function (clickDom, suffix) {
			$(""+clickDom).click(function () {
				var targetId = $(this).prev().attr("id");
				var changeId = targetId?targetId.substr(0, targetId.indexOf(suffix)):'';
				var value = this.value;
				if(!value) {
					value = 'html';
					this.value = 'html';
				}
				if(value == 'html') {
					this.value = value = 'jade';
				} else if(value == 'jade') {
					this.value = value = 'html';
				} 
				HtmlFormat.init([changeId], false, '_code', value);
			});
		},
		init: function (doms, needRoot, suffix, type, clickDom) {
			this.switchHtmlJade(clickDom, suffix);
			for(var i = 0 ; i < doms.length; ++i) {
				var currDom = doms[i];
				var withSpace = 0;
				var isRoot = true;
				this.target = currDom + suffix;
				this.type = type?type.toLowerCase():'html';
				currDom = $('#' + currDom);
				this.handleFormatHtml(currDom, isRoot, withSpace, needRoot);
				$('#' + this.target)[0].innerHTML = HtmlFormat.tempResultHtml + HtmlFormat.tempResultSuffixArr.join('<br>');
				this.reset();
			}
			
		},
		handleFormatHtml: function (jqDom, isRoot, withSpace, needRoot) {
			var currNode,outerH,pre,space='';
			if(isRoot) { // 如果是第一次传递html代码进来
				jqDom = $(jqDom)[0]; // jqDom[0] 是根元素
				withSpace = 0;
			} else if(jqDom.nodeType === 1){
				withSpace += 1;
			} else {
				return;
			}
			if(withSpace < this.currLevel) {
				// 如果dom childNode level改变的时候，去添加</xxx>
				for(var i = 0; i < this.currLevel - withSpace; ++i) {
					var suf = this.tempResultSuffixArr.shift();
					this.tempResultHtml += suf? suf + '<br>':'';
				}
			}
			this.currLevel = withSpace;
			if(this.hasElementChileNodes(jqDom)) {
				currNode = jqDom.cloneNode();
				outerH = currNode.outerHTML;
				pre = outerH.substr(0, outerH.split('').length - (currNode.tagName.length + 3));
				if(!isRoot || (isRoot && needRoot)) { // 暂存根节点，如果不需要，后续截取掉
					if(this.type === 'jade') {
						this.tempResultHtml += this.nodeToJade(currNode, true, withSpace, true);
					} else {
						this.tempResultHtml += this.wrapWithFormatL(pre, true, withSpace);
					}
				}
				space = '';
				for(var i = 0; i < withSpace * 4; ++i) {
					space += ' ';
				}
				if(isRoot && !needRoot) { // 暂存根节点，如果不需要，后续截取掉
					withSpace = -1
				} else {
					if(this.type === 'jade') {
						this.tempResultSuffixArr.unshift('');
					} else {
						this.tempResultSuffixArr.unshift(space + '&lt;/' + currNode.tagName.toLowerCase() + '&gt;');
					}
				}
				for(var i =0 , len = jqDom.childNodes.length; i < len; i ++) {
					this.handleFormatHtml(jqDom.childNodes[i], false, withSpace);	
				}
			} else {
				if(jqDom.nodeType === 1) {
					currNode = jqDom.cloneNode(true);
					if(this.type === 'jade') {
						this.tempResultHtml += this.nodeToJade(currNode, true, withSpace, false);
					} else {
						outerH = currNode.outerHTML;
						pre = outerH.substr(0, outerH.split('').length - (currNode.tagName.length + 3));
						this.tempResultHtml += this.wrapWithFormatL(pre, false, withSpace) + '&lt;/' + currNode.tagName.toLowerCase() + '&gt;<br>';
					}
					return;
				}
				return;
			}
		},
		wrapWithFormatL: function (html, withBR, withSpace) {
			// 生成withSpace * 4 个空格
			var space = '';
			for(var i = 0; i < withSpace * 4; ++i) {
				space += ' ';
			}
			return withBR?space + html.replace(/[<]/g, '&lt;').replace(/[>]/g, '&gt;<br>'):space + html.replace(/[<]/g, '&lt;').replace(/[>]/g, '&gt;');
		},
		hasElementChileNodes: function (element) {
			if(element && element.childNodes.length > 0) {
				for(var i =0 , len = element.childNodes.length; i < len; i ++) {
					if(element.childNodes[i].nodeType === 1) {
						return true;
					}	
				}
			}
			return false;
		},
		nodeToJade: function (node, withBR, withSpace, hasChild) {
			// 生成withSpace * 4 个空格
			var space = '',
				content = '',
				attrLen = 0,
				nodeName = '',
				tempAttr,
				tempAttrClasss,
				hasMoreAttr=false,
				textContent = '',
				i, j;
			if(!hasChild) {
				textContent = node.textContent;
			}
			for(i = 0; i < withSpace * 4; ++i) {
				space += ' ';
			}
			// 如果要转换jade模板，则去获取该节点的attributes
			var attributes = node.attributes;
				attrLen = attributes.length;
			nodeName = node.nodeName.toLowerCase();
			if((nodeName === 'div' && attrLen === 0) || nodeName !== 'div') {
				// 如果是div的情况， 则不用写标签名。类直接加.className, id直接加#id
				content += nodeName;
			} 
			for(j = 0; j < attributes.length; ++j){
				tempAttr = attributes[j]; // 获取各个属性
				if(tempAttr.name.toLowerCase() === 'id') {
					content += '#' + tempAttr.nodeValue;
				} else if(tempAttr.name.toLowerCase() === 'class') {
					// 获取classList 循环遍历
					tempAttrClasss = tempAttr.nodeValue?tempAttr.nodeValue.split(' '):'';
					for(i = 0; i < tempAttrClasss.length; ++i) {
						content += tempAttrClasss[i]?'.' + tempAttrClasss[i]:'';
					}
				} else {
					if(!hasMoreAttr) {
						hasMoreAttr = true;
						content += '(' + tempAttr.name.toLowerCase() + '="' + tempAttr.nodeValue + '"';
					} else {
						content += ', ' + tempAttr.name.toLowerCase() + '="' + tempAttr.nodeValue + '"';
					}
				}
			}
			if(hasMoreAttr) {
				content += ')';
			}
			if(textContent) {
				content += ' ' + textContent;
			}

			return withBR?space + content + '<br>':space + 'xxx';
		}
		,
		reset: function () {
			this.tempResultHtml = '';
			this.tempResultSuffixArr = [];
			this.currLevel = 0;
			this.target = '';
		}

	};
	window.HtmlFormat = HtmlFormat;
}($);

/**
 * [init description]
 * @param  {[type]}  doms      [节点id集合]
 * @param  {Boolean} isRoot    [是否是第一次传入]
 * @param  {[type]}  needRoot  [是否需要根节点]
 * @param  {[type]}  withSpace [第一次传入0]
 * @param  {[type]}  suffix    [显示节点ID的后缀, 节点ID + '_' + suffix]
 * @return {[type]}            [description]
 */
//HtmlFormat.init(['content'], false, '_code');
// HtmlFormat.init(['content'], true, '_code');
// HtmlFormat.init(['content'], false, '_code', 'html' ,'button#clickBtn');
