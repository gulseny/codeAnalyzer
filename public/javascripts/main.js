// parses the code from the editor and returns either the syntax tree or the error message
var getAst = function(){
	var editorCode = editor.getValue();
	try {
		return acorn.parse(editorCode);
	} catch (e) {
		return e.message;
	}
};

// checks the syntax tree for functionality listed in the blacklist and display results on the screen
var checkBlackList = function(ast, list){
	var actions = {};
	var dangerZone = {};
	for(var i = 0; i < list.length; i++){
		var functionality = list[i];
		actions[functionality] = function(functionality){
			dangerZone[functionality.type] = true;
		};
	}

	acorn.walk.simple(ast, actions);

	// change text color depending on the results
	var $blackList = $('.blackList li');
	$blackList.each(function(i){
		if(dangerZone[$(this).html()] && !$(this).hasClass('shouldNotHave')){
			$(this).addClass('shouldNotHave');
		} else if(!dangerZone[$(this).html()] && $(this).hasClass('shouldNotHave')){
			$(this).removeClass('shouldNotHave');
		}
	});

	console.log('running blacklist');
};

// checks the syntax tree for functionality listed in the whitelist and display results on the screen
var checkWhiteList = function(ast, list){
	var actions = {};
	var mustHaves = {};
	for(var i = 0; i < list.length; i++){
		var functionality = list[i];
		actions[functionality] = function(functionality){
			mustHaves[functionality.type] = true;
		};
	}
	acorn.walk.simple(ast, actions);

	// change text color depending on the results
	var $whiteList = $('.whiteList li');
	$whiteList.each(function(i){
		if(mustHaves[$(this).html()] && !$(this).hasClass('shouldHave')){
			$(this).addClass('shouldHave');
		} else if(!mustHaves[$(this).html()]){
			$(this).removeClass('shouldHave');
		}
	});


	console.log('running whitelist');
};


// takes in an array where strings are parents and inner arrays are lists of their children
// {'FunctionDeclaration': ['ReturnStatement'], 'ForStatement': ['IfStatement']};
var checkStructure = function(ast, structure){
	var actions = {};
	var doesContain = {};
	for(var key in structure){
		doesContain[key] = false;

		actions[key] = function(node){
			doesContain[node.type] = true;

			for (var pointer = 0; pointer < structure[node.type].length; pointer++) {
				var target = structure[node.type][pointer];
				if(typeof doesContain[node.type] === 'boolean'){
					doesContain[node.type] = {};
				}
				doesContain[node.type][target] = false;
				
				var childStructure = {};
				childStructure[target] = [];
				doesContain[node.type][target] = checkStructure(node, childStructure);
			}
		};
	}

	acorn.walk.simple(ast, actions);

	var result = function(obj){
		for(var item in obj){
			if(typeof obj[item] === 'boolean' && !obj[item]){
				return false;
			} else if( typeof obj[item] === 'object'){
				if(!result(obj[item])){
					return false;
				}
			}
		}
		return true;
	};

	return result(doesContain);
};

var runCheckStructure = function(ast, structure){
	var $structure = $('.structure li');
	if(checkStructure(ast, structure) && !$structure.hasClass('shouldHave')){
		$structure.addClass('shouldHave');
	} else if(!checkStructure(ast, structure)){
		$structure.removeClass('shouldHave');
	}
};

// acorn syntax elements
// var Syntax = ['Program','Statement','EmptyStatement','ExpressionStatement','IfStatement','LabeledStatement','BreakStatement',
// 'WithStatement','SwitchStatement','ReturnStatement','ThrowStatement','TryStatement','WhileStatement','DoWhileStatement',
// 'ForStatement','ForInStatement','ForInit','DebuggerStatement','FunctionDeclaration','VariableDeclaration','Function',
// 'ScopeBody','Expression','ThisExpression','ArrayExpression','ObjectExpression','FunctionExpression','SequenceExpression',
// 'UnaryExpression','BinaryExpression','ConditionalExpression','NewExpression','MemberExpression','Identifier'];

// identify tests
var blackList = ['WhileStatement'];
var whiteList = ['ReturnStatement', 'ForStatement', 'IfStatement', 'FunctionDeclaration'];
var structure = {'FunctionDeclaration': ['ReturnStatement'], 'ForStatement': ['IfStatement']};

//populate text area with test information
$blackList = $('.blackList');
for(var j = 0; j < blackList.length; j++){
	$blackList.append('<li>' + blackList[j] + '</li>');
}

$whiteList = $('.whiteList');
for(var j = 0; j < whiteList.length; j++){
	$whiteList.append('<li>' + whiteList[j] +'</li>');
}

// run tests and appends an error message to the messages area if there is a syntax error
var runTests = function(){
	var ast = getAst();
	if(typeof ast !== 'string'){
		$('.messages').find('.error').remove();
		checkBlackList(ast, blackList);
		checkWhiteList(ast, whiteList);
		runCheckStructure(ast, structure);
	} else {
		$('.messages').append('<p class="error shouldNotHave">Oops! Syntax error in your code: ' + ast + '</p>')
	}
};

// run tests when there is no keyup for 3 seconds
var typingTimeout;
var $editor = $('#editor');
$editor.keyup(function(){
	clearTimeout(typingTimeout);
	typingTimeout = setTimeout(function(){
		runTests();
	}, 3000);
});
