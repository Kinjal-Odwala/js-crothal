ii.config = {
	
	configVersion: "1.0.0",
	
	appName: "TEAMFIN",
	appDescription: "TeamFinv2. Written and architected by Improvement Interactive, LLC.",
	appVersion: "1.00.000",
	appDotRoot: "fin",
	production: false,

	startupScript: "main",
	minimizeSource: false,
	
	pageLoadingId: "pageLoading",
	
	xmlProvider: globalContext + "/provider.aspx",
	xmlTimeout: 180000
}

ii.config.loader = {
	
	layerRequired: false,
	
	timeout: (location.hostname == "localhost" ? 2500 : 70000),

	/* APPLICATION Roots 
	 * Should always associate with an application, especially for ii names.
	 */
	roots:{
		jQuery: {root: "/jquery", isIiName: false },
		ii: { root: "/ii/framework/core" },
		ui: { root: "/ii/framework/ui" },
		fin: { root: "/" },
		skin: { root: "/skins" }
  	},
	
	versions:{
		"jQuery": {version: "1.6.4", description: "", copyright: ""},
		"ii": {version: ii.config.appVersion, description: "", copyright: ""},
		"ui": {version: ii.config.appVersion, description: "", copyright: ""},
		"fin": {version: ii.config.appVersion, description: "", copyright: ""},
		"gateway": {version: ii.config.appVersion, description: "", copyright: ""},
		"skin": {version: ii.config.appVersion, description: "", copyright: ""}
  	},
	
	waitFor:{
		dom: true,
		body: false,
		session: true,
		styles: true
	}
}
	
ii.config.session = {
	on: true,
	
	server:{
		on: true,
		timeoutOn: true,
		moduleId: "app",
		userConfig: false,
		roles: false,
		skins: true,
		showUnAuthorized: true
	},
	
	cookie:{
		on: false
	}
}
	
ii.config.trace = {
	on: true,

	localLog: {
		maxItems: 100,
		filter: {
	    	standard: 511,
  			custom: /.*/
  		}
	},
	
	serverLog: {
		on: false,
	    url: "logging.ImprovementInteractive.com",
	    updateFrequency: 0,
		stopFrequency: 32,
		filter:	{
  			standard: 480,
	    	custom: /.*/
	    } 			
	}
}
	
ii.config.debug = {
	on: true,
	
	scripts: false,
	styles: false,

	Private:{
		check: true,
		stackTrace:{
			on: true,
			format: "<br>Stack: "
		},
		invokeDebugger: true,
		exception: true
	},
	
	args: {
		check: true,
		stackTrace:{
			on: true,
			format: "<br>Stack: "
		},
		invokeDebugger: true,
		exception: true,
		arrays:{
			check: true,
			allElements: false
		}
	},

	interfaces: {
		check: true,
		stackTrace:{
			on: true,
			format: "<br>Stack: "
		},
		invokeDebugger: true,
		exception: true
	}
}
