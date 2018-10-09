window.__bt__7838cbf9 = ['<div style="min-height: 400px" class="mop">    <div id="mop-top">        <div style="background-color: #555; color: #fff; float: left; text-align: center; height: 30px; vertical-align: middle; font-size: 14px; font-weight: bold; width: 180px; padding-top: 15px;">            Snapshot        </div>        <div style="margin-left: 180px; background-color: #6D94BA; color: #fff; padding-top: 10px; vertical-align: text-bottom">            <div style="height: 20px; padding-left: 10px;" id="jde-form">                <span>JDE Company: </span>                <span id="jde-form-jdeCompany" name="jdeCompany" style="display: inline-block;"></span>                  <span>Fiscal Year: </span>                <span id="jde-form-fscYear" name="fscYear" style="display: inline-block;"></span>            </div>            <div style="clear: both">            </div>        </div>        <div id="page-status" style="display: block; width: 100%; clear: both;">            <div id="itemStatusDiv" style="padding: 10px;">                <div class="itemStatusImage Normal" id="itemStatusImage">                </div>                <div class="itemModifiedImage" id="itemModifiedImage">                </div>                <div id="itemStatusText" class="itemStatusText">                    Normal                </div>            </div>        </div>        <div class="clear"></div>    </div>    <div style="padding-top: 10px; display: none;" id="mop-wrapper">        <!--  <div style="width: 150px; float: left">            <div style="padding: 10px">                <div id="snapshot-list"></div>                <button class="btn btn-primary btn-block">Create Snapshot</button>            </div>        </div>        <div style="margin-left: 150px">            <div style="padding: 10px; display:none;" id="snapshot-data-list">                            </div>        </div>-->        <div id="snapshot-list-container" style="display: none; padding: 10px;">            <div id="snapshot-list"></div>        </div>        <div id="sector-level-container" style="display: none;">            <h4 style="padding: 10px;"><a href="javascript:;" class="period-title back-to-snapshot-list"></a></h4>            <div id="sector-level-revenue-container" style="display: none; padding: 10px;">                <h4>Revenue</h4>                <div style="padding-top: 10px;" id="sector-level-revenue-list">                </div>            </div>            <div id="sector-level-total-container" style="display: none; padding: 10px;">                <h4>Total</h4>                <div style="padding-top: 10px;" id="sector-level-total-list">                </div>            </div>            <div style="padding: 10px;">                <h4 style="padding-bottom: 10px;">Description</h4>                <textarea id="snapshotDescription" rows="3" style="width: 95%"></textarea>            </div>            <div style="text-align: right; padding: 10px;">                <button id="btnSaveSnapshot" class="btn btn-primary">Save</button>                <button id="btnCancel" class="btn btn-default back-to-snapshot-list">Cancel</button>            </div>        </div>        <div id="cost-center-container">            <div id="cost-center-revenue-container" class="cost-center-container" style="display: none; padding: 10px;">                <h4><a href="javascript:;" class="period-title back-to-snapshot-list"></a> / <a href="javascript:;" class="sector-level-name back-to-sector-level"></a>/ Revenue                </h4>                <div style="padding: 10px 0">Filter: &nbsp;<input type="text" class="house-code-filter" /></div>                <div style="padding-top: 10px;" id="cost-center-revenue-list">                </div>            </div>            <div id="cost-center-total-container" class="cost-center-container" style="display: none; padding: 10px;">                <h4><a href="javascript:;" class="period-title back-to-snapshot-list"></a> / <a href="javascript:;" class="sector-level-name back-to-sector-level"></a>/ Total</h4>                <div style="padding: 10px 0">Filter: &nbsp;<input type="text" class="house-code-filter" /></div>                <div style="padding-top: 10px;" id="cost-center-total-list">                </div>            </div>        </div>        <div id="gl-revenue-container" class="gl-container" style="display: none; padding: 10px;">            <h4><a href="javascript:;" class="period-title back-to-snapshot-list"></a> / <a href="javascript:;" class="sector-level-name back-to-sector-level"></a>/ <a href="javascript:;" class="house-code-name back-to-cost-center-revenue"></a>/ Revenue</h4>            <div style="padding: 10px 0">Filter: &nbsp;<input type="text" class="gl-code-filter" /></div>            <div style="padding-top: 10px;" id="gl-revenue-list">            </div>        </div>        <div id="gl-total-container" class="gl-container" style="display: none; padding: 10px;">            <h4><a href="javascript:;" class="period-title back-to-snapshot-list"></a> / <a href="javascript:;" class="sector-level-name back-to-sector-level"></a>/ <a href="javascript:;" class="house-code-name back-to-cost-center-total"></a>/ Total</h4>            <div style="padding: 10px 0">Filter: &nbsp;<input type="text" class="gl-code-filter" /></div>            <div style="padding-top: 10px;" id="gl-total-list">            </div>        </div>        <div class="clear"></div>    </div></div>',''];

if ((typeof Range !== "undefined") && !Range.prototype.createContextualFragment) {
    Range.prototype.createContextualFragment = function (html) {
        var frag = document.createDocumentFragment(),
        div = document.createElement("div");
        frag.appendChild(div);
        div.outerHTML = html;
        return frag;
    };
}

$.fn.focusNextInputField = function () {
    return this.each(function () {
        var fields = $(this).parents('form:eq(0),body').find('input,textarea,select');
        var index = fields.index(this);
        if (index > -1 && (index + 1) < fields.length) {
            fields.eq(index + 1).focus();
        }
        return false;
    });
};

$.fn.focusPrevInputField = function () {
    return this.each(function () {
        var fields = $(this).parents('form:eq(0),body').find('input,textarea,select');
        var index = fields.index(this);
        if (index > 1) {
            fields.eq(index - 1).focus();
        }
        return false;
    });
};

bine.namespace('fin.bud', 'fin.bud.page', 'fin.bud.data');

fin.bud.budRequest = function (requestXml, callback) {
    var data = String.format('moduleId=bud&requestId=1&requestXml={0}&&targetId=iiCache', encodeURIComponent(requestXml));
    fin.bud.loading();
    jQuery.post('/net/crothall/chimes/fin/bud/act/Provider.aspx', data, function (data, status) {
        callback(data);
        fin.bud.loaded();
    });
}

fin.bud.hcmRequest = function (requestXml, callback) {
    var data = String.format('moduleId=hcm&requestId=1&requestXml={0}&&targetId=iiCache', encodeURIComponent(requestXml));
    fin.bud.loading();

    jQuery.post('/net/crothall/chimes/fin/hcm/act/Provider.aspx', data, function (data, status) {
        callback(data);
        fin.bud.loaded();
    });
}

fin.bud.fscRequest = function (requestXml, callback) {
    var data = String.format('moduleId=fsc&requestId=1&requestXml={0}&&targetId=iiCache', encodeURIComponent(requestXml));
    fin.bud.loading();
    jQuery.post('/net/crothall/chimes/fin/fsc/act/Provider.aspx', data, function (data, status) {
        callback(data);
        fin.bud.loaded();
    });
}

fin.bud.glmRequest = function (requestXml, callback) {
    var data = String.format('moduleId=glm&requestId=1&requestXml={0}&&targetId=iiCache', encodeURIComponent(requestXml));
    fin.bud.loading();
    jQuery.post('/net/crothall/chimes/fin/glm/act/Provider.aspx', data, function (data, status) {
        callback(data);
        fin.bud.loaded();
    });
}

fin.bud.rptRequest = function (callback) {
    var data = String.format('moduleId=rpt&requestId=1&requestXml={0}&&targetId=iiCache', encodeURIComponent('<criteria>storeId:rptReports,userId:[user],</criteria>'));
    fin.bud.loading();
    jQuery.post('/net/crothall/chimes/fin/rpt/act/Provider.aspx', data, function (d, status) {
        callback(d);
        fin.bud.loaded();
    });

}

fin.bud.budSubmit = function (submitXml, callback) {
    var data = String.format('moduleId=bud&requestId=1&requestXml={0}&&targetId=iiTransaction', encodeURIComponent(submitXml));
    fin.bud.saving();
    jQuery.post('/net/crothall/chimes/fin/bud/act/Provider.aspx', data, function (data, status) {
        callback(data);
        fin.bud.saved();
    });
}

if (!window.top.fin.appUI) {
    //window.top.fin = { appUI: { houseCodeId: 227, glbFscYear: 2, glbFscPeriod: 18} };
    window.top.fin.appUI = { houseCodeId: 415, glbFscYear: 4, glbFscPeriod: 45, glbWeek: 2 };
}

fin.bud.Context = {
    isTest: document.location.host == 'localhost',

    getHcmHouseCode: function () {
        var hcmHouseCode = window.top.fin.appUI.houseCodeId;
        if (!hcmHouseCode)
            return 0;
        return hcmHouseCode;
    },

    getWeekNumber: function () {
        var week = window.top.fin.appUI.glbWeek;
        if (!week)
            return 1;
        return week;
    },

    getFscYear: function () {
        var fscYear = window.top.fin.appUI.glbFscYear;
        if (!fscYear)
            return 0;
        return fscYear;
    },

    getFscPeriod: function () {

        var fscPeriod = window.top.fin.appUI.glbFscPeriod;
        if (!fscPeriod)
            return 0;
        return fscPeriod;
    },

    setHcmHouseCode: function (appUnit, id, name, brief, hirNode) {

        if (window.top.fin.appUI) {
            window.top.fin.appUI.unitId = appUnit;
            window.top.fin.appUI.houseCodeId = parseFloat(id);
            window.top.fin.appUI.houseCodeTitle = name;
            window.top.fin.appUI.houseCodeBrief = brief;
            window.top.fin.appUI.hirNode = hirNode;
        }
    },

    setFscYear: function (id, name) {
        if (window.top.fin.appUI) {
            window.top.fin.appUI.glbFscYear = parseFloat(id);
            window.top.fin.appUI.glbfiscalYear = name;
        }
    }
};

$bud = {
    calcDaysInDateRange: function (date1, date2) {
        date1.setHours(0, 0, 0, 0);
        date2.setHours(0, 0, 0, 0);
        return Math.round((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }

};

Date.prototype.addDays = function (days) {
    var dat = new Date(this.valueOf())
    dat.setDate(dat.getDate() + days);
    return dat;
}

var htmlEncode = function (str) {
    if (!str)
        return '';

    return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}


bine.applyIf(Array.prototype, {
    /**
    * Add an element at the specified index
    * @param {Object} o The object to add
    * @param {int} index The index position the element has to be inserted
    * @return {Boolean} True if you can insert
    */
    insertAt: function (o, index) {
        if (index > -1 && index <= this.length) {
            this.splice(index, 0, o);
            return true;
        }
        return false;
    },
    /**
    * Add an element after another element
    * @param {Object} The object before which you want to insert
    * @param {Object} The object to insert
    * @return {Boolean} True if inserted, false otherwise
    */
    insertBefore: function (o, toInsert) {
        var inserted = false;
        var index = this.indexOf(o);
        if (index == -1)
            return false;
        else {
            if (index == 0) {
                this.unshift(toInsert)
                return true;
            }
            else
                return this.insertAt(toInsert, index - 1);
        }
    },
    /**
    * Add an element before another element
    * @param {Object} The object after which you want to insert
    * @param {Object} The object to insert
    * @return {Boolean} True if inserted, false otherwise
    */
    insertAfter: function (o, toInsert) {
        var inserted = false;
        var index = this.indexOf(o);
        if (index == -1)
            return false;
        else {
            if (index == this.length - 1) {
                this.push(toInsert);
                return true;
            }
            else
                return this.insertAt(toInsert, index + 1);
        }
    }
});


function dirtyCheck(me) {
    return !window.top.fin.cmn.status.itemValid();
}

if (!top.ui)
    top.ui = { ctl: {} };

if (top.ui.ctl.menu) {
    var me = this;
    top.ui.ctl.menu.Dom.me.registerDirtyCheck(dirtyCheck, me);
}

if (document.location.host == 'localhost')
    window.__fin_modified = false;


window.globalLoadingCounter = 0;
window.isSavedSuccessfully = false;

fin.bud.loading = function () {
    window.globalLoadingCounter++;
    $('.itemStatusImage').removeClass('Normal').addClass('Loading');
    $('.itemModifiedImage').removeClass('Modified');
    $('.itemStatusText').html('Loading, please wait...');
}

fin.bud.saving = function () {
    window.globalLoadingCounter++;
    $('.itemStatusImage').removeClass('Normal').addClass('Loading');
    $('.itemModifiedImage').removeClass('Modified');
    $('.itemStatusText').html('Saving, please wait...');
}


fin.bud.saved = function () {
    window.globalLoadingCounter--;
    window.isSavedSuccessfully = true;

    //    if (window.globalLoadingCounter <= 0) {
    //        setTimeout(function () {
    //            window.isSavedSuccessfully = false;
    //        }, 5000);
    //    }

    setTimeout(function () {
        if (window.globalLoadingCounter <= 0) {
            fin.bud.normal(window.__fin_modified);
            window.globalLoadingCounter = 0;
        }
    }, 20);
}


fin.bud.normal = function (isModified) {
    $('.itemStatusImage').removeClass('Loading').addClass('Normal');
    $('.itemStatusText').css('color', '#032D23');
    $('.itemStatusText').html(window.isSavedSuccessfully && !isModified ? 'Data saved successfully.' : 'Normal');
    if (isModified === true) {
        $('.itemModifiedImage').addClass('Modified');
    }
    else {
        $('.itemModifiedImage').removeClass('Modified');
    }
}

fin.bud.loaded = function () {
    window.globalLoadingCounter--;

    setTimeout(function () {
        if (window.globalLoadingCounter <= 0) {
            fin.bud.normal(window.__fin_modified);
            window.globalLoadingCounter = 0;

            if (window.isSavedSuccessfully) {
                window.isSavedSuccessfully = false;
            }
        }

    }, 20);
};

fin.bud.modified = function () {

    if (arguments.length == 1) {
        fin.bud.normal(arguments[0]);
    }

    if (arguments.length == 0) {
        if (!window.top.fin || !window.top.fin.cmn || !window.top.fin.cmn.status) {
            return window.__fin_modified;
        }
        else
            return !window.top.fin.cmn.status.itemValid();
    }
    else {
        window.__fin_modified = arguments[0];

        if (window.top.fin && window.top.fin.appUI)
            window.top.fin.appUI.modified = arguments[0];
    }
}


var getViewPort = function () {
    var e = window,
        a = 'inner';
    if (!('innerWidth' in window)) {
        a = 'client';
        e = document.documentElement || document.body;
    }

    return {
        width: e[a + 'Width'],
        height: e[a + 'Height']
    };
};

!function (bud) {


    var FscYears = [];
    var FscPeriodLookup = {};
    var FscPeriodLookup2 = {};


    var FscYearStore = new Ext.data.JsonStore({
        root: 'data',
        idProperty: 'Id',
        fields: [{ name: 'Id' }, { name: 'Description' }]
    });


    var JdeCompanyStore = new Ext.data.JsonStore({
        root: 'data',
        idProperty: 'Id',
        fields: [{ name: 'Id' }, { name: 'Description' }]
    });

    var HcmHouseCodeStore = new Ext.data.JsonStore({
        root: 'data',
        idProperty: 'Id',
        fields: [{ name: 'Id' }, { name: 'Description' }]
    });


    var JDECompanies = [];
    var JDECompanyLookup = {};
    
    var loadJdeCompanies = function (callback) {
        var me = this;

        fin.bud.budRequest('<criteria>storeId:fiscalJDECompanys,userId:[user],</criteria>', function (data) {
            JDECompanies = [];
            JDECompanyLookup = {};
            $('item', $(data)).each(function (index, item) {
                var $item = $(item);
                var jdeCompany = { Id: parseInt($item.attr('id')), Description: $item.attr('title') };
                JDECompanies.push(jdeCompany);
                JDECompanyLookup[jdeCompany.Id] = jdeCompany;
            });

            JdeCompanyStore.loadData({ data: JDECompanies });
        });

    };
    
    loadJdeCompanies();

    var HcmHouseCodes = [];
    var HcmHouseCodeLookup = {};
    var loadHcmHouseCodes = function (callback) {
        var criteriaXml = '<criteria>appUnitBrief:,storeId:hcmHouseCodes,userId:[user],</criteria>';

        fin.bud.hcmRequest(criteriaXml, function (data) {
            HcmHouseCodes = [];
            $('item', $(data)).each(function (index, item) {
                var $item = $(item);
                var HcmHouseCode = { Id: parseInt($item.attr('id')), Description: $item.attr('name'), Code: $item.attr('brief'), HirNode: $item.attr('hirNode'), AppUnit: $item.attr('appUnit') };
                HcmHouseCodes.push(HcmHouseCode);
                HcmHouseCodeLookup[HcmHouseCode.Id] = HcmHouseCode;
            });

            HcmHouseCodeStore.loadData({ data: HcmHouseCodes });

            if (callback)
                callback();
        });
    };
    loadHcmHouseCodes();


    var FscAccounts = [];
    var FscAccountLookup = {};
    var FscAccountCategories = [];
    var FscAccountCategoryLookup = {};

    var loadFscAccounts = function (callback) {
        var criteriaXml = '<criteria>storeId:budFscAccounts,userId:[user],</criteria>';

        fin.bud.budRequest(criteriaXml, function (data) {
            FscAccounts = [];
            FscAccountCategories = [];
            $('item', $(data)).each(function (index, item) {
                var $item = $(item);
                var categoryId = parseInt($item.attr('accountCategoryId'));
                var category = bine.query(FscAccountCategories).where(function (i) { return i.Id == categoryId; }).first();

                var FscAccount = {
                    Id: parseInt($item.attr('id')),
                    Code: parseFloat($item.attr('code')),
                    CategoryId: categoryId,
                    Name: $item.attr('name'),
                    Description: String.format('{0} {1}', $item.attr('code'), $item.attr('name')),
                    MopTotalType: parseInt($item.attr('mopTotalType') || 1),
                    DisplayOrder: parseFloat($item.attr('displayOrder')),
                    IsNegative: $item.attr('isNegative') == 'true'
                };
                /*
                if (FscAccount.Code == 6685)
                    FscAccount.MopTotalType = 2;
                else if (FscAccount.Code == 8605)
                    FscAccount.MopTotalType = 3;
                */

                if (!category) {
                    var FscAccountCategory = {
                        Id: categoryId,
                        Description: $item.attr('accountCategory'),
                        OrderIndex: categoryId == 45 ? 0 : (parseFloat($item.attr('categoryDisplayOrder') || 0) + 1),
                        IsNegative: $item.attr('isNegative') == 'true'
                    };
                    FscAccountCategories.push(FscAccountCategory);
                    FscAccountCategoryLookup[FscAccountCategory.Id] = FscAccountCategory;
                }
                FscAccounts.push(FscAccount);
                FscAccountLookup[FscAccount.Id] = FscAccount;
            });

            if (callback)
                callback();
        });
    };
    loadFscAccounts();


    var loadFscYears = function (callback) {
        var criteriaXml = '<criteria>storeId:fiscalYears,userId:[user],</criteria>';

        fin.bud.budRequest(criteriaXml, function (data) {
            FscYears = [];
            $('item', $(data)).each(function (index, item) {
                var $item = $(item);
                FscYears.push({ Id: parseInt($item.attr('id')), Description: $item.attr('title') });
            });

            FscYearStore.loadData({ data: FscYears });
            if (callback)
                callback();
        });
    };

    loadFscYears();

    var loadFscPeriods = function (fscYearId, callback) {

        var fscYear = bine.query(FscYears).where(function (i) { return i.Id == fscYearId; }).first();

        if (fscYear && fscYear.Periods) {
            //FscPeriodStore.loadData({ data: fscYear.Periods });

            callback(fscYear.Periods);
            return;
        }

        var criteriaXml = String.format('<criteria>fiscalYearId:{0},storeId:fiscalPeriods,userId:[user],</criteria>', fscYear.Id);

        fin.bud.fscRequest(criteriaXml, function (data) {
            var fscPeriods = [];
            $('item', $(data)).each(function (index, item) {
                var $item = $(item);
                var fscPeriod = {
                    Id: parseInt($item.attr('id')), Number: parseFloat($item.attr('title')),
                    Description: 'Period ' + $item.attr('title'),
                    StartDt: Date.parseDate($item.attr('startDate'), 'n/j/Y'), EndDt: Date.parseDate($item.attr('endDate'), 'n/j/Y')
                };
                fscPeriod.Days = $bud.calcDaysInDateRange(fscPeriod.StartDt, fscPeriod.EndDt);

                var weeks = [];
                var startDt = fscPeriod.StartDt;
                var endDt = fscPeriod.StartDt;

                while (endDt < fscPeriod.EndDt) {

                    if (endDt.getDay() == 6) {
                        weeks.push({ StartDt: startDt, EndDt: endDt, Days: $bud.calcDaysInDateRange(startDt, endDt) });
                        startDt = endDt.addDays(1);
                    }
                    endDt = endDt.addDays(1);
                }
                if (startDt != endDt) {
                    weeks.push({ StartDt: startDt, EndDt: endDt, Days: $bud.calcDaysInDateRange(startDt, endDt) });
                }
                fscPeriod.Weeks = weeks;
                fscPeriod.FscYear = fscYear.Id;
                fscPeriods.push(fscPeriod);
            });

            $.each(fscPeriods, function (index, fscPeriod) {
                FscPeriodLookup2[fscPeriod.Id] = fscPeriod;
                FscPeriodLookup[fscYearId + '_' + fscPeriod.Number] = fscPeriod;
            });

            fscYear.Periods = fscPeriods;
            //FscPeriodStore.loadData({ data: fscPeriods });
            callback(fscPeriods);

        });
    };

    var ComboBox = bine.extend(Ext.form.ComboBox, {
        displayField: 'Description',
        valueField: 'Id',
        mode: 'local',
        forceSelection: false,      // if set true, the tab key cannot work on IE
        triggerAction: 'all',
        selectOnFocus: true,
        editable: false,
        layzeInit: false,
        typeAhead: true,
        minChars: 1
    });

    var SnapshotListCreator = function (loadSnapshotCallback) {

        var htmlBuilder = [];

        var TPL_LIST = '<table class="table snapshot-table table-hover table-bordered"><thead><tr><th>Snapshot period</th><th>Status</th><th>Action</th></tr></thead><tbody id="item-wrapper"></tbody></table>';
        var TPL_VIEW = '<tr><td name="name"></td><td name="status"></td><td name="action"></td></tr>';
      


        var DataViewList = bine.extend(bine.DataViewList, {
            tpl: TPL_LIST, itemContainerId: 'item-wrapper',

            createDataView: function () {
                var me = this;
                return new bine.DataView({
                    tpl: TPL_VIEW,
                    onDomReady: function () {
                        var dv = this;

                        dv.$this.on('click', function () {
                            if ((dv.val('allowCreate') || dv.val('createdBy')) && loadSnapshotCallback)
                                loadSnapshotCallback(dv.val());
                        });
                    }
                }, {
                    status:{
                        convertDisplay: function (v) {
                            var dv=this;
                          
                            var createdBy = dv.val('createdBy');
                            var createdAt = dv.val('createdAt');

                            if (createdBy) {
                                return 'Created by ' + createdBy + ' at ' + createdAt;
                            }
                            else {
                                return 'No snapshot';
                            }
                        }
                    },
                    action: {
                        convertDisplay: function (v) {
                            var dv = this;

                            var createdBy = dv.val('createdBy');

                            if (createdBy) {
                                return '<a class="btn btn-primary btn-sm" style="font-size:11px; padding:3px 8px;">View Snapshot</a>';
                            }
                            else if (dv.val('allowCreate')) {
                                return '<a class="btn btn-primary btn-sm" style="font-size:11px; padding:3px 8px;">Create Snapshot</a>';
                            }
                        }
                    }
                });
            },

            onDomReady: function () {
                var me = this;


            }
        });

        return new DataViewList();
    };

    var SnapshotDataListCreator2 = function (changeCallback) {

        var htmlBuilder = [];

        htmlBuilder.push('<table class="table snapshot-table table-hover table-bordered"><thead><tr><th>Account Code</th>');

        for (var i = 1; i <= 12; i++) {
            htmlBuilder.push('<th>Period ' + i + '</th>');
        }

        htmlBuilder.push('<th>Full Year</th>');

        htmlBuilder.push('</tr></thead><tbody id="item-wrapper"></tbody></table>');

        var TPL_LIST = htmlBuilder.join('');

        htmlBuilder = [];
        htmlBuilder.push('<tr><td name="accountName"></td>');

        for (var i = 1; i <= 12; i++) {
            htmlBuilder.push('<td class="number period' + i + '" name="period' + i + '"></td>');
        }
        htmlBuilder.push('<td class="number" name="total"></td>');
        htmlBuilder.push('</tr>');
        var TPL_VIEW = htmlBuilder.join('');

        var fieldConfig = {};

        for (var i = 1; i <= 12; i++) {
            fieldConfig['period' + i] = {
                convertDisplay: function (v) {
                    var html = (v || 0).numberFormat('0,000.00');
                    return html;
                }
            };
        }

        fieldConfig.total = {

            convertDisplay: function (v) {

                var total = 0;

                for (var i = 1; i <= 12; i++) {
                    total += this.val('period' + i) || 0;
                }

                return total.numberFormat('0,000.00');
            }
        }

        var DataViewList = bine.extend(bine.DataViewList, {
            tpl: TPL_LIST, itemContainerId: 'item-wrapper',


            createDataView: function () {
                var me = this;
                return new bine.DataView({
                    tpl: TPL_VIEW,
                    onDomReady: function () {
                        var dv = this;

                        dv.on('change', function () {
                            if (dv.val('isTotal'))
                                dv.$this.addClass('total-row');
                            else
                                dv.$this.removeClass('total-row');

                            if (changeCallback)
                                changeCallback(dv);
                        });
                    }
                }, fieldConfig);
            },

            onDomReady: function () {
                var me = this;


            }
        });

        return new DataViewList();

    };

    var SnapshotDataListCreator = function (summaryLevel, clickCallback, changeCallback) {

        var htmlBuilder = [];

        htmlBuilder.push('<table class="table snapshot-table table-hover table-bordered"><thead><tr>');

        switch (summaryLevel) {
            case 1: //sector level
                break;
            case 2:
                htmlBuilder.push('<th>Cost Center</th>');
                break;
            case 3:
                htmlBuilder.push('<th>Account Code</th>');
                break;
        }

        for (var i = 1; i <= 12; i++) {
            htmlBuilder.push('<th>Period ' + i + '</th>');
        }

        htmlBuilder.push('<th>Full Year</th>');

        htmlBuilder.push('</tr></thead><tbody id="item-wrapper"></tbody></table>');

        var TPL_LIST = htmlBuilder.join('');

        htmlBuilder = ['<tr>'];
        if (summaryLevel != 1)
            htmlBuilder.push('<td name="id"></td>');

        for (var i = 1; i <= 12; i++) {
            htmlBuilder.push('<td class="number period' + i + '" name="period' + i + '"></td>');
        }
        htmlBuilder.push('<td class="number" name="total"></td>');
        htmlBuilder.push('</tr>');
        var TPL_VIEW = htmlBuilder.join('');

        var fieldConfig = {};

        fieldConfig['id'] = {
            convertDisplay: function (v) {
                if (summaryLevel == 2) {
                    var hcmHouseCode = HcmHouseCodeLookup[v];
                    return hcmHouseCode ? hcmHouseCode.Description : v;
                }
                else if (summaryLevel == 3) {
                    var fscAccount = FscAccountLookup[v];
                    return fscAccount ? fscAccount.Description : v;
                }
                return v;
            }
        };

        for (var i = 1; i <= 12; i++) {
            fieldConfig['period' + i] = {
                convertDisplay: function (v) {
                    var html = (v || 0).numberFormat('0,000.00');
                    return html;
                }
            };
        }

        fieldConfig.total = {

            convertDisplay: function (v) {

                var total = 0;

                for (var i = 1; i <= 12; i++) {
                    total += this.val('period' + i) || 0;
                }

                return total.numberFormat('0,000.00');
            }
        }

        var DataViewList = bine.extend(bine.DataViewList, {
            tpl: TPL_LIST, itemContainerId: 'item-wrapper',


            createDataView: function () {
                var me = this;
                return new bine.DataView({
                    tpl: TPL_VIEW,
                    onDomReady: function () {
                        var dv = this;

                        dv.$this.on('click', function () {
                            if (clickCallback)
                                clickCallback(dv.val());
                        });

                        dv.on('change', function () {
                            if (dv.val('isTotal'))
                                dv.$this.addClass('total-row');
                            else
                                dv.$this.removeClass('total-row');

                            if (changeCallback)
                                changeCallback(dv);
                        });
                    }
                }, fieldConfig);
            },

            onDomReady: function () {
                var me = this;


            }
        });

        return new DataViewList();

    };

    bud.page.SnapshotPage = bine.extend(bine.Control, {
        tpl: window.__bt__7838cbf9[0],

        jdeCompanyId: null,

        fscYear: null,

        fscPeriod: null,

        jdeForm: null,

        snapshotList: null,

        sectorLevelRevenueList: null,
        sectorLevelTotalList: null,

        costCenterRevenueList: null,
        costCenterTotalList: null,

        glRevenueList: null,
        glTotalList: null,

        rawCostCenterRevenues: [],
        rawCostCenterTotals: [],
        rawGlRevenues: [],
        rawGlTotals: [],
        houseCodeFilter: null,
        glCodeFilter: null,

        onDomReady: function () {
            var me = this;

            me.createJdeForm();

            me.createDataLists();

            me.snapshotList = SnapshotListCreator(function (v) {
                me.fscPeriod = v.fscPeriod;
                $('.period-title').html(v.name);
                me.loadSectorLevelData(me.jdeCompanyId);
            });

            me.append(me.snapshotList, 'snapshot-list');


            $('.back-to-sector-level').on('click', function (e) {
                me.showSectorLevel();
            });

            $('.back-to-cost-center-revenue').on('click', function (e) {
                me.showCostCenterRevenue();
            });

            $('.back-to-cost-center-total').on('click', function (e) {
                me.showCostCenterTotal();
            });

            $('.snapshot-table').on('click', 'tbody > tr > td', function (e) {
                $('.snapshot-table tr').removeClass('success');
                $(this).parent().addClass('success');
            });

            $('.back-to-snapshot-list').on('click', function (e) {
                me.showSnapshotList();
            });

            me.$('#btnSaveSnapshot').on('click', function (e) {
                me.createSnapshot(me.jdeCompanyId);
            });

            var delayTimer;
            $('.house-code-filter').on('keyup', function (e) {
                clearTimeout(delayTimer);
                var $ctrl = $(this);
                delayTimer = setTimeout(function () {
                    me.houseCodeFilter = $ctrl.val();
                    $('.house-code-filter').val($ctrl.val());
                    me.costCenterRevenueList.val(me.getFilteredCostCenterRevenues());
                    me.costCenterTotalList.val(me.getFilteredCostCenterTotals());

                }, 1000); 
            });

            $('.gl-code-filter').on('keyup', function (e) {
                clearTimeout(delayTimer);
                var $ctrl = $(this);
                delayTimer = setTimeout(function () {
                    me.glCodeFilter = $ctrl.val();
                    $('.gl-code-filter').val($ctrl.val());
                    me.glRevenueList.val(me.getFilteredGlRevenues());
                    me.glTotalList.val(me.getFilteredGlTotals());

                }, 1000);
            });
          
        },

        createJdeForm: function () {
            var me = this;
            var jdeCompanyConfig = {
                type: 'number', align: 'left',
                isValid: function (value) {
                    return true;
                }
            }

            me.jdeForm = new bine.DataView({
                tpl: me.$('#jde-form'), id: me.id('jde-form'),
                onDomReady: function () {
                    var dv = this;

                    var jdeCompanyBox = new ComboBox({ store: JdeCompanyStore, name: 'jdeCompany', editable: false, width: 300, listWidth: 300 });
                    dv.addField(jdeCompanyBox);

                    var fscYearBox = new ComboBox({ store: FscYearStore, name: 'fscYear', editable: false, width: 100, listWidth: 100 });
                    dv.addField(fscYearBox);

                }
            }, {
                jdeCompany: jdeCompanyConfig
            });

            me.jdeForm.on('change', function (name, value, oldValue) {
                if (name == 'jdeCompany') {
                    me.jdeCompanyId = value;
                    me.$('.sector-level-name').html(JDECompanyLookup[value].Description);
                  
                    me.houseCodeFilter = null;
                    $('.house-code-filter').val('');
                  
                }

                if (name == 'fscYear') {
                    me.fscYear = value;
                }

                if (me.jdeCompanyId && me.fscYear) {
                    me.$('#mop-wrapper').show();
                    me.loadSnapshots(me.jdeCompanyId);
                }

            });
        },

        createDataLists: function () {
            var me = this;
            //me.snapshotDataList = SnapshotDataListCreator(function (dv) {
            //    var snapshotPeriod = me.snapshotName.substr(1, 1).charCodeAt() - 64;

            //    for (var i = 1; i <= 12; i++) {
            //        if (snapshotPeriod <= i)
            //            dv.$('.period' + i).addClass('wor-forecast');
            //        else
            //            dv.$('.period' + i).removeClass('wor-forecast');
            //    }
            //});

            me.sectorLevelRevenueList = SnapshotDataListCreator(1, function (data) {
                me.loadCostCenterDataRevenue(me.jdeCompanyId);
            });
            me.append(me.sectorLevelRevenueList, 'sector-level-revenue-list');

            me.sectorLevelTotalList = SnapshotDataListCreator(1, function (data) {
                me.loadCostCenterDataTotal(me.jdeCompanyId);
            });
            me.append(me.sectorLevelTotalList, 'sector-level-total-list');

            me.costCenterRevenueList = SnapshotDataListCreator(2, function (data) {
                me.glCodeFilter = null;
                $('.gl-code-filter').val('');
                me.loadGlDataRevenue(data.id);
            });
            me.append(me.costCenterRevenueList, 'cost-center-revenue-list');

            me.costCenterTotalList = SnapshotDataListCreator(2, function (data) {
                me.glCodeFilter = null;
                $('.gl-code-filter').val('');
                me.loadGlDataTotal(data.id);
            });
            me.append(me.costCenterTotalList, 'cost-center-total-list');

            me.glRevenueList = SnapshotDataListCreator(3);
            me.append(me.glRevenueList, 'gl-revenue-list');

            me.glTotalList = SnapshotDataListCreator(3);
            me.append(me.glTotalList, 'gl-total-list');

            //var houseCodeCombo1 =new ComboBox({ store: HcmHouseCodeStore, name: 'house-code-combo-1', editable: false, width: 300, listWidth: 300 });
            //me.append(houseCodeCombo1, 'house-code-combo-1');
        },

        convertXmlToObject: function (data) {
            var items = [];
            $('item', $(data)).each(function (index, item) {
                var $item = $(item);
                var dataItem = { id: parseInt($item.attr('id')) };
                for (var i = 1; i <= 12; i++)
                    dataItem['period' + i] = parseFloat($item.attr('period' + i));
                items.push(dataItem);
            });

            return items;
        },

        loadSectorLevelData: function (jdeCompanyId) {
            var me = this;
            fin.bud.budRequest('<criteria>storeId:budSnapshotSummaries,userId:[user], level:1, key:' + jdeCompanyId + ', fscPeriod:' + me.fscPeriod + ', type: 1</criteria>', function (data) {
                var objects = me.convertXmlToObject(data);
                me.sectorLevelRevenueList.val(objects);
                me.$('#sector-level-revenue-container').show();
            });

            fin.bud.budRequest('<criteria>storeId:budSnapshotSummaries,userId:[user], level:1, key:' + jdeCompanyId + ', fscPeriod:' + me.fscPeriod + ', type: 0</criteria>', function (data) {
                var objects = me.convertXmlToObject(data);
                me.sectorLevelTotalList.val(objects);
                me.$('#sector-level-total-container').show();
            });

            me.showSectorLevel();
        },

        showSnapshotList: function(){
            var me = this;
            me.$('#snapshot-list-container').show();
            me.$('#sector-level-container').hide();
            me.$('.cost-center-container').hide();
            me.$('.gl-container').hide();

        },

        showSectorLevel: function () {
            var me = this;
            me.$('#snapshot-list-container').hide();
            me.$('#sector-level-container').show();
            me.$('.cost-center-container').hide();
            me.$('.gl-container').hide();
        },


        showCostCenterRevenue: function () {
            var me = this;
            me.$('#snapshot-list-container').hide();
            me.$('#sector-level-container').hide();
            me.$('#cost-center-revenue-container').show();
            me.$('.gl-container').hide();
        },

        showCostCenterTotal: function () {
            var me = this;
            me.$('#snapshot-list-container').hide();
            me.$('#sector-level-container').hide();
            me.$('#cost-center-total-container').show();
            me.$('.gl-container').hide();
        },

        showGlRevenue: function () {
            var me = this;
            me.$('#snapshot-list-container').hide();
            me.$('#sector-level-container').hide();
            me.$('#gl-revenue-container').show();
            me.$('.cost-center-container').hide();
        },

        showGlTotal: function () {
            var me = this;
            me.$('#snapshot-list-container').hide();
            me.$('#sector-level-container').hide();
            me.$('#gl-total-container').show();
            me.$('.cost-center-container').hide();
        },

        loadCostCenterDataRevenue: function (jdeCompanyId) {
            var me = this;
            fin.bud.budRequest('<criteria>storeId:budSnapshotSummaries,userId:[user], level:2, key:' + jdeCompanyId + ', fscPeriod:' + me.fscPeriod + ', type: 1</criteria>', function (data) {
                var objects = me.convertXmlToObject(data);
                me.rawCostCenterRevenues = objects;
                me.costCenterRevenueList.val(me.getFilteredCostCenterRevenues());
                me.$('#cost-center-revenue-container').show();
            });

            me.showCostCenterRevenue();
        },

        loadCostCenterDataTotal: function (jdeCompanyId) {
            var me = this;
          
            fin.bud.budRequest('<criteria>storeId:budSnapshotSummaries,userId:[user], level:2, key:' + jdeCompanyId + ', fscPeriod:' + me.fscPeriod + ', type: 0</criteria>', function (data) {
                var objects = me.convertXmlToObject(data);
                me.rawCostCenterTotals = objects;
                me.costCenterTotalList.val(me.getFilteredCostCenterTotals());
                me.$('#cost-center-total-container').show();
            });
            me.showCostCenterTotal();
        },

        getFilteredCostCenterRevenues: function(){
            var me = this;

            if (!me.houseCodeFilter)
                return me.rawCostCenterRevenues;

            var filteredCode = [];

            $.each(HcmHouseCodes, function (index, code) {
                if ((code.Description || '').toUpperCase().indexOf(me.houseCodeFilter.toUpperCase()) >= 0)
                    filteredCode.push(code.Id.toString());
            });

            var filtered = [];

            $.each(me.rawCostCenterRevenues, function (index, item) {
                if (filteredCode.indexOf(item.id.toString()) >= 0)
                    filtered.push(item);
            });

            return filtered;

        },

        getFilteredCostCenterTotals: function () {
            var me = this;

            if (!me.houseCodeFilter)
                return me.rawCostCenterTotals;

            var filteredCode = [];

            $.each(HcmHouseCodes, function (index, code) {
                if ((code.Description || '').toUpperCase().indexOf(me.houseCodeFilter.toUpperCase()) >= 0)
                    filteredCode.push(code.Id.toString());
            });

            var filtered = [];

            $.each(me.rawCostCenterTotals, function (index, item) {
                if (filteredCode.indexOf(item.id.toString()) >= 0)
                    filtered.push(item);
            });

            return filtered;

        },


        getFilteredGlRevenues: function () {
            var me = this;

            if (!me.glCodeFilter)
                return me.rawGlRevenues;

            var filteredCode = [];

            $.each(FscAccounts, function (index, code) {
                if ((code.Description || '').toUpperCase().indexOf(me.glCodeFilter.toUpperCase()) >= 0)
                    filteredCode.push(code.Id.toString());
            });

            var filtered = [];

            $.each(me.rawGlRevenues, function (index, item) {
                if (filteredCode.indexOf(item.id.toString()) >= 0)
                    filtered.push(item);
            });

            return filtered;

        },


        getFilteredGlTotals: function () {
            var me = this;

            if (!me.glCodeFilter)
                return me.rawGlTotals;

            var filteredCode = [];

            $.each(FscAccounts, function (index, code) {
                if ((code.Description || '').toUpperCase().indexOf(me.glCodeFilter.toUpperCase()) >= 0)
                    filteredCode.push(code.Id.toString());
            });

            var filtered = [];

            $.each(me.rawGlTotals, function (index, item) {
                if (filteredCode.indexOf(item.id.toString()) >= 0)
                    filtered.push(item);
            });

            return filtered;

        },

        loadGlDataRevenue: function (hcmHouseCode) {
            var me = this;
            fin.bud.budRequest('<criteria>storeId:budSnapshotSummaries,userId:[user], level:3, key:' + hcmHouseCode + ', fscPeriod:' + me.fscPeriod + ', type: 1</criteria>', function (data) {
                var objects = me.convertXmlToObject(data);
                me.rawGlRevenues = objects;
                me.glRevenueList.val(me.getFilteredGlRevenues());
                me.$('#gl-revenue-container').show();
            });

            me.$('.house-code-name').html(HcmHouseCodeLookup[hcmHouseCode].Description);
            me.showGlRevenue();
        },

        loadGlDataTotal: function (hcmHouseCode) {
            var me = this;

            fin.bud.budRequest('<criteria>storeId:budSnapshotSummaries,userId:[user], level:3, key:' + hcmHouseCode + ', fscPeriod:' + me.fscPeriod + ', type: 0</criteria>', function (data) {
                var objects = me.convertXmlToObject(data);
                me.rawGlTotals = objects;
                me.glTotalList.val(me.getFilteredGlTotals());
                me.$('#gl-total-container').show();
            });

            me.$('.house-code-name').html(HcmHouseCodeLookup[hcmHouseCode].Description);
            me.showGlTotal();
        },

        loadSnapshots: function (jdeCompanyId) {
            var me = this;
            loadFscPeriods(me.fscYear, function (periods) {

                fin.bud.budRequest('<criteria>storeId:budSnapshots,userId:[user], jdeCompany:' + jdeCompanyId + ', fscYear:' + me.fscYear + '</criteria>', function (data) {

                    var fscYear = bine.query(FscYears).where(function (i) { return i.Id == me.fscYear; }).first();
                    var items = [];

                    for (var i = 0; i < periods.length; i++) {

                        var period = periods[i];

                        if (new Date() < period.StartDt)
                            continue;

                        var dataItem = { 'fscPeriod': period.Id, 'name': fscYear.Description + ' - ' + period.Description, createdAt: null, createdBy: null, allowCreate : new Date()>= period.StartDt && new Date()<=period.EndDt };
                        $('item', $(data)).each(function (index, item) {
                            var $item = $(item);
                            var fscPeriod = parseInt($item.attr('fscPeriod'));

                            if (fscPeriod == period.Id) {
                                dataItem.createdAt = $item.attr('createdAt');
                                dataItem.createdBy = $item.attr('createdBy');
                                dataItem.description = $item.attr('description');
                            }
                        });
                        items.push(dataItem);
                    }

                   

                    me.$('#snapshotDescription').val(dataItem.description || '');
                    if (dataItem.createdAt) {
                        me.$('#btnSaveSnapshot').hide();
                        me.$('#btnCancel').hide();
                        me.$('#snapshotDescription').prop('disabled', true);
                    }
                    else {
                        me.$('#btnSaveSnapshot').show();
                        me.$('#btnCancel').show();
                        me.$('#snapshotDescription').prop('disabled', false);
                    }

                    me.snapshotList.val(items);

                    me.showSnapshotList();
                });
            });
          
        },



        createSnapshot: function (jdeCompanyId) {
            var me = this;

            var xml = ['<transaction id="1">\r\n'];
            xml.push('<budSnapshotCreate ');
            xml.push(' jdeCompany="' + jdeCompanyId + '"');
            xml.push(' fscPeriod="' + me.fscPeriod + '"');
            xml.push(' description="' + me.$('#snapshotDescription').val() + '"');
            xml.push(' />\r\n');

            xml.push('</transaction>');

            fin.bud.budSubmit(xml.join(''), function () {
                me.loadSnapshots(jdeCompanyId);

                alert('Snapshot has been created successfully!');
                fin.bud.modified(false);
            });

        }


    });

} (fin.bud);
