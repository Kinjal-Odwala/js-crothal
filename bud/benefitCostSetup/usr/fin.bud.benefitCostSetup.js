window.__bt__c7e5aa1d = ['<div style="margin: 15px;">    <div id="itemStatusDiv" style="padding: 10px;">        <div class="itemStatusImage Normal" id="itemStatusImage">        </div>        <div class="itemModifiedImage" id="itemModifiedImage">        </div>        <div id="itemStatusText" class="itemStatusText">            Normal        </div>    </div>    <div style="padding: 10px;margin-top: 20px;" id="fsc-year-form">        <span>Fiscal Year: </span>        <span id="fsc-year-form-fscYear" name="fscYear" style="display:inline-block;"></span></div>    <table class="bud-grid-1" style="">        <thead>            <tr>                 <th style="width: 100px">Type                </th>                <th style="width: 100px">Name                </th>                <th style="width: 110px">Single Coverage                </th>                <th style="width: 110px">Single + Spouse                </th>                <th style="width: 130px">Single + Dependant                </th>                <th style="width: 110px">Family Coverage                </th>                <th style="width: 80px">Life                </th>                                 <th style="width: 200px">Notes                </th>                <th style="width: 200px">House Codes                </th>                <th></th>            </tr>        </thead>        <tbody id="data-list">        </tbody>    </table>    <div style="padding: 10px">        <input type="button" id="addButton" value="Add New Row" />        <input type="button" id="submitButton" value="Submit" />    </div></div><div id="popup" class="popup">    <div class="housecodes-list-wrapper" style="width: 400px; padding: 20px; margin: 50px auto; background-color: white">        <h3>Edit House Codes</h3>        <div class="housecodes-list-container" style="overflow:auto;">            <table class="bud-grid-1" style="margin-top: 20px; width: 350px;">                <thead>                    <tr>                        <th style="width: 100px">House Code                        </th>                        <th><a href="#" id="addHouseCodeBtutton">Add</a></th>                    </tr>                </thead>                <tbody id="house-code-list">                </tbody>            </table>        </div>        <div style="padding: 10px">            <input type="button" id="applyHouseCodeButton" value="Apply" />            <input type="button" id="cancelHouseCodeButton" value="Cancel" />        </div>    </div></div>','<tr>     <td id="costType">    </td>     <td>        <input type="text" name="costName" />    </td>     <td>        <input type="text" name="singleCoverageCost" />    </td>    <td>        <input type="text" name="singleSpouseCost" />    </td>    <td>        <input type="text" name="singleDependantCost" />    </td>    <td>        <input type="text" name="familyCoverageCost" />    </td>    <td>        <input type="text" name="lifeCost" />    </td>       <td>        <input type="text" name="notes" maxlength="100"/>    </td>       <td >        <a href="#" id="houseCodes" name="houseCodes"></a>    </td></tr>','<tr>    <td id="houseCode">    </td></tr>',''];

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
    var HcmHouseCodes = [];
    var FscYears = [];


    var HcmHouseCodeLookup = {};
    var HcmHouseCodeStore = new Ext.data.JsonStore({
        root: 'data',
        idProperty: 'Id',
        fields: [{ name: 'Id' }, { name: 'Description' }]
    });

    var FscYearStore = new Ext.data.JsonStore({
        root: 'data',
        idProperty: 'Id',
        fields: [{ name: 'Id' }, { name: 'Description' }]
    });

    var CostTypeStore = new Ext.data.JsonStore({
        root: 'data',
        idProperty: 'Id',
        fields: [{ name: 'Id' }, { name: 'Description' }]
    });

    CostTypeStore.loadData({
        data: [
            { Id: 1, Description: 'Medical 1' },
             { Id: 2, Description: 'Medical 2' },
             { Id: 3, Description: 'Medical 3' },
             { Id: 4, Description: 'Medical 4' },
             { Id: 5, Description: 'Medical 5' },
             { Id: 6, Description: 'Dental Only' },
             { Id: 7, Description: 'Liberty Plan' }
        ]
    });


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

    bud.page.BenefitCostSetup = bine.extend(bine.Control, {
        tpl: window.__bt__c7e5aa1d[0],

        dataList: null,
        $hcmHouseCodes: null,
        houseCodeList: null,
        hcmHouseCodeMappings: null,
        fscYearForm: null,

        currentDv:null,

        onDomReady: function () {
            var me = this;

            me.createDataList();
            me.createButtons();

            var data = [];
            me.dataList.val(data);

            me.createHouseCodeList();

            me.houseCodeList.val([{}, {}]);

            me.loadFscYears(function () {
              
                me.loadHcmHouseCodes(function () {
                    me.createFscYearForm();

                    me.fscYearForm.on('change', function (name, value) {
                        if (name=='fscYear')
                            me.loadBenefitsCostInitials();
                    });

                    me.fscYearForm.val('fscYear', FscYears[0].Id);
                   
                });
            });
          

            me.$('.housecodes-list-wrapper').css('height', (getViewPort().height - 150) + 'px');
            me.$('.housecodes-list-container').css('height', (getViewPort().height - 200) + 'px');

        },

        createButtons: function () {
            var me = this;

            var submitButton = me.$('#submitButton');
            submitButton.click(function (e) {
                e.preventDefault();

                if (me.dataList.isValid()) {
                    me.postData();
                }
                else {
                    alert('Some fields contain invalid data, please fix it!');
                }
            });

            var addButton = me.$('#addButton');

            addButton.click(function (e) {
                me.dataList.add({ singleCoverageCost: 0, singleSpouseCost: 0, singleDependantCost: 0, familyCoverageCost: 0, lifeCost: 0, costName: '', houseCodes: '' });
            });

            me.$('#addHouseCodeBtutton').click(function (e) {
                e.preventDefault();
                me.houseCodeList.add({});
            });

            me.$('#cancelHouseCodeButton').click(function (e) {

                me.$('#popup').hide();
            });

            me.$('#applyHouseCodeButton').click(function (e) {

                var houseCodes = me.houseCodeList.val();
                houseCodes = bine.query(houseCodes).clean().toArray();
                var data = [];

                for (var i = 0; i < houseCodes.length; i++)
                {
                    if (data.indexOf(houseCodes[i].houseCode) == -1)
                        data.push(houseCodes[i].houseCode);
                }

                me.currentDv.val('houseCodes', data.join(','));
                me.currentDv.refresh();
                me.$('#popup').hide();
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
                        isValid: function (value) {
                            if (value >= 999999)
                                return false;
                            var dv = this;
                            if (dv.val('singleCoverageCost') == 0 && dv.val('singleSpouseCost') == 0 && dv.val('singleDependantCost') == 0 && dv.val('familyCoverageCost') == 0 && dv.val('lifeCost') == 0)
                                return false;

                            return true;
                        },
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

                    var costNameConfig = {
                        type: 'string', align: 'left',
                        isValid: function (value) {
                            if (!value)
                                return false;

                            return true;
                            
                            
                        }
                    };

                    var houseCodeConfig = {
                        align: 'left',
                        isValid: function (value) {
                            var dv = this;
                            var dataIndex = me.dataList.val().indexOf(dv.val());
                            if (dataIndex < 5 && dataIndex >= 0)
                                return true;

                            if (!value)
                                return false;

                            var overflow5 = false;
                            var houseCodes = value.split(',');
                            $.each(houseCodes, function (index, houseCode) {
                                overflow5 = bine.query(me.dataList.val()).where(function (i) { return (i.houseCodes || '').split(',').indexOf(houseCode) >= 0; }).count() > 5;
                                if (overflow5)
                                    return false;
                            });

                            return !overflow5;
                        },
                        convertDisplay: function (value) {
                            var dv = this;
                            var items = value.split(',');
                            var text = '';
                            for (var i = 0; i < items.length; i++) {
                                var houseCode = HcmHouseCodeLookup[items[i]];
                                if (houseCode)
                                    text += houseCode.Code + ',';
                            }
                            if (text == '') {
                                var dataIndex = me.dataList.val().indexOf(dv.val());
                                if (dataIndex < 5 && dataIndex >= 0)
                                    return '';
                                else
                                    return 'Add';
                            }
                            return text;
                        }
                    };


                    return new bine.DataView({
                        tpl: window.__bt__c7e5aa1d[1], removable: true,
                        onDomReady: function () {
                            var dv = this;
                            dv.on('change', function (name,newValue) {
                                if (dv.name != name) {
                                    fin.bud.modified(true);
                                }
                                else {
                                    var dataIndex = me.dataList.val().indexOf(newValue);
                                    if (dataIndex < 5 && dataIndex >= 0)
                                        dv.setRemovable(false);
                                }

                                if (name == 'singleCoverageCost' || name == 'singleSpouseCost' || name == 'singleDependantCost' || name == 'familyCoverageCost' || name == 'lifeCost') {
                                    dv.refresh('singleCoverageCost');
                                    dv.refresh('singleSpouseCost');
                                    dv.refresh('singleDependantCost');
                                    dv.refresh('familyCoverageCost');
                                    dv.refresh('lifeCost');
                                }

                            });
                            dv.on('remove', function () {
                                fin.bud.modified(true);
                            });

                            dv.$('#houseCodes').click(function (e) {
                                e.preventDefault();
                                var houseCodes = dv.val('houseCodes');
                                var data = [];

                                if (houseCodes) {
                                    var items = houseCodes.split(',');
                                    for (var i = 0; i < items.length; i++) {
                                        var houseCode = HcmHouseCodeLookup[items[i]];
                                        if (houseCode)
                                            data.push({ houseCode: items[i] });
                                    }
                                }
                                me.houseCodeList.val(data);
                                me.currentDv = dv;
                                me.$('#popup').show();

                            });

                            var costTypeComboBox = new ComboBox({ store: CostTypeStore, name: 'costType', editable: false, width: 110, listWidth: 110 });
                            dv.addField(costTypeComboBox);
                        }
                    }, {
                        costName: costNameConfig,
                        singleCoverageCost: moneyConfig,
                        singleSpouseCost: moneyConfig,
                        singleDependantCost: moneyConfig,
                        familyCoverageCost: moneyConfig,
                        lifeCost: moneyConfig,
                        houseCodes: houseCodeConfig,
                        costType: {
                            type:'number',
                            isValid: function (value) {
                                if (!value)
                                    return false;
                                var dv = this;

                                if (!dv.val('houseCodes'))
                                    return true;

                                var duplicate = false;
                                var houseCodes = (dv.val('houseCodes') || '').split(',');
                                $.each(houseCodes, function (index, houseCode) {
                                    duplicate = bine.query(me.dataList.val()).where(function (i) { return i.costType == value && (i.houseCodes || '').split(',').indexOf(houseCode) >= 0; }).count() > 1;

                                    if (duplicate)
                                        return false;
                                });

                                return !duplicate;
                            }
                        }
                    });

                }
            });

        },

        createFscYearForm: function () {
            var me = this;
            var fscYearConfig = {
                type: 'number', align: 'left',
                isValid: function (value) {
                    return true;
                }
            }

            me.fscYearForm = new bine.DataView({
                tpl: me.$('#fsc-year-form'), id: me.id('fsc-year-form'),
                onDomReady: function () {
                    var dv = this;
                           
                    var fscYearCombobox = new ComboBox({ store: FscYearStore, name: 'fscYear', editable: false, width: 150, listWidth: 150 });
                    dv.addField(fscYearCombobox);
                    //houseCodeComboBox.on('beforeselect', onhhcBeforeSelect);

                }
            }, {
                fscYear: fscYearConfig
            });
        },

        createHouseCodeList: function () {
            var me = this;
            me.houseCodeList = new bine.DataViewList({
                tpl: me.$('#house-code-list'), id: me.id('house-codes'),
                createDataView: function () {
                    var dl = this;

                    var houseCodeConfig = {
                        type: 'number', align: 'left',
                        isValid: function (value) {
                            return HcmHouseCodeLookup[value];
                        }
                    }

                    return new bine.DataView({
                        tpl: window.__bt__c7e5aa1d[2], removable: true,
                        onDomReady: function () {
                            var dv = this;
                           
                            var houseCodeComboBox = new ComboBox({ store: HcmHouseCodeStore, name: 'houseCode', editable: true, width: 300, listWidth: 300 });
                            dv.addField(houseCodeComboBox);
                            //houseCodeComboBox.on('beforeselect', onhhcBeforeSelect);

                        }
                    }, {
                        houseCode: houseCodeConfig
                    });

                }
            });

        },


        postData: function () {
            var me = this;


            var data = me.dataList.val();

            //data = bine.query(data).clean().toArray();

            var xml = ['<transaction id="1">\r\n'];

            var popupMessages = [];

            $.each(data, function (index, item) {
                xml.push('<budBenefitsCostInitial ');
                xml.push(String.format(' {0}="{1}"', 'fscYear', me.fscYearForm.val('fscYear')));
                for (var key in item) {
                    if (key == 'costName' || key=='notes')
                        xml.push(String.format(' {0}="{1}"', key, (item[key] || '').replace(/&/gi, '&amp;').replace(/"/gi, '&quot;').replace(/</gi, '&lt;').replace(/>/gi, '&gt;')));
                    else
                        xml.push(String.format(' {0}="{1}"', key, item[key]));
                }

                xml.push(' />\r\n');
            });

            xml.push('</transaction>');


            me.mask('Saving...');

            fin.bud.budSubmit(xml.join(''), function () {

                alert('Data has been saved successfully!');
                fin.bud.modified(false);
                me.loadBenefitsCostInitials();
                me.unmask();
            });

        },

        loadFscYears: function (callback) {
            var me = this;
            var criteriaXml = '<criteria>storeId:fiscalYears,userId:[user],</criteria>';
            me.mask('Loading...');

            fin.bud.budRequest(criteriaXml, function (data) {
               

                FscYears = [];
                $('item', $(data)).each(function (index, item) {
                    var $item = $(item);
                    var FscYear = { Id: parseInt($item.attr('id')), Description: $item.attr('title') };
                    FscYears.push(FscYear);
                });

                FscYearStore.loadData({ data: FscYears });

                me.unmask();
                if (callback)
                    callback();
            });
        },

        loadHcmHouseCodes: function (callback) {
            var me = this;
            var criteriaXml = '<criteria>appUnitBrief:,storeId:hcmHouseCodes,userId:[user],</criteria>';
            me.mask('Loading...');

            fin.bud.hcmRequest(criteriaXml, function (data) {
               
                HcmHouseCodes = [];
                $('item', $(data)).each(function (index, item) {
                    var $item = $(item);
                    var HcmHouseCode = { Id: parseInt($item.attr('id')), Description: $item.attr('name'), Code: $item.attr('brief'), HirNode: $item.attr('hirNode'), AppUnit: $item.attr('appUnit') };
                    HcmHouseCodes.push(HcmHouseCode);
                    HcmHouseCodeLookup[HcmHouseCode.Id] = HcmHouseCode;
                });

                HcmHouseCodeStore.loadData({ data: HcmHouseCodes });

                me.unmask();
                if (callback)
                    callback();
            });

            
        },

        loadBenefitsCostInitials: function () {
            var me = this;
            var criteriaXml = '<criteria>storeId:budBenefitsCostInitials,userId:[user],fscYear:' + me.fscYearForm.val('fscYear') + '</criteria>';
            me.mask('Loading...');

            fin.bud.budRequest(criteriaXml, function (data) {
                var $data = $(data);
                var data = [];
                $('item', $data).each(function (index, item) {
                    var $item = $(item);
                    data.push({
                        id: $item.attr('id'),
                        costName: $item.attr('costName'),
                        singleCoverageCost: parseFloat( $item.attr('singleCoverageCost')),
                        singleSpouseCost: parseFloat($item.attr('singleSpouseCost')),
                        singleDependantCost:parseFloat( $item.attr('singleDependantCost')),
                        familyCoverageCost: parseFloat($item.attr('familyCoverageCost')),
                        lifeCost: parseFloat($item.attr('lifeCost')),
                        houseCodes: $item.attr('houseCodes'),
                        notes: $item.attr('notes'),
                        costType: $item.attr('costType')
                    });
                });

                var emptyHcIndex = bine.query(data).where(function (i) { return !i.houseCodes; }).count();

                while (emptyHcIndex < 5) {

                    var costName = emptyHcIndex < 3 ? 'Medical ' + (emptyHcIndex + 1) : 'Dental ' + (emptyHcIndex - 2);

                    data.splice(emptyHcIndex, 0,
                        {
                            costName: costName,
                            singleCoverageCost: 0, singleSpouseCost: 0,
                            singleDependantCost: 0, familyCoverageCost: 0,
                            lifeCost: 0, houseCodes: '', notes: ''
                        });
                    emptyHcIndex++;
                }

                me.dataList.val(data);
                me.unmask();
            });
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
        }
    });
} (fin.bud);
