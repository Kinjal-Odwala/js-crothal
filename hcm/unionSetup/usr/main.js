ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.hcm.unionSetup.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.input", 3 );
ii.Style( "fin.cmn.usr.grid", 4 );
ii.Style( "fin.cmn.usr.dropDown", 5 );
ii.Style( "fin.cmn.usr.dateDropDown", 6 );
ii.Style( "fin.cmn.usr.button", 7 );
ii.Style( "fin.cmn.usr.theme", 8 );
ii.Style( "fin.cmn.usr.core", 9 );
ii.Style( "fin.cmn.usr.multiselect", 10 );

var importCompleted = false;
var iiScript;

iiScript = new ii.Script( "fin.cmn.usr.ui.core", function() { coreLoaded(); });

function coreLoaded() {
	iiScript = new ii.Script( "fin.cmn.usr.ui.widget", function() { widgetLoaded(); });
}

function widgetLoaded() {
	iiScript = new ii.Script( "fin.cmn.usr.multiselect", function() { importCompleted = true; });
}

ii.Class({
    Name: "fin.hcm.unionSetup.UserInterface",
    Definition: {
        init: function() {
            var me = this;

			me.formulaExpression = "";
			me.status = "";
			me.addParameter = true;
			me.addOperator = true;
			me.addAmount = true;
			me.lastSelectedRowIndex = -1;
			me.deductionType = 0;
			me.selectedPayCodes = [];

            me.gateway = ii.ajax.addGateway("hcm", ii.config.xmlProvider);
            me.cache = new ii.ajax.Cache(me.gateway);
			me.session = new ii.Session(me.cache);
            me.validator = new ui.ctl.Input.Validation.Master();

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\HouseCodeSetup\\HouseCodes";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.defineFormControls();
			me.configureCommunications();
			me.initialize();
			ui.cmn.behavior.disableBackspaceNavigation();

			$("#pageBody").show();
			$(window).bind("resize", me, me.resize );
			$(document).bind("keydown", me, me.controlKeyProcessor);
		},

		authorizationProcess: function() {
			var me = this;

			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);

			if (me.isAuthorized) {
				ii.timer.timing("Page displayed");
				me.session.registerFetchNotify(me.sessionLoaded, me);
				parent.fin.hcmMasterUi.setLoadCount();
				me.payCodeTypeStore.fetch("userId:[user]", me.payCodeTypesLoaded, me);
				me.deductionFrequencyTypeStore.fetch("userId:[user]", me.deductionFrequencyTypesLoaded, me);
				me.unionDeductionParameterStore.fetch("userId:[user]", me.unionDeductionParametersLoaded, me);
				me.unionDeductionStore.fetch("userId:[user],houseCodeId:" + parent.fin.hcmMasterUi.getHouseCodeId(), me.unionDeductionsLoaded, me);
			}
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";

			//UnionSetup
			me.unionSetupWrite = me.authorizer.isAuthorized(me.authorizePath + '\\Write');
			me.unionSetupReadOnly = me.authorizer.isAuthorized(me.authorizePath + '\\Read');

			me.tabUnionSetupShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabUnionSetup");
			me.tabUnionSetupWrite = me.authorizer.isAuthorized(me.authorizePath + "\\TabUnionSetup\\Write");
			me.tabUnionSetupReadOnly = me.authorizer.isAuthorized(me.authorizePath +"\\TabUnionSetup\\Read");

			me.resetUIElements();

			$("#pageLoading").hide();
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},

		sessionLoaded: function() {

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		resize: function() {
			var me = fin.hcmUnionSetupUi;

			me.unionDeductionGrid.setHeight($(window).height() - 65);
			$("#ContainerArea").height($(window).height() - 110);
		},

		controlKeyProcessor: function() {
			var args = ii.args(arguments, {
				event: {
					type: Object
				}
			});
			var event = args.event;
			var processed = false;

			if (event.ctrlKey) {
				if (event.keyCode === 83) { // Ctrl+S
					parent.fin.hcmMasterUi.actionSaveItem();
					processed = true;
				}
				else if (event.keyCode === 85) { // Ctrl+U
					parent.fin.hcmMasterUi.actionUndoItem();
					processed = true;
				}
			}

			if (processed) {
				return false;
			}
		},

		isCtrlVisible: function() {
			var me = this;

			if (me.unionSetupWrite || me.unionSetupReadOnly)
				return true;
			else if (me.tabUnionSetupShow || me.tabUnionSetupWrite || me.tabUnionSetupReadOnly)
				return true;
			else
				return false;
		},

		isCtrlReadOnly: function() {
			var me = this;

			if (me.tabUnionSetupWrite && !me.tabUnionSetupReadOnly && !me.unionSetupReadOnly)
				return false;

			if (me.tabUnionSetupWrite && !me.unionSetupReadOnly)
				return false;

			if (me.unionSetupWrite)
				return false;

			return (me.unionSetupReadOnly || me.tabUnionSetupReadOnly);
		},

		resetUIElements: function() {
			var me = this;
			var ctrlVisible = me.isCtrlVisible();
			var ctrlReadOnly = me.isCtrlReadOnly();

			me.setControlState("DeductionType", ctrlReadOnly, ctrlVisible, "Radio", "DeductionTypeRadio");
			me.setControlState("PayCodeType", ctrlReadOnly, ctrlVisible, "MultiSelect", "");
			me.setControlState("PayRate", ctrlReadOnly, ctrlVisible);
			me.setControlState("PayType", ctrlReadOnly, ctrlVisible);
			me.setControlState("DeductionFrequency", ctrlReadOnly, ctrlVisible);
			me.setControlState("ProbationaryPeriod", ctrlReadOnly, ctrlVisible);
			me.setControlState("MinimumDeductionAmount", ctrlReadOnly, ctrlVisible);
			me.setControlState("MaximumDeductionAmount", ctrlReadOnly, ctrlVisible);
			me.setControlState("StartDate", ctrlReadOnly, ctrlVisible);
			me.setControlState("EndDate", ctrlReadOnly, ctrlVisible);
			me.setControlState("Parameter", ctrlReadOnly, ctrlVisible);
			me.setControlState("Operator", ctrlReadOnly, ctrlVisible);
			me.setControlState("Amount", ctrlReadOnly, ctrlVisible);
			me.setControlState("Formula", ctrlReadOnly, ctrlVisible);
			me.setControlState("Percentage", ctrlReadOnly, ctrlVisible, "Check", "PercentageCheck");
			me.setControlState("Active", ctrlReadOnly, ctrlVisible, "Check", "ActiveCheck");

			if (ctrlReadOnly) {
				me.anchorNew.display(ui.cmn.behaviorStates.disabled);
				me.anchorSave.display(ui.cmn.behaviorStates.disabled);
				$("#AddParameter").hide();
				$("#AddOperator").hide();
				$("#AddAmount").hide();
				$("#ResetFormula").hide();
			}
		},

		setControlState: function() {
			var args = ii.args(arguments, {
				ctrlName: {type: String},
				ctrlReadOnly: {type: Boolean},
				ctrlShow: {type: Boolean, required: false, defaultValue: false},
				ctrlType: {type: String, required: false, defaultValue: ""},
				ctrlDiv: {type: String, required: false}
			});

			if (args.ctrlReadOnly && args.ctrlType !== "Radio" && args.ctrlType !== "Check") {
				$("#" + args.ctrlName + "Text").attr('disabled', true);
				$("#" + args.ctrlName + "Action").removeClass("iiInputAction");
			}

			if (!args.ctrlShow && args.ctrlType !== "Radio" && args.ctrlType !== "Check") {
				$("#" + args.ctrlName).hide();
				$("#" + args.ctrlName + "Text").hide();
			}

			if (args.ctrlReadOnly && args.ctrlType === "Radio" && args.ctrlName === "DeductionType") {
				$("#" + args.ctrlName + "FlatDollar").attr('disabled', true);
				$("#" + args.ctrlName + "Percentage").attr('disabled', true);
				$("#" + args.ctrlName + "Formula").attr('disabled', true);
			}

			if (args.ctrlReadOnly && args.ctrlType === "MultiSelect") {
				$("#" + args.ctrlName).multiselect().multiselect("disable");
			}

			if (args.ctrlReadOnly && args.ctrlType === "Check") {
				$("#" + args.ctrlName + "Check").attr('disabled', true);
			}

			if (!args.ctrlShow && (args.ctrlType === "Radio" || args.ctrlType === "Check")) {
				$("#" + args.ctrlDiv).hide();
			}
		},

		defineFormControls: function() {
			var me = this;

			me.unionDeductionGrid = new ui.ctl.Grid({
				id: "UnionDeductionGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function( index ) { me.itemSelect(index); }
			});

			me.unionDeductionGrid.addColumn("deductionType", "deductionType", "Deduction Type", "Deduction Type", null, function( type ) {
				if (type === 1)
					return "Flat Dollar";
				else if (type === 2)
					return "Percentage";
				else if (type === 3)
					return "Formula";
			});
			me.unionDeductionGrid.addColumn("payType", "payType", "Pay Type", "Pay Type", 150, function( type ) {
				if (type === 1)
					return "Part Time";
				else if (type === 2)
					return "Full Time";
			});
			me.unionDeductionGrid.capColumns();

			$("#PayCodeType").multiselect({
				minWidth: 350
				, header: false
				, noneSelectedText: ""
				, selectedList: 4
				, click: function() { parent.fin.hcmMasterUi.modified(true); }
			});

			me.payRate = new ui.ctl.Input.Text({
		        id: "PayRate",
		        maxLength: 11,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });

			me.payRate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.payRate.getValue();

					if (enteredText === "")
						return;

					if (!(/^\d{1,8}(\.\d{1,2})?$/.test(enteredText)))
						this.setInvalid("Please enter valid Pay Rate. Example: 9.99");
				});

			me.payType = new ui.ctl.Input.DropDown.Filtered({
		        id: "PayType",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); },
		        required: false
		    });

			me.payType.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.payType.indexSelected === -1)
						this.setInvalid("Please select Pay Type.");
				});

			me.deductionFrequency = new ui.ctl.Input.DropDown.Filtered({
		        id: "DeductionFrequency",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); },
		        required: false
		    });

			me.deductionFrequency.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.deductionFrequency.indexSelected === -1)
						this.setInvalid("Please select Deduction Frequency.");
				});

			me.probationaryPeriod = new ui.ctl.Input.Text({
		        id: "ProbationaryPeriod",
		        maxLength: 3,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });

			me.probationaryPeriod.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.probationaryPeriod.getValue();

					if (enteredText === "")
						return;

					if (!(/^\d+$/.test(enteredText)))
						this.setInvalid("Please enter valid Probationary Period.");
				});

			me.minimumDeductionAmount = new ui.ctl.Input.Text({
		        id: "MinimumDeductionAmount",
		        maxLength: 11,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });

			me.minimumDeductionAmount.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.minimumDeductionAmount.getValue();

					if (enteredText === "")
						return;

					if (!(/^\d{1,8}(\.\d{1,2})?$/.test(enteredText)))
						this.setInvalid("Please enter valid Minimum Deduction Amount. Example: 9.99");
				});

			me.maximumDeductionAmount = new ui.ctl.Input.Text({
		        id: "MaximumDeductionAmount",
		        maxLength: 11,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });

			me.maximumDeductionAmount.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.maximumDeductionAmount.getValue();

					if (enteredText === "")
						return;

					if (!(/^\d{1,8}(\.\d{1,2})?$/.test(enteredText)))
						this.setInvalid("Please enter valid Maximum Deduction Amount. Example: 9.99");
					else {
						if (parseFloat(enteredText) <= parseFloat(me.minimumDeductionAmount.getValue()))
							this.setInvalid("Maximum Deduction Amount should not be less than Minimum Deduction Amount (" + me.minimumDeductionAmount.getValue() + ")");
					}
				});

			me.startDate = new ui.ctl.Input.Date({
		        id: "StartDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); },
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });

			me.startDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.startDate.text.value;

					if (enteredText === "")
						return;

					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid Start Date.");
				});

			me.endDate = new ui.ctl.Input.Date({
		        id: "EndDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); },
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });

			me.endDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.endDate.text.value;

					if (enteredText === "")
						return;

					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid End Date.");
					else {
						if (new Date(enteredText) < new Date(me.startDate.text.value))
							this.setInvalid("End Date should not be less than Start Date (" + me.startDate.text.value + ")");
					}
				});

			me.parameter = new ui.ctl.Input.DropDown.Filtered({
		        id: "Parameter",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); },
		        required: false
		    });

			me.parameter.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					if (me.parameter.lastBlurValue !== "" && me.parameter.indexSelected === -1)
						this.setInvalid("Please select the Parameter.");
				});

			me.operator = new ui.ctl.Input.DropDown.Filtered({
		        id: "Operator",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); },
		        required: false
		    });

			me.operator.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					if (me.operator.lastBlurValue !== "" && me.operator.indexSelected === -1)
						this.setInvalid("Please select the Operator.");
				});

			me.amount = new ui.ctl.Input.Text({
		        id: "Amount",
				maxLength: 6,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });

			me.amount.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.amount.getValue();

					if (enteredText === "")
						return;

					if (!(/^\d{1,3}(\.\d{1,2})?$/.test(enteredText)))
						this.setInvalid("Please enter valid Amount. Example: 9.99");
				});

			me.formula = new ui.ctl.Input.Text({
		        id: "Formula",
		        maxLength: 256,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });

			me.formula.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.formula.getValue();

					if (enteredText === "")
						return;

					if ($("input[name='DeductionType']:checked").val() === "3" && !me.validateFormula())
						this.setInvalid("Invalid formula.");
				});

			me.formula.text.readOnly = true;

			me.percentage = new ui.ctl.Input.Check({
		        id: "Percentage",
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });

			me.active = new ui.ctl.Input.Check({
		        id: "Active",
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });

			me.anchorNew = new ui.ctl.buttons.Sizeable({
				id: "AnchorNew",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;New&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionNewItem(); },
				hasHotState: true
			});

			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem(); },
				hasHotState: true
			});

			$("#PayCodeType")[0].tabIndex = 4;
			me.payRate.text.tabIndex = 5;
			me.payType.text.tabIndex = 6;
			me.deductionFrequency.text.tabIndex = 7;
			me.probationaryPeriod.text.tabIndex = 8;
			me.minimumDeductionAmount.text.tabIndex = 9;
			me.maximumDeductionAmount.text.tabIndex = 10;
			me.startDate.text.tabIndex = 11;
			me.endDate.text.tabIndex = 12;
			me.parameter.text.tabIndex = 13;
			me.operator.text.tabIndex = 14;
			me.amount.text.tabIndex = 15;
			me.percentage.check.tabIndex = 16;
			me.formula.text.tabIndex = 17;
			me.active.check.tabIndex = 18;
		},

		configureCommunications: function() {
			var me = this;

			me.payCodeTypes = [];
			me.payCodeTypeStore = me.cache.register({
				storeId: "payCodes",
				itemConstructor: fin.hcm.unionSetup.PayCodeType,
				itemConstructorArgs: fin.hcm.unionSetup.payCodeTypeArgs,
				injectionArray: me.payCodeTypes
			});

			me.deductionFrequencyTypes = [];
			me.deductionFrequencyTypeStore = me.cache.register({
				storeId: "deductionFrequencyTypes",
				itemConstructor: fin.hcm.unionSetup.DeductionFrequencyType,
				itemConstructorArgs: fin.hcm.unionSetup.deductionFrequencyTypeArgs,
				injectionArray: me.deductionFrequencyTypes
			});

			me.unionDeductionParameters = [];
			me.unionDeductionParameterStore = me.cache.register({
				storeId: "unionDeductionParameters",
				itemConstructor: fin.hcm.unionSetup.DeductionParameter,
				itemConstructorArgs: fin.hcm.unionSetup.deductionParameterArgs,
				injectionArray: me.unionDeductionParameters
			});

			me.unionDeductions = [];
			me.unionDeductionStore = me.cache.register({
				storeId: "houseCodeUnionDeductions",
				itemConstructor: fin.hcm.unionSetup.UnionDeduction,
				itemConstructorArgs: fin.hcm.unionSetup.unionDeductionArgs,
				injectionArray: me.unionDeductions
			});

			me.unionDeductionPayCodes = [];
			me.unionDeductionPayCodeStore = me.cache.register({
				storeId: "houseCodeUnionDeductionPayCodes",
				itemConstructor: fin.hcm.unionSetup.UnionDeductionPayCode,
				itemConstructorArgs: fin.hcm.unionSetup.unionDeductionPayCodeArgs,
				injectionArray: me.unionDeductionPayCodes
			});
		},

		initialize: function() {
			var me = this;

			$("input[name='DeductionType']").change(function() { parent.fin.hcmMasterUi.modified(true); });
			$("#AddParameter").bind("click", function() { me.actionAddParameterItem(); });
			$("#AddOperator").bind("click", function() { me.actionAddOperatorItem(); });
			$("#AddAmount").bind("click", function() { me.actionAddAmountItem(); });
			$("#ResetFormula").bind("click", function() { me.actionResetFormulaItem(); });
			$("#PayCodeType").multiselect("uncheckAll");
			$("input[name='DeductionType'][value='1']").attr('checked', true);

			me.payTypes = [];
			me.operatorTypes = [];

			me.payTypes.push(new fin.hcm.unionSetup.PayType({ id: 1, name: "Part Time" }));
			me.payTypes.push(new fin.hcm.unionSetup.PayType({ id: 2, name: "Full Time" }));

			me.operatorTypes.push(new fin.hcm.unionSetup.OperatorType({ id: 1, brief: " + ", name: "+ (Addition)" }));
			me.operatorTypes.push(new fin.hcm.unionSetup.OperatorType({ id: 2, brief: " - ", name: "- (Subtraction)" }));
			me.operatorTypes.push(new fin.hcm.unionSetup.OperatorType({ id: 3, brief: " * ", name: "* (Multiplication) " }));
			me.operatorTypes.push(new fin.hcm.unionSetup.OperatorType({ id: 4, brief: " / ", name: "/ (Division)" }));
			me.operatorTypes.push(new fin.hcm.unionSetup.OperatorType({ id: 5, brief: " (", name: "( (Open Bracket)" }));
			me.operatorTypes.push(new fin.hcm.unionSetup.OperatorType({ id: 6, brief: ") ", name: ") (Close Bracket)" }));

			me.payType.setData(me.payTypes);
			me.operator.setData(me.operatorTypes);
		},

		resizeControls: function() {
			var me = this;

			me.payRate.resizeText();
			me.payType.resizeText();
			me.deductionFrequency.resizeText();
			me.probationaryPeriod.resizeText();
			me.minimumDeductionAmount.resizeText();
			me.maximumDeductionAmount.resizeText();
			me.startDate.resizeText();
			me.endDate.resizeText();
			me.parameter.resizeText();
			me.operator.resizeText();
			me.amount.resizeText();
			me.formula.resizeText();
		},

		resetControls: function() {
			var me = this;

			$("input[name='DeductionType'][value='1']").attr('checked', true);
			$("#PayCodeType").multiselect("uncheckAll");
			me.validator.reset();
			me.payRate.setValue("");
			me.payType.reset();
			me.payType.updateStatus();
			me.deductionFrequency.reset();
			me.deductionFrequency.updateStatus();
			me.probationaryPeriod.setValue("");
			me.minimumDeductionAmount.setValue("");
			me.maximumDeductionAmount.setValue("");
			me.startDate.setValue("");
			me.endDate.setValue("");
			me.parameter.reset();
			me.parameter.updateStatus();
			me.operator.reset();
			me.operator.updateStatus();
			me.amount.setValue("");
			me.percentage.setValue("true");
			me.formula.setValue("");
			me.active.setValue("true");
			me.assignValue();
			me.unionDeductionPayCodeStore.reset();
		},

		payCodeTypesLoaded: function(me, activeId) {

			$("#PayCodeType").html("");
			for (var index = 0; index < me.payCodeTypes.length; index++) {
				$("#PayCodeType").append("<option title='" + me.payCodeTypes[index].name + "' value='" + me.payCodeTypes[index].id + "'>" + me.payCodeTypes[index].brief + " - " + me.payCodeTypes[index].name + "</option>");
			}
			$("#PayCodeType").multiselect("refresh");
		},

		deductionFrequencyTypesLoaded: function(me, activeId) {

			me.deductionFrequency.setData(me.deductionFrequencyTypes);
		},

		unionDeductionParametersLoaded: function(me, activeId) {

			me.parameter.setData(me.unionDeductionParameters);
		},

		unionDeductionsLoaded: function(me, activeId) {

			if (parent.fin.hcmMasterUi === undefined || parent.fin.hcmMasterUi.houseCodeDetails[0] === undefined)
				return;

			me.unionDeductionGrid.setData(me.unionDeductions);
			parent.fin.hcmMasterUi.checkLoadCount();
			if (parent.parent.fin.appUI.modified)
				parent.fin.hcmMasterUi.setStatus("Edit");
			me.resizeControls();
		},

		itemSelect: function() {
			var args = ii.args(arguments, {
				index: {type: Number}
			});
			var me = this;
			var index = args.index;
			var item = me.unionDeductionGrid.data[index];

			me.lastSelectedRowIndex = index;
			me.status = "";
			$("input[name='DeductionType'][value='" + item.deductionType + "']").attr('checked', true);
			me.payRate.setValue(item.payRate);

			var itemIndex = ii.ajax.util.findIndexById(item.payType.toString(), me.payTypes);
			if (itemIndex >= 0 && itemIndex !== undefined)
				me.payType.select(itemIndex, me.payType.focused);

			itemIndex = ii.ajax.util.findIndexById(item.deductionFrequency.toString(), me.deductionFrequencyTypes);
			if (itemIndex >= 0 && itemIndex !== undefined)
				me.deductionFrequency.select(itemIndex, me.deductionFrequency.focused);

			me.probationaryPeriod.setValue(item.probationaryPeriod);
			me.minimumDeductionAmount.setValue(item.minimumDeductionAmount);
			me.maximumDeductionAmount.setValue(item.maximumDeductionAmount);
			me.startDate.setValue(item.startDate);
			me.endDate.setValue(item.endDate);
			me.formula.setValue(item.formula);
			me.active.setValue(item.active.toString());
			me.assignValue();
			parent.fin.hcmMasterUi.setLoadCount();
			me.unionDeductionPayCodeStore.fetch("userId:[user],unionDeductionId:" + item.id, me.unionDeductionPayCodesLoaded, me);
		},

		unionDeductionPayCodesLoaded: function(me, activeId) {

			var payCodesTemp = [];
			for (var index = 0; index < me.unionDeductionPayCodes.length; index++) {
				payCodesTemp.push(me.unionDeductionPayCodes[index].payCodeId.toString());
			}

			$("#PayCodeType").multiselect("uncheckAll");
			$("#PayCodeType").multiselect("widget").find(":checkbox").each(function() {
		 		if ($.inArray(this.value, payCodesTemp) >= 0) {
		 			this.click();
		 		}
			});
			parent.fin.hcmMasterUi.checkLoadCount();
		},

		assignValue: function() {
			var me = this;

			me.deductionType = parseInt($("input[name='DeductionType']:checked").val(), 10);

			if (me.deductionType === 3) {
				$("#FormulaContainer").show();
				me.parameter.resizeText();
				me.operator.resizeText();
				me.amount.resizeText();
				me.formula.resizeText();
			}
			else {
				$("#FormulaContainer").hide();
				me.parameter.reset();
				me.parameter.updateStatus();
				me.operator.reset();
				me.operator.updateStatus();
				me.amount.setValue("");
				me.percentage.setValue("true");
				me.formula.setValue("");
			}
		},

		actionAddParameterItem: function() {
			var me = this;

			if (me.addParameter && me.parameter.indexSelected !== -1) {
				me.formulaExpression = me.formulaExpression + "1";
				me.formula.setValue(me.formula.getValue() + me.unionDeductionParameters[me.parameter.indexSelected].brief);
				me.validateFormula();
				me.addParameter = false;
				me.addAmount = false;
				me.addOperator = true;
			}
		},

		actionAddOperatorItem: function() {
			var me = this;

			if (me.addOperator && me.operator.indexSelected !== -1) {
				me.formulaExpression = me.formulaExpression + me.operatorTypes[me.operator.indexSelected].brief;
				me.formula.setValue(me.formula.getValue() + me.operatorTypes[me.operator.indexSelected].brief);
				me.validateFormula();
				me.addParameter = true;
				me.addOperator = false;
				me.addAmount = true;
			}
		},

		actionAddAmountItem: function() {
			var me = this;
			var amount = "";

			if (me.addAmount && me.amount.validate(true) && me.amount.getValue() !== "" && parseFloat(me.amount.getValue()) > 0) {
				if (me.percentage.check.checked)
					amount = parseFloat(me.amount.getValue()) / 100;
				else
					amount = me.amount.getValue();
				me.formulaExpression = me.formulaExpression + amount;
				me.formula.setValue(me.formula.getValue() + amount);
				me.validateFormula();
				me.addParameter = false;
				me.addOperator = true;
				me.addAmount = false;
			}
		},

		actionResetFormulaItem: function() {
			var me = this;

			me.formula.setValue("");
			me.formulaExpression = "";
			me.addParameter = true;
			me.addOperator = true;
			me.addAmount = true;
		},

		validateFormula: function() {
			var me = this;
			var valid = true;

			try {
				eval(me.formulaExpression);
			}
			catch(err) {
				valid = false;
			}

			if (valid) {
				me.formula.valid = true;
			}
			else {
				me.formula.setInvalid("Invalid formula");
			}

			return valid;
		},

		actionNewItem: function() {
			var me = this;

			me.unionDeductionGrid.body.deselectAll();
			me.resetControls();
			me.status = "New";
		},

		actionSaveItem: function() {

			parent.fin.hcmMasterUi.actionSaveItem();
		},

		validateControls: function() {
			var me = this;

			me.selectedPayCodes = $("#PayCodeType").multiselect("getChecked").map(function() {
				return this.value;
			}).get();

			// Check to see if the data entered is valid
			me.validator.forceBlur();
			me.validator.queryValidity(true);
		},

		updateUnionDeduction: function(id) {
			var me = this;
			var item = new fin.hcm.unionSetup.UnionDeduction(
				(me.status === "New" ? id : me.unionDeductionGrid.data[me.unionDeductionGrid.activeRowIndex].id)
				, parent.fin.hcmMasterUi.getHouseCodeId()
				, me.deductionType
				, me.payRate.getValue()
				, me.payTypes[me.payType.indexSelected].id
				, me.deductionFrequencyTypes[me.deductionFrequency.indexSelected].id
				, me.probationaryPeriod.getValue()
				, me.minimumDeductionAmount.getValue()
				, me.maximumDeductionAmount.getValue()
				, me.startDate.lastBlurValue
				, me.endDate.lastBlurValue
				, me.formula.getValue()
				, me.active.check.checked
			);

			if (me.status === "New") {
				me.unionDeductions.push(item);
				me.lastSelectedRowIndex = me.unionDeductions.length - 1;
				me.unionDeductionGrid.setData(me.unionDeductions);
				me.unionDeductionGrid.body.select(me.lastSelectedRowIndex);
			}
			else {
				me.unionDeductions[me.lastSelectedRowIndex] = item;
				me.unionDeductionGrid.body.renderRow(me.lastSelectedRowIndex, me.lastSelectedRowIndex);
				me.unionDeductionPayCodeStore.reset();
				me.unionDeductionPayCodeStore.fetch("userId:[user],unionDeductionId:" + item.id, me.unionDeductionPayCodesLoaded, me);
			}

			me.status = "";
		}
	}
});

function main() {
	var intervalId = setInterval(function() {
		if (importCompleted) {
			clearInterval(intervalId);
			fin.hcmUnionSetupUi = new fin.hcm.unionSetup.UserInterface();
			fin.hcmUnionSetupUi.resize();
		}
	}, 100);
}