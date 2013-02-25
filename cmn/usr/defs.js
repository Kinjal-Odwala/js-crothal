var fin = {};
var esm = {};

ii.init.register( function fin_cmn_startup_init(){
	/* @iiDoc {Namespace}
	 * Define the common module namespace.
	 */
	fin.cmn = {};
	
	fin.cmn.text = {
				
		mask:{
			
			phone: function fin_cmn_text_mask_phone(){ //provided phone number mask (999) 999-9999
				var args = ii.args(arguments,{
					phoneNumber: {type: String}
					, unMask: {type: Boolean, required: false, defaultValue: false}
				});
				
				var stringToMask = ''; 
				var stringMasked = ''; 
	
				var val = args.phoneNumber.split(''); 
	
				for(var i=0; i < val.length; i++){ 
					if(!isNaN(val[i]) && val[i] != " ")
						stringToMask = stringToMask + val[i];
				} 
	
				if(args.unMask) return stringToMask; //unMask phone number while saving.
				
				if (stringToMask.length < 10) return args.phoneNumber;
				if (stringToMask.length > 10) stringToMask = stringToMask.substring(0, 10);
	
				val = stringToMask.split(''); 
	
				for(var i=0; i < val.length; i++){ 
					if(i==0){val[i] = '(' + val[i]} 
					if(i==2){val[i] = val[i] + ') '} 
					if(i==5){val[i] = val[i] + '-'} 
					stringMasked = stringMasked + val[i] 
				} 
	
				return stringMasked; 
			},

			ssn: function fin_cmn_text_mask_ssn(){ //provided SSN mask 999-99-9999
				var args = ii.args(arguments,{
					ssnNumber: {type: String}
					, unMask: {type: Boolean, required: false, defaultValue: false}
				});
				
				var stringToMask = ''; 
				var stringMasked = ''; 
	
				var val = args.ssnNumber.split(''); 
	
				for(var i=0; i < val.length; i++){ 
					if(!isNaN(val[i]) && val[i] != " ")
						stringToMask = stringToMask + val[i];
				} 
	
				if(args.unMask) return stringToMask; //unMask SSN number while saving.
				
				if (stringToMask.length < 9) return args.ssnNumber;
				if (stringToMask.length > 9) stringToMask = stringToMask.substring(0, 9);
	
				val = stringToMask.split(''); 
	
				for(var i=0; i < val.length; i++){ 
					if(i==2){val[i] = val[i] + '-'} 
					if(i==4){val[i] = val[i] + '-'} 
					stringMasked = stringMasked + val[i] 
				} 
	
				return stringMasked; 
			}
		}
	};
}, 1);

ii.init.register( function fin_cmn_startup_init1() {
	/* @iiDoc {Namespace}
	 * Define the application (framing) module namespace.
	 */
	
	// extend the session object for our use!!!
	
	ii.Session.dataArgs.personId = {type: Number, required: false, defaultValue: 0};
    ii.Session.dataArgs.environmentName = {type: String, required: false, defaultValue: ""};

});