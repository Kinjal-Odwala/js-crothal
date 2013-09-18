ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons");
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.rev.taxRate.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.grid", 6 );
ii.Style( "fin.cmn.usr.button", 7 );
ii.Style( "fin.cmn.usr.dropDown", 8 );

ii.Class({
    Name: "fin.rev.taxRate.UserInterface",
	Definition: {
		
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.fileName = "";
			me.stateId = 0;
			
			//pagination setup
			me.startPoint = 1;
			me.maximumRows = 100;
			me.recordCount = 0;
			me.pageCount = 0;
			me.pageCurrent = 1;

			me.gateway = ii.ajax.addGateway("rev", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);	

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Setup\\ImportTaxes";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);

			me.defineFormControls();			
			me.configureCommunications();

			me.state.fetchingData();
			me.stateTypeStore.fetch("userId:[user],", me.statesLoaded, me);
			me.anchorUpload.display(ui.cmn.behaviorStates.disabled);

			$("#divFrame").height(0);
			$("#iFrameUpload").height(0);
			$("#divUpload").hide();
			$(window).bind("resize", me, me.resize);

			// Disable the context menu but not on localhost because its used for debugging
			if (location.hostname != "localhost") {
				$(document).bind("contextmenu", function(event) {
					return false;
				});
			}
		},

		authorizationProcess: function fin_rev_taxRate_UserInterface_authorizationProcess() {
			var args = ii.args(arguments, {});
			var me = this;

			me.isReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");			

			if (me.isReadOnly)
				$("#actionHeader").hide();

			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);

			$("#pageLoading").hide();
		},	

		sessionLoaded: function fin_rev_taxRate_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var me = this;
			
			$("#GridContianer").height($(window).height() - 200);
			fin.rev.taxRateUI.taxGrid.setHeight($(window).height() - 220);			
		},
		
		defineFormControls: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});  
			
			me.actionMenu
				.addAction({
					id: "importAction",
					brief: "Import Tax Rates",
					title: "Upload the text file for importing tax rates.",
					actionFunction: function() { me.actionImportItem(); }
				})				
				.addAction({
					id: "viewAction", 
					brief: "View Tax Rates", 
					title: "View the state and local tax rates.",
					actionFunction: function() { me.actionViewItem(); }
				});
			
			me.anchorUpload = new ui.ctl.buttons.Sizeable({
				id: "AnchorUpload",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Upload&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUploadItem(); },
				hasHotState: true
			});
			
			me.anchorCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCancelItem(); },
				hasHotState: true
			});
			
			me.anchorSearch = new ui.ctl.buttons.Sizeable({
				id: "AnchorSearch",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Search&nbsp;&nbsp;</span>",
				clickFunction: function() { me.loadSearchResults(); },
				hasHotState: true
			});

			me.anchorExportToExcel = new ui.ctl.buttons.Sizeable({
				id: "AnchorExportToExcel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Export To Excel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionExportToExcelItem(); },
				hasHotState: true
			});

			me.zipCode = new ui.ctl.Input.Text({
                id: "ZipCode",
                maxLength: 5
            });

            me.zipCode.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(function (isFinal, dataMap) {

					var enteredText = me.zipCode.getValue();
					
					if (enteredText == "") 
						return;

				  	if (/^\d{5}$/.test(enteredText) == false)
				    	this.setInvalid("Please enter valid 5 digit Zip Code.");
				});
			
			me.state = new ui.ctl.Input.DropDown.Filtered({
		        id: "State",
				formatFunction: function(type) { return type.name; },
				required : false
		    });
			
			me.state.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.state.lastBlurValue == "")
						return;						
						
					if (me.state.indexSelected == -1)
						this.setInvalid("Please select the correct State.");
				});
				
			me.stateTax = new ui.ctl.Input.Money({
				id: "StateTax"
			});
			
			me.stateTax.text.readOnly = true;
			
			me.taxGrid = new ui.ctl.Grid({
				id: "TaxGrid",
				appendToId: "divForm",
				allowAdds: false
			});
						
			me.taxGrid.addColumn("zipCode", "zipCode", "Zip Code", "Zip Code", 80);
			me.taxGrid.addColumn("geoCode", "geoCode", "GEO Code", "GEO Code", 80);
			me.taxGrid.addColumn("cityName", "cityName", "City Name", "City Name", 220);
			me.taxGrid.addColumn("citySalesTaxRate", "citySalesTaxRate", "City Sales Tax", "City Sales Tax", 130);
			me.taxGrid.addColumn("cityTransitSalesTaxRate", "cityTransitSalesTaxRate", "City Transit Sales Tax", "City Transit Sales Tax", 180);
			me.taxGrid.addColumn("countyName", "countyName", "County Name", "County Name", null);
			me.taxGrid.addColumn("countySalesTaxRate", "countySalesTaxRate", "County Sales Tax", "County Sales Tax", 150);
			me.taxGrid.addColumn("countyTransitSalesTaxRate", "countyTransitSalesTaxRate", "County Transit Sales Tax", "County Transit Sales Tax", 210);
			me.taxGrid.addColumn("combinedSalesTaxRate", "combinedSalesTaxRate", "Total Sales Tax", "Total Sales Tax", 140);
			me.taxGrid.capColumns();
			
			$("#ZipCodeText").bind("keydown", me, me.actionSearchItem);
			$("#selPageNumber").bind("change", function() { me.pageNumberChange(); });
			$("#imgPrev").bind("click", function() { me.prevTaxes(); });
			$("#imgNext").bind("click", function() { me.nextTaxes(); });
		},
		
		configureCommunications: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.stateTypes = [];
			me.stateTypeStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.rev.taxRate.StateType,
				itemConstructorArgs: fin.rev.taxRate.stateTypeArgs,
				injectionArray: me.stateTypes	
			});
			
			me.stateTaxes = [];
			me.stateTaxStore = me.cache.register({
				storeId: "revStateTaxs",
				itemConstructor: fin.rev.taxRate.StateTax,
				itemConstructorArgs: fin.rev.taxRate.stateTaxArgs,
				injectionArray: me.stateTaxes	
			});
			
			me.localTaxes = [];
			me.localTaxStore = me.cache.register({
				storeId: "revLocalTaxs",
				itemConstructor: fin.rev.taxRate.LocalTax,
				itemConstructorArgs: fin.rev.taxRate.localTaxArgs,
				injectionArray: me.localTaxes
			});
			
			me.recordCounts = [];
			me.recordCountStore = me.cache.register({
				storeId: "appRecordCounts",
				itemConstructor: fin.rev.taxRate.RecordCount,
				itemConstructorArgs: fin.rev.taxRate.recordCountArgs,
				injectionArray: me.recordCounts
			});
			
			me.fileNames = [];
			me.fileNameStore = me.cache.register({
				storeId: "revInvoiceExcelFileNames",
				itemConstructor: fin.rev.taxRate.FileName,
				itemConstructorArgs: fin.rev.taxRate.fileNameArgs,
				injectionArray: me.fileNames
			});
		},

		resizeControls: function() {
			var me = this;
			
			me.zipCode.resizeText();
			me.state.resizeText();
			me.stateTax.resizeText();
			me.taxGrid.resize();
		},
		
		resetControls: function() {
			var me = this;
		    var selPageNumber = $("#selPageNumber");

			me.startPoint = 1;
			me.recordCount = 0;
			me.pageCount = 0;
			me.pageCurrent = 1;

		    selPageNumber.empty();
			selPageNumber.append("<option value='1'>1</option>");
			selPageNumber.val(me.pageCurrent);

			me.stateTaxStore.reset();
			me.localTaxStore.reset();
			me.zipCode.setValue("");
			me.stateTax.setValue("");
			me.state.reset();
			me.taxGrid.setData([]);
			me.stateId = 0;
			$("#spnPageInfo").html(" of 1 (0 records)");
		},

		statesLoaded: function(me, activeId) {			
			var stateId = 0;

			me.state.setData(me.stateTypes);
			me.resizeControls();
		},
		
		actionSearchItem: function() {
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
			
			me.validator.forceBlur();
			
			// Check to see if the data entered is valid
		    if (!me.validator.queryValidity(true)) {
				alert("In order to search, the errors on the page must be corrected.");
				return false;
			}	
			
			if (me.zipCode.getValue() == "" && me.state.indexSelected == -1) {
				alert("Please enter search criteria: Zip Code or State.")
				return false;
			}

			$("#messageToUser").text("Loading");
			$("#pageLoading").show();
			
			if (me.state.indexSelected >= 0)
				me.stateId = me.stateTypes[me.state.indexSelected].id;
			else
				me.stateId = 0;
				    
			me.recordCountStore.fetch("userId:[user],module:RevLocalTaxes,stateId:" + me.stateId + ",zipCode:" + me.zipCode.getValue(), me.recordCountsLoaded, me);
		},
		
		recordCountsLoaded: function(me, activeId) {		    
		    var selPageNumber = $("#selPageNumber");

			me.startPoint = 1;
		    me.recordCount = me.recordCounts[0].recordCount;
		    me.pageCount = Math.ceil(me.recordCount / me.maximumRows);
		    me.pageCurrent = Math.ceil(me.startPoint / me.maximumRows);

		    //if we don't have records...
		    if (me.pageCount == 0) me.pageCount = 1;

		    //fill the select box
		    selPageNumber.empty();
		    for (var index = 0; index < me.pageCount; index++) {
				selPageNumber.append("<option value=\"" + (index + 1) + "\">" + (index + 1) + "</option>");
			}

			$("#spnPageInfo").html(" of " + me.pageCount + " (" + me.recordCount + " records)");
		    selPageNumber.val(me.pageCurrent);
			me.listTaxes();
		},
		
		listTaxes: function() {
			var me = this;

			$("#messageToUser").text("Loading");
			$("#pageLoading").show();				
			$("#selPageNumber").val(me.pageCurrent);			
	
			me.startPoint = ((me.pageCurrent - 1) * me.maximumRows) + 1;	
			me.localTaxStore.fetch("userId:[user],stateId:" + me.stateId 
				+ ",zipCode:" + me.zipCode.getValue() 
				+ ",startPoint:" + me.startPoint 
				+ ",maximumRows:" + me.maximumRows
				, me.localTaxesLoaded
				, me
				);
		},
		
		localTaxesLoaded: function(me, activeId) {

			var stateType = 0;
			me.taxGrid.setData(me.localTaxes);
			
			if (me.localTaxes.length > 0)
				stateType = me.localTaxes[0].stateType;
			else if (me.state.indexSelected >= 0)
				stateType = me.stateTypes[me.state.indexSelected].id;

			me.stateTaxStore.fetch("userId:[user],stateId:" + stateType, me.stateTaxesLoaded, me);
		},

		stateTaxesLoaded: function(me, activeId) { 
			
			if (me.stateTaxes.length > 0) {
				me.stateTax.setValue(me.stateTaxes[0].salesTaxRate);
				var index = ii.ajax.util.findIndexById(me.stateTaxes[0].stateType.toString(), me.stateTypes);
	            if (index >= 0 && index != null)
	                me.state.select(index, me.state.focused);
			}				
			else {
				me.stateTax.setValue("");
				me.state.reset();
			}
			
			$("#pageLoading").hide();
		},
		
		prevTaxes: function() {
		    var me = this;

			me.pageCurrent--;

			if (me.pageCurrent < 1)
			    me.pageCurrent = 1;
			else				
				me.listTaxes();
		},

		nextTaxes: function() {
		    var me = this;

			me.pageCurrent++;

			if (me.pageCurrent > me.pageCount)
			    me.pageCurrent = me.pageCount;
			else
				me.listTaxes();
		},
		
		pageNumberChange: function() {
		    var me = this;
		    var selPageNumber = $("#selPageNumber");
		    
		    me.pageCurrent = Number(selPageNumber.val());
		    me.listTaxes();
		},

		actionImportItem: function() {
			var me = this;

			$("#pageHeader").text("Tax Import");
			$("#divTaxes").hide();
			$("#iFrameUpload").height(30);
			$("#divFrame").height(45);
			$("#divFrame").show();
			$("#divUpload").show();
			$("iframe")[0].contentWindow.document.getElementById("FormReset").click();
			me.anchorUpload.display(ui.cmn.behaviorStates.disabled);
		},

		actionViewItem: function() {
			var me = this;

			$("#pageHeader").text("Tax Rates");
			$("#divFrame").height(0);
			$("#iFrameUpload").height(0);
			$("#divUpload").hide();
			$("#divTaxes").show();
		},

		actionCancelItem: function() {
			var me = this;

			me.actionViewItem();
		},
		
		actionExportToExcelItem: function() {
			var me = this;

			if (me.zipCode.getValue() == "" && me.state.indexSelected == -1) {
				alert("Please enter search criteria: Zip Code or State.")
				return false;
			}

			if (me.state.indexSelected >= 0)
				me.stateId = me.stateTypes[me.state.indexSelected].id;
			else
				me.stateId = 0;

			$("#messageToUser").text("Exporting");
			$("#pageLoading").show();

			me.fileNameStore.reset();
			me.fileNameStore.fetch("userId:[user],exportType:taxRates,stateId:" + me.stateId + ",zipCode:" + me.zipCode.getValue(), me.fileNamesLoaded, me);
		},

		fileNamesLoaded: function(me, activeId) {

			$("#pageLoading").hide();

			if (me.fileNames.length == 1) {
				$("iframe")[0].contentWindow.document.getElementById("FileName").value = me.fileNames[0].fileName;
				$("iframe")[0].contentWindow.document.getElementById("DownloadButton").click();
			}
		},

		actionUploadItem: function() {
			var me = this;

			me.fileName = "";

			$("#messageToUser").text("Upload process will take few minutes, please wait...");
			$("#pageLoading").show();
			$("iframe")[0].contentWindow.document.getElementById("FileName").value = "";
			$("iframe")[0].contentWindow.document.getElementById("UploadButton").click();

			me.intervalId = setInterval(function() {

				if ($("iframe")[0].contentWindow.document.getElementById("FileName").value != "") {
					me.fileName = $("iframe")[0].contentWindow.document.getElementById("FileName").value;
					clearInterval(me.intervalId);

					if (me.fileName == "Error") {
						alert("Unable to upload the file. Please try again.")
						$("#pageLoading").hide();
					}
					else {
						me.actionImportSave();
					}
				}
				
			}, 1000);
		},

		actionImportSave: function() {
			var me = this;
			var item = [];

			$("#messageToUser").text("Import process will take few minutes, please wait...");
			$("#pageLoading").show();

			var xml = '<revTaxImport';
				xml += ' fileName="' + me.fileName + '"';
				xml += '/>';

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
		saveResponse: function() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},	
				xmlNode: {type: "XmlNode:transaction"}							
			});
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var status = $(args.xmlNode).attr("status");
			var errorMessage = "";
			
			$("#pageLoading").hide();

			if (status == "success") {
				me.resetControls();
				me.actionViewItem();
				alert("Tax Rates imported successfully.")
			}
			else {
				errorMessage = "Error while importing Tax File: " + $(args.xmlNode).attr("message");
				errorMessage += $(args.xmlNode).attr("error");
				errorMessage += " [SAVE FAILURE]";
				alert(errorMessage);				
			}
		}				
	}
});

function onFileChange() {

	var fileName = $("iframe")[0].contentWindow.document.getElementById("UploadFile").value;
	var fileExtension = fileName.substring(fileName.lastIndexOf("."));

	if (fileExtension.toLowerCase() == ".txt")
		fin.rev.taxRateUI.anchorUpload.display(ui.cmn.behaviorStates.enabled);
	else {
		alert("Invalid file format. Please select the correct text file.");
		fin.rev.taxRateUI.anchorUpload.display(ui.cmn.behaviorStates.disabled);
	}		
}

function main() {

	fin.rev.taxRateUI = new fin.rev.taxRate.UserInterface();
	fin.rev.taxRateUI.resize();
}