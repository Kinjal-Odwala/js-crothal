ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.pur.vendor.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.grid", 6 );
ii.Style( "fin.cmn.usr.button", 7 );
ii.Style( "fin.cmn.usr.dropDown", 8 );

ii.Class({
    Name: "fin.pur.vendor.UserInterface",
    Definition: {

		init: function() {
			var me = this;

			me.vendorId = 0;
			me.statusType = 0;
			me.lastSelectedRowIndex = -1;
			me.loadCount = 0;

			me.gateway = ii.ajax.addGateway("pur", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway,
				function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Purchasing\\Vendors";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.defineFormControls();
			me.setTabIndexes();
			me.configureCommunications();
			me.setStatus("Loading");
			me.modified(false);

			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);

			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
		},

		authorizationProcess: function() {
			var me = this;

			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
			me.vendorsReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");
			me.setupVendors = me.authorizer.isAuthorized(me.authorizePath + "\\SetupVendors");

			if (me.isAuthorized) {
				$("#pageLoading").hide();
				$("#pageLoading").css({
					"opacity": "0.5",
					"background-color": "black"
				});
				$("#messageToUser").css({ "color": "white" });
				$("#imgLoading").attr("src", "/fin/cmn/usr/media/Common/loadingwhite.gif");
				$("#pageLoading").fadeIn("slow");

				ii.timer.timing("Page displayed");
				me.loadCount = 2;
				me.session.registerFetchNotify(me.sessionLoaded,me);
				me.sendMethodType.fetchingData();
				me.stateType.fetchingData();
				me.poSendMethodTypeStore.fetch("userId:[user]", me.poSendMethodTypesLoaded, me);
				me.stateTypeStore.fetch("userId:[user]", me.stateTypesLoaded, me);
				if (me.setupVendors) {
					me.loadCount = 3;
					me.recordCountStore.fetch("userId:[user],type:vendors", me.newVendorsCountLoaded, me);
				}
				me.itemStatusesLoaded();
				me.controlVisible();
			}
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},

		sessionLoaded: function() {

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		resize: function() {

			fin.purVendorUi.vendorGrid.setHeight($(window).height() - 145);
			$("#vendorDetailContentArea").height($(window).height() - 185);
		},

		defineFormControls: function() {
			var me = this;

			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});

			me.actionMenu
				.addAction({
					id: "saveAction",
					brief: "Save Vendor (Ctrl+S)",
					title: "Save the current Vendor details.",
					actionFunction: function() { me.actionSaveItem(); }
				})
				.addAction({
					id: "undoAction",
					brief: "Undo (Ctrl+U)",
					title: "Undo the changes to Vendor being edited.",
					actionFunction: function() { me.actionUndoItem(); }
				});

			me.searchInput = new ui.ctl.Input.Text({
				id: "SearchInput",
				maxLength: 50
			});

			me.searchInput.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

				if (me.vendorGrid.activeRowIndex >= 0)
					this.valid = true;
				else if (me.searchInput.getValue().length < 3)
					this.setInvalid("Please enter search criteria (minimum 3 characters).");
			});

			me.vendorStatus = new ui.ctl.Input.DropDown.Filtered({
		        id: "VendorStatus",
				formatFunction: function( type ) { return type.name; }
		    });

			me.vendorStatus.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.vendorStatus.indexSelected === -1)
						this.setInvalid("Please select the correct Status.");
				});

			me.anchorSearch = new ui.ctl.buttons.Sizeable({
				id: "AnchorSearch",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Search&nbsp;&nbsp;</span>",
				clickFunction: function() { me.loadSearchResults(); },
				hasHotState: true
			});

			me.viewNewVendorsLink = new ui.ctl.buttons.Simple({
				id: "ViewNewVendorsLink",
				className: "linkButton",
				clickFunction: function() { me.actionVendorSearch(2); },
				hasHotState: true,
				title: "Click here to view the new Vendors"
			});

			me.viewCurrentVendorsLink = new ui.ctl.buttons.Simple({
				id: "ViewCurrentVendorsLink",
				className: "linkButton",
				clickFunction: function() { me.actionVendorSearch(0); },
				hasHotState: true,
				title: "Click here to view the existing Vendors"
			});

			me.viewReactivateVendorsLink = new ui.ctl.buttons.Simple({
				id: "ViewReactivateVendorsLink",
				className: "linkButton",
				clickFunction: function() { me.actionVendorSearch(7); },
				hasHotState: true,
				title: "Click here to view the existing Vendors"
			});

			me.vendorGrid = new ui.ctl.Grid({
				id: "VendorsGrid",
				appendToId: "divForm",
				allowAdds: false,
				rowNumberDisplayWidth: 40,
				selectFunction: function(index) { me.itemSelect(index); },
				validationFunction: function() {return parent.fin.cmn.status.itemValid(); }
			});

			me.vendorGrid.addColumn("vendorNumber", "vendorNumber", "Vendor #", "Vendor Number", 100);
			me.vendorGrid.addColumn("title", "title", "Title", "Title", null);
			me.vendorGrid.addColumn("name", "name", "Name", "Name", 250);
			me.vendorGrid.capColumns();

			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem(); },
				hasHotState: true
			});

			me.anchorUndo = new ui.ctl.buttons.Sizeable({
				id: "AnchorUndo",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Undo&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUndoItem(); },
				hasHotState: true
			});

			me.vendorNumber = new ui.ctl.Input.Text({
		        id: "VendorNumber",
				maxLength: 16,
				changeFunction: function() { me.modified(); }
		    });

			me.vendorNumber.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required);

			me.title = new ui.ctl.Input.Text({
		        id: "Title",
				maxLength: 256,
				changeFunction: function() { me.modified(); }
		    });

			me.title.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required);

			me.name = new ui.ctl.Input.Text({
		        id: "Name",
				maxLength: 256,
				changeFunction: function() { me.modified(); }
		    });

			me.addressLine1 = new ui.ctl.Input.Text({
		        id: "AddressLine1",
				maxLength: 256,
				changeFunction: function() { me.modified(); }
		    });

			me.addressLine1.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required);

			me.addressLine2 = new ui.ctl.Input.Text({
		        id: "AddressLine2",
				maxLength: 256,
				changeFunction: function() { me.modified(); }
		    });

			me.city = new ui.ctl.Input.Text({
		        id: "City",
				maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });

			me.city.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required);

			me.stateType = new ui.ctl.Input.DropDown.Filtered({
		        id: "State",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });

			me.stateType.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.stateType.indexSelected === -1)
						this.setInvalid("Please select the correct State.");
				});

			me.zip = new ui.ctl.Input.Text({
		        id: "Zip",
				maxLength: 10,
				changeFunction: function() { me.modified(); }
		    });

			me.zip.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.zip.getValue();

					if (enteredText === "")
						return;

					if (!(ui.cmn.text.validate.postalCode(enteredText)))
						this.setInvalid("Please enter valid postal code. Example: 99999 or 99999-9999.");
				});

			me.contactName = new ui.ctl.Input.Text({
		        id: "ContactName",
				maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });

			me.email = new ui.ctl.Input.Text({
		        id: "Email",
				maxLength: 200,
				changeFunction: function() { me.modified(); }
		    });

			me.email.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.email.getValue();

					if (enteredText === "")
						return;

					var emailArray = enteredText.split(",");
					var emailIndex, emailAddress;

					for (emailIndex in emailArray) {
						emailAddress = emailArray[emailIndex];
						if (!(ui.cmn.text.validate.emailAddress(emailAddress))) {
							this.setInvalid("Please enter valid Email Address. Use comma(,) to separate two addresses.");
						}
					}
				});

			me.phoneNumber = new ui.ctl.Input.Text({
		        id: "PhoneNumber",
				maxLength: 14,
				changeFunction: function() { me.modified(); }
		    });

			me.phoneNumber.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.phoneNumber.getValue();

					if (enteredText === "")
						return;

					me.phoneNumber.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.phoneNumber.text.value;

					if (!(ui.cmn.text.validate.phone(enteredText)))
						this.setInvalid("Please enter valid phone number. Example: (999) 999-9999");
				});

			me.faxNumber = new ui.ctl.Input.Text({
		        id: "FaxNumber",
				maxLength: 14,
				changeFunction: function() { me.modified(); }
		    });

			me.faxNumber.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.faxNumber.getValue();

					if (enteredText === "")
						return;

					me.faxNumber.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.faxNumber.text.value;

					if (!(ui.cmn.text.validate.phone(enteredText)))
						this.setInvalid("Please enter valid fax number. Example: (999) 999-9999");
				});

			me.trainStation = new ui.ctl.Input.Text({
		        id: "TrainStation",
				maxLength: 25
		    });

			me.groupKey = new ui.ctl.Input.Text({
		        id: "GroupKey",
				maxLength: 10
		    });

			me.paymentTerm = new ui.ctl.Input.Text({
		        id: "PaymentTerm",
				maxLength: 4
		    });

			me.accountNumber = new ui.ctl.Input.Text({
		        id: "AccountNumber",
				maxLength: 12
		    });

			me.memo = new ui.ctl.Input.Text({
		        id: "Memo",
				maxLength: 30
		    });

			me.minorityIndicator = new ui.ctl.Input.Text({
		        id: "MinorityIndicator",
				maxLength: 3
		    });

			me.consolidatedCode = new ui.ctl.Input.Text({
		        id: "ConsolidatedCode",
				maxLength: 30
		    });

			me.consolidatedText = new ui.ctl.Input.Text({
		        id: "ConsolidatedText",
				maxLength: 30
		    });

			me.categoryCode = new ui.ctl.Input.Text({
		        id: "CategoryCode",
				maxLength: 30
		    });

			me.categoryText = new ui.ctl.Input.Text({
		        id: "CategoryText",
				maxLength: 30
		    });

			me.nominatedCode = new ui.ctl.Input.Text({
		        id: "NominatedCode",
				maxLength: 30
		    });

			me.nominatedText = new ui.ctl.Input.Text({
		        id: "NominatedText",
				maxLength: 30
		    });

			me.paymentKeyTerms = new ui.ctl.Input.Text({
		        id: "PaymentKeyTerms",
				maxLength: 4
		    });

			me.businessType = new ui.ctl.Input.Text({
		        id: "BusinessType",
				maxLength: 30
		    });

			me.country = new ui.ctl.Input.Text({
		        id: "Country",
				maxLength: 3
		    });

			me.name3 = new ui.ctl.Input.Text({
		        id: "Name3",
				maxLength: 35
		    });

			me.name4 = new ui.ctl.Input.Text({
		        id: "Name4",
				maxLength: 35
		    });

			me.blockCentralPosting = new ui.ctl.Input.Check({
		        id: "BlockCentralPosting"
		    });

			me.blockPayment = new ui.ctl.Input.Check({
		        id: "BlockPayment"
		    });

			me.blockPostingCompanyCode = new ui.ctl.Input.Check({
		        id: "BlockPostingCompanyCode"
		    });

			me.sendMethodType = new ui.ctl.Input.DropDown.Filtered({
		        id: "SendMethodType",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });

			me.sendMethodType.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.sendMethodType.indexSelected === -1)
						this.setInvalid("Please select the correct Send Method Type.");
				});

			me.selectVendorBy = new ui.ctl.Input.DropDown.Filtered({
		        id: "SelectVendorBy",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });

			me.selectVendorBy.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.selectVendorBy.indexSelected === -1)
						this.setInvalid("Please select the correct Select Vendor By.");
				});

			me.autoEmail = new ui.ctl.Input.Check({
		        id: "AutoEmail",
				changeFunction: function() { me.modified(); }
		    });

			me.active = new ui.ctl.Input.Check({
		        id: "Active",
				changeFunction: function() { me.modified(); }
		    });

			$("#SearchInputText").bind("keydown", me, me.actionSearchItem);
			$("#VendorStatusText").bind("keydown", me, me.actionSearchItem);
		},

		configureCommunications: function() {
			var me = this;

			me.vendors = [];
			me.vendorStore = me.cache.register({
				storeId: "purVendors",
				itemConstructor: fin.pur.vendor.Vendor,
				itemConstructorArgs: fin.pur.vendor.vendorArgs,
				injectionArray: me.vendors
			});

			me.stateTypes = [];
			me.stateTypeStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.pur.vendor.StateType,
				itemConstructorArgs: fin.pur.vendor.stateTypeArgs,
				injectionArray: me.stateTypes
			});

			me.poSendMethodTypes = [];
			me.poSendMethodTypeStore = me.cache.register({
				storeId: "purPOSendMethodTypes",
				itemConstructor: fin.pur.vendor.POSendMethodType,
				itemConstructorArgs: fin.pur.vendor.poSendMethodTypeArgs,
				injectionArray: me.poSendMethodTypes
			});

			me.recordCounts = [];
			me.recordCountStore = me.cache.register({
				storeId: "purRecordCounts",
				itemConstructor: fin.pur.vendor.RecordCount,
				itemConstructorArgs: fin.pur.vendor.recordCountArgs,
				injectionArray: me.recordCounts
			});
		},

		controlKeyProcessor: function() {
			var args = ii.args(arguments, {
				event: {type: Object}
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

		setTabIndexes: function() {
			var me = this;

			me.vendorNumber.text.tabIndex = 1;
			me.title.text.tabIndex = 2;
			me.name.text.tabIndex = 3;
			me.addressLine1.text.tabIndex = 4;
			me.addressLine2.text.tabIndex = 5;
			me.city.text.tabIndex = 6;
			me.stateType.text.tabIndex = 7;
			me.zip.text.tabIndex = 8;
			me.contactName.text.tabIndex = 9;
			me.email.text.tabIndex = 10;
			me.phoneNumber.text.tabIndex = 11;
			me.faxNumber.text.tabIndex = 12;
			me.trainStation.text.tabIndex = 13;
			me.groupKey.text.tabIndex = 14;
			me.paymentTerm.text.tabIndex = 15;
			me.accountNumber.text.tabIndex = 16;
			me.memo.text.tabIndex = 17;
			me.minorityIndicator.text.tabIndex = 18;
			me.consolidatedCode.text.tabIndex = 19;
			me.consolidatedText.text.tabIndex = 20;
			me.categoryCode.text.tabIndex = 21;
			me.categoryText.text.tabIndex = 22;
			me.nominatedCode.text.tabIndex = 23;
			me.nominatedText.text.tabIndex = 24;
			me.paymentKeyTerms.text.tabIndex = 25;
			me.businessType.text.tabIndex = 26;
			me.country.text.tabIndex = 27;
			me.name3.text.tabIndex = 28;
			me.name4.text.tabIndex = 29;
			me.blockCentralPosting.check.tabIndex = 30;
			me.blockPayment.check.tabIndex = 31;
			me.blockPostingCompanyCode.check.tabIndex = 32;
			me.sendMethodType.text.tabIndex = 33;
			me.selectVendorBy.text.tabIndex = 34;
			me.autoEmail.check.tabIndex = 35;
			me.active.check.tabIndex = 36;
		},

		resizeControls: function() {
			var me = this;

			me.vendorNumber.resizeText();
			me.title.resizeText();
			me.name.resizeText();
			me.addressLine1.resizeText();
			me.addressLine2.resizeText();
			me.city.resizeText();
			me.stateType.resizeText();
			me.zip.resizeText();
			me.contactName.resizeText();
			me.email.resizeText();
			me.phoneNumber.resizeText();
			me.faxNumber.resizeText();
			me.trainStation.resizeText();
			me.groupKey.resizeText();
			me.paymentTerm.resizeText();
			me.accountNumber.resizeText();
			me.memo.resizeText();
			me.minorityIndicator.resizeText();
			me.consolidatedCode.resizeText();
			me.consolidatedText.resizeText();
			me.categoryCode.resizeText();
			me.categoryText.resizeText();
			me.nominatedCode.resizeText();
			me.nominatedText.resizeText();
			me.paymentKeyTerms.resizeText();
			me.businessType.resizeText();
			me.country.resizeText();
			me.name3.resizeText();
			me.name4.resizeText();
			me.sendMethodType.resizeText();
			me.selectVendorBy.resizeText();
			me.resize();
		},

		resetControls: function() {
			var me = this;

			me.vendorId = 0;
			me.validator.reset();
			me.vendorNumber.setValue("");
			me.title.setValue("");
			me.name.setValue("");
			me.addressLine1.setValue("");
			me.addressLine2.setValue("");
			me.city.setValue("");
			me.stateType.reset();
			me.zip.setValue("");
			me.contactName.setValue("");
			me.email.setValue("");
			me.phoneNumber.setValue("");
			me.faxNumber.setValue("");
			me.trainStation.setValue("");
			me.groupKey.setValue("");
			me.paymentTerm.setValue("");
			me.accountNumber.setValue("");
			me.memo.setValue("");
			me.minorityIndicator.setValue("");
			me.consolidatedCode.setValue("");
			me.consolidatedText.setValue("");
			me.categoryCode.setValue("");
			me.categoryText.setValue("");
			me.nominatedCode.setValue("");
			me.nominatedText.setValue("");
			me.paymentKeyTerms.setValue("");
			me.businessType.setValue("");
			me.country.setValue("");
			me.name3.setValue("");
			me.name4.setValue("");
			me.blockCentralPosting.setValue("false");
			me.blockPayment.setValue("false");
			me.blockPostingCompanyCode.setValue("false");
			me.sendMethodType.reset();
			me.selectVendorBy.reset();
			me.autoEmail.setValue("false");
			me.active.setValue("false");
			me.vendorNumber.text.focus();
		},

		setStatus: function(status) {

			fin.cmn.status.setStatus(status);
		},
		
		dirtyCheck: function(me) {

			return !fin.cmn.status.itemValid();
		},

		modified: function() {
			var args = ii.args(arguments, {
				modified: {type: Boolean, required: false, defaultValue: true}
			});
			var me = this;

			parent.fin.appUI.modified = args.modified;
			if (args.modified)
				me.setStatus("Edit");
		},

		setLoadCount: function() {
			var me = this;

			me.loadCount++;
			me.setStatus("Loading");
			$("#messageToUser").text("Loading");
			$("#pageLoading").fadeIn("slow");
		},

		checkLoadCount: function() {
			var me = this;

			me.loadCount--;
			if (me.loadCount <= 0) {
				me.setStatus("Loaded");
				$("#pageLoading").fadeOut("slow");
			}
		},

		controlVisible: function() {
			var me = this;

			$("#VendorNumberText").attr("disabled", true);
			$("#TitleText").attr("disabled", true);
			$("#NameText").attr("disabled", true);
			$("#AddressLine1Text").attr("disabled", true);
			$("#AddressLine2Text").attr("disabled", true);
			$("#CityText").attr("disabled", true);
			$("#StateText").attr("disabled", true);
			$("#StateAction").removeClass("iiInputAction");
			$("#ZipText").attr("disabled", true);
			$("#ContactNameText").attr("disabled", true);
			$("#EmailText").attr("disabled", true);
			$("#PhoneNumberText").attr("disabled", true);
			$("#FaxNumberText").attr("disabled", true);
			$("#TrainStationText").attr("disabled", true);
			$("#GroupKeyText").attr("disabled", true);
			$("#PaymentTermText").attr("disabled", true);
			$("#AccountNumberText").attr("disabled", true);
			$("#MemoText").attr("disabled", true);
			$("#MinorityIndicatorText").attr("disabled", true);
			$("#ConsolidatedCodeText").attr("disabled", true);
			$("#ConsolidatedTextText").attr("disabled", true);
			$("#CategoryCodeText").attr("disabled", true);
			$("#CategoryTextText").attr("disabled", true);
			$("#NominatedCodeText").attr("disabled", true);
			$("#NominatedTextText").attr("disabled", true);
			$("#PaymentKeyTermsText").attr("disabled", true);
			$("#BusinessTypeText").attr("disabled", true);
			$("#CountryText").attr("disabled", true);
			$("#Name3Text").attr("disabled", true);
			$("#Name4Text").attr("disabled", true);
			$("#BlockCentralPostingCheck").attr("disabled", true);
			$("#BlockPaymentCheck").attr("disabled", true);
			$("#BlockPostingCompanyCodeCheck").attr("disabled", true);
			$("#ActiveCheck").attr("disabled", true);

			if (me.vendorsReadOnly) {
				$("#SendMethodTypeText").attr("disabled", true);
				$("#SendMethodTypeAction").removeClass("iiInputAction");
				$("#AutoEmailCheck").attr("disabled", true);
				$("#actionMenu").hide();
				$(".footer").hide();
			}
		},

		itemStatusesLoaded: function() {
			var me = this;

			me.vendorStatuses = [];
			me.vendorStatuses.push(new fin.pur.vendor.VendorStatus(1, -1, "All"));
			me.vendorStatuses.push(new fin.pur.vendor.VendorStatus(2, 1, "Active"));
			me.vendorStatuses.push(new fin.pur.vendor.VendorStatus(3, 0, "In Active"));
			me.vendorStatus.setData(me.vendorStatuses);
			me.vendorStatus.select(0, me.vendorStatus.focused);
			
			me.selectVendorTypes = [];
			me.selectVendorTypes.push(new fin.pur.vendor.SelectVendorType(1, "Title", "PurVenTitle"));
			me.selectVendorTypes.push(new fin.pur.vendor.SelectVendorType(2, "Name", "PurVenName"));
			me.selectVendorBy.setData(me.selectVendorTypes);
		},

		stateTypesLoaded: function(me, activeId) {

			me.stateType.setData(me.stateTypes);
			me.checkLoadCount();
		},

		poSendMethodTypesLoaded: function(me, activeId) {

			me.sendMethodType.setData(me.poSendMethodTypes);
			me.checkLoadCount();
			me.resizeControls();
		},

		newVendorsCountLoaded: function(me, activeId) {

			if (me.recordCounts[0].recordCount > 0)
				$("#Notification").show();

			me.recordCountStore.fetch("userId:[user],type:reActivateVendors", me.reActivateVendorsCountLoaded, me);
		},

		reActivateVendorsCountLoaded: function(me, activeId) {

			if (me.recordCounts[0].recordCount > 0)
				$("#ReactivateVendors").show();
			me.checkLoadCount();
		},

		actionSearchItem: function() {
			var args = ii.args(arguments, {
				event: {type: Object}
			});
			var event = args.event;
			var me = event.data;

			if (event.keyCode === 13) {
				me.loadSearchResults();
			}
		},

		actionVendorSearch: function(statusType) {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			me.statusType = statusType;
			me.lastSelectedRowIndex = -1;
			me.resetControls();
			me.searchInput.setValue("");
			me.searchInput.valid = true;
			me.searchInput.updateStatus();
			me.vendorGrid.setData([]);
			me.setStatus("Normal");

			if (me.statusType === 0)
				$("#StatusContainer").show();
			else if (me.statusType === 2 || me.statusType === 7)
				$("#StatusContainer").hide();
		},

		loadSearchResults: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			if (me.searchInput.getValue().length < 3) {
				me.searchInput.setInvalid("Please enter search criteria (minimum 3 characters).");
				return false;
			}
			else {
				me.searchInput.valid = true;
				me.searchInput.updateStatus();
			}

			me.setLoadCount();
 			me.vendorStore.fetch("userId:[user],searchValue:" + me.searchInput.getValue()
				+ ",statusType:" + me.statusType
				+ ",vendorStatus:" + (me.vendorStatus.indexSelected === -1 ? -1 : me.vendorStatuses[me.vendorStatus.indexSelected].number)
				+ ",selectBy:Both", me.vendorsLoaded, me);
		},

		vendorsLoaded: function(me, activeId) {

			me.lastSelectedRowIndex = -1;
			me.vendorGrid.setData(me.vendors);
			me.resetControls();
			me.checkLoadCount();
		},

		itemSelect: function() {
			var args = ii.args(arguments, {
				index: {type: Number}
			});
			var me = this;
			var index = args.index;
			var itemIndex = 0;
			var item = me.vendorGrid.data[index];

			if (!parent.fin.cmn.status.itemValid()) {
				me.vendorGrid.body.deselect(index, true);
				return;
			}

			me.lastSelectedRowIndex = index;
			me.validator.reset();
			me.vendorId = item.id;
			me.vendorNumber.setValue(item.vendorNumber);
			me.title.setValue(item.title);
			me.name.setValue(item.name);
			me.addressLine1.setValue(item.addressLine1);
			me.addressLine2.setValue(item.addressLine2);
			me.city.setValue(item.city);

			itemIndex = ii.ajax.util.findIndexById(item.stateType.toString(), me.stateTypes);
			if (itemIndex !== null)
				me.stateType.select(itemIndex, me.stateType.focused);

			me.zip.setValue(item.zip);
			me.contactName.setValue(item.contactName);
			me.email.setValue(item.email);
			me.faxNumber.setValue(item.faxNumber);
			me.phoneNumber.setValue(item.phoneNumber);
			me.trainStation.setValue(item.trainStation);
			me.groupKey.setValue(item.groupKey);
			me.paymentTerm.setValue(item.paymentTerm);
			me.accountNumber.setValue(item.accountNumber);
			me.memo.setValue(item.memo);
			me.minorityIndicator.setValue(item.minorityIndicator);
			me.consolidatedCode.setValue(item.consolidatedCode);
			me.consolidatedText.setValue(item.consolidatedText);
			me.categoryCode.setValue(item.categoryCode);
			me.categoryText.setValue(item.categoryText);
			me.nominatedCode.setValue(item.nominatedCode);
			me.nominatedText.setValue(item.nominatedText);
			me.paymentKeyTerms.setValue(item.paymentKeyTerms);
			me.businessType.setValue(item.businessType);
			me.country.setValue(item.country);
			me.name3.setValue(item.name3);
			me.name4.setValue(item.name4);
			me.blockCentralPosting.setValue(item.blockCentralPosting.toString());
			me.blockPayment.setValue(item.blockPayment.toString());
			me.blockPostingCompanyCode.setValue(item.blockPostingCompanyCode.toString());

			itemIndex = ii.ajax.util.findIndexById(item.sendMethodType.toString(), me.poSendMethodTypes);
			if (itemIndex !== null)
				me.sendMethodType.select(itemIndex, me.sendMethodType.focused);
			else
				me.sendMethodType.select(-1, me.sendMethodType.focused);

			for (var iIndex = 0; iIndex < me.selectVendorTypes.length; iIndex++) {
				if (me.selectVendorTypes[iIndex].value === item.nameSelectBy) {
					me.selectVendorBy.select(iIndex, me.selectVendorBy.focused);
					break;
				}
			}

			me.autoEmail.setValue(item.autoEmail.toString());
			me.active.setValue(item.active.toString());

			if (item.statusType === 6) {
				me.anchorSave.display(ui.cmn.behaviorStates.disabled);
				me.anchorUndo.display(ui.cmn.behaviorStates.disabled);
			}
			else {
				me.anchorSave.display(ui.cmn.behaviorStates.enabled);
				me.anchorUndo.display(ui.cmn.behaviorStates.enabled);
			}

			me.setStatus("Loaded");
		},

		actionCatlogItem: function() {

			top.ui.ctl.menu.Dom.me.items["pur"].items["cat"].select();
		},

		actionUndoItem: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			if (me.lastSelectedRowIndex >= 0) {
				me.vendorGrid.body.select(me.lastSelectedRowIndex);
				me.itemSelect(me.lastSelectedRowIndex);
			}
			else
				me.resetControls();

			me.setStatus("Loaded");
		},

		actionSaveItem: function() {
		    var me = this;
		    var sendMethodType = 0;

		    if (me.sendMethodType.indexSelected !== -1)
		         sendMethodType = me.sendMethodType.data[me.sendMethodType.indexSelected].id;

		    if (sendMethodType === 1) {
		        if (!(ui.cmn.text.validate.phone(me.faxNumber.getValue()))) {
		            alert("You cannot select the Send Method Type as 'Fax'. Fax Number is invalid and Fax Number needs to update in SAP.");
		            return;
		        }  
			}
		    else if (sendMethodType === 2) {
		        if (!(ui.cmn.text.validate.emailAddress(me.email.getValue()))) {
		            alert("You cannot select the Send Method Type as 'Email'. Email Id is invalid and Email Id needs to update in SAP.");
		            return;
		        }
		    }

			if (me.vendorsReadOnly || me.vendorGrid.activeRowIndex === -1)
				return false;

			me.validator.forceBlur();
			// Check to see if the data entered is valid
			if (!me.validator.queryValidity(true)) {
				alert("In order to save, the errors on the page must be corrected.");
				return false;
			}

			me.setStatus("Saving");

			$("#messageToUser").text("Saving");
			$("#pageLoading").fadeIn("slow");

			var item = new fin.pur.vendor.Vendor(
				me.vendorId
				, me.vendors[me.vendorGrid.activeRowIndex].statusType
				, me.vendorNumber.getValue()
				, me.title.getValue()
				, me.name.getValue()
				, me.addressLine1.getValue()
				, me.addressLine2.getValue()
				, me.city.getValue()
				, me.stateType.data[me.stateType.indexSelected].id
				, me.zip.getValue()
				, me.contactName.getValue()
				, me.email.getValue()
				, fin.cmn.text.mask.phone(me.phoneNumber.getValue(), true)
				, fin.cmn.text.mask.phone(me.faxNumber.getValue(), true)
				, me.trainStation.getValue()
				, me.groupKey.getValue()
				, me.paymentTerm.getValue()
				, me.accountNumber.getValue()
				, me.memo.getValue()
				, me.minorityIndicator.getValue()
				, me.consolidatedCode.getValue()
				, me.consolidatedText.getValue()
				, me.categoryCode.getValue()
				, me.categoryText.getValue()
				, me.nominatedCode.getValue()
				, me.nominatedText.getValue()
				, me.paymentKeyTerms.getValue()
				, me.businessType.getValue()
				, me.country.getValue()
				, me.name3.getValue()
				, me.name4.getValue()
				, me.blockCentralPosting.check.checked
				, me.blockPayment.check.checked
				, me.blockPostingCompanyCode.check.checked
				, me.sendMethodType.data[me.sendMethodType.indexSelected].id
				, me.autoEmail.check.checked
				, me.selectVendorBy.data[me.selectVendorBy.indexSelected].value
				, me.active.check.checked
				);

			var xml = me.saveXmlBuildItem(item);

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponseItem,
				referenceData: {me: me, item: item}
			});

			return true;
		},

		saveXmlBuildItem: function() {
			var args = ii.args(arguments,{
				item: {type: fin.pur.vendor.Vendor}
			});
			var item = args.item;
			var xml = "";

			xml += '<purVendor';
			xml += ' id="' + item.id + '"';
			xml += ' vendorNumber="' + ui.cmn.text.xml.encode(item.vendorNumber) + '"';
			xml += ' sendMethodType="' + item.sendMethodType + '"';
			xml += ' nameSelectBy="' + item.nameSelectBy + '"';
			xml += ' autoEmail="' + item.autoEmail + '"';
			xml += '/>';

			return xml;
		},

		saveResponseItem: function() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction}, // The transaction that was responded to.
				xmlNode: {type: "XmlNode:transaction"} // The XML transaction node associated with the response.
			});
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var status = $(args.xmlNode).attr("status");

			if (status == "success") {
				me.modified(false);

				$(args.xmlNode).find("*").each(function() {
					switch (this.tagName) {
						case "purVendor":
							if (item.statusType === 2 || item.statusType === 7) {
								me.resetControls();
								me.vendors.splice(me.lastSelectedRowIndex, 1);
								me.vendorGrid.setData(me.vendors);
								me.lastSelectedRowIndex = -1;
							}
							else {
								me.vendors[me.lastSelectedRowIndex] = item;
								me.vendorGrid.body.renderRow(me.lastSelectedRowIndex, me.lastSelectedRowIndex);
							}

							break;	
					}
				});

				me.setStatus("Saved");
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating Vendor details: " + $(args.xmlNode).attr("message"));
			}
			$("#pageLoading").fadeOut("slow");
		}
	}
});

function main() {
	fin.purVendorUi = new fin.pur.vendor.UserInterface();
	fin.purVendorUi.resize();
}