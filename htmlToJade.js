
~function (argument) {
	var HtmlFormat = {
		tempResultHtml:'',
		tempResultSuffixArr:[],
		currLevel:0,
		target:'',
		type:'html',
		indentType:'tab', // 缩进类型
		/**
		 * [init description]
		 * @param  {[type]}  doms      [节点id集合]
		 * @param  {[type]}  needRoot  [是否需要根节点]
		 * @param  {[type]}  suffix    [显示节点ID的后缀]
		 * @return {[type]}            [description]
		 */
		switchHtmlJade:function (clickDom, suffix) {
			$(""+clickDom).click(function () {
				var targetId = $(this).parent().children().first().attr("id");
				var changeId = targetId?targetId.substr(0, targetId.indexOf(suffix)):'';
				var value = this.innerHTML;
				$(this).parent().children(""+clickDom).each(function (index, dom) {
					if(dom === event.target) {
						$(this).addClass('actived');
					} else {
						$(dom).removeClass('actived');
					}
				});
				/*if(!value) {
					value = 'html';
					this.innerHTML = 'html';
				}
				if(value == 'html') {
					this.innerHTML = value = 'jade';
				} else if(value == 'jade') {
					this.innerHTML = value = 'html';
				} */
				HtmlFormat.handleSwitch([changeId], false, '_code', value);
			});
		},
		init: function (doms, needRoot, suffix, type, clickDom, indentType) {
			this.switchHtmlJade(clickDom, suffix);
			this.handleSwitch(doms, needRoot, suffix, type);
		},
		handleSwitch: function (doms, needRoot, suffix, type) {
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
			} else if(jqDom.nodeType === 1 || (jqDom.nodeType === 3 && jqDom.nodeValue && jqDom.nodeValue.trim().length > 0)) {
				withSpace += 1;
			} else {
				return;
			}
			/*else if(jqDom.nodeType === 1){
				withSpace += 1;
			} else {
				return;
			}*/
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
				space = this.generateIndent(withSpace);
				if(isRoot && !needRoot) { // 暂存根节点，如果不需要，后续截取掉
					withSpace = -1
				} else if(!(this.type === 'jade')) {
					this.tempResultSuffixArr.unshift(space + '&lt;/' + currNode.tagName.toLowerCase() + '&gt;');
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
						this.tempResultHtml += this.wrapWithFormatL(outerH, false, withSpace) +  '<br>';
					}
					return;
				}
				if(jqDom.nodeType === 3) {
					if(this.type === 'jade') {
						this.tempResultHtml += this.nodeToJade(jqDom, true, withSpace, false);
					} else {
						this.tempResultHtml +=  this.wrapWithFormatL(jqDom.nodeValue.trim(), false, withSpace) + '<br>';
					}
					return;
				}
				return;
			}
		},
		wrapWithFormatL: function (html, withBR, withSpace) {
			// 根据缩进类型生成相应长度的缩进，空格为4个，Tab为一个
			var space = this.generateIndent(withSpace);
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
			var space = '', // 生成的缩进
				content = '', // 生成的jade内容
				attrLen = 0,
				nodeName = '',
				tempAttr,
				tempAttrClasss,
				textContent = '',
				i, j,
				attrObj = {otherAttr:[]}; // 用于存储非id, class之外的属性值
			if(!node) {
				return;
			}	
			if(!hasChild) {
				textContent = node.textContent;
			}
			space = this.generateIndent(withSpace);
			// 如果要转换jade模板，则去获取该节点的attributes
			var attributes = node.attributes;
			if(!attributes) {
				// 如果是文本， 把文本里的回车加之后的空格替换为‘| ’
				content = node.nodeValue.trim().replace(/\n\s*/g, '<br>'+ space +'| ');
				return withBR?space + '| ' + content + '<br>':space +  '| ' + content;;
			}
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
					// 存储其他的属性名和值
					attrObj.otherAttr.push(tempAttr.name.toLowerCase() + '="' + tempAttr.nodeValue + '"');
				}
			}
			// 拼接属性值
			if(attrObj.otherAttr && attrObj.otherAttr.length > 0) {
				content += '(' + attrObj.otherAttr.join(',') + ')';
			}
			// 拼接内容textContent
			if(textContent) {
				content += ' ' + textContent;
			}

			return withBR?space + content + '<br>':space + content;
		},
		generateIndent: function (num) {
			var space = '';
			var result = '';
			// 生成缩进类型
			if(this.indentType === 'tab') {
				space = '	'; 
			} else {
				space = ' ';
				num = 4 * num;
			}
			for(i = 0; i < num; ++i) {
				result += space;
			}
			return result;
		},
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
