var fin = {};
var esm = {};

ii.init.register( function fin_cmn_startup_init(){
	/* @iiDoc {Namespace}
	 * Define the common module namespace.
	 */
	fin.cmn = {};
	
	fin.cmn.status = {

		itemValid: function fin_cmn_status_itemValid() {
			if (parent.fin.appUI != undefined && parent.fin.appUI.modified) {
				if (confirm("The current item was modified and you will lose unsaved data if you navigate from current item. Press OK to continue, or Cancel to remain on the current item.")) {
					parent.fin.appUI.modified = false;
					return true;
				}
				else
					return false;
			}
			else
				return true;
		},
		
		setStatus: function fin_cmn_status_setStatus(status) {
			var args = ii.args(arguments,{
				status: {type: String}
				, message: {type: String, required: false, defaultValue: ""}
			});				
			var me = this;
			var status = args.status;
			var message = args.message;

			me.$itemStatusImage = $("#itemStatusImage");
			me.$itemModifiedImage = $("#itemModifiedImage");
			me.$itemStatusText = $("#itemStatusText");

			if (message == "") {
				if (status == "New")
					message = "New";
				else if (status == "Loading" || status == "Saving" || status == "Exporting" || status == "Importing" || status == "Validating" || status == "Uploading" || status == "Downloading")
					message = status + ", please wait...";
				else if (status == "Saved")
					message = "Data saved successfully.";
				else if (status == "Imported")
					message = "Data imported successfully.";
				else if (status == "Exported")
					message = "Data exported successfully.";
				else if (status == "Locked")
					message = "The current page is Readonly.";
				else if (status == "Error")
					message = "Error while updating the data.";
				else
					message = "Normal";
			}			

			if (status == "Locked")
				me.$itemModifiedImage.addClass("Locked");
			else
				me.$itemModifiedImage.removeClass("Locked");

			if (status == "Edit")
				me.$itemModifiedImage.addClass("Modified");
			else
				me.$itemModifiedImage.removeClass("Modified");

			if (status == "Edit" || status == "Loaded" || status == "Saved" || status == "Imported" || status == "Exported")
				status = "Normal";

			me.$itemStatusImage.attr("class", "itemStatusImage " + status);
			me.$itemStatusText.text(message);
		}
	};

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
	
	ii.Session.dataArgs.roleId = {type: Number, required: false, defaultValue: 0};
	ii.Session.dataArgs.personId = {type: Number, required: false, defaultValue: 0};
    ii.Session.dataArgs.environmentName = {type: String, required: false, defaultValue: ""};
	
	/* @iiDoc {Function}
	 * Provide a confirmation if unsaved work is present when
	 * the user trys to navigate away.
	 */
	window.onbeforeunload = function(event) {
		if (parent.fin.appUI != undefined && parent.fin.appUI.modified) {
			var message = "You will lose unsaved data if you navigate from page now.";
			if (event) {
				event.returnValue = message;
			}
			return message;
		}
	};
});