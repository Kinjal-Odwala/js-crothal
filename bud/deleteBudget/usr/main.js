ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "ui.ctl.usr.hierarchy" );
ii.Import( "fin.cmn.usr.treeView" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.cmn.usr.ui.core" );
ii.Import( "fin.cmn.usr.ui.widget" );
ii.Import( "fin.cmn.usr.multiselect" );
ii.Import( "fin.bud.deleteBudget.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.hierarchy", 6 );
ii.Style( "fin.cmn.usr.button", 7 );
ii.Style( "fin.cmn.usr.dropDown", 8 );
ii.Style( "fin.cmn.usr.treeview", 9 );
ii.Style( "fin.cmn.usr.theme", 10 );
ii.Style( "fin.cmn.usr.core", 11 );
ii.Style( "fin.cmn.usr.multiselect", 12 );

ii.Class({
    Name: "fin.bud.deleteBudget.UserInterface",
    Definition: {
        init: function () {
            var args = ii.args(arguments, {});
            var me = this;

            me.hirNodesList = [];
            me.hirNodesTemp = [];
            me.hirNodeSelected = 0;
            me.hirNodePreviousSelected = 0;
            me.fiscalYearId = 0;
            me.jobId = 0;

            me.gateway = ii.ajax.addGateway("bud", ii.config.xmlProvider);
            me.cache = new ii.ajax.Cache(me.gateway);
            me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway,
				function (status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);
            me.hierarchy = new ii.ajax.Hierarchy(me.gateway);

            me.authorizer = new ii.ajax.Authorizer(me.gateway);
            me.authorizePath = "\\crothall\\chimes\\fin\\bud\\deleteBudget";
            me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
				    me.authorizationProcess.apply(me);
				},
				me);

            me.validator = new ui.ctl.Input.Validation.Master();
            me.session = new ii.Session(me.cache);

            me.defineFormControls();
            me.configureCommunications();
            me.modified(false);

            $(window).bind("resize", me, me.resize);
            $(document).bind("keydown", me, me.controlKeyProcessor);

            me.fiscalYear.fetchingData();
            me.yearStore.fetch("userId:[user],", me.yearsLoaded, me);
            me.jdeCompanysStore.fetch("userId:[user],", me.jdeCompanysLoaded, me);
            me.weekPeriodYearStore.fetch("userId:[user],", me.weekPeriodYearsLoaded, me);
            $("#hirNodeLoading").show();
            ii.trace("Hierarchy Nodes Loading", ii.traceTypes.Information, "Info");
            me.hirNodeStore.fetch("userId:[user],hierarchy:2,", me.hirNodesLoaded, me);

            var toggleDisplay = function () {
                var isHouseCodeMode = $('#rdHouseCode').is(':checked');

                if (isHouseCodeMode) {
                    $('#ulEdit0').css('visibility', 'visible');
                    me.anchorLoad.display(ui.cmn.behaviorStates.enabled);
                    $('#JDECompany').multiselect('disable');
                }
                else {
                    $('#ulEdit0').css('visibility', 'hidden');
                    me.anchorLoad.display(ui.cmn.behaviorStates.disabled);
                    $('#JDECompany').multiselect('enable');
                    $("#divJob").hide();
                    me.anchorDelete.display(ui.cmn.behaviorStates.enabled);

                }

                $('#AppUnitText').attr('disabled', !isHouseCodeMode);

            };

            $('#rdHouseCode').change(function () {
                toggleDisplay();
            });

            $('#rdJdeCompany').change(function () {
                toggleDisplay();
            });

            $('#rdHouseCode').attr('checked', true);
            toggleDisplay();

        },

        authorizationProcess: function fin_bud_deleteBudget_UserInterface_authorizationProcess() {
            var args = ii.args(arguments, {});
            var me = this;

            $("#pageLoading").hide();
            me.isAuthorized = me.authorizer.isAuthorized(me.authorizePath);

            ii.timer.timing("Page displayed");
            me.session.registerFetchNotify(me.sessionLoaded, me);
        },

        sessionLoaded: function fin_bud_deleteBudget_UserInterface_sessionLoaded() {
            var args = ii.args(arguments, {
                me: { type: Object }
            });

            ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
        },

        resize: function fin_bud_deleteBudget_UserInterface_resize() {
            var args = ii.args(arguments, {});
            var me = this;
            var offset = 105;

            $("#hirContainer").height($(window).height() - offset);
            $("#detailContainer").height($(window).height() - offset);
        },

        defineFormControls: function fin_bud_deleteBudget_UserInterface_defineFormControls() {
            var me = this;

            $("#ulEdit0").treeview({
                animated: "medium",
                persist: "location",
                collapsed: true
            });

            me.anchorLoad = new ui.ctl.buttons.Sizeable({
                id: "AnchorLoad",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Load&nbsp;&nbsp;</span>",
                clickFunction: function () { me.actionUnitLoad(); },
                hasHotState: true
            });

            me.anchorDelete = new ui.ctl.buttons.Sizeable({
                id: "AnchorDelete",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Delete&nbsp;&nbsp;</span>",
                clickFunction: function () { me.actionDeleteItem(); },
                hasHotState: true
            });

            me.appUnit = new ui.ctl.Input.Text({
                id: "AppUnit",
                maxLength: 8,
                title: "To search a specific House Code in the following Hierarchy, type-in House Code# (0941, 14244) and press Enter key/click Load button."
            });

            $("#AppUnitText").bind("keydown", me, me.actionSearchItem);

            me.fiscalYear = new ui.ctl.Input.DropDown.Filtered({
                id: "FiscalYear",
                formatFunction: function (type) { return type.name; },
                changeFunction: function () { me.actionYearChanged(); },
                required: false
            });

            me.fiscalYear.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function (isFinal, dataMap) {

				    if (me.fiscalYear.indexSelected == -1)
				        this.setInvalid("Please select the correct Year.");
				});

            me.job = new ui.ctl.Input.DropDown.Filtered({
                id: "Job",
                formatFunction: function (type) { return (type.jobTitle == "[ALL]" ? type.jobTitle : type.jobNumber + " - " + type.jobTitle); },
                changeFunction: function () { me.actionJobChanged(); },
                required: false
            });

            me.job.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function (isFinal, dataMap) {

				    if (me.job.indexSelected == -1)
				        this.setInvalid("Please select the correct Job.");
				});

            me.reason = $("#Reason")[0];

            $("#Reason").height(100);
            $("#Reason").keypress(function () {
                if (me.reason.value.length > 1023) {
                    me.reason.value = me.reason.value.substring(0, 1024);
                    return false;
                }
            });
            $("#Reason").change(function () { me.modified(); });

            $("#JDECompany").multiselect({
                minWidth: 255
				, header: false
				, noneSelectedText: ""
				, selectedList: 4
				, click: function () { me.modified(true); }
            });

            ii.trace("Controls Loaded", ii.traceTypes.Information, "Info");
        },

        configureCommunications: function fin_bud_deleteBudget_UserInterface_configureCommunications() {
            var args = ii.args(arguments, {});
            var me = this;

            me.hirOrgs = [];
            me.hirOrgStore = me.hierarchy.register({
                storeId: "hirOrgs",
                itemConstructor: ui.ctl.Hierarchy.Node,
                itemConstructorArgs: ui.ctl.Hierarchy.nodeArgs,
                isRecursive: true,
                addToParentItem: true,
                parentPropertyName: "nodes",
                parentField: "parent",
                multipleFetchesAllowed: true,
                injectionArray: me.hirOrgs
            });

            me.hirNodes = [];
            me.hirNodeStore = me.cache.register({
                storeId: "hirNodes",
                itemConstructor: fin.bud.deleteBudget.HirNode,
                itemConstructorArgs: fin.bud.deleteBudget.hirNodeArgs,
                injectionArray: me.hirNodes
            });

            me.units = [];
            me.unitStore = me.cache.register({
                storeId: "units",
                itemConstructor: fin.bud.deleteBudget.AppUnit,
                itemConstructorArgs: fin.bud.deleteBudget.appUnitArgs,
                injectionArray: me.units
            });

            me.houseCodes = [];
            me.houseCodeStore = me.cache.register({
                storeId: "hcmHouseCodes",
                itemConstructor: fin.bud.deleteBudget.HouseCode,
                itemConstructorArgs: fin.bud.deleteBudget.houseCodeArgs,
                injectionArray: me.houseCodes
            });

            me.jdeCompanys = [];
            me.jdeCompanysStore = me.cache.register({
                storeId: "fiscalJDECompanys",
                itemConstructor: fin.bud.deleteBudget.JdeCompany,
                itemConstructorArgs: fin.bud.deleteBudget.jdeCompanyArgs,
                injectionArray: me.jdeCompanys
            });

            me.houseCodeJobs = [];
            me.houseCodeJobStore = me.cache.register({
                storeId: "houseCodeJobs",
                itemConstructor: fin.bud.deleteBudget.HouseCodeJob,
                itemConstructorArgs: fin.bud.deleteBudget.houseCodeJobArgs,
                injectionArray: me.houseCodeJobs
            });

            me.years = [];
            me.yearStore = me.cache.register({
                storeId: "fiscalYears",
                itemConstructor: fin.bud.deleteBudget.Year,
                itemConstructorArgs: fin.bud.deleteBudget.yearArgs,
                injectionArray: me.years
            });

            me.weekPeriodYears = [];
            me.weekPeriodYearStore = me.cache.register({
                storeId: "weekPeriodYears",
                itemConstructor: fin.bud.deleteBudget.WeekPeriodYear,
                itemConstructorArgs: fin.bud.deleteBudget.weekPeriodYearArgs,
                injectionArray: me.weekPeriodYears
            });

            me.annualBudgets = [];
            me.annualBudgetStore = me.cache.register({
                storeId: "budAnnualBudgets",
                itemConstructor: fin.bud.deleteBudget.AnnualBudget,
                itemConstructorArgs: fin.bud.deleteBudget.annualBudgetArgs,
                injectionArray: me.annualBudgets
            });

            me.annualInformations = [];
            me.annualInformationStore = me.cache.register({
                storeId: "budAnnualInformations",
                itemConstructor: fin.bud.deleteBudget.AnnualInformation,
                itemConstructorArgs: fin.bud.deleteBudget.annualInformationArgs,
                injectionArray: me.annualInformations
            });

            ii.trace("Communication Configured", ii.traceTypes.Information, "Info");
        },

        controlKeyProcessor: function ii_ui_Layouts_ListItem_controlKeyProcessor() {
            var args = ii.args(arguments, {
                event: { type: Object} // The (key) event object
            });
            var event = args.event;
            var me = event.data;
            var processed = false;

            if (event.ctrlKey) {

                switch (event.keyCode) {
                    case 83: // Ctrl+S
                        //me.actionSaveItem();
                        processed = true;
                        break;

                    case 85: // Ctrl+U
                        //me.actionUndoItem();
                        processed = true;
                        break;
                }
            }

            if (processed) {
                return false;
            }
        },

        modified: function () {
            var args = ii.args(arguments, {
                modified: { type: Boolean, required: false, defaultValue: true }
            });
            var me = this;

            parent.parent.fin.appUI.modified = args.modified;
        },

        resizeControls: function () {
            var me = this;

            me.appUnit.resizeText();
            me.fiscalYear.resizeText();
            me.job.resizeText();
            me.resize();
        },

        yearsLoaded: function (me, activeId) {

            me.fiscalYear.setData(me.years);
            me.fiscalYear.select(0, me.fiscalYear.focused);
            me.fiscalYearId = me.fiscalYear.data[me.fiscalYear.indexSelected].id;
            me.annualInformationStore.fetch("userId:[user],fscYear:" + me.fiscalYearId, me.annualInformationsLoaded, me);
            me.resizeControls();
        },

        jdeCompanysLoaded: function (me, activeId) {

            for (var index = 0; index < me.jdeCompanys.length; index++) {
                $("#JDECompany").append("<option title='" + me.jdeCompanys[index].name + "' value='" + me.jdeCompanys[index].id + "'>" + me.jdeCompanys[index].name + "</option>");
            }

            $("#JDECompany").multiselect("refresh");
        },

        actionYearChanged: function () {
            var me = this;

            if (me.fiscalYear.indexSelected >= 0)
                me.fiscalYearId = me.fiscalYear.data[me.fiscalYear.indexSelected].id;
            else
                me.fiscalYearId = 0;

            me.annualInformationStore.fetch("userId:[user],fscYear:" + me.fiscalYearId, me.annualInformationsLoaded, me);
            me.hirNodeSingleLoaded(me.hirNodeSelected);
            me.modified(true);
        },

        weekPeriodYearsLoaded: function (me, activeId) {

            me.currentFiscalYearId = me.weekPeriodYears[0].yearId;
        },

        houseCodeLoaded: function (me, activeId) {

            if (me.houseCodes.length > 0) {
                me.job.fetchingData();
                me.houseCodeJobStore.reset();
                me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + me.houseCodes[0].id, me.houseCodeJobsLoaded, me);
            }
        },

        houseCodeJobsLoaded: function (me, activeId) {

            //me.houseCodeJobs.unshift(new fin.bud.deleteBudget.HouseCodeJob({ id: 0, jobNumber: "", jobTitle: "[ALL]", jobId: 0 }));
            me.job.reset();
            me.job.setData(me.houseCodeJobs);
            if (me.houseCodeJobs.length > 0) {
                me.job.select(0, me.job.focused);
                me.jobId = me.houseCodeJobs[me.job.indexSelected].jobId;
                me.annualBudgetStore.fetch("userId:[user],hcmHouseCode:" + me.houseCodes[0].id + ",fscYear:" + me.fiscalYearId + ",hcmJob:" + me.jobId, me.annualBudgetsLoaded, me);
            }
            else
                me.jobId = 0;

            //me.anchorDelete.display(ui.cmn.behaviorStates.enabled);
        },

        actionJobChanged: function () {
            var me = this;

            if (me.job.indexSelected >= 0) {
                me.jobId = me.houseCodeJobs[me.job.indexSelected].jobId;
                me.annualBudgetStore.fetch("userId:[user],hcmHouseCode:" + me.houseCodes[0].id + ",fscYear:" + me.fiscalYearId + ",hcmJob:" + me.jobId, me.annualBudgetsLoaded, me);
            }
            else {
                me.jobId = 0;
                //me.anchorDelete.display(ui.cmn.behaviorStates.enabled);
            }

            me.modified(true);
        },

        annualBudgetsLoaded: function (me, activeId) {

            if (me.validateBudget())
                me.anchorDelete.display(ui.cmn.behaviorStates.enabled);
            else
                me.anchorDelete.display(ui.cmn.behaviorStates.disabled);
        },

        annualInformationsLoaded: function (me, activeId) {

            if (me.annualInformations.length > 0)
                me.cutOffDate = new Date(me.annualInformations[0].cutOffDate);
            else
                me.cutOffDate = "";
        },

        actionSearchItem: function fin_bud_deleteBudget_UserInterface_actionSearchItem() {
            var args = ii.args(arguments, {
                event: { type: Object} // The (key) event object
            });
            var event = args.event;
            var me = event.data;

            if (event.keyCode == 13) {
                if (!parent.fin.cmn.status.itemValid())
                    me.appUnit.setValue("");
                else
                    me.actionUnitLoad();
            }
        },

        actionUnitLoad: function fin_bud_deleteBudget_UserInterface_actionUnitLoad() {
            var me = this;

            if (me.appUnit.getValue() == "") return;

            $("#AppUnitText").addClass("Loading");

            me.unitStore.fetch("userId:[user],unitBrief:" + me.appUnit.getValue() + ",", me.actionUnitsLoaded, me);
        },

        actionUnitsLoaded: function fin_bud_deleteBudget_UserInterface_actionUnitsLoaded(me, activeId) {

            $("#AppUnitText").removeClass("Loading");

            if (me.units.length <= 0) {

                ii.trace("Could not load the said House Code.", ii.traceTypes.Information, "Info");
                alert("There is no corresponding House Code available or you do not have enough permission to access it.");

                return;
            }

            me.appUnit.setValue(me.units[0].description);
            me.hirNodeCurrentId = me.units[0].hirNode;

            var found = false;

            for (var index = 0; index < me.hirNodesList.length; index++) {
                if (me.hirNodesList[index].id == me.hirNodeCurrentId) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                ii.trace("Hirnodes Loading", ii.traceTypes.Information, "Info");
                $("#hirNodeLoading").show();
                me.hirOrgStore.reset();
                me.hirOrgStore.fetch("userId:[user],hirOrgId:" + me.hirNodeCurrentId + ",hirNodeSearchId:" + me.hirNodeCurrentId + ",ancestors:true", me.hirOrgsLoaded, me);
            }
            else
                me.selectNode();
        },

        hirOrgsLoaded: function fin_bud_deleteBudget_UserInterface_hirOrgsLoaded(me, activeId) {

            var childNodesCount = 0;
            var found = false;

            me.hirNodesTemp = [];

            for (var index = 0; index < me.hirOrgs.length; index++) {
                if (me.hirOrgs[index].hirLevel != -1) {
                    found = false;

                    for (var nodeIndex = 0; nodeIndex < me.hirNodesList.length; nodeIndex++) {
                        if (me.hirNodesList[nodeIndex].id == me.hirOrgs[index].id) {
                            found = true;
                            break;
                        }
                    }

                    if (!found) {
                        if (me.hirOrgs[index].hirLevel == 7)
                            childNodesCount = 0;
                        else
                            childNodesCount = 1;

                        var item = new fin.bud.deleteBudget.HirNode(me.hirOrgs[index].id
							, me.hirOrgs[index].parent.id
							, me.hirOrgs[index].hirLevel
							, me.hirOrgs[index].hirLevelTitle
							, 2
							, me.hirOrgs[index].brief
							, me.hirOrgs[index].title
							, childNodesCount
							)

                        me.hirNodesTemp.push(item);
                    }
                }
            }

            me.actionAddNodes();
            me.selectNode();

            ii.trace("Hirnodes Loaded", ii.traceTypes.Information, "Info");
        },

        selectNode: function () {
            var me = this;
            var hirNodeId = me.hirNodeCurrentId;
            var found = true;

            while (found) {
                for (var index = 0; index < me.hirNodesList.length; index++) {
                    if (me.hirNodesList[index].id == hirNodeId) {
                        var parentId = me.hirNodesList[index].nodeParentId;
                        var parentNode = $("#liNode" + parentId)[0];
                        hirNodeId = parentId;

                        if (parentNode != undefined) {
                            found = true;

                            if (parentNode.className == "expandable" || parentNode.className == "expandable lastExpandable")
                                $("#liNode" + hirNodeId).find(">.hitarea").click();
                        }

                        break;
                    }
                    else
                        found = false;
                }
            }

            me.hirNodeSingleLoaded(me.hirNodeCurrentId);
            $("#liNode" + me.hirNodeCurrentId).focus();
        },

        hirNodesLoaded: function (me, activeId) {

            me.hirNodesTemp = me.hirNodes.slice();
            me.actionAddNodes();
        },

        actionAddNodes: function () {
            var me = this;
            var index = -1;
            var hirNode = 0;
            var hirParentNode = 0;
            var hirNodeTitle = "";
            var childNodeCount = 0;
            var nodeList = "";
            var treeNode = null;

            for (index = 0; index < me.hirNodesTemp.length; index++) {
                hirNode = me.hirNodesTemp[index].id;
                hirParentNode = me.hirNodesTemp[index].nodeParentId;
                hirNodeTitle = me.hirNodesTemp[index].title;
                childNodeCount = me.hirNodesTemp[index].childNodeCount;
                nodeList = "";
                treeNode = null;

                //set up the edit tree
                //add the item underneath the parent list
                me.actionNodeAppend(hirNode, hirNodeTitle, hirParentNode, childNodeCount);
            }

            me.storeHirNodes();

            if (me.hirNodePreviousSelected == 0) {
                me.hirNodeSingleLoaded(me.hirNodesTemp[0].id);
            }

            $("#pageLoading").hide();
            $("#hirNodeLoading").hide();
        },

        actionNodeAppend: function () {
            var args = ii.args(arguments, {
                hirNode: { type: Number }
				, hirNodeTitle: { type: String }
				, hirNodeParent: { type: Number }
				, childNodeCount: { type: Number }
            });
            var me = this;

            nodeHtml = "<li id=\"liNode" + args.hirNode + "\">"
		    	+ "<span id=\"span" + args.hirNode + "\" class='TreeNodeText'>" + args.hirNodeTitle + "</span>";

            //add a list holder if the node has children
            if (args.childNodeCount != 0) {
                nodeHtml += "<ul id=\"ulEdit" + args.hirNode + "\"></ul>";
            }

            nodeHtml += "</li>";

            if ($("#liNode" + args.hirNodeParent)[0] == undefined)
                args.hirNodeParent = 0;

            var treeNode = $(nodeHtml).appendTo("#ulEdit" + args.hirNodeParent);
            $("#ulEdit0").treeview({ add: treeNode });

            //link up the node
            $("#span" + args.hirNode).bind("click", function () {
                me.hirNodeSelect(args.hirNode);
            });

            $("#liNode" + args.hirNode).find(">.hitarea").bind("click", function () {
                me.hitAreaSelect(args.hirNode);
            });

            return nodeHtml;
        },

        storeHirNodes: function () {
            var me = this;
            var index = 0;

            for (index = 0; index < me.hirNodesTemp.length; index++) {
                me.hirNodesList.push(me.hirNodesTemp[index]);
            }
        },

        hirNodeSingleLoaded: function () {
            var args = ii.args(arguments, {
                hirNode: { type: Number }
            });
            var me = this;

            if (!parent.fin.cmn.status.itemValid())
                return;

            var index = me.getNodeIndex(args.hirNode);
            me.jobId = 0;
            me.reason.value = "";
            me.anchorDelete.display(ui.cmn.behaviorStates.disabled);
            me.hirNodeSelected = me.hirNodesList[index].id;

            if (me.hirNodesList[index].hirLevel == 7) {
                $("#divJob").show();
                me.houseCodeStore.fetch("userId:[user],hirNodeId:" + me.hirNodeSelected, me.houseCodeLoaded, me);
            }
            else
                $("#divJob").hide();

            if (me.hirNodePreviousSelected > 0) {
                $("#span" + me.hirNodePreviousSelected).replaceClass("TreeNodeTextSelected", "TreeNodeText");
            }

            me.hirNodePreviousSelected = me.hirNodeSelected;

            $("#span" + me.hirNodeSelected).replaceClass("TreeNodeText", "TreeNodeTextSelected")
        },

        hitAreaSelect: function (nodeId) {
            var me = this;

            if ($("#ulEdit" + nodeId)[0].innerHTML == "") {
                $("#hirNodeLoading").show();
                me.hirNodeStore.fetch("userId:[user],hirNodeParent:" + nodeId + ",", me.hirNodesLoaded, me);
            }
        },

        hirNodeSelect: function (nodeId) {
            var me = this;

            me.hirNodeSingleLoaded(nodeId);
        },

        getNodeIndex: function () {
            var args = ii.args(arguments, {
                hirNode: { type: Number }
            });
            var me = this;
            var index = 0;

            for (index = 0; index < me.hirNodesList.length; index++) {
                if (me.hirNodesList[index].id == args.hirNode)
                    return index;
            }

            return 0;
        },

        validateBudget: function () {
            var me = this;
            var date = new Date();

            if (me.currentFiscalYearId == me.fiscalYearId || date <= me.cutOffDate) {
                return true;
            }

            return false;
        },

        actionClearItem: function () {
            var me = this;

            me.reason.value = "";
            me.anchorDelete.display(ui.cmn.behaviorStates.disabled);
        },

        actionDeleteItem: function () {
            var me = this;

            var isHouseCodeMode = $('#rdHouseCode').is(':checked');
            if (!isHouseCodeMode) {
                if (!confirm("Are you sure you want to delete the budgeting information in selected JDE Company(s)  permanently?"))
                    return false;

                me.actionSaveItem();
                return;
            }


            if (!me.hirNodeSelected)
                return;

            var jobTitle = me.houseCodeJobs[me.job.indexSelected].jobNumber + " - " + me.houseCodeJobs[me.job.indexSelected].jobTitle;

            if (me.annualBudgets.length > 0) {
                if (me.annualBudgets[0].approved) {
                    alert("The selected budget is already approved. So you cannot delete this budget.");
                    return;
                }
            }
            else {
                alert("Budgeting information is not available for the selected House Code [" + me.houseCodes[0].name + "] and Job [" + jobTitle + "].");
                return;
            }

            if (!confirm("Are you sure you want to delete the budgeting information of the House Code [" + me.houseCodes[0].name + "] and Job [" + jobTitle + "] permanently?"))
                return false;

            me.actionSaveItem();
        },

        actionSaveItem: function () {
            var args = ii.args(arguments, {});
            var me = this;
            var item = [];
            var errorMessage = "";

            var isHouseCodeMode = $('#rdHouseCode').is(':checked');

            me.validator.forceBlur();

            // Check to see if the data entered is valid
            if (isHouseCodeMode && !me.validator.queryValidity(true)) {
                errorMessage += "In order to save, the errors on the page must be corrected.\n";
            }

            if (me.reason.value == "") {
                errorMessage += "Reason field is required. Please make an entry.\n";
            }

            if (!me.hirNodeSelected && isHouseCodeMode) {
                errorMessage += "Please select a house code on the left panel.\n";
            }

            if (errorMessage != "") {
                alert(errorMessage);
                return false;
            }

            $("#messageToUser").text("Saving");
            $("#pageLoading").show();

            item = new fin.bud.deleteBudget.AnnualBudget(0, "", "", false, 0);
            var xml = me.saveXmlBuild(item);

            // Send the object back to the server as a transaction
            me.transactionMonitor.commit({
                transactionType: "itemUpdate",
                transactionXml: xml,
                responseFunction: me.saveResponse,
                referenceData: { me: me, item: item }
            });

            return true;
        },

        saveXmlBuild: function () {
            var args = ii.args(arguments, {
                item: { type: fin.bud.deleteBudget.AnnualBudget }
            });
            var me = this;
            var item = args.item;
            var xml = "";

            var isHouseCodeMode = $('#rdHouseCode').is(':checked');

            xml += '<budAnnualBudgetDelete';
            xml += ' id="' + item.id + '"';

            if (isHouseCodeMode)
                xml += ' houseCodeId="' + me.houseCodes[0].id + '"';
            else {
                xml += ' houseCodeId="0"';
                xml += ' jdeCompanys="' + $('#JDECompany').val() + '"';
            }

            xml += ' yearId="' + me.fiscalYearId + '"';
            xml += ' jobId="' + me.jobId + '"';
            xml += ' reason="' + ui.cmn.text.xml.encode(me.reason.value) + '"';
            xml += '/>';

            ii.trace("Xml Build", ii.traceTypes.Information, "Info");

            return xml;
        },

        saveResponse: function () {
            var args = ii.args(arguments, {
                transaction: { type: ii.ajax.TransactionMonitor.Transaction },
                xmlNode: { type: "XmlNode:transaction" }
            });
            var transaction = args.transaction;
            var me = transaction.referenceData.me;
            var item = transaction.referenceData.item;
            var status = $(args.xmlNode).attr("status");

            $("#pageLoading").hide();

            if (status == "success") {
                me.actionClearItem();
                me.modified(false);
                ii.trace("Budget Deleted", ii.traceTypes.Information, "Info");
            }
            else {
                alert("[SAVE FAILURE] Error while deleting the budget information: " + $(args.xmlNode).attr("message"));
            }
        }
    }
});

function main() {
	fin.deleteBudgetUi = new fin.bud.deleteBudget.UserInterface();
	fin.deleteBudgetUi.resize();
}