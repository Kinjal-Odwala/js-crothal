ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.defs" );
ii.Import( "fin.rev.unappliedCash.usr.defs" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.input", 4 );
ii.Style( "fin.cmn.usr.grid", 5 );
ii.Style( "fin.cmn.usr.button", 6 );

ii.Class({
    Name: "fin.rev.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
    Definition: {

		init: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.loadCount = 0;

			me.gateway = ii.ajax.addGateway("rev", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\AccountsReceivable\\UnappliedCash";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.defineFormControls();
			me.configureCommunications();
			me.setStatus("Loading");
			
			$(window).bind("resize", me, me.resize);
			
			me.houseCodeSearch = new ui.lay.HouseCodeSearch();
			if (!parent.fin.appUI.houseCodeId) parent.fin.appUI.houseCodeId = 0;	
			if (parent.fin.appUI.houseCodeId == 0) //usually happens on pageLoad			
				me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
			else
				me.houseCodesLoaded(me, 0);

			ui.cmn.behavior.disableBackspaceNavigation();
		},
		
		authorizationProcess: function fin_rev_unappliedCash_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			me.isAuthorized = me.authorizer.isAuthorized(me.authorizePath);

			if (me.isAuthorized) {
				$("#pageLoading").css({
					"opacity": "0.5",
					"background-color": "black"
				});
				$("#messageToUser").css({ "color": "white" });
				$("#imgLoading").attr("src", "/fin/cmn/usr/media/Common/loadingwhite.gif");
				ii.timer.timing("Page displayed");
				me.session.registerFetchNotify(me.sessionLoaded, me);
			}
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},	

		sessionLoaded: function fin_rev_unappliedCash_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		resize: function() {
			var args = ii.args(arguments,{});

			if (!fin.unappliedCashUi) return;

		    fin.unappliedCashUi.unappliedCashGrid.setHeight($(window).height() - 110);
		},

		defineFormControls: function() {			
			var me = this;

			me.customer = new ui.ctl.Input.Text({
				id: "Customer", 
				required: false
		    });

			me.customer.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

					if ($("#SearchByCustomer")[0].checked && me.customer.getValue().length < 3)
						this.setInvalid("Please enter Customer # or Title (minimum 3 characters).");
				});

			me.anchorSearch = new ui.ctl.buttons.Sizeable({
				id: "AnchorSearch",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Search&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionLoadUnappliedCashes(); },
				hasHotState: true
			});

			me.unappliedCashGrid = new ui.ctl.Grid({
				id: "UnappliedCashGrid",
				appendToId: "divForm",
				allowAdds: false
			});

			me.unappliedCashGrid.addColumn("houseCodeTitle", "houseCodeTitle", "House Code", "House Code", 200);
			me.unappliedCashGrid.addColumn("customer", "customer", "Customer", "Customer", 200);
			me.unappliedCashGrid.addColumn("documentNumber", "documentNumber", "Document Number", "Document Number", 140);
			me.unappliedCashGrid.addColumn("receiptDate", "receiptDate", "Cash Receipt Date", "Cash Receipt Date", 140);
			me.unappliedCashGrid.addColumn("grossAmount", "grossAmount", "Gross Amount", "Gross Amount", 120);
			me.unappliedCashGrid.addColumn("openAmount", "openAmount", "Open Amount", "Open Amount", 120);
			me.unappliedCashGrid.addColumn("receiptItems", "receiptItems", "Receipt Items", "Receipt Items", null);
			me.unappliedCashGrid.capColumns();

			$("#CustomerText").bind("keydown", me, me.actionSearchItem);
			$("#SearchByHouseCode").click(function() {
				me.validator.reset();
				me.customer.setValue("");
			});
		},

		resizeControls: function() {
			var me = this;

			me.customer.resizeText();
			me.resize();
		},

		configureCommunications: function fin_rev_unappliedCash_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;

			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.rev.unappliedCash.HirNode,
				itemConstructorArgs: fin.rev.unappliedCash.hirNodeArgs,
				injectionArray: me.hirNodes
			});

			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.rev.unappliedCash.HouseCode,
				itemConstructorArgs: fin.rev.unappliedCash.houseCodeArgs,
				injectionArray: me.houseCodes
			});

			me.unappliedCashes = [];
			me.unappliedCashStore = me.cache.register({
				storeId: "revUnappliedCashes",
				itemConstructor: fin.rev.unappliedCash.UnappliedCash,
				itemConstructorArgs: fin.rev.unappliedCash.unappliedCashArgs,
				injectionArray: me.unappliedCashes
			});			
		},

		setStatus: function(status) {
			var me = this;

			fin.cmn.status.setStatus(status);
		},

		setLoadCount: function(me, activeId) {
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

		houseCodesLoaded: function(me, activeId) {

			if (parent.fin.appUI.houseCodeId == 0) {
				if (me.houseCodes.length <= 0) {				
					return me.houseCodeSearchError();
				}
				me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
			}

			me.houseCodeGlobalParametersUpdate(false);
			me.resizeControls();	
			me.actionLoadUnappliedCashes();
		},

		houseCodeChanged: function() {
			var args = ii.args(arguments,{});
			var me = this;

			if (parent.fin.appUI.houseCodeId <= 0) return;

			me.actionLoadUnappliedCashes();
		},

		actionSearchItem: function() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});
			var event = args.event;
			var me = event.data;

			if (event.keyCode == 13) {
				me.actionLoadUnappliedCashes();
			}
		},
		
		actionLoadUnappliedCashes: function() {
			var me = this;

			me.validator.forceBlur();

			// Check to see if the data entered is valid
		    if (!me.validator.queryValidity(true)) {
				alert("In order to search, the errors on the page must be corrected.");
				return false;
			}	

			if ($("#SearchByHouseCode")[0].checked && $("#houseCodeText").val() == "") {
				alert("Please enter the House Code.")
				return false;
			}

			me.setLoadCount();
			me.unappliedCashStore.reset();
			me.unappliedCashStore.fetch("userId:[user]"
				+ ",houseCodeId:" + ($("#SearchByHouseCode")[0].checked ? parent.fin.appUI.houseCodeId : "0")
				+ ",customer:" + ($("#SearchByCustomer")[0].checked ? me.customer.getValue() : "")
				, me.unappliedCashLoaded, me);
		},

		unappliedCashLoaded: function(me, activeId) {

			me.unappliedCashGrid.setData(me.unappliedCashes);
			me.checkLoadCount();
  		}
	}
});

function main() {
	fin.unappliedCashUi = new fin.rev.UserInterface();
	fin.unappliedCashUi.resize();
	fin.houseCodeSearchUi = fin.unappliedCashUi;
}