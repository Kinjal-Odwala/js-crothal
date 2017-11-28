ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.ctl.usr.statusBar" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.cmn.usr.defs" );
ii.Import( "fin.emp.userSearch.usr.defs" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.grid", 6 );
ii.Style( "fin.cmn.usr.button", 7 );
ii.Style( "fin.cmn.usr.dropDown", 8 );

ii.Class({
    Name: "fin.emp.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
	Definition: {

		init: function() {
			var me = this;

			me.sortSelections = [];
			me.loadCount = 0;

			if (!parent.fin.appUI.houseCodeId)
				parent.fin.appUI.houseCodeId = 0;

			me.gateway = ii.ajax.addGateway("emp", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);
			me.houseCodeSearch = new ui.lay.HouseCodeSearch();

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Setup\\Users";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.setStatus("Loading");
			me.defineFormControls();
			me.configureCommunications();
			me.initialize();
			ui.cmn.behavior.disableBackspaceNavigation();
			$(window).bind("resize", me, me.resize);
		},

		authorizationProcess: function() {
			var me = this;

			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);

			if (me.isAuthorized) {
				$("#pageLoading").hide();
				$("#pageLoading").css({
					"opacity": "0.5",
					"background-color": "black"
				});
				$("#messageToUser").css({ "color": "white" });
				$("#imgLoading").attr("src", "/fin/cmn/usr/media/Common/loadingwhite.gif");
				$("#pageLoading").fadeIn("slow");

				if (parent.fin.appUI.houseCodeId === 0)
					me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
				else
					me.houseCodesLoaded(me, 0);

				ii.timer.timing("Page displayed");
				me.session.registerFetchNotify(me.sessionLoaded, me);
			}
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},

		sessionLoaded: function() {

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		resize: function() {

		    fin.empSearchUi.userGrid.setHeight($(window).height() - 125);
		},

		defineFormControls: function() {
			var me = this;

			me.searchInput = new ui.ctl.Input.Text({
				id: "SearchInput",
				maxLength: 50
			});

			me.filterType = new ui.ctl.Input.DropDown.Filtered({
				id: "FilterType",
				formatFunction: function( type ) { return type.name; },
				required: false
		    });

			me.statusType = new ui.ctl.Input.DropDown.Filtered( {
				id: "StatusType",
				formatFunction: function( type ) { return type.name; },
				required: false
		    });

			me.anchorSearch = new ui.ctl.buttons.Sizeable({
				id: "AnchorSearch",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Search&nbsp;&nbsp;</span>",
				clickFunction: function() { me.loadSearchResults(); },
				hasHotState: true
			});

			me.anchorNew = new ui.ctl.buttons.Sizeable({
				id: "AnchorNew",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;&nbsp;New&nbsp;&nbsp;&nbsp;</span>",
				clickFunction: function() { me.loadNewUser(); },
				hasHotState: true
			});

			me.userGrid = new ui.ctl.Grid({
				id: "UserGrid",
				appendToId: "divForm",
				allowAdds: false
			});

			me.userGrid.addColumn("firstName", "firstName", "First Name", "First Name", 200).setSortFunction(function(me, displayProperty, a, b) {
				return fin.empSearchUi.customSort(me, displayProperty, a, b);
			});
			me.userGrid.addColumn("lastName", "lastName", "Last Name", "Last Name", 200).setSortFunction(function(me, displayProperty, a, b) {
				return fin.empSearchUi.customSort(me, displayProperty, a, b);
			});
			me.userGrid.addColumn("userName", "userName", "User Name", "User Name", 200);
			me.userGrid.addColumn("houseCodeTitle", "houseCodeTitle", "House Code", "House Code", null);
			me.userGrid.capColumns();

			$("#SearchInputText").bind("keydown", me, me.actionSearchItem);
			$("#FilterTypeText").bind("keydown", me, me.actionSearchItem);
			$("#StatusTypeText").bind("keydown", me, me.actionSearchItem);
			$("#UserGrid").bind("dblclick", me, me.showUserDetails);
		},

		configureCommunications: function() {
			var me = this;

			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.emp.HirNode,
				itemConstructorArgs: fin.emp.hirNodeArgs,
				injectionArray: me.hirNodes
			});

			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.emp.HouseCode,
				itemConstructorArgs: fin.emp.houseCodeArgs,
				injectionArray: me.houseCodes
			});

			me.users = [];
			me.userStore = me.cache.register({
				storeId: "userSearchs",
				itemConstructor: fin.emp.User,
				itemConstructorArgs: fin.emp.userArgs,
				injectionArray: me.users
			});
		},

		setStatus: function(status) {

			fin.cmn.status.setStatus(status);
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
			if (me.loadCount <= 0 ) {
				me.setStatus("Loaded");
				$("#pageLoading").fadeOut("slow");
			}
		},

 		resizeControls: function() {
			var me = this;

			me.searchInput.resizeText();
			me.filterType.resizeText();
			me.statusType.resizeText();
		},

		initialize: function() {
			var me = this;

			me.filterTypes = [];
			me.statusTypes = [];
			me.filterTypes.push({id: 0, name: "All"});
			me.filterTypes.push({id: 1, name: "Name"});
			me.filterTypes.push({id: 2, name: "User Name"});
			me.filterType.setData(me.filterTypes);
			me.filterType.select(0, me.filterType.focused);

			me.statusTypes.push({id: 0, name: "None"});
			me.statusTypes.push({id: 1, name: "Active"});
			me.statusType.setData(me.statusTypes);
			me.statusType.select(0, me.statusType.focused);
		},

		customSort: function(me, dataProperty, a, b) {
			var aValue = a[dataProperty];
			var bValue = b[dataProperty];

			if (aValue.toLowerCase() < bValue.toLowerCase()) {
				return -1;
			}
			else if(aValue.toLowerCase() > bValue.toLowerCase()) {
				return 1;
			}
			return 0;
		},

		houseCodesLoaded: function(me, activeId) {

			if (parent.fin.appUI.houseCodeId === 0) {
				if (me.houseCodes.length <= 0) {
					return me.houseCodeSearchError();
				}

				me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
			}

			me.houseCodeGlobalParametersUpdate(false);
			me.resizeControls();
			me.searchInput.text.focus();
			me.setStatus("Loaded");
			$("#pageLoading").fadeOut("slow");
		},

		loadSearchResults: function() {
			var me = this;

			if (me.searchInput.getValue() === "" && $("#houseCodeText").val() === "") {
				alert("Please enter search criteria: Name or House Code.");
				return false;
			}

			me.setLoadCount();
			me.userStore.reset();
			me.userStore.fetch("userId:[user],searchValue:" + me.searchInput.getValue()
				+ ",houseCodeId:" + ($("#houseCodeText").val() !== "" ?  parent.fin.appUI.houseCodeId : "0")
				+ ",statusType:" + (me.statusType.indexSelected > 0 ? me.statusTypes[me.statusType.indexSelected].id : "0")
				+ ",filterType:" + me.filterType.text.value
				, me.usersLoaded, me);
		},

		usersLoaded: function(me, activeId) {

			if (me.users.length === 0) {
				alert("There is no User matching to the given search criteria.");
			}

			me.userGrid.setData(me.users);
			me.searchInput.text.focus();
			me.checkLoadCount();
		},

		loadNewUser: function() {

			window.location = "/fin/emp/userMaster/usr/markup.htm?personId=0";
		},

		showUserDetails: function() {
			var args = ii.args(arguments, {
				event: {type: Object}
			});
			var event = args.event;
			var me = event.data;

			if (me.userGrid.activeRowIndex === -1)
				return;

			var item = me.userGrid.data[me.userGrid.activeRowIndex];

			if (!me.columnSorted())
				window.location = "/fin/emp/userMaster/usr/markup.htm?personId=" + item.id;
		},

		columnSorted: function() {
			var me = this;
			var columnExists = false;
			var generalColumnSorted = false;
			var columnSorted = false;
			var column;
			var columnSelected;

			for (var index in me.userGrid.columns) {
				column = me.userGrid.columns[index];

				if (index === "rowNumber")
					continue;

				for (var sortColumnIndex = 0; sortColumnIndex < me.sortSelections.length; sortColumnIndex++) {
					columnSelected = me.sortSelections[sortColumnIndex];
					if (columnSelected.name === index) {
						columnExists = true;
						if (columnSelected.sortStatus !== column.sortStatus) {
							columnSorted = true;
							me.sortSelections[sortColumnIndex].name = index;
							me.sortSelections[sortColumnIndex].sortStatus = column.sortStatus;
						}
					}
				}

				if (!columnExists) {
					me.sortSelections.push({
						name: index,
						sortStatus: column.sortStatus
					});

					if (column.sortStatus !== "none")
						columnSorted = true;
				}

				if (columnSorted)
					generalColumnSorted = true;
				columnSorted = false;
			}

			return generalColumnSorted;
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
		}
	}
});

function main() {
	fin.empSearchUi = new fin.emp.UserInterface();
	fin.empSearchUi.resize();
	fin.houseCodeSearchUi = fin.empSearchUi;
}