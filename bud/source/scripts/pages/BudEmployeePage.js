/// <reference path="../../references/jquery-1.4.1.js" />
/// <reference path="../../references/ext-jquery-adapter.js" />
/// <reference path="../../references/ext-all.js" />
/// <reference path="../../references/weblight4extjs.js" />

WebLight.namespace('Bud.page');

Bud.page.EmployeePage = WebLight.extend(Bud.page.BudgetPage, {
    title: 'Employee',
    html: '<% import path="..\templates\employee.htm" %>',

    _employeeStore: null,

    _employeeGrid: null,

    createEmployeeGrid: function () {
        var checkboxRenderer = function (value) {
            return '<div><input type="checkbox" autocomplete="off" size="24" value="' + (value || '') + '"\
                style="width: 30px; height:16px;border:none;" />\
                </div>';
        }

        this._employeeGrid = new WebLight.grid.GridPanel({
            ctCls: 'ux-grid-1',
            autoHeight: true,
            viewConfig: { forceFit: true },
            store: this._employeeStore,
            cm: new Ext.grid.ColumnModel({
                defaults: { sortable: false },
                columns: [
                        { header: 'Employee<br/>&nbsp;<br/>&nbsp;', dataIndex: 'fullname', width: 100 },
                        { header: 'Years <br/>of <br/>Service', dataIndex: 'yearOfService', width: 70 },
                        { header: 'Vacation <br/>Earned<br/>(Days)', dataIndex: 'vacationDays', width: 80 },
                        { header: 'Employees<br/> due<br/> Increases', dataIndex: 'dueIncrease',
                            renderer: function (v) {
                                return v;
                            }, width: 100
                        },
                        { header: 'Base Wage <br/>Rute<br/>($/hr)', dataIndex: 'baseWageRute', width: 70 },
                        { header: 'Shift <br/>Differential<br/>($/hr)', dataIndex: 'differentialPayRate', width: 100 },
                        { header: 'Other<br/>($/hr)<br/>&nbsp', dataIndex: 'otherPayRate', width: 70 },
                        { header: 'Total Current<br/> Wage rate <br/>per hr', dataIndex: 'totalCurrentWageRatePerHour', width: 80 },
                        { header: 'Hours worked <br/>Per Pay<br/> Period', dataIndex: 'hoursWorkedPerPayPeriod', width: 100 },
                        { header: 'Cost Per <br/>Pay<br/> Period', dataIndex: 'costPerPayPeriod', width: 100 },
                        { header: 'Cost<br/> before <br/>Differential', dataIndex: 'costBeforeDifferential', width: 150 },
                        { header: 'Annual<br/>&nbsp<br/>&nbsp', dataIndex: 'annual', width: 150 }
                    ]
            })
        });
    },

    createChildControls: function () {
        this._employeeStore = new Bud.data.BudShiftTypeStore();

        this.createEmployeeGrid();

        var form = new WebLight.form.FormPanel({
            border: false,
            labelWidth: 150, labelAlign: 'right',
            items: [{ border: false, layout: 'column', defaults: { layout: 'form', border: false },
                items: [
                        { columnWidth: .2, items: [{ fieldLabel: 'Number of Employees', xtype: 'numberfield', width: 50}] },
                        { columnWidth: .2, items: [{ fieldLabel: 'Average Wage Rate', xtype: 'numberfield', width: 50}] },
                        { columnWidth: .3, labelWidth: 300, items: [{ fieldLabel: 'Base Average Wage Rate Excluding Differential', xtype: 'numberfield', width: 50}] },
                        { columnWidth: .3, items: [{ boxLabel: 'Set Increases for all', xtype: 'checkbox'}] }
                    ]
            }]
        });

        Bud.page.EmployeePage.superclass.createChildControls.call(this);

        this.addChildControl(this._employeeGrid, 'employee-grid');
        this.addChildControl(form, 'employee-form');

        this.addChildControl(Ext.create({ xtype: 'button', ctCls: 'ux-button-1', width: 100, text: 'Save Changes',
            handler: function () { }
        }), 'employee-save-button');
        this.addChildControl(Ext.create({ xtype: 'button', ctCls: 'ux-button-1', width: 100, text: 'Update Totals',
            handler: function () { }
        }), 'employee-update-button');
        this.addChildControl(Ext.create({ xtype: 'button', ctCls: 'ux-button-1', width: 90, text: 'Print',
            handler: function () { }
        }), 'employee-print-button');
    },
    dataBind: function () {
        this._employeeStore.loadSampleData();
        Bud.page.EmployeePage.superclass.dataBind.call(this);
    }
});

WebLight.PageMgr.registerType('employee', Bud.page.EmployeePage);
