var getTokens = function(){
	var code = editor.getValue();
	var syntax = acorn.parse(code);
	console.log('acorn tree: ', syntax);
	
	acorn.walk.simple(syntax, {
		VariableDeclaration: function(){
			console.log('hi');
		}
	});

	var tokens = [];
	return tokens;
};

var checkNegatives = function(blackList){
	var tokensList = getTokens();
	console.log('tokens: ', tokensList);
	if(!Array.isArray(blackList)){
		console.log('Please pass in an array of keywords!');
	} else {
		var dangerZone = {};
		tokensList.forEach(function(item){
			if(blackList.indexOf(item) !== -1){
				dangerZone[item] = true;
			}
		});
		if(Object.keys(dangerZone).length){
			console.log('Please do not use ' + Object.keys(dangerZone).join(', ') + ' in your code!');
		} else {
			console.log('Good job!');
		}
	}
};

var $button = $('.check');
var blackList = ['while', 'if'];
$button.on('click', function(){
	checkNegatives(blackList);
});

// var Syntax = ['AssignmentExpression','ArrayExpression','BlockStatement','BinaryExpression','BreakStatement',
// 'CallExpression','CatchClause','ConditionalExpression','ContinueStatement','DoWhileStatement','DebuggerStatement',
// 'EmptyStatement','ExpressionStatement','ForStatement','ForInStatement','FunctionDeclaration','FunctionExpression',
// 'Identifier','IfStatement','Literal','LabeledStatement','LogicalExpression','MemberExpression','NewExpression',
// 'ObjectExpression','Program','Property','ReturnStatement','SequenceExpression','SwitchStatement','SwitchCase',
// 'ThisExpression','ThrowStatement','TryStatement','UnaryExpression','UpdateExpression','VariableDeclaration',
// 'VariableDeclarator','WhileStatement','WithStatement'];