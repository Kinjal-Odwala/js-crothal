/// <reference path="../Core.js" />

WebLight.namespace('Bud.page');

Bud.page.StaffingHourPage = WebLight.extend(Bud.page.BudgetPage, {
    title: 'Staffing Hours',
    html: '<% import path="..\templates\staffing.htm" %>',
    arrayStore: null,

    _shiftTypeStore: null,
    _staffingDetailStore: null,
    _staffingSummaryStore: null,

    _shiftTypeDorpdown: null,
    _staffingDetailGrid: null,
    _staffingSummaryGrid: null,

    createStaffingDetailGrid: function () {
        var current = this;
        var descriptionRow = [
            { header: '', colspan: 1 },
            { header: 'Current Staff:Productive Hours per Shift', colspan: 9 },
            { header: 'Proposed Staff:Productive Hours per Shift', colspan: 9 },
            { header: '', colspan: 1 }
        ];
        var group = new Ext.ux.grid.ColumnHeaderGroup({
            rows: [descriptionRow]
        });

        this._staffingDetailGrid = new Ext.grid.EditorGridPanel({
            autoHeight: true, ctCls: 'ux-grid-1', enableHdMenu: false,
            viewConfig: { forceFit: true },
            store: this._staffingDetailStore,
            clicksToEdit: 1,
            plugins: [group],
            cm: new Ext.grid.ColumnModel({
                defaults: { sortable: false },
                columns: [
                            { header: 'Unit', width: 60, dataIndex: 'unit', editor: new Ext.form.TextField() },
                            { header: 'Sun', width: 55, dataIndex: 'currentSunday', renderer: current.numberRenderer, editor: new Ext.form.NumberField({ decimalPrecision: 0 }) },
                            { header: 'Mon', width: 55, dataIndex: 'currentMonday', renderer: current.numberRenderer, editor: new Ext.form.NumberField({ decimalPrecision: 0 }) },
                            { header: 'Tues', width: 55, dataIndex: 'currentTuesday', renderer: current.numberRenderer, editor: new Ext.form.NumberField({ decimalPrecision: 0 }) },
                            { header: 'Weds', width: 55, dataIndex: 'currentWednesday', renderer: current.numberRenderer, editor: new Ext.form.NumberField({ decimalPrecision: 0 }) },
                            { header: 'Thurs', width: 55, dataIndex: 'currentThursday', renderer: current.numberRenderer, editor: new Ext.form.NumberField({ decimalPrecision: 0 }) },
                            { header: 'Fri', width: 55, dataIndex: 'currentFriday', renderer: current.numberRenderer, editor: new Ext.form.NumberField({ decimalPrecision: 0 }) },
                            { header: 'Sat', width: 55, dataIndex: 'currentSaturday', renderer: current.numberRenderer, editor: new Ext.form.NumberField({ decimalPrecision: 0 }) },
                            { header: 'Wkly Total', width: 60, dataIndex: 'currentTotal', renderer: current.numberRenderer },
                            { header: 'Legal Hol', width: 60, dataIndex: 'currentHolidays', renderer: current.numberRenderer, editor: new Ext.form.NumberField({ decimalPrecision: 0 }) },
                            { header: 'Sun', width: 55, dataIndex: 'proposedSunday', renderer: current.numberRenderer, editor: new Ext.form.NumberField({ decimalPrecision: 0 }) },
                            { header: 'Mon', width: 55, dataIndex: 'proposedMonday', renderer: current.numberRenderer, editor: new Ext.form.NumberField({ decimalPrecision: 0 }) },
                            { header: 'Tues', width: 55, dataIndex: 'proposedTuesday', renderer: current.numberRenderer, editor: new Ext.form.NumberField({ decimalPrecision: 0 }) },
                            { header: 'Weds', width: 55, dataIndex: 'proposedWednesday', renderer: current.numberRenderer, editor: new Ext.form.NumberField({ decimalPrecision: 0 }) },
                            { header: 'Thurs', width: 55, dataIndex: 'proposedThursday', renderer: current.numberRenderer, editor: new Ext.form.NumberField({ decimalPrecision: 0 }) },
                            { header: 'Fri', width: 55, dataIndex: 'proposedFriday', renderer: current.numberRenderer, editor: new Ext.form.NumberField({ decimalPrecision: 0 }) },
                            { header: 'Sat', width: 55, dataIndex: 'proposedSaturday', renderer: current.numberRenderer, editor: new Ext.form.NumberField({ decimalPrecision: 0 }) },
                            { header: 'Wkly Total', width: 60, dataIndex: 'proposedTotal', renderer: current.numberRenderer },
                            { header: 'Legal Hol', width: 60, dataIndex: 'proposedHolidays', renderer: current.numberRenderer, editor: new Ext.form.NumberField({ decimalPrecision: 0 }) },
                            { header: 'X', width: 8, renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                if (record.get('_sysStatus') == 1)
                                    return '<a href="javascript:void(0);" class="remove" title="Remove">X</a>';
                                return '';
                            }
                            }
                    ]
            })
        });

        this._staffingDetailGrid.on('cellclick', function (g, row, col, e) {
            if (col == 19) {
                $('a.remove').each(function (i, v) {
                    $(this).click(function (e) {
                        var record = g.getStore().getAt(row);
                        current._staffingDetailStore.remove(record);
                        e.preventDefault();
                    });
                });
            }
        });
    },

    numberRenderer: function (value, metaData, record, rowIndex, colIndex, store) {
        if (value == 0) {
            return '';
        }
        return Ext.util.Format.number(value, '0,000');
    },

    createStaffingSummaryGrid: function () {
        var current = this;
        var descriptionRow = [
            { header: '', colspan: 1 },
            { header: 'Current Staff:Productive Hours per Shift', colspan: 9 },
            { header: 'Proposed Staff:Productive Hours per Shift', colspan: 9 }
        ];
        var group = new Ext.ux.grid.ColumnHeaderGroup({
            rows: [descriptionRow]
        });

        this._staffingSummaryGrid = new Ext.grid.GridPanel({
            autoHeight: true, ctCls: 'ux-grid-1', enableHdMenu: false,
            viewConfig: { forceFit: true },
            store: this._staffingSummaryStore,
            clicksToEdit: 1,
            plugins: [group],
            cm: new Ext.grid.ColumnModel({
                defaults: { sortable: false },
                columns: [
                            { header: 'Unit', width: 60, dataIndex: 'unit' },
                            { header: 'Sun', width: 60, renderer: current.numberRenderer, dataIndex: 'currentSunday' },
                            { header: 'Mon', width: 60, renderer: current.numberRenderer, dataIndex: 'currentMonday' },
                            { header: 'Tues', width: 60, renderer: current.numberRenderer, dataIndex: 'currentTuesday' },
                            { header: 'Weds', width: 60, renderer: current.numberRenderer, dataIndex: 'currentWednesday' },
                            { header: 'Thurs', width: 60, renderer: current.numberRenderer, dataIndex: 'currentThursday' },
                            { header: 'Fri', width: 60, renderer: current.numberRenderer, dataIndex: 'currentFriday' },
                            { header: 'Sat', width: 60, renderer: current.numberRenderer, dataIndex: 'currentSaturday' },
                            { header: 'Wkly Total', width: 60, renderer: current.numberRenderer, dataIndex: 'currentTotal' },
                            { header: 'Legal Hol', width: 60, renderer: current.numberRenderer, dataIndex: 'currentHolidays' },
                            { header: 'Sun', width: 60, renderer: current.numberRenderer, dataIndex: 'proposedSunday' },
                            { header: 'Mon', width: 60, renderer: current.numberRenderer, dataIndex: 'proposedMonday' },
                            { header: 'Tues', width: 60, renderer: current.numberRenderer, dataIndex: 'proposedTuesday' },
                            { header: 'Weds', width: 60, renderer: current.numberRenderer, dataIndex: 'proposedWednesday' },
                            { header: 'Thurs', width: 60, renderer: current.numberRenderer, dataIndex: 'proposedThursday' },
                            { header: 'Fri', width: 60, renderer: current.numberRenderer, dataIndex: 'proposedFriday' },
                            { header: 'Sat', width: 60, renderer: current.numberRenderer, dataIndex: 'proposedSaturday' },
                            { header: 'Wkly Total', width: 60, renderer: current.numberRenderer, dataIndex: 'proposedTotal' },
                            { header: 'Legal Hol', width: 60, renderer: current.numberRenderer, dataIndex: 'proposedHolidays' }
                    ]
            })
        });
    },

    createChildControls: function () {
        var current = this;
        this._shiftTypeStore = new Bud.data.BudShiftTypeStore();
        this._shiftTypeStore.loadSampleData();
        this._shiftTypeDorpdown = new Bud.form.DropdownList({
            store: this._shiftTypeStore,
            value: 1,
            displayField: 'title',
            valueField: 'id'
        });
        this.addChildControl(this._shiftTypeDorpdown, 'staffing-shift-select-box');

        this.addChildControl(Ext.create({ xtype: 'button', ctCls: 'ux-button-1', text: 'Add Unit\\Position', width: 120,
            handler: function () {
                current._staffingDetailStore.add(current._staffingDetailStore.newRecord({}));
            }
        }), 'staffing-add-unit-button');
        this.addChildControl(Ext.create({ xtype: 'button', ctCls: 'ux-button-1', text: 'Save', width: 80,
            handler: function () {
                current._staffingDetailStore.submitChanges(function () {
                    current._staffingDetailStore.load(current.getHouseCode(), current.getJobCode(),
                            current.getFiscalYearId(), current._shiftTypeDorpdown.getValue());
                    current._staffingSummaryStore.load(current.getHouseCode(), current.getJobCode(),
                            current.getFiscalYearId(), 0);
                });
            }
        }), 'staffing-update-button');
        this.addChildControl(Ext.create({ xtype: 'button', ctCls: 'ux-button-1', text: 'Cancel', width: 80, handler: function () {
            current._staffingDetailStore.load(current.getHouseCode(), current.getJobCode(),
                            current.getFiscalYearId(), current._shiftTypeDorpdown.getValue());
        }
        }), 'staffing-cancel-button');
        this.addChildControl(Ext.create({ xtype: 'button', ctCls: 'ux-button-1', text: 'Print', width: 80, handler: function () {
            current._staffingDetailGrid.getColumnModel().config[current._staffingDetailGrid.getColumnModel().config.length - 1].hidden = true;

            Ext.ux.Printer.print('Staffing Hour', '<% import path="..\templates\staffinghourprinter.htm" %>',
         { staffingHours: current._staffingDetailGrid,
             'hcmHouseCodeTitle': current.getHcmHouseCodeTitle(),
             'hcmJobTitle': current.getHcmJobTitle(),
             'fscYearTitle': current.getFscYearTitle()
         },
         '../../res/css/print-all.css');
            current._staffingDetailGrid.getColumnModel().config[current._staffingDetailGrid.getColumnModel().config.length - 1].hidden = false;
        }
        }), 'staffing-print-button');

        this._staffingDetailStore = new Bud.data.BudStaffingHourStore();

        this.createStaffingDetailGrid();
        this.addChildControl(this._staffingDetailGrid, 'staffing-detail-worksheet-grid');

        this._staffingSummaryStore = new Bud.data.BudStaffingHourStore();
        this.createStaffingSummaryGrid();
        this.addChildControl(this._staffingSummaryGrid, 'staffing-hours-summary-worksheet-grid');

        this.addChildControl(this._increasePerWeek = Ext.create({ xtype: 'displayfield' }), 'increase-per-week-textbox');
        this.addChildControl(this._increaseOnLegalHolidays = Ext.create({ xtype: 'displayfield' }), 'increase-on-legal-holidays-textbox');

        Bud.page.StaffingHourPage.superclass.createChildControls.call(this);

        $('#' + this.getClientId('staffing-tab-panel')).tabs();
    },
    dataBind: function () {
        var current = this;
        this._shiftTypeDorpdown.on('valuechange', function (v) {
            if (v) {
                current._staffingDetailStore.load(current.getHouseCode(), current.getJobCode(), current.getFiscalYearId(), v);
            }
        });

        this.on('contextChanged', function () {
            current._staffingDetailStore.load(current.getHouseCode(), current.getJobCode(), current.getFiscalYearId(), current._shiftTypeDorpdown.getValue());
            current._staffingSummaryStore.load(current.getHouseCode(), current.getJobCode(), current.getFiscalYearId(), 0);
        });

        this.grouping([this, this._staffingDetailStore, this._staffingSummaryStore]
        , null);

        var proposedWeeklyTotal = 0;
        var currentWeeklyTotal = 0;
        var proposedHolidaysTotal = 0;
        var currentHolidaysTotal = 0;

        this._staffingSummaryStore.on('load', function (store) {
            for (var i = 0; i < store.getCount(); i++) {
                var record = store.getAt(i);
                currentWeeklyTotal += record.get('currentTotal');
                proposedWeeklyTotal += record.get('proposedTotal');

                currentHolidaysTotal += record.get('currentHolidays');
                proposedHolidaysTotal += record.get('proposedHolidays');
            }

            current._increasePerWeek.setValue(Math.round((proposedWeeklyTotal - currentWeeklyTotal) * 100) / 100);
            current._increaseOnLegalHolidays.setValue(Math.round((proposedHolidaysTotal - currentHolidaysTotal) * 100) / 100);
        });

        Bud.page.StaffingHourPage.superclass.dataBind.call(this);
    }
});

WebLight.PageMgr.registerType('staffing', Bud.page.StaffingHourPage);
