//ii.config.xmlTimeout = 600000;
ii.Import("ii.krn.sys.ajax");
ii.Import("ii.krn.sys.session");
ii.Import("ui.ctl.usr.input");
ii.Import("ui.ctl.usr.buttons");
ii.Import("ui.cmn.usr.text");
ii.Import("ui.ctl.usr.hierarchy");
ii.Import("fin.cmn.usr.util");
ii.Import("fin.bud.deleteBudget.usr.defs");

ii.Style("style", 1);
ii.Style("fin.cmn.usr.common", 2);
ii.Style("fin.cmn.usr.statusBar", 3);
ii.Style("fin.cmn.usr.toolbar", 4);
ii.Style("fin.cmn.usr.input", 5);
ii.Style("fin.cmn.usr.hierarchy", 6);
ii.Style("fin.cmn.usr.button", 7);
ii.Style("fin.cmn.usr.dropDown", 8);
ii.Style("fin.cmn.usr.theme", 9);
ii.Style("fin.cmn.usr.core", 10);
ii.Style("fin.cmn.usr.multiselect", 11);

var importCompleted = false;
var iiScript = new ii.Script( "fin.cmn.usr.ui.core", function() { coreLoaded(); });

function coreLoaded() { 
	var iiScript = new ii.Script( "fin.cmn.usr.ui.widget", function() { widgetLoaded(); });
}

function widgetLoaded() { 
	var iiScript = new ii.Script( "fin.cmn.usr.multiselect", function() { importCompleted = true; }); 
}

ii.Class({
    Name: "fin.bud.deleteBudget.UserInterface",
    Definition: {
        init: function () {
            var args = ii.args(arguments, {});
            var me = this;

            me.hirNodeSelected = 0;
            me.hirNodeTitle = "";
            me.fiscalYearId = 0;
            me.houseCodeId = 0;
            me.jobId = 0;
            me.hirNodeCurrentId = 1;
            me.loadCount = 0;

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
            me.setStatus("Loading");

            $(window).bind("resize", me, me.resize);
            $(document).bind("keydown", me, me.controlKeyProcessor);

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

            me.isAuthorized = me.authorizer.isAuthorized(me.authorizePath);

            $("#pageLoading").hide();
            $("#pageLoading").css({
                "opacity": "0.5",
                "background-color": "black"
            });
            $("#messageToUser").css({ "color": "white" });
            $("#imgLoading").attr("src", "/fin/cmn/usr/media/Common/loadingwhite.gif");
            $("#pageLoading").fadeIn("slow");

            ii.timer.timing("Page displayed");
            me.loadCount = 1;
            me.session.registerFetchNotify(me.sessionLoaded, me);
            me.fiscalYear.fetchingData();
            me.yearStore.fetch("userId:[user],", me.yearsLoaded, me);
            me.jdeCompanysStore.fetch("userId:[user],", me.jdeCompanysLoaded, me);
            ii.trace("Hierarchy Nodes Loading", ii.traceTypes.Information, "Info");
            me.hirOrgStore.fetch("userId:[user],hirOrgId:1,ancestors:true", me.hirOrgsLoaded, me);
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
            var offset = 130;

            $("#hirContainer").height($(window).height() - offset);
            $("#detailContainer").height($(window).height() - offset);
        },

        defineFormControls: function fin_bud_deleteBudget_UserInterface_defineFormControls() {
            var me = this;

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
                formatFunction: function (job) { return (job.jobTitle == "[ALL]" ? job.jobTitle : job.jobNumber + " - " + job.jobTitle); },
                changeFunction: function () { me.actionJobChanged(); },
                required: false
            });

            $("#JDECompany").multiselect({
                minWidth: 255
				, header: false
				, noneSelectedText: ""
				, selectedList: 4
				, click: function () { me.modified(true); }
            });

            me.reason = $("#Reason")[0];

            $("#Reason").height(100);
            $("#Reason").keypress(function () {
                if (me.reason.value.length > 1023) {
                    me.reason.value = me.reason.value.substring(0, 1024);
                    return false;
                }
            });
            $("#Reason").change(function () { me.modified(true); });

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

            me.annualBudgets = [];
            me.annualBudgetStore = me.cache.register({
                storeId: "budAnnualBudgets",
                itemConstructor: fin.bud.deleteBudget.AnnualBudget,
                itemConstructorArgs: fin.bud.deleteBudget.annualBudgetArgs,
                injectionArray: me.annualBudgets
            });

            me.deletes = [];
            me.deleteStore = me.cache.register({
                storeId: "budAnnualBudgetDeletes",
                itemConstructor: fin.bud.deleteBudget.Delete,
                itemConstructorArgs: fin.bud.deleteBudget.deleteArgs,
                injectionArray: me.deletes
            });

            ii.trace("Communication Configured", ii.traceTypes.Information, "Info");
        },

        controlKeyProcessor: function ii_ui_Layouts_ListItem_controlKeyProcessor() {
            var args = ii.args(arguments, {
                event: { type: Object } // The (key) event object
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

        setStatus: function (status) {
            var me = this;

            fin.cmn.status.setStatus(status);
        },

        dirtyCheck: function (me) {

            return !fin.cmn.status.itemValid();
        },

        modified: function () {
            var args = ii.args(arguments, {
                modified: { type: Boolean, required: false, defaultValue: true }
            });
            var me = this;

            parent.parent.fin.appUI.modified = args.modified;
            if (args.modified)
                me.setStatus("Edit");
        },

        setLoadCount: function (me, activeId) {
            var me = this;

            me.loadCount++;
            me.setStatus("Loading");
            $("#messageToUser").text("Loading");
            $("#pageLoading").fadeIn("slow");
        },

        checkLoadCount: function () {
            var me = this;

            me.loadCount--;
            if (me.loadCount <= 0) {
                me.setStatus("Loaded");
                $("#pageLoading").fadeOut("slow");
            }
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
            me.resizeControls();
        },

        jdeCompanysLoaded: function (me, activeId) {

            for (var index = 0; index < me.jdeCompanys.length; index++) {
                $("#JDECompany").append("<option title='" + me.jdeCompanys[index].name + "' value='" + me.jdeCompanys[index].id + "'>" + me.jdeCompanys[index].name + "</option>");
            }

            $("#JDECompany").multiselect("refresh");
            me.checkLoadCount();
        },

        actionYearChanged: function () {
            var me = this;

            if (me.fiscalYear.indexSelected >= 0)
                me.fiscalYearId = me.fiscalYear.data[me.fiscalYear.indexSelected].id;
            else
                me.fiscalYearId = 0;

            me.modified(true);
        },

        houseCodeLoaded: function (me, activeId) {

            if (me.houseCodes.length > 0) {
                me.houseCodeId = me.houseCodes[0].id;
                me.job.fetchingData();
                me.houseCodeJobStore.reset();
                me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + me.houseCodeId, me.houseCodeJobsLoaded, me);
            }
        },

        houseCodeJobsLoaded: function (me, activeId) {

            me.houseCodeJobs.unshift(new fin.bud.deleteBudget.HouseCodeJob({ id: 0, jobNumber: "", jobTitle: "[ALL]", jobId: 0 }));
            me.job.setData(me.houseCodeJobs);
            me.job.select(0, me.job.focused);
            me.jobId = 0;
        },

        actionJobChanged: function () {
            var me = this;

            if (me.job.indexSelected > 0) {
                me.jobId = me.houseCodeJobs[me.job.indexSelected].jobId;
                me.annualBudgetStore.fetch("userId:[user],hcmHouseCode:" + me.houseCodeId + ",fscYear:" + me.fiscalYearId + ",hcmJob:" + me.jobId, me.annualBudgetsLoaded, me);
            }
            else {
                me.jobId = 0;
            }

            me.modified(true);
        },

        annualBudgetsLoaded: function (me, activeId) {

        },

        actionSearchItem: function fin_bud_deleteBudget_UserInterface_actionSearchItem() {
            var args = ii.args(arguments, {
                event: { type: Object } // The (key) event object
            });
            var event = args.event;
            var me = event.data;

            if (event.keyCode == 13) {
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
                ii.trace("could not load the said Unit.", ii.traceTypes.Information, "Info");
                alert("There is no corresponding Unit available or you do not have enough permission to access it.");
                return;
            }

            $("#HirUnit").val(me.units[0].description);
            me.hirNodeCurrentId = me.units[0].hirNode;
            me.setLoadCount();
            me.hirOrgLoad("search");
        },

        hirOrgLoad: function () {
            var args = ii.args(arguments, {
                flag: { type: String, required: false }
            });
            var me = this;

            me.hirOrgStore.reset();

            if (args.flag)
                me.hirOrgStore.fetch("userId:[user],hirOrgId:" + me.hirNodeCurrentId + ",hirNodeSearchId:" + me.hirNodeCurrentId + ",ancestors:true,sFilter:false", me.hirOrgsLoaded, me);
            else
                me.hirOrgStore.fetch("userId:[user],hirOrgId:" + me.hirNodeCurrentId + ",ancestors:true,sFilter:false", me.hirOrgsLoaded, me);

            ii.trace("Organization nodes loading", ii.traceTypes.Information, "Info");
        },

        hirOrgsLoaded: function (me, activeId) {

            $("#hirOrg").html("");

            if (me.orgHierarchy)
                if (me.orgHierarchy.selectedNodes.length > 0)
                    me.prevSelectedNodes = me.orgHierarchy.selectedNodes;

            me.orgHierarchy = new ui.ctl.Hierarchy({
                nodeStore: me.hirOrgStore,
                domId: "hirOrg", //OrganizationHierarchy
                baseClass: "iiHierarchy",
                actionLevel: 9,
                //actionCallback: function(node){ me.hirNodeOrgSelect(node); },
                actionCallback: function (node) { me.hirNodeOrgSelect(node); },
                topNode: me.hirOrgs[0],
                currentNode: ii.ajax.util.findItemById(me.hirNodeCurrentId + "", me.hirOrgs),
                hasSelectedState: false,
                //sparse: false,
                multiSelect: true,
                //readOnly : me.userEditingOwnSecurity, //RMSESM
                actionNodeSelect: function (node) { me.hirNodeOrgSelect(node); },
                actionNodeChecked: function (node) { me.hirNodeOrgSelect(node); }
            });

            if (me.prevSelectedNodes)
                me.orgHierarchy.setData(me.prevSelectedNodes);

            me.checkLoadCount();
        },

        lastSelectedNode: null,

        isLevel7NodeSelected: function () {
            var me = this;
            var selectedNodeId = me.lastSelectedNode.id;
            var selectedNodes = me.orgHierarchy.selectedNodes;

            return (me.lastSelectedNode.hirLevel == 7 && selectedNodes.length == 1 && selectedNodes[0].id == selectedNodeId);
        },

        hirNodeOrgSelect: function () {
            var args = ii.args(arguments, {
                node: { type: ui.ctl.Hierarchy.Node }
            });
            var me = this;

            me.lastSelectedNode = args.node;
            me.modified(true);

            if (me.isLevel7NodeSelected()) {
                me.houseCodeStore.fetch("userId:[user],hirNodeId:" + args.node.id, me.houseCodeLoaded, me);
                $("#divJob").show();
            }
            else
                $("#divJob").hide();
        },

        actionDeleteItem: function () {
            var args = ii.args(arguments, {});
            var me = this;
            var item = [];
            var errorMessage = "";
            var message = "";

            me.validator.forceBlur();

            var beforeSubmit = function () {
                me.setStatus("Loading");
                $("#messageToUser").text("Deleting");
                $("#pageLoading").fadeIn("slow");
            }

            var afterSubmit = function () {
                me.setStatus("Loaded");
                $("#messageToUser").text("Normal");
                $("#pageLoading").fadeOut("slow");
            }

            if (!me.reason.value) {
                alert('Please enter delete reason');
                return;
            }

            var budSubmit = function (submitXml, callback) {

                beforeSubmit();
                var data = 'moduleId=bud&requestId=1&requestXml=' + encodeURIComponent(submitXml) + '&&targetId=iiTransaction';
                jQuery.post('/net/crothall/chimes/fin/bud/act/Provider.aspx', data, function (data, status) {

                    if (status == "success") {
                        me.modified(false);
                        me.setStatus("Deleted");
                        alert("Budgeting data deleted successfully.");
                    }
                    else {
                        me.setStatus("Error");
                        alert("Failed to delete budgets");
                    }

                    callback(data);
                    afterSubmit();
                });
            }

            var isHouseCodeMode = $('#rdHouseCode').is(':checked');

            if (!isHouseCodeMode) {

                if (!confirm("Are you sure you want to delete the budgeting information on selected JDE company(s)?"))
                    return false;

                ///<transaction id="1"><budAnnualBudgetDelete id="0" houseCodeId="415" yearId="8" jobId="1" reason="test"/></transaction>

                var criteriaXml = '<transaction id="1"><budAnnualBudgetDelete id="0" houseCodeId="0" jobId="0" \
                        jdeCompanys="' + $('#JDECompany').val() + '" yearId="' + me.fiscalYearId + '" reason="' + me.reason.value + '" /></transaction>';

                budSubmit(criteriaXml, function () {

                });

                //budRequest(criteriaXml, function (responseXml) {
                //    partialBudgetDeleteed = $('item', $(responseXml)).length > 0;
                //    if (partialBudgetDeleteed && !confirm('1 or more budget already deleteed, do you want to continue to delete all the selected budgets?')) {
                //        me.setStatus("Loaded");
                //        $("#pageLoading").fadeOut("slow");
                //        return;
                //    }
                //    else {
                //        me.deleteStore.reset();
                //        me.deleteStore.fetch("userId:[user],hirNode:,jdeCompanys:" + $('#JDECompany').val() + ",yearId:" + me.fiscalYearId + ",jobId:0", me.deleteItemsLoaded, me);
                //    }
                //});
                return;
            }

            // Check to see if the data entered is valid
            if (isHouseCodeMode && !me.validator.queryValidity(true)) {
                errorMessage += "In order to save, the errors on the page must be corrected.\n";
            }

            var selectedNodes = [];
            var selectedNames = [];

            $.each(me.orgHierarchy.selectedNodes, function (index, item) {
                selectedNodes.push(item.id);
                selectedNames.push(item.fullPath.substr(item.fullPath.lastIndexOf('\\') + 1));
            });

            if (selectedNodes.length == 0) {
                errorMessage += "Please select a node on the left panel.\n";
            }

            if (errorMessage != "") {
                alert(errorMessage);
                return false;
            }

            if (!confirm("Are you sure you want to delete the budgeting information for the " + selectedNames.join(',') + "?"))
                return false;

            // me.setStatus("Loading");
            // $("#messageToUser").text("Deleting");
            // $("#pageLoading").fadeIn("slow");

            var jobId = me.isLevel7NodeSelected() ? me.jobId : 0;
            var criteriaXml = '<transaction id="1"><budAnnualBudgetDelete id="0" houseCodeId="0" jobId="0" \
                        hirNodes="' + selectedNodes.join('~') + '" yearId="' + me.fiscalYearId + '" reason="' + me.reason.value + '" /></transaction>';

            budSubmit(criteriaXml, function () {

            });

            //budRequest(criteriaXml, function (responseXml) {
            //    partialBudgetDeleteed = $('item', $(responseXml)).length > 0;
            //    if (partialBudgetDeleteed && !confirm('1 or more budget already deleteed, do you want to continue to delete all the selected budgets?')) {
            //        me.setStatus("Loaded");
            //        $("#pageLoading").fadeOut("slow");
            //        return;
            //    }
            //    else {
            //        me.deleteStore.reset();
            //        me.deleteStore.fetch("userId:[user],hirNode:" + selectedNodes.join('~') + ",yearId:" + me.fiscalYearId + ",jobId:" + jobId, me.deleteItemsLoaded, me);
            //    }
            //});
        },

        deleteItemsLoaded: function (me, activeId) {

            if (me.deletes.length <= 0) {
                me.setStatus("Loaded");
                $("#pageLoading").fadeOut("slow");
                alert("Budgeting data is either already deleteed or not available or not approved.");
                return;
            }

            var pItems = [];
            $.each(me.deletes, function (index, bItem) {
                if (bItem.currentDeleteed == "false")
                    pItems.push(bItem.houseCode);
            });

            if (pItems.length > 0) {
                alert(pItems.join(', ') + ' already deleteed!');
            }

            if (me.deletes.length == pItems.length) {
                me.setStatus("Loaded");
                $("#pageLoading").fadeOut("slow");
                return;
            }

            var item = new fin.bud.deleteBudget.AnnualBudget(0, "", "", false, false);
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
            if (!isHouseCodeMode) {
                xml += '<budAnnualBudgetDeleteUpdate';
                xml += ' id="' + item.id + '"';
                xml += ' hirNode=""';
                xml += ' yearId="' + me.fiscalYearId + '"';
                xml += ' jobId="' + me.jobId + '"';
                xml += ' jdeCompanys="' + $('#JDECompany').val() + '"';
                xml += '/>';
            }
            else {
                $.each(me.orgHierarchy.selectedNodes, function (index, node) {
                    xml += '<budAnnualBudgetDeleteUpdate';
                    xml += ' id="' + item.id + '"';
                    xml += ' hirNode="' + node.id + '"';
                    xml += ' yearId="' + me.fiscalYearId + '"';
                    xml += ' jobId="' + me.jobId + '"';
                    xml += '/>';
                });
            }

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

            $("#pageLoading").fadeOut("slow");

            if (status == "success") {
                me.modified(false);
                me.setStatus("Deleteed");
                ii.trace("Budget Deleteed", ii.traceTypes.Information, "Info");
                alert("Budgeting data deleteed successfully.");
            }
            else {
                me.setStatus("Error");
                alert("[SAVE FAILURE] Error while deleteing the budget information: " + $(args.xmlNode).attr("message"));
            }
        }
    }
});

function main() {
	var intervalId = setInterval(function() {
		if (importCompleted) {
			clearInterval(intervalId);
			fin.deleteBudgetUi = new fin.bud.deleteBudget.UserInterface();
    		fin.deleteBudgetUi.resize();
		}
	}, 100);
}