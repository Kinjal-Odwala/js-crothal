/// <reference path="../../references/jquery-1.4.1.js" />
/// <reference path="../../references/ext-jquery-adapter.js" />
/// <reference path="../../references/ext-all.js" />
/// <reference path="../../references/weblight4extjs.js" />

WebLight.namespace('Bud.page');

Bud.page.ManagementHistoryPage = WebLight.extend(Bud.page.BudgetPage, {
    title: 'Mgt Hist',
    html: '<% import path="..\templates\managementHistory.htm" %>',

    _personalSalaryStore: null,
    _managementAdministrationStore: null,

    _personalSalaryGrid: null,
    _managementAdministrationGrid: null,

    createPersonalSalaryReviewGrid: function () {
        this._personalSalaryGrid = new WebLight.grid.GridPanel({
            ctCls: 'ux-grid-1',
            store: this._personalSalaryStore,
            autoHeight: true,
            viewConfig: { forceFit: true },
            cm: new Ext.grid.ColumnModel({
                defaults: { sortable: false },
                columns: [
                            { header: 'name' },
                            { header: 'Position' },
                            { header: 'Annual Salary' },
                            { header: 'Period of Incerase' },
                            { header: 'Type Merit Promotion' },
                            { header: '2011 Fical Increase(%)' },
                            { header: 'New Salary' }
                        ]
            })
        })
    },

    createManagementAdministrationGrid: function () {
        this._managementAdministrationGrid = new WebLight.grid.GridPanel({
            ctCls: 'ux-grid-1',
            store: this._managementAdministrationStore,
            autoHeight: true,
            viewConfig: {  forceFit: true },
            cm: new Ext.grid.ColumnModel({
                defaults: { sortable: false },
                columns: [
                            { header: 'name', width: 68 },
                            { header: 'Period 1', width: 68 },
                            { header: 'Period 2', width: 68 },
                            { header: 'Period 3', width: 68 },
                            { header: 'Period 4', width: 68 },
                            { header: 'Period 5', width: 68 },
                            { header: 'Period 6', width: 68 },
                            { header: 'Period 7', width: 68 },
                            { header: 'Period 8', width: 68 },
                            { header: 'Period 9', width: 68 },
                            { header: 'Period 10', width: 68 },
                            { header: 'Period 11', width: 68 },
                            { header: 'Period 12', width: 68 },
                            { header: 'Period 13', width: 68 },
                            { header: 'Total', width: 68 }
                        ]
            })
        });
    },

    createChildControls: function () {
        this._personalSalaryStore = new Ext.data.ArrayStore({
            fields: ['field1', 'field2', 'field3', 'field4', 'field5', 'field6', 'field7']
        });
        this._managementAdministrationStore = new Ext.data.ArrayStore({
            fields: ['field1', 'field2', 'field3', 'field4', 'field5', 'field6', 'field7', 'field8', 'field9', 'field10', 'field11', 'field12', 'field13', 'field14', 'field15']
        });

        this.createPersonalSalaryReviewGrid();
        this.createManagementAdministrationGrid();

        this.addChildControl(this._personalSalaryGrid, 'personal-salary-review-grid');
        this.addChildControl(Ext.create({ xtype: 'button', ctCls: 'ux-button-1', width: 80, text: 'Add...',
            handler: function () { }
        }), 'personal-salary-review-add-button');

        this.addChildControl(this._managementAdministrationGrid, 'management-admin--worksheet-grid');

        Bud.page.ManagementHistoryPage.superclass.createChildControls.call(this);

        $('#' + this.getClientId('management-history-tab-panel')).tabs();
    },
    dataBind: function () {
        this._personalSalaryStore.loadData(Bdg.store.Hist);
        this._managementAdministrationStore.loadData(Bdg.store.Hist1);
        Bud.page.ManagementHistoryPage.superclass.dataBind.call(this);
    }
});

WebLight.PageMgr.registerType('managementhistory', Bud.page.ManagementHistoryPage);
