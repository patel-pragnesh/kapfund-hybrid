/*
 * 	@ Developed by Nyvra (http://www.nyvra.net)
 * 	@ Last release: 13/10/2011
 */

function Mask() {
	var me = 
	{
		mask: function(_field, _function, _genericParameters) {
			if (_genericParameters)
				_field.value = _function(_field.value, _genericParameters);
			else
				_field.value = _function(_field.value);
		},
		
		generic: function(v, _genericParameters) {
			var _regex = _genericParameters.regex;
			var _syntax = _genericParameters.syntax;
			var _maxValue = _genericParameters.maxValue;
			v = v.replace(/D/g,"");
			v = v.replace(_regex, _syntax);
			
			return (_maxValue != null) ? v.slice(0, _maxValue) : v;
		},
		
		creditcard: function(v) {
			console.log("v1", v, v.length);
			v = v.replace(/D/g, "");
			v = v.replace(/\s+/g, '');
			console.log("v2", v);
			
			if(v.length > 4 && v.length < 9) {
				v = v.substr(0, 4) + " " + v.substr(4);
			} else if(v.length > 8 && v.length < 13) {
				v = v.substr(0,4) + " " + v.substr(4,4) + " " + v.substr(8);
			} else if(v.length > 12) {
				v = v.substr(0,4) + " " + v.substr(4,4) + " " + v.substr(8,4) + " " + v.substr(12);
			}
			
			return v.slice(0,19);
		},
	
		postcode: function(v) {
			v = v.replace(/D/g,"");
			v = v.replace(/^(\d{5})(\d)/,"$1-$2");
			return v.slice(0, 9);
		},
		
		phone: function(v) {
			v = v.replace(/\D/g,"");
			v = v.replace(/^(\d\d\d)(\d)/g,"($1) $2");
			v = v.replace(/(\d{3})(\d{3})/,"$1-$2");
			return v.slice(0, 14);
		}
	};
	
	return me;
}

module.exports = Mask();
