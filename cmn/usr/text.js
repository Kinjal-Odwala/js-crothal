if(!parent.fin.cmn){
	parent.fin.cmn = {};
}

/* @iiDoc {Class}
 * this provides methods to format/masking given string.
 */
parent.fin.cmn.text = {
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
		}
	}
};