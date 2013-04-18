ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "fin.hcm.remitTo.usr.defs" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.toolbar" , 4);
ii.Style( "fin.cmn.usr.input" , 5);
ii.Style( "fin.cmn.usr.grid" , 6);
ii.Style( "fin.cmn.usr.button" , 7);
ii.Style( "fin.cmn.usr.dropDown" , 8);

ii.Class({
    Name: "fin.hcm.remitTo.UserInterface",
    Definition: {
	
		init: function (){
			var args = ii.args(arguments, {});
			var me = this;
			
			me.remitToId = 0;
			me.status = "";
			me.lastSelectedRowIndex = -1;
			
			me.gateway = ii.ajax.addGateway("hcm", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(me.gateway, function(status, errorMessage){
				me.nonPendingError(status, errorMessage);
			});
			
			me.validator = new ui.ctl.Input.Validation.Master();
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );	//@iiDoc {Property:ii.ajax.Authorizer} Boolean
			me.authorizePath = "\\crothall\\chimes\\fin\\HouseCodeSetup\\RemitToLocations";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.session = new ii.Session(me.cache);
			
			me.defineFormControls();
			me.configureCommunications();
			
			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);
			
			me.remitToStateType.fetchingData();			
			me.stateTypeStore.fetch("userId:[user]", me.stateTypesLoaded, me);	
			me.modified(false);	
		},	
		
		authorizationProcess: function fin_hcm_remitTo_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			$("#pageLoading").hide();
			me.remitToReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");
			me.controlVisible();
				
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},	
		
		sessionLoaded: function fin_hcm_remitTo_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},
		
		resize: function(){
			var args = ii.args(arguments, {});
			
			fin.hcm.hcmRemitToUi.remitToGrid.setHeight($(window).height() - 85);
			$("#remitToContentArea").height($(window).height() - 125);
		},
		
		defineFormControls: function(){
			var args = ii.args(arguments, {});
			var me = this;

			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});
			
			me.actionMenu
				.addAction({
					id: "saveAction",
					brief: "Save (Ctrl+S)", 
					title: "Save the current RemitTo.",
					actionFunction: function(){ me.actionSaveItem(); }
				})
				.addAction({
					id: "newAction", 
					brief: "New RemitTo(Ctrl+N)", 
					title: "Save the current RemitTo, and create a new blank RemitTo.",
					actionFunction: function(){ me.actionNewItem(); }
				})
				.addAction({
					id: "cancelAction", 
					brief: "Undo current changes to RemitTo (Ctrl+U)", 
					title: "Undo the changes to RemitTo being edited.",
					actionFunction: function(){ me.actionUndoItem(); }
				});
				
			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function(){
					me.actionSaveItem();},
				hasHotState: true
			});
			
			me.anchorNew = new ui.ctl.buttons.Sizeable({
				id: "AnchorNew",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;New&nbsp;&nbsp;</span>",
				clickFunction: function(){
					me.actionNewItem();},
				hasHotState: true
			});
			
			me.anchorUndo = new ui.ctl.buttons.Sizeable({
				id: "AnchorUndo",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Undo&nbsp;&nbsp;</span>",
				clickFunction: function(){
					me.actionUndoItem();},
				hasHotState: true
			});
			
			me.remitToTitle = new ui.ctl.Input.Text({
		        id: "RemitToTitle",
				maxLength: 16,
				changeFunction: function() { me.modified(); } 
		    });
			
			me.remitToTitle.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.remitToAddress1 = new ui.ctl.Input.Text({
		        id: "RemitToAddress1",
				changeFunction: function() { me.modified(); } 
		    });
			
			me.remitToAddress1.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.remitToAddress2 = new ui.ctl.Input.Text({
		        id: "RemitToAddress2",
				changeFunction: function() { me.modified(); } 
		    });
			
			me.remitToCity = new ui.ctl.Input.Text({
		        id: "RemitToCity",
				changeFunction: function() { me.modified(); } 
		    });
			
			me.remitToCity.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.remitToStateType = new ui.ctl.Input.DropDown.Filtered({
				id : "RemitToStateType",
				formatFunction: function( type ){ return type.name; },
				changeFunction: function() { me.modified(); } 
		    });
			
			me.remitToStateType.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.remitToStateType.indexSelected == -1)
						this.setInvalid("Please select the correct State.");
				});
				
			me.remitToZip = new ui.ctl.Input.Text({
		        id: "RemitToZip",
				maxLength: 10,
				changeFunction: function() { me.modified(); }
		    });
			
			me.remitToZip.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {
					
				if(me.remitToZip.getValue() == "") 
					return;

				if(ui.cmn.text.validate.postalCode(me.remitToZip.getValue()) == false)
					this.setInvalid("Please enter valid zip code. Example: 99999 or 99999-9999");
			});
				
			me.remitToGrid = new ui.ctl.Grid({
				id: "RemitTo",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function(index){me.itemSelect(index);},
				createNewFunction: fin.hcm.remitTo.RemitTo,
				validationFunction: function() { return parent.fin.cmn.status.itemValid(); }
			});
			
			me.remitToGrid.addColumn("title", "title", "Title", "Title", 150);
			me.remitToGrid.addColumn("address1", "address1", "Address1", "Address1", null);
			me.remitToGrid.capColumns();
		},
		
		resizeControls: function() {
			var me = this;
			
			me.remitToTitle.resizeText();
			me.remitToAddress1.resizeText();
			me.remitToAddress2.resizeText();
			me.remitToCity.resizeText();
			me.remitToStateType.resizeText();
			me.remitToZip.resizeText();
			me.resize();
		},
			
		configureCommunications: function (){
			var args = ii.args(arguments, {});
			var me = this;

			me.remitTos = [];
			me.remitToStore = me.cache.register({
				storeId: "remitToLocations",
				itemConstructor: fin.hcm.remitTo.RemitTo,
				itemConstructorArgs: fin.hcm.remitTo.remitToArgs,
				injectionArray: me.remitTos
			});					
			
			me.stateTypes = [];
			me.stateTypeStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.hcm.remitTo.StateType,
				itemConstructorArgs: fin.hcm.remitTo.stateTypeArgs,
				injectionArray: me.stateTypes	
			});	
		},
		
		modified: function fin_cmn_status_modified() {
			var args = ii.args(arguments, {
				modified: {type: Boolean, required: false, defaultValue: true}
			});
		
			parent.fin.appUI.modified = args.modified;
		},
		
		stateTypesLoaded: function(me, activeId){
			
			me.remitToStateType.reset();
			me.remitToStateType.setData(me.stateTypes);
			
			me.remitToStore.fetch("userId:[user]", me.remitToLoaded, me);			
		},
		
		controlVisible: function(){
			var me = this;
			
			if(me.remitToReadOnly){
				$("#RemitToTitleText").attr('disabled', true);
				$("#RemitToAddress1Text").attr('disabled', true);
				$("#RemitToAddress1Text").attr('disabled', true);
				$("#RemitToAddress2Text").attr('disabled', true);
				$("#RemitToCityText").attr('disabled', true);
				$("#RemitToStateTypeText").attr('disabled', true);
				$("#RemitToStateTypeAction").removeClass('iiInputAction');
				$("#RemitToZipText").attr('disabled', true);
				$("#actionMenu").hide();
				$(".footer").hide();
			}
		},
		
		remitToLoaded: function(me, activeId) {
			me.controlVisible();
			
			me.remitToGrid.setData(me.remitTos);
			me.remitToStateType.valid = true;
			me.remitToStateType.updateStatus();
			
			me.remitToGrid.body.select(0);

			$("#pageLoading").hide();
			me.resizeControls();
		},

		itemSelect: function(){
			
			var args = ii.args(arguments,{
				index: {type: Number}  // The index of the data subItem to select
			});
			
			var me = this;
			var index = args.index;
			var itemIndex = 0;
			var item = me.remitToGrid.data[index];
			
			me.lastSelectedRowIndex = index;
			
			if (item == undefined) 
				return;
			
			if (me.remitToGrid.data[index] != undefined) {

				me.remitToId = me.remitToGrid.data[index].id;				
				
				me.remitToTitle.setValue(me.remitToGrid.data[index].title);
				me.remitToAddress1.setValue(me.remitToGrid.data[index].address1);
				me.remitToAddress2.setValue(me.remitToGrid.data[index].address2);
				me.remitToCity.setValue(me.remitToGrid.data[index].city);

				itemIndex = ii.ajax.util.findIndexById(me.remitToGrid.data[index].stateType.toString(), me.stateTypes);
				if(itemIndex >= 0 && itemIndex != undefined)
					me.remitToStateType.select(itemIndex, me.remitToStateType.focused);

				me.remitToZip.setValue(me.remitToGrid.data[index].zip);
			}
			else {
				me.remitToId = 0;
			}					
		},

		controlKeyProcessor: function ii_ui_Layouts_ListItem_controlKeyProcessor(){
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});
			
			var event = args.event;
			var me = event.data;
			var processed = false;
			
			if (event.ctrlKey) {
			
				switch (event.keyCode) {
					case 83:// Ctrl+S
						me.actionSaveItem();
						processed = true;
						break;
						
					case 78: // Ctrl+N
						me.actionNewItem();
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
		
		resetControls: function(){
			var me = this;
			
			me.remitToId = 0;
			me.remitToTitle.setValue("");
			me.remitToAddress1.setValue("");
			me.remitToAddress2.setValue("");
			me.remitToCity.setValue("");
			me.remitToStateType.reset();
			me.remitToZip.setValue("");
		},

		actionUndoItem: function(){
			
			var args = ii.args(arguments,{});
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			if (me.lastSelectedRowIndex >= 0) {
				me.remitToGrid.body.select(me.lastSelectedRowIndex);
				me.itemSelect(me.lastSelectedRowIndex);
			}
		},
		
		actionNewItem: function(){
			var args = ii.args(arguments,{});
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			if(me.remitToReadOnly) return;
			
			me.status = "new";
			me.resetControls();
			me.remitToGrid.body.deselectAll();			
		},
		
		actionSaveItem: function(){
			var args = ii.args(arguments,{});
			var me = this;
			
			if(me.remitToReadOnly) return;
			
			if (me.status == "") {
				if (me.lastSelectedRowIndex == -1 || me.lastSelectedRowIndex == undefined)
					me.status = "new";
				else
					me.status = "update";
			}
		
			me.validator.forceBlur();
			
			// Check to see if the data entered is valid
			if( !me.validator.queryValidity(true) ){
				alert( "In order to save, the errors on the page must be corrected.");
				return false;
			}
			
			$("#messageToUser").text("Saving");
			$("#pageLoading").show();
				
			var item = new fin.hcm.remitTo.RemitTo(
				me.remitToId
				, me.remitToTitle.getValue()
				, me.remitToAddress1.getValue()
				, me.remitToAddress2.getValue()
				, me.remitToCity.getValue()
				, me.remitToStateType.data[me.remitToStateType.indexSelected].id
				, me.remitToZip.getValue()
				, true
				, "1"						
				);
			
			var xml = me.saveXmlBuildRemitTo(item);

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponseRemitTo,
				referenceData: {me: me, item: item}
			});
			
			return true;
		},
		
		saveXmlBuildRemitTo: function(){
			var args = ii.args(arguments,{
				item: {type: fin.hcm.remitTo.RemitTo}
			});
			
			var me = this;
			var item = args.item;
			var xml = "";
			
			var clientId = 0;
			
			xml += '<remitToLocation';
			xml += ' id="' + item.id + '"';
			xml += ' title="' + ui.cmn.text.xml.encode(item.title) + '"';
			xml += ' address1="' + ui.cmn.text.xml.encode(item.address1) + '"';
			xml += ' address2="' + ui.cmn.text.xml.encode(item.address2) + '"';
			xml += ' city="' + ui.cmn.text.xml.encode(item.city) + '"';
			xml += ' stateType="' + item.stateType + '"';
			xml += ' zip="' + item.zip + '"';
			xml += ' active="' + item.active + '"';
			xml += ' displayOrder="1"';
			xml += ' clientId="' + ++clientId + '"';
			xml += '/>';
	
			return xml;			
		},	

		saveResponseRemitTo: function(){
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction}, // The transaction that was responded to.
				xmlNode: {type: "XmlNode:transaction"} // The XML transaction node associated with the response.
			});
			
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var errorMessage = "";
			var status = $(args.xmlNode).attr("status");
			var traceType = ii.traceTypes.errorDataCorruption;
			
			if (status == "success") {
				me.remitToId = parseInt(args.xmlNode.firstChild.attributes[0].nodeValue);
					
				$(args.xmlNode).find("*").each(function(){
					switch (this.tagName) {

						case "remitToLocation":
			
							if (me.status == "new") {
								item.id = me.remitToId;
								me.remitTos.push(item);
								me.lastSelectedRowIndex = me.remitToGrid.data.length - 1;
							}
							else {
								me.lastSelectedRowIndex = me.remitToGrid.activeRowIndex;
								me.remitTos[me.lastSelectedRowIndex] = item;
							}
							
							me.status = "";
							me.remitToGrid.setData(me.remitTos);
							me.remitToGrid.body.select(me.lastSelectedRowIndex);
							
							break;
					}
				});
				
				$("#pageLoading").hide();
			}
			else {
				alert('Error while updating Remit To Location Record: ' + $(args.xmlNode).attr("message"));
				errorMessage = $(args.xmlNode).attr("error");
				
				if (status == "invalid") {
					traceType = ii.traceTypes.warning;
				}
				else {
					errorMessage += " [SAVE FAILURE]";
				}
				$("#pageLoading").hide();
			}	
			me.modified(false);
		}
	}
});

function main(){
	fin.hcm.hcmRemitToUi = new fin.hcm.remitTo.UserInterface();
	fin.hcm.hcmRemitToUi.resize();
}
