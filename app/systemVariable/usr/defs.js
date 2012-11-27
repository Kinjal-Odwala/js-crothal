ii.Import("fin.cmn.usr.defs");

ii.init.register( function(){
    fin.app = { systemVariable: {}};
    
}, 1);


ii.init.register( function(){
	
	fin.app.systemVariable.systemVariableArgs = {
		id: {type: Number, defaultValue: 0},
		variableName: {type: String, required: false, defaultValue:''},
		variableValue: {type: String, required: false, defaultValue:''},
		active: {type: Boolean, required: false, defaultValue:false}		
	};

}, 2);


ii.Class({
	Name: "fin.app.systemVariable.SystemVariable",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.app.systemVariable.systemVariableArgs);
			$.extend(this, args);
			
		}
	}
});