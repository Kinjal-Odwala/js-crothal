/// <reference path="../../references/jquery-1.4.1.js" />
/// <reference path="../ext-all-budget.js" />
/// <reference path="../../references/ext-jquery-adapter.js" />
/// <reference path="../references/weblight4extjs.js" />

WebLight.namespace('Bud.page');

Bud.page.FinalLaborCalculationsPage = WebLight.extend(Bud.page.BudgetPage, {
    title: 'Fnl Labor Calc',
    html: '<% import path="..\templates\finalLaborCalculations.htm" %>',

    _finalComputationOfLaborStore: null,

    _finalComputationOfLaborGrid: null,

    createFinalComputationOfLaborGrid: function () {
        this._finalComputationOfLaborGrid = new WebLight.grid.GridPanel({
            ctCls: 'ux-grid-1',
            store: this._finalComputationOfLaborStore,
            autoHeight: true,
            viewConfig: { forceFit: true },
            cm: new Ext.grid.ColumnModel({
                defaults: { sortable: false },
                columns: [
                    { header: '&nbsp;<br />Item<br />&nbsp;', width: 150 },
                    { header: 'Period 1<br/>9/26/10-<br />10/23/10', width: 60 },
                    { header: 'Period 2<br />10/24/10-<br />11/20/10', width: 60 },
                    { header: 'Period 3<br />11/21/10-<br />12/18/10', width: 60 },
                    { header: 'Period 4<br />12/19/10-<br />1/15/11', width: 60 },
                    { header: 'Period 5<br />1/16/11-<br />2/12/11', width: 60 },
                    { header: 'Period 6<br />2/13/11-<br />3/12/11', width: 60 },
                    { header: 'Period 7<br />3/13/11-<br />4/9/11', width: 60 },
                    { header: 'Period 8<br />4/10/11-<br />5/7/11', width: 60 },
                    { header: 'Period 9<br />5/8/11-<br />6/4/11', width: 60 },
                    { header: 'Period 10<br />6/5/11-<br />7/2/11', width: 60 },
                    { header: 'Period 11<br />7/3/11-<br />7/30/11', width: 60 },
                    { header: 'Period 12<br />7/31/11-<br />8/27/11', width: 60 },
                    { header: 'Period 13<br />8/28/11-<br />9/24/11', width: 60 },
                    { header: '&nbsp;<br />Total<br />&nbsp;', width: 60 }
                ]
            })
        });
    },

    createChildControls: function () {
        this._finalComputationOfLaborStore = new Ext.data.ArrayStore({
            fields: ['field1', 'field2', 'field3', 'field4', 'field5', 'field6', 'field7', 'field8', 'field9', 'field10', 'field11', 'field12', 'field13', 'field14', 'field15', ]
        });

        this.createFinalComputationOfLaborGrid();

        this.addChildControl(this._finalComputationOfLaborGrid, 'final-computation-of-labor-grid');

        Bud.page.FinalLaborCalculationsPage.superclass.createChildControls.call(this);
    },
    dataBind: function () {
        this._finalComputationOfLaborStore.loadData(Bdg.store.Labor);
        Bud.page.FinalLaborCalculationsPage.superclass.dataBind.call(this);
    }
});

WebLight.PageMgr.registerType('finallaborcalculations', Bud.page.FinalLaborCalculationsPage);
