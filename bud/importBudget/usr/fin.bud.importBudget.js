window.__bt__8c60c5ac = ['<div style="margin: 15px;">    <div id="itemStatusDiv" style="padding: 10px;">        <div class="itemStatusImage Normal" id="itemStatusImage">        </div>        <div class="itemModifiedImage" id="itemModifiedImage">        </div>        <div id="itemStatusText" class="itemStatusText">            Normal</div>    </div>    <div id="uploader">    </div>    <div id="keys-form" style="margin: 15px 0">        <fieldset class="l2r">            <div class="field">                <label>                    Fiscal Year</label>                <div class="item">                    <input type="text" name="FscYeaTitle" style="width: 80px" /></div>            </div>        </fieldset>    </div>    <table class="bud-grid-1">        <thead>            <tr>                <th style="width: 100px">                    House Code                </th>                <th style="width: 50px">                    Job                </th>                <th style="width: 95px">                    Fsc Account                </th>                <th style="width: 70px">                    Period 1                </th>                <th style="width: 70px">                    Period 2                </th>                <th style="width: 70px">                    Period 3                </th>                <th style="width: 70px">                    Period 4                </th>                <th style="width: 70px">                    Period 5                </th>                <th style="width: 70px">                    Period 6                </th>                <th style="width: 70px">                    Period 7                </th>                <th style="width: 70px">                    Period 8                </th>                <th style="width: 70px">                    Period 9                </th>                <th style="width: 70px">                    Period 10                </th>                <th style="width: 70px">                    Period 11                </th>                <th style="width: 70px">                    Period 12                </th>                <th>                </th>            </tr>        </thead>        <tbody id="data-list">        </tbody>    </table>    <div style="padding: 10px">        <input type="button" id="submitButton" value="Submit" />    </div></div>','<tr>     <td>        <input type="text" name="HouseCodeBrief" />    </td>     <td>        <input type="text" name="JobNumber" />    </td>    <td>        <input type="text" name="FscAccCode" />    </td>    <td>        <input type="text" name="Period1" />    </td>    <td>        <input type="text" name="Period2" />    </td>    <td>        <input type="text" name="Period3" />    </td>    <td>        <input type="text" name="Period4" />    </td>    <td>        <input type="text" name="Period5" />    </td>    <td>        <input type="text" name="Period6" />    </td>    <td>        <input type="text" name="Period7" />    </td>    <td>        <input type="text" name="Period8" />    </td>    <td>        <input type="text" name="Period9" />    </td>    <td>        <input type="text" name="Period10" />    </td>    <td>        <input type="text" name="Period11" />    </td>    <td>        <input type="text" name="Period12" />    </td></tr>',''];

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

    bud.page.ImportBudget = bine.extend(bine.Control, {
        tpl: window.__bt__8c60c5ac[0],

        dataList: null,
        $fscAccounts: null,
        $hcmHouseCodes: null,
        $hcmJobs: null,
        $fscYears: null,

        hcmHouseCodeMappings: null,
        fscAccountMappings: null,

        onDomReady: function () {
            var me = this;

            me.loadFscAccounts();
            me.loadHcmHouseCodes();
            me.loadFscYears();

            me.createUploader();
            me.createKeysForm();
            me.createDataList();
            me.createButtons();

            me.$hcmJobs = {};

            var data = [];
            me.dataList.val(data);

        },

        createButtons: function () {
            var me = this;

            var submitButton = me.$('#submitButton');
            submitButton.click(function (e) {
                e.preventDefault();

                if (me.dataList.isValid() && me.keysForm.isValid()) {

                    var data = me.dataList.val();
                    data = bine.query(data).clean().toArray();
                    var briefs = [];
                    var hcmHouseCodes = [];

                    $.each(data, function (index, item) {
                        if (briefs.indexOf(item.HouseCodeBrief) < 0) {
                            briefs.push(item.HouseCodeBrief);
                            hcmHouseCodes.push(me.getHcmHouseCode(item.HouseCodeBrief));
                        }
                    });

                    //var hcmHouseCodes = jQuery.unique(bine.query(data).select(function (i) { return me.getHcmHouseCode(i.HouseCodeBrief); }).toArray());

                    me.mask('Validating Job Number');
                    me.loadHcmJobs(hcmHouseCodes, function () {
                        me.unmask();
                        if (me.dataList.isValid())
                            me.postData();
                        else
                            alert('Invalid Job Number!');
                    });
                }
                else {
                    alert('Some fields contain invalid data, please fix it!');
                }
            });

        },

        createKeysForm: function () {
            var me = this;
            me.keysForm = new bine.DataView({
                tpl: me.$('#keys-form'), id: me.id()
            }, {
                FscYeaTitle: {
                    isValid: function (value) {
                        return me.getFscYear(value);
                    }
                }
            });
        },

        createUploader: function () {
            var me = this;
            me.uploader = new bine.Uploader({ url: '/net/crothall/chimes/fin/bud/act/FileUpload.aspx' });
            me.append(me.uploader, 'uploader');

            me.uploader.on('beforeupload', function () {
                if (fin.bud.modified())
                    return false;
                me.mask('Uploading...');
            });
            me.uploader.on('upload', function (response) {
                me.bindImportedData(bine.parseJSON(response));
                me.unmask();
            });
        },

        createDataList: function () {
            var me = this;
            me.dataList = new bine.DataViewList({
                tpl: me.$('#data-list'), id: me.id(),
                createDataView: function () {
                    var dl = this;

                    var moneyConfig = {
                        type: 'number',
                        convertDisplay: function (value) {
                            if (!value)
                                return '0.00';
                            return value.numberFormat('0,000.00');
                        },
                        convertBack: function (value) {
                            if (!value)
                                return 0;
                            return value;
                        }
                    };

                    var fscAccCodeConfig = {
                        type: 'number', align: 'left',
                        isValid: function (value) {
                            return me.getFscAccount(value);
                        }
                    };

                    var houseCodeConfig = {
                        type: 'number', align: 'left',
                        isValid: function (value) {
                            return me.getHcmHouseCode(value);
                        }
                    }
                    var jobConfig = {
                        isValid: function (value) {
                            return me.getHcmJob(me.getHcmHouseCode(this.val('HouseCodeBrief')), value);
                        }
                    }


                    return new bine.DataView({
                        tpl: window.__bt__8c60c5ac[1], removable: true,
                        onDomReady: function () {
                            var dv = this;
                            dv.on('change', function (name) {
                                if (dv.name != name)
                                    fin.bud.modified(true);
                            });
                            dv.on('remove', function () {
                                fin.bud.modified(true);
                            });
                        }
                    }, {
                        FscAccCode: fscAccCodeConfig,
                        HouseCodeBrief: houseCodeConfig,
                        JobNumber: jobConfig,
                        Period1: moneyConfig,
                        Period2: moneyConfig,
                        Period3: moneyConfig,
                        Period4: moneyConfig,
                        Period5: moneyConfig,
                        Period6: moneyConfig,
                        Period7: moneyConfig,
                        Period8: moneyConfig,
                        Period9: moneyConfig,
                        Period10: moneyConfig,
                        Period11: moneyConfig,
                        Period12: moneyConfig,
                        Period13: moneyConfig
                    });

                }
            });

        },

        bindImportedData: function (data) {
            var me = this;
            var list = [];

            if (!data || data.length == 0) {
                alert('Error: Budget Import worksheet does not exist!');
                return;
            }

            var fscAccountLkup = {};
            $.each(data, function (index, row) {

                if (index == 0) {
                    me.keysForm.val('FscYeaTitle', row[2]);
                }

                var houseCode = row[0];
                var jobNumber = row[1];

                var fscAccount = me.parseInt(row, 3);
                var lkupKey = houseCode + '_' + fscAccount;
                var item = fscAccountLkup[lkupKey];
                if (!item) {
                    item = { FscAccCode: fscAccount, JobNumber: jobNumber, HouseCodeBrief: houseCode };
                    fscAccountLkup[lkupKey] = item;
                    list.push(item);
                }

                //item['JobNumber'] = row[1];
                //item['HouseCodeBrief'] = row[0];

                for (var i = 1; i <= 12; i++) {
                    item['Period' + i] = ( item['Period' + i] || 0) + me.parseFloat(row, i + 3);
                }

            });

            me.dataList.val(list);
            fin.bud.modified(false);
        },

        postData: function () {
            var me = this;

            var fscYear = me.getFscYear(me.keysForm.val('FscYeaTitle'));

            var data = me.dataList.val();

            data = bine.query(data).clean().toArray();

            if (!data || data.length == 0) {
                alert('Error: pelase upload a file first.');
                return;
            }

            var hcmHouseCodes = [];

            $.each(data, function (index, i) {
                var hcmHouseCode = me.getHcmHouseCode(i.HouseCodeBrief);
                var keyPair = hcmHouseCode + '~' + me.getHcmJob(hcmHouseCode, i.JobNumber) + '~' + i.HouseCodeBrief + '~' + i.JobNumber;
                if (hcmHouseCodes.indexOf(keyPair) < 0)
                    hcmHouseCodes.push(keyPair);
            });


            //            var hcmHouseCodes = jQuery.unique(bine.query(data).select(function (i) {
            //                var hcmHouseCode = me.getHcmHouseCode(i.HouseCodeBrief);
            //                return hcmHouseCode + '~' + me.getHcmJob(hcmHouseCode, i.JobNumber) + '~' + i.HouseCodeBrief + '~' + i.JobNumber;
            //            }).toArray());

            var xml = ['<transaction id="1">\r\n'];

            var popupMessages = [];

            $.each(hcmHouseCodes, function (index, item) {
                var keys = item.split('~');
                xml.push(String.format('<budAnnualBudgetStart hcmHouseCode="{0}" hcmJob="{1}" fscYear="{2}"/>\r\n',
                                keys[0], keys[1], fscYear));
                xml.push(String.format('<budDetailDelete hcmHouseCode="{0}" hcmJob="{1}" fscYear="{2}"/>\r\n',
                                keys[0], keys[1], fscYear));
                popupMessages.push(String.format('Budget for housecode {0}, job {1}, fiscal year {2} have been sucessfully imported',
                                    keys[2], keys[3], me.keysForm.val('FscYeaTitle')));
            });


            $.each(data, function (index, item) {
                var hcmHouseCode = me.getHcmHouseCode(item.HouseCodeBrief);
                xml.push('<budDetail ');
                xml.push(String.format(' hcmHouseCode="{0}"', hcmHouseCode));
                xml.push(String.format(' hcmJob="{0}"', me.getHcmJob(hcmHouseCode, item.JobNumber)));
                xml.push(String.format(' fscYear="{0}"', fscYear));
                xml.push(String.format(' fscAccount="{0}"', me.getFscAccount(item.FscAccCode)));
                xml.push(' genericImport="1"');

                for (var i = 1; i <= 12; i++) {
                    xml.push(String.format(' period{1}="{0}"', item['Period' + i] || 0, i));
                }
                xml.push(' />\r\n');
            });


            $.each(hcmHouseCodes, function (index, item) {
                var keys = item.split('~');
                xml.push(String.format('<budAnnualBudgetApprove hcmHouseCode="{0}" hcmJob="{1}" fscYear="{2}" approved="1"  comments=""/>\r\n',
                                keys[0], keys[1], fscYear));
            });

            xml.push('</transaction>');


            // console.log(xml.join(''));
            // return;

            me.mask('Importing...');

            fin.bud.budSubmit(xml.join(''), function () {

                alert(popupMessages.join('\r\n'));
                me.dataList.val([]);
                me.keysForm.val({ HouseCodeBrief: '', JobNumber: '', FscYeaTitle: '' });
                fin.bud.modified(false);
                me.unmask();
            });

        },

        loadFscAccounts: function () {
            var me = this;
            var criteriaXml = '<criteria>storeId:budFscAccounts,userId:[user],</criteria>';
            me.mask('Loading...');
            fin.bud.budRequest(criteriaXml, function (data) {
                me.$fscAccounts = $(data);
                me.fscAccountMappings = {};
                $('item', $(data)).each(function (index, item) {
                    var $item = $(item);
                    me.fscAccountMappings[$item.attr('code')] = $item.attr('id');
                });
                me.unmask();
            });
        },

        loadFscYears: function () {
            var me = this;
            var criteriaXml = '<criteria>storeId:fiscalYears,userId:[user],</criteria>';
            me.mask('Loading...');

            fin.bud.budRequest(criteriaXml, function (data) {
                me.$fscYears = $(data);
                me.unmask();
            });
        },

        loadHcmHouseCodes: function () {
            var me = this;
            var criteriaXml = '<criteria>appUnitBrief:,storeId:hcmHouseCodes,userId:[user],</criteria>';
            me.mask('Loading...');

            fin.bud.hcmRequest(criteriaXml, function (data) {
                me.$hcmHouseCodes = $(data);
                me.hcmHouseCodeMappings = {};
                $('item', me.$hcmHouseCodes).each(function (index, item) {
                    var $item = $(item);
                    me.hcmHouseCodeMappings[$item.attr('brief')] = $item.attr('id');
                });
                me.unmask();
            });
        },

        getFscAccount: function (code) {
            var me = this;
            if (!me.fscAccountMappings)
                return false;
            return me.fscAccountMappings[code];
            var node = $('[code="' + code + '"]', me.$fscAccounts);
            if (node.length == 0)
                return null;
            return node.attr('id');
        },

        getFscYear: function (code) {
            var me = this;
            if (!me.$fscYears)
                return false;
            var node = $('[name="' + code + '"]', me.$fscYears);
            if (node.length == 0)
                return null;
            return node.attr('id');
        },

        getHcmHouseCode: function (code) {
            var me = this;
            if (!me.hcmHouseCodeMappings)
                return false;

            return me.hcmHouseCodeMappings[code];

            var node = $('[brief="' + code + '"]', me.$hcmHouseCodes);
            if (node.length == 0)
                return null;
            return node.attr('id');
        },

        loadHcmJobs: function (hcmHouseCodes, callback) {
            var me = this;

            $.each(hcmHouseCodes, function (index, code) {
                if (!me.$hcmJobs[code]) {
                    me.$hcmJobs[code] = null;
                }
            });

            var innerCallback = function () {
                var reamingCalls = 0;
                for (var key in me.$hcmJobs) {
                    if (!me.$hcmJobs[key]) {
                        reamingCalls++;
                    }
                }
                if (reamingCalls == 0)
                    callback();
            };

            var jobRequest = function (hcmHouseCode) {
                var criteriaXml = String.format('<criteria>houseCodeId:{0},jobType:0,storeId:houseCodeJobs,userId:[user],</criteria>', hcmHouseCode);

                fin.bud.hcmRequest(criteriaXml, function (data) {
                    me.$hcmJobs[hcmHouseCode] = $(data);
                    innerCallback();
                });
            };

            var allJobLoaded = true;
            for (var key in me.$hcmJobs) {
                if (!me.$hcmJobs[key]) {
                    jobRequest(key);
                    allJobLoaded = false;
                }
            }

            if (allJobLoaded)
                callback();

        },

        getHcmJob: function (hcmHouseCode, jobNumber) {
            var me = this;
            if (!hcmHouseCode || !me.$hcmJobs[hcmHouseCode])
                return true;
            var node = $('[jobNumber="' + jobNumber + '"]', me.$hcmJobs[hcmHouseCode]);
            if (node.length == 0)
                return null;
            return node.attr('jobId');
        },

        parseInt: function (array, index) {
            if (array.length > index)
                return parseInt(array[index]) || 0;
            return 0;
        },

        parseFloat: function (array, index) {
            if (array.length > index)
                return parseFloat(array[index]) || 0;
            return 0;
        }

    });

} (fin.bud);
