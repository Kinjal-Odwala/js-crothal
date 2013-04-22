ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "fin.cmn.usr.tabsPack" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.cmn.usr.defs" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );
ii.Import( "fin.cmn.usr.houseCodeSearchTemplate" );
ii.Import( "fin.hcm.ePaySite.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.grid", 6 );
ii.Style( "fin.cmn.usr.button", 7 );
ii.Style( "fin.cmn.usr.dropDown", 8 );
ii.Style( "fin.cmn.usr.tabs", 9);

ii.Class({
    Name: "fin.hcm.ePaySite.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
    Definition: {
	
		init: function fin_hcm_ePaySite_UserInterface_init() {
			var args = ii.args(arguments, {});
			var me = this;

			me.jobId = 0;
			me.status = "";
			me.validZipCode = true;
			me.cityNames = [];
			me.status = "";
			me.units = [];
			me.lastSelectedRowIndex = -1;
			me.activeFrameId = 0;
			me.houseCodesTabNeedUpdate = true;
			
			me.gateway = ii.ajax.addGateway("hcm", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\HouseCodeSetup\\EpaySites";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);

			me.defineFormControls();
			me.configureCommunications();

			me.jobState.fetchingData();
			me.ePayGroupType.fetchingData();
			me.stateTypeStore.fetch("userId:[user]", me.stateTypesLoaded, me);
			me.jobTypeStore.fetch("userId:[user]", me.jobTypesLoaded, me);
			me.ePayGroupTypeStore.fetch("userId:[user]", me.ePayGroupTypesLoaded, me);
			me.modified(false);
			
			
			if (!parent.fin.appUI.houseCodeId) parent.fin.appUI.houseCodeId = 0;
			me.houseCodeSearch = new ui.lay.HouseCodeSearch();
			me.houseCodeSearchTemplate = new ui.lay.HouseCodeSearchTemplate();

			if (parent.fin.appUI.houseCodeId == 0) //usually happens on pageLoad			
				me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
			else {
				me.houseCodesLoaded(me, 0);
			}
			
			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);

			$("#TabCollection a").click(function() {
				
				switch(this.id) {
					case "EpaySiteDetails":
						
						me.activeFrameId = 0;
						if (me.status == "")
							me.jobDetailsLoad();

						break;

					case "EpaySiteAssociations":

						me.activeFrameId = 1;
						me.loadHouseCodes();
						me.houseCodesTabNeedUpdate = false;

						break;
				}
			});
			
			$("#container-1").tabs(1);
			$("#container-1").triggerTab(1);
		},	

		authorizationProcess: function fin_hcm_ePaySite_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
			if (!me.isAuthorized) {
				$("#messageToUser").text("Load Failed");
				$("#pageLoading").show();
				return;
			}
					
			$("#pageLoading").hide();

			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded, me);
		},	

		sessionLoaded: function fin_hcm_ePaySite_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function fin_hcm_ePaySite_UserInterface_resize() {
			var args = ii.args(arguments, {});
			var me = fin.hcm.ePaySiteUi;
			
			if ($("#EpayHouseCodeContainer").width() < 1000)	{
				$("#HouseCodeGrid").width(1000);
				$("#AddHouseCodes").width(1000);
			}
				
			else {
				$("#HouseCodeGrid").width($("#EpayHouseCodeContainer").width() - 5);
				$("#AddHouseCodes").width($("#EpayHouseCodeContainer").width() - 5);
			}				
				
			$("#popupEpaySite").height($(window).height() - 191);
			$("#EpayHouseCodeContainer").height($(window).height() - 181);
			me.jobGrid.setHeight($(window).height() - 115);
			me.houseCodeGrid.setHeight($(window).height() - 225);
		},
		
		controlKeyProcessor: function fin_hcm_ePaySite_UserInterface_controlKeyProcessor() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});			
			var event = args.event;
			var me = event.data;
			var processed = false;
			
			if (event.ctrlKey) {
			
				switch (event.keyCode) {
					case 83: // Ctrl+S
						me.actionSaveItem();
						processed = true;
						break;
						
					case 85: // Ctrl+U
						me.actionUndoItem();
						processed = true;
						break;
				}
			}
			
			if (processed) {
				return false;
			}
		},

		defineFormControls: function fin_hcm_ePaySite_UserInterface_defineFormControls() {
			var args = ii.args(arguments, {});
			var me = this;

			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});

			me.actionMenu
				.addAction({
					id: "saveAction",
					brief: "Save (Ctrl+S)", 
					title: "Save the current Epay Site details.",
					actionFunction: function() { me.actionSaveItem(); }
				})
				.addAction({
					id: "newAction", 
					brief: "New Epay Site(Ctrl+N)", 
					title: "Create a new Epay Site.",
					actionFunction: function() { me.actionNewItem(); }
				})
				.addAction({
					id: "cancelAction", 
					brief: "Undo current changes to Epay Site (Ctrl+U)", 
					title: "Undo the changes to Epay Site being edited.",
					actionFunction: function() { me.actionUndoItem(); }
				});

			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem(); },
				hasHotState: true
			});

			me.anchorNew = new ui.ctl.buttons.Sizeable({
				id: "AnchorNew",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;New&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionNewItem(); },
				hasHotState: true
			});

			me.anchorUndo = new ui.ctl.buttons.Sizeable({
				id: "AnchorUndo",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Undo&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUndoItem(); },
				hasHotState: true
			});			

			me.searchInput = new ui.ctl.Input.Text({
				id: "SearchInput",
				title: "To search a specific Epay Site, type-in Epay Site Number or Description and press Enter key/click Search button.",
				maxLength: 50
			});		
		
			me.searchInput.setValidationMaster( me.validator )
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {
					
				if (me.status != "")
					this.valid = true;
				else if(me.searchInput.getValue().length < 3)
					this.setInvalid("Please enter search criteria (minimum 3 characters).");
			});
			
			me.anchorSearch = new ui.ctl.buttons.Sizeable({
				id: "AnchorSearch",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Search&nbsp;&nbsp;</span>",
				clickFunction: function() { me.loadSearchResults(); },
				hasHotState: true
			});
			
			me.jobNumber = new ui.ctl.Input.Text({
				id: "JobNumber",
				maxLength: 8,
				changeFunction: function() { me.modified(); }
			});

			me.jobNumber.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required );

			me.jobDescription = new ui.ctl.Input.Text({
				id: "JobDescription",
				maxLength: 40,
				changeFunction: function() { me.modified(); }
			});

			me.jobDescription.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required );

			me.jobContact = new ui.ctl.Input.Text({
				id: "JobContact",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
			});

			me.jobAddress1 = new ui.ctl.Input.Text({
				id: "JobAddress1",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
			});

			me.jobAddress2 = new ui.ctl.Input.Text({
				id: "JobAddress2",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
			});
			
			me.jobPostalCode = new ui.ctl.Input.Text({
				id: "JobPostalCode",
				maxLength: 10,
				changeFunction: function() { 
					if (ui.cmn.text.validate.postalCode(me.jobPostalCode.getValue()))
						me.loadZipCodeTypes(); me.modified();
				}
			});
			
			me.jobPostalCode.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.jobPostalCode.getValue();
					
					if (enteredText == "") return;

					if (ui.cmn.text.validate.postalCode(enteredText) == false)
						this.setInvalid("Please enter valid Postal Code. Example: 99999 or 99999-9999");
				});
			
			me.geoCode = new ui.ctl.Input.DropDown.Filtered({
		        id: "JobGEOCode",
				formatFunction: function( type ) { return type.geoCode; },
				changeFunction: function() { me.geoCodeChanged(); },
		        required: false,
				changeFunction: function() { me.modified(); }
		    });
			
			me.geoCode.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

					if (me.geoCode.lastBlurValue != "" && me.geoCode.indexSelected == -1)
						this.setInvalid("Please select the correct GEO Code.");
				});

			me.jobCity = new ui.ctl.Input.DropDown.Filtered({
		        id: "JobCity",
				formatFunction: function( type ) { return type.city; },
		        required: false,
				changeFunction: function() { me.modified(); }
		    });
			
			me.jobCity.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.validZipCode && me.jobCity.indexSelected == -1)
						this.setInvalid("Please select the correct City.");
					else if (me.geoCode.lastBlurValue != "" && me.geoCode.indexSelected != -1) {
						var cityName = "";

						for (var index = 0; index < me.zipCodeTypes.length; index++) {
							if (me.zipCodeTypes[index].geoCode == me.geoCode.lastBlurValue) {
								cityName = me.zipCodeTypes[index].city;
								break;
							}
						}

						if (me.jobCity.lastBlurValue.toUpperCase() != cityName.toUpperCase())
							this.setInvalid("Please select the correct City [" + cityName + "].");
					}						
				});

			me.jobState = new ui.ctl.Input.DropDown.Filtered({
				id: "JobState",
				formatFunction: function(type) { return type.name; },
				changeFunction: function() { me.modified(); }
			});
			
			me.jobState.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {
					
					if ((this.focused || this.touched) && me.jobState.indexSelected == -1)
						this.setInvalid("Please select the correct State.");
					else if (ui.cmn.text.validate.postalCode(me.jobPostalCode.getValue())) {
						var found = false;
									
						for (var index = 0; index < me.zipCodeTypes.length; index++) {
							if (me.zipCodeTypes[index].stateType == me.stateTypes[me.jobState.indexSelected].id) {
								found = true;
								break;
							}
						}

						if (!found && me.zipCodeTypes.length > 0) {
							var stateName = "";
							var index = ii.ajax.util.findIndexById(me.zipCodeTypes[0].stateType.toString(), me.stateTypes);
							
							if (index != undefined)
								stateName = me.stateTypes[index].name;
							this.setInvalid("Please select the correct State [" + stateName + "].");
						}							
					}
			});
			
			me.ePayGroupType = new ui.ctl.Input.DropDown.Filtered({
		        id: "EPayGroupType" ,
				formatFunction: function( type ){ return type.name; },
		        required : false,
				changeFunction: function() { me.modified(); }
		    });	
			
			me.jobActive = new ui.ctl.Input.Check({
				id: "JobActive",
				changeFunction: function() { me.modified(); }
			});
			
			me.jobGrid = new ui.ctl.Grid({
				id: "Job",
				appendToId: "divForm",
				selectFunction: function(index) { me.itemSelect(index);	},
				validationFunction: function() { return parent.fin.cmn.status.itemValid(); }
			});

			me.jobGrid.addColumn("brief", "brief", "Number", "Epay Number", 70);
			me.jobGrid.addColumn("description", "description", "Description", "Epay Description", null);
			me.jobGrid.addColumn("active", "active", "Active", "Active", 60);
			me.jobGrid.capColumns();
			
			me.houseCodeGrid = new ui.ctl.Grid({
				id: "HouseCodeGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function(index) { me.houseCodeGridSelect(index); }
			});
			
			me.houseCodeTitle = new ui.ctl.Input.Text({
		        id: "HouseCodeTitle",
				appendToId: "HouseCodeGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });

			me.houseCodeLanguage1 = new ui.ctl.Input.Text({
			    id: "HouseCodeLanguage1",
				appendToId: "HouseCodeGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });
			
			me.houseCodeLanguage2 = new ui.ctl.Input.Text({
		        id: "HouseCodeLanguage2",
				appendToId: "HouseCodeGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });
			
			me.houseCodeLanguage3 = new ui.ctl.Input.Text({
		        id: "HouseCodeLanguage3",
				appendToId: "HouseCodeGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });
			
			me.houseCodeActive = new ui.ctl.Input.Check({
		        id: "HouseCodeActive" ,
		        className: "iiInputCheck",
				appendToId: "HouseCodeGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });
			
			me.defaultHouseCode = new ui.ctl.Input.Check({
		        id: "DefaultHouseCode" ,
		        className: "iiInputCheck",
				appendToId: "HouseCodeGridControlHolder"
		    });
			
			me.houseCodeGrid.addColumn("houseCodeTitle", "houseCodeTitle", "House Code", "House Code", null, null, me.houseCodeTitle);
			me.houseCodeGrid.addColumn("language1", "language1", "Language 1", "Language 1", 170, null, me.houseCodeLanguage1);
			me.houseCodeGrid.addColumn("language2", "language2", "Language 2", "Language 2", 170, null, me.houseCodeLanguage2);
			me.houseCodeGrid.addColumn("language3", "language3", "Language 3", "Language 3", 170, null, me.houseCodeLanguage3);
			me.houseCodeGrid.addColumn("defaultHouseCode", "", "Default House Code", "Default House Code", 160, function(data) {
				var index = me.houseCodeGrid.rows.length - 1;				
	            return "<center><input type=\"radio\" name=\"defaultHouseCode\" id=\"defaultHouseCode" + index + "\" class=\"iiInputCheck\"" + (data.defaultHouseCode == 1 ? 'checked' : '') + " onclick=\"fin.hcm.ePaySiteUi.actionClickItem(this," + index + ");\" onchange=\"parent.fin.appUI.modified = true;\" /></center>";
            });	
			me.houseCodeGrid.addColumn("active", "active", "Active", "Active", 60, null, me.houseCodeActive);			
			
			me.houseCodeGrid.capColumns();
			me.houseCodeGrid.setHeight(250);
			me.houseCodeTitle.text.readOnly = true;
			
			me.houseCodePopupGrid = new ui.ctl.Grid({
				id: "HouseCodePopupGrid",
				appendToId: "divForm"
			});
			
			me.popupTitle = new ui.ctl.Input.Text({
		        id: "PopupTitle",
				appendToId: "HouseCodePopupGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });
			
			me.popupLanguage1 = new ui.ctl.Input.Text({
		        id: "PopupLanguage1",
				appendToId: "HouseCodePopupGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });

			me.popupLanguage2 = new ui.ctl.Input.Text({
		        id: "PopupLanguage2",
				appendToId: "HouseCodePopupGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });
			
			me.popupLanguage3 = new ui.ctl.Input.Text({
		        id: "PopupLanguage3",
				appendToId: "HouseCodePopupGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });
			
			me.houseCodePopupGrid.addColumn("assigned", "assigned", "", "Checked means associated to the Epay Site", 30, function() { 
				var rowNumber = me.houseCodePopupGrid.rows.length - 1;
                return "<input type=\"checkbox\" id=\"assignInputCheck" + rowNumber + "\" class=\"iiInputCheck\"" + (me.units[rowNumber].assigned == true ? checked='checked' : '') + " onchange=\"parent.fin.appUI.modified = true;\"/>";				
            });
			me.houseCodePopupGrid.addColumn("name", "name", "House Code", "House Code", null, null, me.popupTitle);
			me.houseCodePopupGrid.addColumn("language1", "language1", "Language 1", "Language 1", 200, null, me.popupLanguage1);
			me.houseCodePopupGrid.addColumn("language2", "language2", "Language 2", "Language 2", 200, null, me.popupLanguage2);
			me.houseCodePopupGrid.addColumn("language3", "language3", "Language 3", "Language 3", 200, null, me.popupLanguage3);
			me.houseCodePopupGrid.capColumns();
			me.houseCodePopupGrid.setHeight(250);
			
			me.popupTitle.text.readOnly = true;
			
			me.anchorOk = new ui.ctl.buttons.Sizeable({
				id: "AnchorOk",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionOkItem(); },
				hasHotState: true
			});	
			
			me.anchorCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCancelItem(); },
				hasHotState: true
			});
			
			$("#SearchInputText").bind("keydown", me, me.actionSearchItem);
			$("#imgAddHouseCodes").bind("click", function() { me.addHouseCodes(); });
		},

		configureCommunications: function fin_hcm_ePaySite_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.hcm.ePaySite.HirNode,
				itemConstructorArgs: fin.hcm.ePaySite.hirNodeArgs,
				injectionArray: me.hirNodes
			});

			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.hcm.ePaySite.HouseCode,
				itemConstructorArgs: fin.hcm.ePaySite.houseCodeArgs,
				injectionArray: me.houseCodes			
			});
			
			me.stateTypes = [];
			me.stateTypeStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.hcm.ePaySite.StateType,
				itemConstructorArgs: fin.hcm.ePaySite.stateTypeArgs,
				injectionArray: me.stateTypes	
			});
			
			me.jobTypes = [];
			me.jobTypeStore = me.cache.register({
				storeId: "jobTypes",
				itemConstructor: fin.hcm.ePaySite.JobType,
				itemConstructorArgs: fin.hcm.ePaySite.jobTypeArgs,
				injectionArray: me.jobTypes	
			});
			
			me.ePayGroupTypes = [];
			me.ePayGroupTypeStore = me.cache.register({
				storeId: "ePayGroupTypes",
				itemConstructor: fin.hcm.ePaySite.EPayGroupType,
				itemConstructorArgs: fin.hcm.ePaySite.ePayGroupTypeArgs,
				injectionArray: me.ePayGroupTypes	
			});

			me.zipCodeTypes = [];
			me.zipCodeTypeStore = me.cache.register({
				storeId: "zipCodeTypes",
				itemConstructor: fin.hcm.ePaySite.ZipCodeType,
				itemConstructorArgs: fin.hcm.ePaySite.zipCodeTypeArgs,
				injectionArray: me.zipCodeTypes
			});

			me.jobs = [];
			me.jobStore = me.cache.register({
				storeId: "jobs",
				itemConstructor: fin.hcm.ePaySite.Job,
				itemConstructorArgs: fin.hcm.ePaySite.jobArgs,
				injectionArray: me.jobs,
				lookupSpec: {jobType: me.jobTypes}
			});

			me.houseCodeJobs = [];
			me.houseCodeJobStore = me.cache.register({
				storeId: "houseCodeJobs",
				itemConstructor: fin.hcm.ePaySite.HouseCodeJob,
				itemConstructorArgs: fin.hcm.ePaySite.houseCodeJobArgs,
				injectionArray: me.houseCodeJobs
			});
		},
		
		modified: function fin_cmn_status_modified() {
			var args = ii.args(arguments, {
				modified: {type: Boolean, required: false, defaultValue: true}
			});
		
			parent.fin.appUI.modified = args.modified;
		},
		
		resizeControls: function() {
			var me = this;

			me.jobNumber.resizeText();
			me.jobDescription.resizeText();
			me.jobContact.resizeText();
			me.jobAddress1.resizeText();
			me.jobAddress2.resizeText();
			me.jobPostalCode.resizeText();
			me.geoCode.resizeText();
			me.jobCity.resizeText();
			me.jobState.resizeText();
			me.ePayGroupType.resizeText();
		},

		stateTypesLoaded: function fin_hcm_ePaySite_UserInterface_stateTypesLoaded(me, activeId) {

			ii.trace("State Types Loaded", ii.traceTypes.information, "Info");

			me.jobState.setData(me.stateTypes);
		},
		
		jobTypesLoaded: function fin_hcm_ePaySite_UserInterface_jobTypesLoaded(me, activeId) {

			ii.trace("Job Types Loaded", ii.traceTypes.information, "Info");
		},
		
		ePayGroupTypesLoaded: function(me, activeId) {
			
			me.ePayGroupTypes.unshift(new fin.hcm.ePaySite.EPayGroupType({ id: 0, name: "None"}));
			me.ePayGroupType.setData(me.ePayGroupTypes);
		},
		
		houseCodesLoaded: function(me, activeId) { // House Codes
			ii.trace("HouseCodesLoaded", ii.traceTypes.information, "Startup");
			
			if (parent.fin.appUI.houseCodeId == 0) {
				if (me.houseCodes.length <= 0) {				
					return me.houseCodeSearchError();
				}
				
				me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
			}

			me.houseCodeGlobalParametersUpdate(false);
		},
		
		actionSearchItem: function fin_hcm_ePaySite_UserInterface_actionSearchItem() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});			
			var event = args.event;
			var me = event.data;

			if (event.keyCode == 13) {
				me.loadSearchResults();
			}
		},
		
		loadSearchResults: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
			
			if (($("#SearchByEPaySite")[0].checked) || ($("#SearchByHouseCode")[0].checked)) {
				
				if ($("#SearchByEPaySite")[0].checked && me.searchInput.getValue().length < 3) {
					me.searchInput.setInvalid("Please enter search criteria (minimum 3 characters).");
					return false;
				}			
				else {
					me.searchInput.valid = true;
					me.searchInput.updateStatus();
				}
				
				$("#messageToUser").text("Loading");
				$("#pageLoading").show();
				
				me.houseCodeGrid.body.deselectAll();
				me.houseCodeGrid.setData([]);
				
				me.jobGrid.body.deselectAll();
				me.jobGrid.setData([]);
				
				if($("#SearchByEPaySite")[0].checked)
					me.jobStore.fetch("userId:[user],jobType:4,title:" + me.searchInput.getValue(), me.jobsLoaded, me);
				else if($("#SearchByHouseCode")[0].checked)
					me.jobStore.fetch("userId:[user],jobType:4,houseCodeId:" + parent.fin.appUI.houseCodeId , me.jobsLoaded, me);
			}			
		},	
		
		jobsLoaded: function fin_hcm_ePaySite_UserInterface_jobsLoaded(me, activeId) {
			
			me.lastSelectedRowIndex = -1;
			me.resetControls();		
			me.jobGrid.setData(me.jobs);
			
			$("#pageLoading").hide();
		},

		itemSelect: function fin_hcm_ePaySite_UserInterface_itemSelect() {
			var args = ii.args(arguments, {index: { type: Number }});
			var me = this;	
			var index = args.index;

			me.status = "";
			me.jobId = me.jobs[index].id;
			me.lastSelectedRowIndex = index;			
			me.houseCodesTabNeedUpdate = true;
			me.jobDetailsLoad();

			if (me.activeFrameId == 1)				
				me.loadHouseCodes();
		},
		
		jobDetailsLoad: function fin_hcm_ePaySite_UserInterface_jobDetailsLoad() {
			var me = this;
			var item = me.jobs[me.lastSelectedRowIndex];	

			if (item == undefined) return;

			me.jobNumber.setValue(item.brief);
			me.jobDescription.setValue(item.description);
			me.jobContact.setValue(item.contact);
			me.jobAddress1.setValue(item.address1);
			me.jobAddress2.setValue(item.address2);
			me.jobPostalCode.setValue(item.postalCode);
			me.loadZipCodeTypes();

			var index = ii.ajax.util.findIndexById(item.appStateTypeId.toString(), me.stateTypes);
			if (index  != undefined)
				me.jobState.select(index, me.jobState.focused);
			else
				me.jobState.reset();
				
			index = ii.ajax.util.findIndexById(item.ePayGroupType.toString(), me.ePayGroupTypes);
			if (index  != undefined)
				me.ePayGroupType.select(index, me.ePayGroupType.focused);
			else
				me.ePayGroupType.reset();

			me.jobActive.setValue(item.active.toString());

			setTimeout(function() { 
				me.resizeControls();
			}, 100);
		},
		
		loadZipCodeTypes: function() {
			var me = this;

			// remove any unwanted characters
	    	var zipCode = me.jobPostalCode.getValue().replace(/[^0-9]/g, "");
			zipCode = zipCode.substring(0, 5);
			me.jobCity.fetchingData();
			if (!me.validZipCode)
				me.zipCodeTypeStore.reset();
			me.zipCodeTypeStore.fetch("userId:[user],zipCode:" + zipCode, me.zipCodeTypesLoaded, me);
		},

		zipCodeTypesLoaded: function(me, activeId) {
			var cityNamesTemp = [];
			var index = 0;

			for (index = 0; index < me.zipCodeTypes.length; index++) {
				if ($.inArray(me.zipCodeTypes[index].city, cityNamesTemp) == -1)
					cityNamesTemp.push(me.zipCodeTypes[index].city);
			}

			cityNamesTemp.sort();
			me.cityNames = [];

			for (index = 0; index < cityNamesTemp.length; index++) {
				me.cityNames.push(new fin.hcm.ePaySite.CityName({ id: index + 1, city: cityNamesTemp[index] }));
			}

			me.jobCity.reset();
			me.geoCode.reset();
			me.jobState.reset();
			me.jobCity.setData(me.cityNames);
			me.geoCode.setData(me.zipCodeTypes);

			if (me.jobGrid.activeRowIndex >= 0) {
				for (index = 0; index < me.zipCodeTypes.length; index++) {
					if (me.zipCodeTypes[index].geoCode == me.jobs[me.lastSelectedRowIndex].geoCode) {
						me.geoCode.select(index, me.geoCode.focused);
						break;
					}
				}

				for (index = 0; index < me.cityNames.length; index++) {
					if (me.cityNames[index].city.toUpperCase() == me.jobs[me.lastSelectedRowIndex].city.toUpperCase()) {
						me.jobCity.select(index, me.jobCity.focused);
						break;
					}
				}
			}

			if (me.zipCodeTypes.length == 0) {
				me.validZipCode = false;
				
				if (me.jobGrid.activeRowIndex >= 0) {
					me.jobCity.setValue(me.jobs[me.lastSelectedRowIndex].city);
					index = ii.ajax.util.findIndexById(me.jobs[me.lastSelectedRowIndex].appStateTypeId.toString(), me.stateTypes);
					if (index != undefined)
						me.jobState.select(index, me.jobState.focused);
				}
			}
			else {
				me.validZipCode = true;
				index = ii.ajax.util.findIndexById(me.zipCodeTypes[0].stateType.toString(), me.stateTypes);

				if (index != undefined)
					me.jobState.select(index, me.jobState.focused);
				else
					me.jobState.reset();
			}
		},

		geoCodeChanged: function() {
			var me = this;
			var cityName = "";
			
			for (var index = 0; index < me.zipCodeTypes.length; index++) {
				if (me.zipCodeTypes[index].geoCode == me.geoCode.lastBlurValue) {
					cityName = me.zipCodeTypes[index].city;
					break;
				}
			}
			
			for (var index = 0; index < me.cityNames.length; index++) {
				if (me.cityNames[index].city.toUpperCase() == cityName.toUpperCase()) {
					me.jobCity.select(index, me.jobCity.focused);
					break;
				}
			}
		},

		loadHouseCodes: function fin_hcm_ePaySite_UserInterface_loadHouseCodes() {
		    var me = this;

			if (me.jobs[me.lastSelectedRowIndex] == undefined) return;

			if (me.houseCodesTabNeedUpdate) {
				var index = me.houseCodeGrid.activeRowIndex;
				if (index >= 0)				
		   			me.houseCodeGrid.body.deselect(index);

				if (me.jobId == 0) {
					me.houseCodeGrid.setData([]);
				}
				else {
					$("#houseCodesLoading").show();
					me.houseCodesTabNeedUpdate = false;
					me.houseCodeJobStore.reset();
					me.houseCodeJobStore.fetch("userId:[user],jobId:" + me.jobId, me.houseCodeJobsLoaded, me);
				}
			}
		},

		houseCodeJobsLoaded: function fin_hcm_ePaySite_UserInterface_houseCodeJobsLoaded(me, activeId) {

			me.houseCodeGrid.setData(me.houseCodeJobs);
			me.houseCodeGrid.resize();
			$("#houseCodesLoading").hide();
		},

		addHouseCodes: function() {
			var me = this;

			if (me.jobGrid.activeRowIndex == -1)
				return;

			loadPopup();

			$("#houseCodeTemplateText").val("");
			$("#popupContact").show();

			me.units = [];
			me.houseCodePopupGrid.setData(me.units);
			me.houseCodePopupGrid.setHeight($(window).height() - 200);
		},

		houseCodeTemplateChanged: function() {
			var args = ii.args(arguments,{});
			var me = this;		

			me.units.push(new fin.hcm.ePaySite.Unit( 
				me.houseCodeSearchTemplate.houseCodeIdTemplate
				, me.houseCodeSearchTemplate.houseCodeTitleTemplate
				, me.houseCodeSearchTemplate.hirNodeTemplate
				));

			me.houseCodePopupGrid.setData(me.units);
		},
		
		houseCodeGridSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number} 
			});			
			var me = this;
			var index = args.index;

			if (me.houseCodeJobs[index])
				me.houseCodeJobs[index].modified = true;
		},

		resetControls: function() {
			var me = this;
			
			me.validator.reset();
			me.jobNumber.setValue("");
			me.jobDescription.setValue("");
			me.jobContact.setValue("");
			me.jobAddress1.setValue("");
			me.jobAddress2.setValue("");
			me.jobCity.reset();
			me.jobState.reset();
			me.jobPostalCode.setValue("");
			me.geoCode.reset();
			me.ePayGroupType.reset();
			me.jobActive.setValue("true");
		},
		
		resetGrids: function() {
			var me = this;
					
			me.jobGrid.body.deselectAll();
			me.houseCodeGrid.body.deselectAll();
			me.houseCodeJobStore.reset();
			me.houseCodeGrid.setData([]);
			me.houseCodesTabNeedUpdate = true;
		},
		
		actionClickItem: function fin_hcm_ePaySite_UserInterface_actionClickItem(object, index) {
			var me = this;

			for (var iIndex = 0; iIndex < me.houseCodeJobs.length; iIndex++) {
				if (me.houseCodeJobs[iIndex].defaultHouseCode && index != iIndex) {
					me.houseCodeJobs[iIndex].defaultHouseCode = false;
					me.houseCodeJobs[iIndex].modified = true;
					break;
				}
			}

			me.houseCodeJobs[index].defaultHouseCode = true;
		},
		
		actionOkItem: function() {
			var me = this;
			var xml = "";
			var item = [];
			
			if (me.houseCodePopupGrid.activeRowIndex >= 0)		
				me.houseCodePopupGrid.body.deselect(me.houseCodePopupGrid.activeRowIndex);
					
			for (var index = 0; index < me.units.length; index++) {
				if ($("#assignInputCheck" + index)[0].checked) {
					xml += '<houseCodeJob';
					xml += ' id="0"';
					xml += ' jobId="' + me.jobId + '"';
					xml += ' houseCodeId="' + me.units[index].id + '"';
					xml += ' hirNode="' + me.units[index].hirNode + '"';
					xml += ' language1="' + me.units[index].language1 + '"';
					xml += ' language2="' + me.units[index].language2 + '"';
					xml += ' language3="' + me.units[index].language3 + '"';
					xml += ' defaultHouseCode="false"';
					xml += ' active="true"';
					xml += '/>';
				}											
			};

			if (xml != "")
				me.status = "addHouseCodes";
			else {
				alert("Please select at least one House Code.");
				return;
			}

			disablePopup();
			me.actionSave(item, xml);
		},
		
		actionCancelItem: function() {
			var me = this;
			var index = -1;	
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			index = me.houseCodeGrid.activeRowIndex;
			if (index >= 0)				
	   			me.houseCodeGrid.body.deselect(index);
			
			disablePopup();
		},

		actionNewItem: function fin_hcm_ePaySite_UserInterface_actionNewItem() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			$("#container-1").triggerTab(1);

			me.status = "new";
			me.jobId = 0;
			me.resetControls();
			me.resetGrids();
		},

		actionUndoItem: function fin_hcm_ePaySite_UserInterface_actionUndoItem() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			me.status = "";			
			me.resetGrids();
			
			if (me.activeFrameId == 0)
				me.jobDetailsLoad();
			else if (me.activeFrameId == 1)				
				me.loadHouseCodes();

			if (me.lastSelectedRowIndex >= 0)
				me.jobGrid.body.select(me.lastSelectedRowIndex);
			else
				me.resetControls();
		},

		actionSaveItem: function fin_hcm_ePaySite_UserInterface_actionSaveItem() {
			var args = ii.args(arguments,{
				flag: {type: String, required: false, defaultValue: ""}
			});
			var me = this;
			var item;
			var xml = "";

			if (me.status == "" && me.lastSelectedRowIndex == -1)
				me.status = "new";

			me.validator.forceBlur();
			me.houseCodeGrid.body.deselectAll();

			// Check to see if the data entered is valid
		    if (!me.validator.queryValidity(true)) {
				alert("In order to save, the errors on the page must be corrected.");
				return false;
			}

			item = new fin.hcm.ePaySite.Job({
				id: me.jobId,
				brief: me.jobNumber.getValue(),
				title: me.jobDescription.getValue(),
				description: me.jobDescription.getValue(),
				contact: me.jobContact.getValue(),
				address1: me.jobAddress1.getValue(),
				address2: me.jobAddress2.getValue(),
				city: me.jobCity.lastBlurValue,
				appStateTypeId: me.jobState.indexSelected != -1 ? me.stateTypes[me.jobState.indexSelected].id : 0,
				ePayGroupType: me.ePayGroupType.indexSelected != -1 ? me.ePayGroupTypes[me.ePayGroupType.indexSelected].id : 0,
				postalCode: me.jobPostalCode.getValue(),
				geoCode: me.geoCode.lastBlurValue,
				jobType: 4,
				taxId: "",
				active: me.jobActive.getValue(),
				overrideSiteTax: false
			});

			xml = me.saveXmlBuild(item);

			var itemHouseCode = [];
			var houseCodeData;

			for (var index = 0; index < me.houseCodeJobs.length; index++) {

				if (me.houseCodeJobs[index].modified == false) continue;

				houseCodeData = new fin.hcm.ePaySite.HouseCodeJob(									
					me.houseCodeGrid.data[index].id
					, me.houseCodeGrid.data[index].houseCodeId
					, me.houseCodeGrid.data[index].hirNode
					, me.houseCodeGrid.data[index].houseCodeTitle
					, me.houseCodeGrid.data[index].language1
					, me.houseCodeGrid.data[index].language2
					, me.houseCodeGrid.data[index].language3
					, $("#defaultHouseCode" + index)[0].checked
					, me.houseCodeGrid.data[index].active
					, me.houseCodeGrid.data[index].modified		
				);

				me.houseCodeJobs[index].modified = true;
				itemHouseCode.push(houseCodeData);							
			};	

			xml += me.saveXmlBuildHouseCode(itemHouseCode);
			me.actionSave(item, xml);
		},
		
		saveXmlBuild: function fin_hcm_ePaySite_UserInterface_saveXmlBuild() {
			var args = ii.args(arguments, {
				item: {type: fin.hcm.ePaySite.Job}
			});
			var me = this;
			var item = args.item;
			var xml = "";

			xml += '<job';
			xml += ' id="' + item.id + '"';
			xml += ' brief="' + ui.cmn.text.xml.encode(item.brief) + '"';
			xml += ' title="' + ui.cmn.text.xml.encode(item.description) + '"';
			xml += ' description="' + ui.cmn.text.xml.encode(item.description) + '"';
			xml += ' contact="' + ui.cmn.text.xml.encode(item.contact) + '"';
			xml += ' address1="' + ui.cmn.text.xml.encode(item.address1) + '"';
			xml += ' address2="' + ui.cmn.text.xml.encode(item.address2) + '"';
			xml += ' city="' + ui.cmn.text.xml.encode(item.city) + '"'; 
			xml += ' appStateTypeId="' + item.appStateTypeId + '"'; 
			xml += ' ePayGroupType="' + item.ePayGroupType + '"'; 
			xml += ' postalCode="' + ui.cmn.text.xml.encode(item.postalCode) + '"';
			xml += ' geoCode="' + item.geoCode + '"';
			xml += ' jobType="' + item.jobType + '"'; 
			xml += ' taxId="' + item.taxId + '"'; 			
			xml += ' active="' + item.active + '"';
			xml += ' overrideSiteTax="' + item.overrideSiteTax + '"';
			xml += ' clone="false"';
			xml += ' ePaySite="true"';
			xml += ' />';

			return xml;
		},
		
		saveXmlBuildHouseCode: function() {
			var args = ii.args(arguments,{
				item: {type: fin.hcm.ePaySite.HouseCodeJob}
			});
			var me = this;
			var item = args.item;
			var xml = "";
			var index = 0;

			for (index in item) {
			
				xml += '<houseCodeJob';
				xml += ' id="' + (me.status == "new" ? 0 : item[index].id ) + '"';
				xml += ' jobId="' + me.jobs[me.lastSelectedRowIndex].id + '"';
				xml += ' houseCodeId="' + item[index].houseCodeId + '"';
				xml += ' hirNode="' + item[index].hirNode + '"';
				xml += ' language1="' + item[index].language1 + '"';
				xml += ' language2="' + item[index].language2 + '"';
				xml += ' language3="' + item[index].language3 + '"';
				xml += ' defaultHouseCode="' + item[index].defaultHouseCode + '"';
				xml += ' active="' + item[index].active + '"';
				xml += '/>';
			}
	
			return xml;			
		},

		actionSave: function() {
			var args = ii.args(arguments,{
				item: {type: fin.hcm.ePaySite.HouseCodeJob},
				xml: {type: String}
			});
			var me = this;
			var item = args.item;
			var xml = args.xml;

			if (xml == "")
				return;
			
			$("#messageToUser").text("Saving");
			$("#pageLoading").show();
			
			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponse,
				referenceData: {me: me, item: item}
			});			
					
			return true;			
		},
		
		/* @iiDoc {Method}
		 * Handles the server's response to a save transaction.
		 */
		saveResponse: function fin_hcm_ePaySite_UserInterface_saveResponse() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},	
				xmlNode: {type: "XmlNode:transaction"}							
			});		
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var status = $(args.xmlNode).attr("status");

			if (status == "success") {
				
				me.modified(false);
				if (me.status == "addHouseCodes") {
					me.houseCodesTabNeedUpdate = true;
					me.loadHouseCodes();
				}
				else {
					$(args.xmlNode).find("*").each(function() {

						switch (this.tagName) {
							case "job":

								if (me.status == "new") {
									ii.trace("New Epay Site Added", ii.traceTypes.information, "Info");
									me.jobId = parseInt($(this).attr("id"), 10);
									item.id = me.jobId;
									me.jobs.push(item);
									me.lastSelectedRowIndex = me.jobs.length - 1;
									me.jobGrid.setData(me.jobs);
									me.jobGrid.body.select(me.lastSelectedRowIndex);
								}
								else {
									me.jobs[me.lastSelectedRowIndex] = item;
									me.jobGrid.body.renderRow(me.lastSelectedRowIndex, me.lastSelectedRowIndex);
								}

								break;

							case "houseCodeJob":
					
								var id = parseInt($(this).attr("id"), 10);
									
								for (var index = 0; index < me.houseCodeGrid.data.length; index++) {
									if (me.houseCodeGrid.data[index].modified) {
										if (me.houseCodeGrid.data[index].id <= 0)
											me.houseCodeGrid.data[index].id = id;
										me.houseCodeGrid.data[index].modified = false;
										break;
									}
								}	

								break;
						}
					});
				}
			}
			else {
				alert("[SAVE FAILURE] Error while updating Epay Site: " + $(args.xmlNode).attr("message"));
			}

			me.status = "";
			$("#pageLoading").hide();
		}
	}
});

function loadPopup() {
	
	centerPopup();
	
	$("#backgroundPopup").css({
		"opacity": "0.5"
	});
	$("#backgroundPopup").fadeIn("slow");
	$("#popupContact").fadeIn("slow");
}

function disablePopup() {

	$("#backgroundPopup").fadeOut("slow");
	$("#popupContact").fadeOut("slow");
}

function centerPopup() {
	var windowWidth = document.documentElement.clientWidth;
	var windowHeight = document.documentElement.clientHeight;
	var popupWidth = windowWidth - 100;
	var popupHeight = windowHeight - 100;
	
	$("#popupContact").css({
		"width": popupWidth,
		"height": popupHeight,
		"top": windowHeight/2 - popupHeight/2,
		"left": windowWidth/2 - popupWidth/2
	});

	$("#backgroundPopup").css({
		"height": windowHeight
	});
}
	
function main() {
	fin.hcm.ePaySiteUi = new fin.hcm.ePaySite.UserInterface();
	fin.hcm.ePaySiteUi.resize();
	fin.houseCodeSearchUi = fin.hcm.ePaySiteUi;
}