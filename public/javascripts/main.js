var parseCode = function(){
	var code = editor.getValue();
	var syntax = esprima.parse(code);
	console.log(JSON.stringify(syntax, null, 2));
};

var $button = $('.check');
$button.on('click', parseCode);