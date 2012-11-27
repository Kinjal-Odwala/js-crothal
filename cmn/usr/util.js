if(!parent.fin.cmn){
	parent.fin.cmn = {};
}

/* @iiDoc {Class}
 * this provides utility methods to application.
 */
parent.fin.cmn.util = {
	authorization:{
		isAuthorized: function fin_cmn_util_isAuthorized(){ //this to override ii.framework method
			var args = ii.args(arguments, {
				parent: {type: Object}, 
				path: {type: String}	// The path to check to see if an application module "function" is authorized
			});
			
			var me = this;
			var authorized = false;
			var index;
			var path;
			
			for( index = 0; index < args.parent.authorizer.authorizations.length; index++ ){
				path = args.parent.authorizer.authorizations[index];
				if( path.indexOf(args.path) >= 0 ){// this line differs with the origional version in ii.framework
					authorized = true;
					break;
				}
			}
			
			return authorized;
		}
	}
};