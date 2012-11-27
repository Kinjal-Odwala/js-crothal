/// <reference path="../../references/jquery-1.4.1.js" />
/// <reference path="../ext-all-budget.js" />
/// <reference path="../../references/ext-jquery-adapter.js" />
/// <reference path="../../references/weblight4extjs.js" />

WebLight.namespace('Bud.page');

Bud.page.BudgetSummaryPage = WebLight.extend(Bud.page.BudgetPage, {
    title: 'Bgt Summary',
    html: '<% import path="..\templates\bLayout.htm" %>',
    arrayStore: null,

    createChildControls: function () {
        this.arrayStore = new Ext.data.ArrayStore({
            fields: ['field1', 'field2', 'field3', 'field4', 'field5', 'field6', 'field7', 'field8']
        });

        var grid = new WebLight.grid.GridPanel({
            ctCls: 'ux-grid-1',
            autoHeight: true,
            viewConfig: {
                forceFit: true
            },
            store: this.arrayStore,
            cm: new Ext.grid.ColumnModel({
                defaults: { sortable: false },
                columns: [
                    { header: 'GL Account<br />&nbsp;',name:'field1' },
                    { header: 'Account Number<br />&nbsp;', name: 'field2' },
                    { header: '2010 Annual<br/>Projections', name: 'field3' },
                    { header: '2010 Original<br />Budget', name: 'field4' },
                    { header: '2011 Budget<br />&nbsp;', name: 'field5' },
                    { header: 'Variance<br />&nbsp;', name: 'field6' },
                    { header: 'Variance Perc<br />&nbsp;', name: 'field7' },
                    { header: 'Comments<br />&nbsp;', width: 350, name: 'field8' }
                ]
            })
        });

        this.addChildControl(Ext.create({
            xtype: 'box', html: '<h2 class="page-title">Budget Summary</h2>'
        }), 'container');
        this.addChildControl(grid, 'container');

        Bud.page.BudgetSummaryPage.superclass.createChildControls.call(this);
    },
    dataBind: function () {
        this.arrayStore.loadData(Bdg.store.summary);
        Bud.page.BudgetSummaryPage.superclass.dataBind.call(this);
    }
});

WebLight.PageMgr.registerType('budgetsummary', Bud.page.BudgetSummaryPage);
