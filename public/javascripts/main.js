var getAst = function(){
	var editorCode = editor.getValue();
	try {
		return acorn.parse(editorCode);
	} catch (e) {
		return e.message;
	}
};

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

	if(Object.keys(dangerZone).length){
		var message = '';
		for(var key in dangerZone){
			message += key + '(s)';
		}
		console.log('Please do not use ' + message + ' in your code!');
	} else {
		console.log('Good job!');
	}
};

// variable declarations within the for loops?
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

	if(Object.keys(mustHaves).length !== list.length){
		var message = '';
		for(var i = 0; i < list.length; i++){
			if(mustHaves[list[i]] === undefined){
				message += list[i] + '(s)';
			}
		}
		console.log('You are missing ' + message + ' in your code!');
	} else {
		console.log('Good job!');
	}
};


// takes in an array where strings are parents and inner arrays are lists of their children
// {'VariableDeclaration': [], 'ForStatement': ['IfStatement'], 'WhileStatement': ['IfStatement', 'VariableDeclaration']}
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

	console.log(doesContain);

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

var $button = $('.check');
var blackList = ['WhileStatement', 'IfStatement'];
var whiteList = ['ForStatement', 'VariableDeclaration'];
var structure = {'VariableDeclaration': [], 'ForStatement': ['IfStatement'], 'WhileStatement': ['IfStatement', 'VariableDeclaration']};
$button.on('click', function(){
	var ast = getAst();
	if(typeof ast !== 'string'){
		checkBlackList(ast, blackList);
		checkWhiteList(ast, whiteList);
		console.log(checkStructure(ast, structure));
	} else {
		console.log('error: ', ast);
	}
});


// var Syntax = ['Program','Statement','EmptyStatement','ExpressionStatement','IfStatement','LabeledStatement','BreakStatement',
// 'WithStatement','SwitchStatement','ReturnStatement','ThrowStatement','TryStatement','WhileStatement','DoWhileStatement',
// 'ForStatement','ForInStatement','ForInit','DebuggerStatement','FunctionDeclaration','VariableDeclaration','Function',
// 'ScopeBody','Expression','ThisExpression','ArrayExpression','ObjectExpression','FunctionExpression','SequenceExpression',
// 'UnaryExpression','BinaryExpression','ConditionalExpression','NewExpression','MemberExpression','Identifier'];

