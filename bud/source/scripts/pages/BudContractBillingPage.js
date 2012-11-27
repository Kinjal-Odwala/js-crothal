/// <reference path="../Core.js" />

WebLight.namespace('Bud.page');

Bud.page.ContractBillingPage = WebLight.extend(Bud.page.BudgetPage, {
    title: 'Contract Billing',
    html: '<% import path="..\templates\contractbilling.htm" %>',
    arrayStore: null,

    _billingPeriodLabel: null,
    _currentBillingRateTextBox: null,
    _currentBillingDailyRateLabel: null,
    _currentBillingPeriodRateLabel: null,
    _currentBillingPercentIncreaseTextBox: null,
    _currentBillingAmountIncreaseLabel: null,
    _currentBillingDateEffectiveDateBox: null,
    _newBillingRateLabel: null,
    _newBillingDailyRateLabel: null,
    _newBillingPeriodRateLabel: null,

    _currentBillingDailyRate: 0,
    _newBillingDailyRate: 0,

    _incomeTypeStore: null,
    _incomeTypeGrid: null,
    _incomeTypeGridColumnModel: null,
    _liveIncomeTypeStore: null,
    _billingPeriodStore: null,
    _hcmHouseDetailStore: null,

    _fiscalPeriodStore: null,
    _currentBillingNoes: null,
    _currentBillingSaveButton: null,
    _currentBillingCancelButton: null,
    _currentBillingPrintButton: null,


    createBillingPeriodFields: function () {
        this._billingPeriodLabel = Ext.create({ xtype: 'displayfield' });
        this.addChildControl(this._billingPeriodLabel, 'billing-period');

        this._currentBillingRateTextBox = Ext.create({ xtype: 'numberfield', style: 'border-width:0px; color:#5679FF; text-align:right;' });
        this.addChildControl(this._currentBillingRateTextBox, 'current-billing-rate');

        this._currentBillingDailyRateLabel = Ext.create({ xtype: 'displayfield' });
        this.addChildControl(this._currentBillingDailyRateLabel, 'current-billing-daily-rate');

        this._currentBillingPeriodRateLabel = Ext.create({ xtype: 'displayfield' });
        this.addChildControl(this._currentBillingPeriodRateLabel, 'current-billing-period-rate');

        this._currentBillingPercentIncreaseTextBox = Ext.create({ xtype: 'numberfield', style: 'border-width:0px; color:#5679FF; text-align:right;' });
        this.addChildControl(this._currentBillingPercentIncreaseTextBox, 'current-billing-percent-increase');

        this._currentBillingAmountIncreaseLabel = Ext.create({ xtype: 'displayfield' });
        this.addChildControl(this._currentBillingAmountIncreaseLabel, 'current-billing-amount-increase');

        this._currentBillingDateEffectiveDateBox = Ext.create({ xtype: 'datefield', style: 'color:#5679FF; text-align:right;' });
        this.addChildControl(this._currentBillingDateEffectiveDateBox, 'current-billing-date-effective');


        this._newBillingRateLabel = Ext.create({ xtype: 'displayfield' });
        this.addChildControl(this._newBillingRateLabel, 'new-billing-rate');

        this._newBillingDailyRateLabel = Ext.create({ xtype: 'displayfield' });
        this.addChildControl(this._newBillingDailyRateLabel, 'new-billing-daily-rate');

        this._newBillingPeriodRateLabel = Ext.create({ xtype: 'displayfield' });
        this.addChildControl(this._newBillingPeriodRateLabel, 'new-billing-period-rate');

        this._billingPeriodLabel.setValue('Monthly');
        this._currentBillingPercentIncreaseTextBox.setValue('0');
        this._currentBillingRateTextBox.setValue('0');

        this._currentBillingRateTextBox.on('change', function () {
            this.refreshPeriodFields();
            this.applyRateToGrid();
        }, this);

        this._currentBillingPercentIncreaseTextBox.on('change', function () {
            this.refreshPeriodFields();
            this.applyRateToGrid();
        }, this);

        this._currentBillingDateEffectiveDateBox.on('change', function () {
            this.applyRateToGrid();
        }, this);
    },

    applyRateToGrid: function () {

        // 169 Full Service Billings
        // 170 Management Fee Billings

        var incomeTypeId = 170;
        if (this._hcmHouseDetailStore.getCount() > 0) {
            if (this._hcmHouseDetailStore.getAt(0).get('contractTypeId') == 2)
                incomeTypeId = 169;
        }

        var incomeType = this._incomeTypeStore.getById(incomeTypeId);
        if (incomeType) {
            var dateEffective = this._currentBillingDateEffectiveDateBox.getValue();
            for (var i = 0; i < this._fiscalPeriodStore.getCount(); i++) {
                var record = this._fiscalPeriodStore.getAt(i);

                var value = this._currentBillingDailyRate * 28;
                if (dateEffective != '') {
                    var startDay = record.get('startDate').getYear() * 365 + record.get('startDate').getDayOfYear();
                    var endDay = record.get('endDate').getYear() * 365 + record.get('endDate').getDayOfYear();
                    var effectiveDay = dateEffective.getYear() * 365 + dateEffective.getDayOfYear();
                    if (startDay >= effectiveDay)
                        value = this._newBillingDailyRate * 28;
                    else if (startDay < effectiveDay && endDay > effectiveDay) {
                        value = (effectiveDay - startDay) * this._currentBillingDailyRate
                         + (endDay - effectiveDay + 1) * this._newBillingDailyRate;
                    }
                }

                incomeType.set('period' + record.get('title'), parseFloat(value.toFixed(2)));
            }
            this._incomeTypeGrid.getView().refresh(false);
        }
    },

    refreshPeriodFields: function () {

        var period = this._billingPeriodLabel.getValue();
        var rate = this._currentBillingRateTextBox.getValue();

        if (period == 'Biweekly')
            this._currentBillingDailyRate = rate / 14;
        else
            this._currentBillingDailyRate = rate * 12 / 365;

        var increasedAmount = this._currentBillingPercentIncreaseTextBox.getValue() * rate / 100;
        var dateEffective = this._currentBillingDateEffectiveDateBox.getValue();

        var newRate = rate + increasedAmount;

        if (period == 'Biweekly')
            this._newBillingDailyRate = newRate / 14;
        else
            this._newBillingDailyRate = newRate * 12 / 365;

        this._currentBillingDailyRateLabel.setValue(Ext.util.Format.number(this._currentBillingDailyRate, '0,000.00'));
        this._currentBillingPeriodRateLabel.setValue(Ext.util.Format.number(this._currentBillingDailyRate * 28, '0,000.00'));

        this._currentBillingAmountIncreaseLabel.setValue(Ext.util.Format.number(increasedAmount, '0,000.00'));

        this._newBillingRateLabel.setValue(Ext.util.Format.number(newRate, '0,000.00'));
        this._newBillingDailyRateLabel.setValue(Ext.util.Format.number(this._newBillingDailyRate, '0,000.00'));
        this._newBillingPeriodRateLabel.setValue(Ext.util.Format.number(this._newBillingDailyRate * 28, '0,000.00'));



    },

    refreshIncomeTypeGridColumnModel: function () {
        var numberRenderer = function (value, metaData, record, rowIndex, colIndex, store) {
            if (value == 0) {
                return '';
            }
            return Ext.util.Format.number(value, '0,000.00');
        };

        var descriptionRenderer = function (value, metaData, record, rowIndex, colIndex, store) {
            if (record.get('fscAccCode') == 0)
                return record.get('description');
            return String.format('{0} {1}', record.get('fscAccCode'), record.get('description'));
        };

        var columns = [{ header: this.getFiscalYear() + ' Period End Dates', width: 200, dataIndex: 'fscAccount', renderer: descriptionRenderer}];
        for (var i = 0; i < this._fiscalPeriodStore.getCount(); i++) {
            var record = this._fiscalPeriodStore.getAt(i);
            columns.push({ header: Ext.util.Format.date(record.get('endDate'), 'm/d/Y'), width: 70,
                dataIndex: 'period' + record.get('title'), editable: true, renderer: numberRenderer,
                editor: new Ext.form.NumberField({ allowBlank: false, allowNegative: false, minValue: 0 })
            });
        }
        columns.push({ header: this.getFiscalYear(), width: 70, dataIndex: 'fiscalYear', renderer: numberRenderer });

        if (this._incomeTypeGridColumnModel)
            this._incomeTypeGridColumnModel.setConfig(columns);
        else {
            this._incomeTypeGridColumnModel = new Ext.grid.ColumnModel({
                defaults: { sortable: false },
                columns: columns
            });
        }
    },

    ensureIncomeTypeGridCreated: function () {
        if (!this._incomeTypeGrid)
            this.createIncomeTypeGrid();
    },

    createIncomeTypeGrid: function () {


        var descriptionRow = [{ header: 'Period End Date', colspan: 1, align: 'center'}];

        for (var i = 1; i <= 13; i++) {
            descriptionRow.push({ header: 'Period ' + i, colspan: 1 });
        }

        descriptionRow.push({ header: 'Fiscal Year', colspan: 1 });

        var group = new Ext.ux.grid.ColumnHeaderGroup({
            rows: [descriptionRow]
        });

        this.refreshIncomeTypeGridColumnModel();

        this._incomeTypeGrid = new Ext.grid.EditorGridPanel({
            autoHeight: true, clicksToEdit: 1,
            store: this._incomeTypeStore, width: 1180,
            ctCls: 'ux-grid-1',
            plugins: group,
            cm: this._incomeTypeGridColumnModel,
            viewConfig: {
                forceFit: true
            }
        });

        this._incomeTypeGrid.on('afteredit', function (e) {
            /*
            grid - This grid
            record - The record being edited
            field - The field name being edited
            value - The value being set
            originalValue - The original value for the field, before the edit.
            row - The grid row index
            column - The grid column index
            */

            this._incomeTypeGrid.getView().refresh();

        }, this);

        this._incomeTypeGrid.on('beforeedit', function (e) {
            /*
            grid - This grid
            record - The record being edited
            field - The field name being edited
            value - The value for the field being edited.
            row - The grid row index
            column - The grid column index
            cancel - Set this to true to cancel the edit or return false from your handler.
            */

            if (e.record.get('accountCode') == 0)
                e.cancel = true;

        });

        this.addChildControl(this._incomeTypeGrid, 'period-grid-holder');
    },

    createNoteFields: function () {
        var current = this;
        this._currentBillingNoes = Ext.create({ xtype: 'textarea', style: 'width: 95%' });
        this.addChildControl(this._currentBillingNoes, 'billing-notes');

        this._currentBillingSaveButton = Ext.create({ xtype: 'button', ctCls: 'ux-button-1', text: 'Save', width: 80 });
        this._currentBillingSaveButton.on('click', function () {
            //current.maskPage('Saving...');
            if (current._billingPeriodStore.getCount() == 0)
                current._billingPeriodStore.add(current._billingPeriodStore.newRecord({}));
            var record = current._billingPeriodStore.getAt(0);
            record.set('rate', current._currentBillingRateTextBox.getValue());
            record.set('dateEffective', current._currentBillingDateEffectiveDateBox.getValue());
            record.set('percentIncrease', current._currentBillingPercentIncreaseTextBox.getValue() / 100);
            record.set('description', current._currentBillingNoes.getValue());
            current._billingPeriodStore.submitChanges();
            current._incomeTypeStore.submitChanges();

        }, this);
        this.addChildControl(this._currentBillingSaveButton, 'billing-save-button');

        this._currentBillingCancelButton = Ext.create({ xtype: 'button', ctCls: 'ux-button-1', text: 'Cancel', width: 80 });
        this.addChildControl(this._currentBillingCancelButton, 'billing-cancel-button');

        this._currentBillingPrintButton = Ext.create({ xtype: 'button', ctCls: 'ux-button-1', text: 'Print', width: 80 });
        this._currentBillingPrintButton.on('click', function () {
            current.print();
        });
        this.addChildControl(this._currentBillingPrintButton, 'billing-print-button');
    },

    createChildControls: function () {
        var me = this;

        this._incomeTypeStore = new Bud.data.IncomeTypeStore();
        this._fiscalPeriodStore = new Bud.data.FiscalPeriodStore();
        this._liveIncomeTypeStore = new Bud.data.IncomeTypeStore();
        this._billingPeriodStore = new Bud.data.BudBillingPeriodStore();
        this._hcmHouseDetailStore = new Bud.data.HcmHouseDetailStore();

        this.createBillingPeriodFields();
        //this.createIncomeTypeGrid();
        this.createNoteFields();

        this.on('contextChanged', function () {
            this._incomeTypeStore.loadSampleData();
            this._billingPeriodStore.load(this.getHouseCode(), this.getJobCode(), this.getFiscalYearId());
            this._incomeTypeStore.setContext(this.getHouseCode(), this.getJobCode(), this.getFiscalYearId());
            this._fiscalPeriodStore.load(this.getFiscalYearId());
            this._liveIncomeTypeStore.load(this.getHouseCode(), this.getJobCode(), this.getFiscalYearId());
            this._hcmHouseDetailStore.load(this.getHouseCode());
        }, this);

        Bud.page.ContractBillingPage.superclass.createChildControls.call(this);

    },
    dataBind: function () {
        var me = this;

        this._incomeTypeStore.loadSampleData();

        if (this.getFiscalYearId() > 0) {
            this._fiscalPeriodStore.load(this.getFiscalYearId());
            this._liveIncomeTypeStore.load(this.getHouseCode(), this.getJobCode(), this.getFiscalYearId());
        }
        this.refreshPeriodFields();

        this.grouping([this, this._fiscalPeriodStore, this._liveIncomeTypeStore, this._billingPeriodStore,
             this._incomeTypeStore, this._hcmHouseDetailStore]
        , { load: function () {

            var billingCycleFrequencyTypeId = me._hcmHouseDetailStore.getAt(0).get('billingCycleFrequencyTypeId');
            switch (billingCycleFrequencyTypeId) {
                case 1:
                    me._billingPeriodLabel.setValue('Monthly');
                    break;
                case 2:
                    me._billingPeriodLabel.setValue('Quarterly');
                    break;
                case 3:
                    me._billingPeriodLabel.setValue('Biweekly');
                    break;
            };

            me.refreshIncomeTypeGridColumnModel();
            me.ensureIncomeTypeGridCreated();
            me._incomeTypeGrid.getView().refresh(true);

            if (me._billingPeriodStore.getCount() == 0) {
                me._currentBillingDateEffectiveDateBox.setValue('');
                me._currentBillingPercentIncreaseTextBox.setValue(0);
                me._currentBillingRateTextBox.setValue(0);
                me._currentBillingNoes.setValue('');
            }
            else {
                var record = me._billingPeriodStore.getAt(0);
                me._currentBillingDateEffectiveDateBox.setValue(record.get('dateEffective'));
                me._currentBillingPercentIncreaseTextBox.setValue(parseFloat((record.get('percentIncrease') * 100).toFixed(2)));
                me._currentBillingRateTextBox.setValue(record.get('rate'));
                me._currentBillingNoes.setValue(record.get('description'));
            }
            me.refreshPeriodFields();
            me.applyRateToGrid();

            for (var j = 0; j < me._liveIncomeTypeStore.getCount(); j++) {
                var record = me._liveIncomeTypeStore.getAt(j);
                var fscAccount = record.get("fscAccount");
                var incomeType = me._incomeTypeStore.getById(fscAccount);
                if (incomeType) {
                    for (var i = 1; i <= 16; i++)
                        incomeType.set('period' + i, record.get('period' + i));
                }
            }

            me._incomeTypeGrid.getView().refresh(false);
        }
        });


        Bud.page.ContractBillingPage.superclass.dataBind.call(this);
    },

    print: function () {

        Ext.ux.Printer.print('Contract Billing', '<% import path="..\templates\contractbillingprinter.htm" %>',
         { incomeTypes: this._incomeTypeGrid,
             'billing-period': this._billingPeriodLabel.getValue(),
             'current-rate': Ext.util.Format.number(this._currentBillingRateTextBox.getValue(), '0,000.00'),
             'current-daily-rate': this._currentBillingDailyRateLabel.getValue(),
             'current-period-rate': this._currentBillingPeriodRateLabel.getValue(),
             'percent-increase': this._currentBillingPercentIncreaseTextBox.getValue(),
             'amount-increase': this._currentBillingAmountIncreaseLabel.getValue(),
             'date-effective': Ext.util.Format.date(this._currentBillingDateEffectiveDateBox.getValue(), 'm/d/Y'),
             'new-rate': this._newBillingRateLabel.getValue(),
             'new-daily-rate': this._newBillingDailyRateLabel.getValue(),
             'new-period-rate': this._newBillingPeriodRateLabel.getValue(),
             'description': this._currentBillingNoes.getValue(),
             'hcmHouseCodeTitle': this.getHcmHouseCodeTitle(),
             'hcmJobTitle': this.getHcmJobTitle(),
             'fscYearTitle': this.getFscYearTitle()
         },
         '../../res/css/print-all.css');
    }

});

WebLight.PageMgr.registerType('contractbilling', Bud.page.ContractBillingPage);
