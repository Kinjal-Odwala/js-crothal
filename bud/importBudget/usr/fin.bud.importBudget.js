window.__bt__43e63e71 = ['<div style="margin :15px;">    <div id="uploader">    </div>    <div id="keys-form" style="margin :15px 0">        <fieldset class="l2r">           <div class="field">                <label>                    Fiscal Year</label>                <div class="item">                    <input type="text" name="FscYeaTitle" style="width: 80px" /></div>            </div>        </fieldset>    </div>    <table class="bud-grid-1">        <thead>            <tr>                <th style="width: 100px">                  House Code                </th>                  <th style="width: 50px">                    Job                </th>                <th style="width: 95px">                    Fsc Account                </th>                <th style="width: 70px">                    Period 1                </th>                <th style="width: 70px">                    Period 2                </th>                <th style="width: 70px">                    Period 3                </th>                <th style="width: 70px">                    Period 4                </th>                <th style="width: 70px">                    Period 5                </th>                <th style="width: 70px">                    Period 6                </th>                <th style="width: 70px">                    Period 7                </th>                <th style="width: 70px">                    Period 8                </th>                <th style="width: 70px">                    Period 9                </th>                <th style="width: 70px">                    Period 10                </th>                <th style="width: 70px">                    Period 11                </th>                <th style="width: 70px">                    Period 12                </th>                   <th style="width: 70px">                    Period 13                </th>                <th></th>            </tr>        </thead>        <tbody id="data-list">        </tbody>    </table>    <input type="button" id="submitButton" value="Submit" /></div>','<tr>     <td>        <input type="text" name="HouseCodeBrief" />    </td>     <td>        <input type="text" name="JobNumber" />    </td>    <td>        <input type="text" name="FscAccCode" />    </td>    <td>        <input type="text" name="Period1" />    </td>    <td>        <input type="text" name="Period2" />    </td>    <td>        <input type="text" name="Period3" />    </td>    <td>        <input type="text" name="Period4" />    </td>    <td>        <input type="text" name="Period5" />    </td>    <td>        <input type="text" name="Period6" />    </td>    <td>        <input type="text" name="Period7" />    </td>    <td>        <input type="text" name="Period8" />    </td>    <td>        <input type="text" name="Period9" />    </td>    <td>        <input type="text" name="Period10" />    </td>    <td>        <input type="text" name="Period11" />    </td>    <td>        <input type="text" name="Period12" />    </td>       <td>        <input type="text" name="Period13" />    </td></tr>',''];

bine.namespace('fin.bud', 'fin.bud.page', 'fin.bud.data');

fin.bud.budRequest = function (requestXml, callback) {
    var data = String.format('moduleId=bud&requestId=1&requestXml={0}&&targetId=iiCache', encodeURIComponent(requestXml));

    jQuery.post('/net/crothall/chimes/fin/bud/act/Provider.aspx', data, function (data, status) {
        callback(data);
    });
}

fin.bud.hcmRequest = function (requestXml, callback) {
    var data = String.format('moduleId=hcm&requestId=1&requestXml={0}&&targetId=iiCache', encodeURIComponent(requestXml));

    jQuery.post('/net/crothall/chimes/fin/hcm/act/Provider.aspx', data, function (data, status) {
        callback(data);
    });
}

fin.bud.budSubmit = function (submitXml, callback) {
    var data = String.format('moduleId=bud&requestId=1&requestXml={0}&&targetId=iiTransaction', encodeURIComponent(submitXml));

    jQuery.post('/net/crothall/chimes/fin/bud/act/Provider.aspx', data, function (data, status) {
        callback(data);
    });
}



!function (bud) {

    bud.page.ImportBudget = bine.extend(bine.Control, {
        tpl: window.__bt__43e63e71[0],

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
                        tpl: window.__bt__43e63e71[1], removable: true
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

            $.each(data, function (index, row) {
                var item = {};
                if (index == 0) {
                    me.keysForm.val('FscYeaTitle', row[2]);
                }
                item['FscAccCode'] = me.parseInt(row, 3);
                item['JobNumber'] = row[1];
                item['HouseCodeBrief'] = row[0];

                for (var i = 1; i <= 13; i++) {
                    item['Period' + i] = me.parseFloat(row, i + 3);
                }
                list.push(item);

            });

            me.dataList.val(list);
        },

        postData: function () {
            var me = this;

            var fscYear = me.getFscYear(me.keysForm.val('FscYeaTitle'));

            var data = me.dataList.val();

            data = bine.query(data).clean().toArray();

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

                for (var i = 1; i <= 16; i++) {
                    xml.push(String.format(' period{1}="{0}"', item['Period' + i] || 0, i));
                }
                xml.push(' />\r\n');
            });
            xml.push('</transaction>');

            // console.log(xml.join(''));
            // return;

            me.mask('Importing...');

            fin.bud.budSubmit(xml.join(''), function () {

                alert(popupMessages.join('\r\n'));
                me.dataList.val([]);
                me.keysForm.val({ HouseCodeBrief: '', JobNumber: '', FscYeaTitle: '' });
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
