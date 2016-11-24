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
