ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.hcm.safety.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );

ii.Class({
    Name: "fin.hcm.safety.UserInterface",
    Definition: {
	
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.gateway = ii.ajax.addGateway("hcm", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.validator = new ui.ctl.Input.Validation.Master();
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\HouseCodeSetup\\HouseCodes";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
			
			me.session = new ii.Session(me.cache);

			me.defineFormControls();
			me.configureCommunications();
			me.houseCodeSafetyLoaded();
			
			$(window).bind("resize", me, me.resize );
			$(document).bind("keydown", me, me.controlKeyProcessor);
		},

		authorizationProcess: function fin_hcm_safety_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
			if (me.isAuthorized)
				$("#pageLoading").hide();
			else {
				$("#messageToUser").html("Unauthorized");
				alert("You are not authorized to view this content. Please contact your Administrator.");
				return false;
			}
			
			//Safety
			me.safetyWrite = me.authorizer.isAuthorized(me.authorizePath + '\\Write');
			me.safetyReadOnly = me.authorizer.isAuthorized(me.authorizePath + '\\Read');
			
			me.tabSafetyShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabSafety");
			me.tabSafetyWrite = me.authorizer.isAuthorized(me.authorizePath + "\\TabSafety\\Write");
			me.tabSafetyReadOnly = me.authorizer.isAuthorized(me.authorizePath +"\\TabSafety\\Read");
						
			//ts=tabSafety
			me.tsIncidentFrequencyRateShow = me.isCtrlVisible(me.authorizePath + "\\TabSafety\\IncidentFrequencyRate", me.tabSafetyShow, (me.tabSafetyWrite || me.tabSafetyReadOnly));
			me.tsTRIRShow = me.isCtrlVisible(me.authorizePath + "\\TabSafety\\TRIR", me.tabSafetyShow, (me.tabSafetyWrite || me.tabSafetyReadOnly));
			me.tsLostDaysShow = me.isCtrlVisible(me.authorizePath + "\\TabSafety\\LostDays", me.tabSafetyShow, (me.tabSafetyWrite || me.tabSafetyReadOnly));
			me.tsReportedClaimsShow = me.isCtrlVisible(me.authorizePath + "\\TabSafety\\ReportedClaims", me.tabSafetyShow, (me.tabSafetyWrite || me.tabSafetyReadOnly));
			me.tsNearMissesShow = me.isCtrlVisible(me.authorizePath + "\\TabSafety\\NearMisses", me.tabSafetyShow, (me.tabSafetyWrite || me.tabSafetyReadOnly));
			me.tsOSHARecordableShow = me.isCtrlVisible(me.authorizePath + "\\TabSafety\\OSHARecordable", me.tabSafetyShow, (me.tabSafetyWrite || me.tabSafetyReadOnly));
			
			me.tsIncidentFrequencyRateReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabSafety\\IncidentFrequencyRate\\Read", me.tabSafetyWrite, me.tabSafetyReadOnly);
			me.tsTRIRReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabSafety\\TRIR\\Read", me.tabSafetyWrite, me.tabSafetyReadOnly);
			me.tsLostDaysReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabSafety\\LostDays\\Read", me.tabSafetyWrite, me.tabSafetyReadOnly);
			me.tsReportedClaimsReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabSafety\\ReportedClaims\\Read", me.tabSafetyWrite, me.tabSafetyReadOnly);
			me.tsNearMissesReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabSafety\\NearMisses\\Read", me.tabSafetyWrite, me.tabSafetyReadOnly);
			me.tsOSHARecordableReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabSafety\\OSHARecordable\\Read", me.tabSafetyWrite, me.tabSafetyReadOnly);
			
			me.resetUIElements();
			
			$("#pageLoading").hide();
				
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},	
		
		sessionLoaded: function fin_hcm_safety_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		isCtrlVisible: function fin_hcm_safety_UserInterface_isCtrlVisible() { 
			var args = ii.args(arguments, {
				path: {type: String}, // The path to check to see if it is authorized
				sectionShow: {type: Boolean},
				sectionReadWrite: {type: Boolean}
			});			
			var me = this;
			var ctrlShow = parent.fin.cmn.util.authorization.isAuthorized(me, args.path);
			var ctrlWrite = parent.fin.cmn.util.authorization.isAuthorized(me, args.path + "\\Write");
			var ctrlReadOnly = parent.fin.cmn.util.authorization.isAuthorized(me, args.path + "\\Read");
			
			if (me.safetyWrite || me.safetyReadOnly)
				return true;
			
			if (me.tabSafetyWrite || me.tabSafetyReadOnly)
				return true;

			if (args.sectionReadWrite)
				return true;

			if (args.sectionShow && (ctrlWrite || ctrlReadOnly))
				return true;

			return ctrlShow;
		},

		isCtrlReadOnly: function fin_hcm_safety_UserInterface_isCtrlReadOnly() { 
			var args = ii.args(arguments, {
				path: {type: String}, // The path to check to see if it is authorized
				sectionWrite: {type: Boolean},
				sectionReadOnly: {type: Boolean}
			});			
			var me = this;

			if (args.sectionWrite && !me.tabSafetyReadOnly && !me.safetyReadOnly)
				return false;

			if (me.tabSafetyWrite && !me.safetyReadOnly)
				return false;

			if (me.safetyWrite)
				return false;
			
			if (me.safetyReadOnly) return true;
			if (me.tabSafetyReadOnly) return true;
			if (args.sectionReadOnly) return true;
			
			return me.authorizer.isAuthorized(args.path);
		},
		
		resetUIElements: function fin_hcm_safety_UserInterface_resetUIElements() {
			var me = this;			
			
			me.setControlState("IncidentFrequencyRate", me.tsIncidentFrequencyRateReadOnly, me.tsIncidentFrequencyRateShow);
			me.setControlState("TRIR", me.tsTRIRReadOnly, me.tsTRIRShow);
			me.setControlState("LostDays", me.tsLostDaysReadOnly, me.tsLostDaysShow);
			me.setControlState("ReportedClaims", me.tsReportedClaimsReadOnly, me.tsReportedClaimsShow);
			me.setControlState("NearMisses", me.tsNearMissesReadOnly, me.tsNearMissesShow);
			me.setControlState("OSHARecordable", me.tsOSHARecordableReadOnly, me.tsOSHARecordableShow);
		},
		
		setControlState: function() {
			var args = ii.args(arguments, {
				ctrlName: {type: String},
				ctrlReadOnly: {type: Boolean}, 
				ctrlShow: {type: Boolean, required: false, defaultValue: false}, 
				ctrlType: {type: String, required: false, defaultValue: ""}, //DropList, Date, Text, Radio
				ctrlDiv: {type: String, required: false} //parent Div name for Radio button
			});
			var me = this;

			if (args.ctrlReadOnly && args.ctrlType == "") {
				$("#" + args.ctrlName + "Text").attr("disabled", true);
				$("#" + args.ctrlName + "Action").removeClass("iiInputAction");
			}

			if (!args.ctrlShow && args.ctrlType != "Radio") {
				$("#" + args.ctrlName).hide();
			}			
		},
		
		resize: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
		},
		
		defineFormControls: function() {
			var me = this;

			me.incidentFrequencyRate = new ui.ctl.Input.Text({
		        id: "IncidentFrequencyRate",
		        maxLength: 50,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });

			me.trir = new ui.ctl.Input.Text({
		        id: "TRIR",
		        maxLength: 50,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });

			me.lostDays = new ui.ctl.Input.Text({
		        id: "LostDays",
		        maxLength: 50,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });

			me.reportedClaims = new ui.ctl.Input.Text({
		        id: "ReportedClaims",
		        maxLength: 50,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });

			me.nearMisses = new ui.ctl.Input.Text({
		        id: "NearMisses",
		        maxLength: 50,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });

			me.oshaRecordable = new ui.ctl.Input.Text({
		        id: "OSHARecordable",
		        maxLength: 50,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });

			me.incidentFrequencyRate.text.tabIndex = 1;
			me.trir.text.tabIndex = 2;
			me.lostDays.text.tabIndex = 3;
			me.reportedClaims.text.tabIndex = 4;
			me.nearMisses.text.tabIndex = 5;
			me.oshaRecordable.text.tabIndex = 6;
		},
		
		resizeControls: function() {
			var me = this;

			me.incidentFrequencyRate.resizeText();
			me.trir.resizeText();
			me.lostDays.resizeText();
			me.reportedClaims.resizeText();
			me.nearMisses.resizeText();
			me.oshaRecordable.resizeText();

			me.resize();
		},
		
		configureCommunications: function() {
			var args = ii.args(arguments, {});
			var me = this;	

		},
			
		controlKeyProcessor: function() {
			var args = ii.args(arguments, {
				event: {
					type: Object
				} // The (key) event object
			});
			var event = args.event;
			var me = event.data;
			var processed = false;
			
			if (event.ctrlKey){
				
				switch (event.keyCode) {
					case 83: // Ctrl+S
						parent.fin.hcmMasterUi.actionSaveItem();
						processed = true;
						break;
						
					case 85: // Ctrl+U
						parent.fin.hcmMasterUi.actionUndoItem();
						processed = true;
						break;
				}
			}
			
			if (processed) {
				return false;
			}
		},

		houseCodeSafetyLoaded: function() {
			var me = this;
			
			if (parent.fin.hcmMasterUi == undefined || parent.fin.hcmMasterUi.houseCodeDetails[0] == undefined) return;

			var houseCode = parent.fin.hcmMasterUi.houseCodeDetails[0];

			me.incidentFrequencyRate.setValue(houseCode.incidentFrequencyRate);
			me.trir.setValue(houseCode.trir);
			me.lostDays.setValue(houseCode.lostDays);
			me.reportedClaims.setValue(houseCode.reportedClaims);
			me.nearMisses.setValue(houseCode.nearMisses);
			me.oshaRecordable.setValue(houseCode.oshaRecordable);

			$("#pageLoading").hide();
			me.resizeControls();
		}
	}
});

function main() {

	fin.hcmSafetyUi = new fin.hcm.safety.UserInterface();
	fin.hcmSafetyUi.resize();
}