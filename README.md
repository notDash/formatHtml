# formatHtml
format html to the text with CR and tab
格式化html代码为带有回车符和制表符的文本

## 例如
    var html = '<div><span>content</span><ul><li><a href="#">link</a></li></ul></div>';
    格式化之后为:
    <div>
		<span>content</span>
		<ul>
			<li>
				<a href="">link</a>
			</li>
		</ul>
	</div>
    在页面中设置pre标签来显示内容即可以格式化的方式来显示
    
## 使用
	<!DOCTYPE html>
	<html lang="en">
	<head>
	<meta charset="UTF-8">
	<title>测试html代码直接格式化显示在页面</title>
	</head>
	<body>
	<div class="content" id="content">
	    <h1>html代码格式化显示</h1>
	    <div class="formatHtml">
		<pre id="">
		    content ........
		</pre>
	    </div>
	</div>
	<div class="formatHtml">
	    <pre id="content_code">
	    </pre>
	</div>

	<script src="js/jquery1.42.min.js"></script>
	<script src="formatHtml.js"></script>
	</body>
	</html>
	
	1. 改插件依赖于jquery，在页面中引入jquery以及formatHtml.js
	2. 在页面底部，body上面编写js代码（或者引入外部js文件）：
	    HtmlFormat.init(['content'], false, '_code');
	3. 页面上要转化的dom节点的id和显示转化后结果的元素id之间的关系
	    srcDomId + '_code' == showDomId;
	    例如：srcDomId  =  id="content" ，  showDomId = content_code
	    <div class="content" id="content">
	    	<h1>html代码格式化显示</h1>
	    	<div class="formatHtml">
		    <pre id="">
		        content ........
		    </pre>
	        </div>
	    </div>
	    <div class="formatHtml">
	        <pre id="content_code">
	        </pre>
	    </div>
	
	
	
