/// <reference path="../../references/jquery-1.4.1.js" />
/// <reference path="../ext-all-budget.js" />
/// <reference path="../../references/ext-jquery-adapter.js" />
/// <reference path="../../references/weblight4extjs.js" />

WebLight.namespace('Bud.page');

Bud.page.SupplyExpendituresPage = WebLight.extend(Bud.page.BudgetPage, {
    title: 'Supply Exp',
    html: '<% import path="..\templates\bLayout.htm" %>',
    arrayStore: null,

    createChildControls: function () {
        this.arrayStore = new Ext.data.ArrayStore({
            fields: ['field1', 'field2', 'field3', 'field4', 'field5', 'field6', 'field7', 'field8', 'field9']
        });

        var supplyExpSelect = new Ext.Panel({
            header: false,
            border: false,
            autoHeight: true,
            bodyStyle: 'border-bottom:2px solid #336600;margin:10px 0;padding:10px;',
            items: [
                    { xtype: 'radiogroup', columns: 2, vertical: true, items: [
                        { boxLabel: 'I.Paper Worksheet', name: 'cb-custwidth', inputValue: 1, checked: true },
                        { boxLabel: 'II.Plastic Worksheet', name: 'cb-custwidth', inputValue: 2 },
                        { boxLabel: 'III.Janitorial Worksheet', name: 'cb-custwidth', inputValue: 3 },
                        { boxLabel: 'IV.Hand Soap Worksheet', name: 'cb-custwidth', inputValue: 4 }
                    ],
                        listeners: {
                            'change': function (obj, checked) {
                                var v = checked.getRawValue();
                                var arr = ['I', 'II', 'III', 'IV'];
                                for (var i = 0; i < arr.length; i++) {
                                    if (i + 1 == parseInt(v))
                                        eval('gridTitle' + arr[i] + '.show()');
                                    else
                                        eval('gridTitle' + arr[i] + '.hide()');
                                }
                            }
                        }
                    }]
        });

        var group = new Ext.ux.grid.ColumnHeaderGroup({
            rows: [[
                    { header: '', colspan: 3 },
                    { header: 'Actual Avg YTD', colspan: 2, align: 'center' },
                    { header: 'Budget 2011', colspan: 2, align: 'center' },
                    { header: 'Variance', colspan: 2, align: 'center'}]
            ]
        });

        var gridIV = new WebLight.grid.GridPanel({
            ctCls: 'ux-grid-1',
            autoHeight: true,
            viewConfig: {
                forceFit: true
            },
            store: this.arrayStore,
            cm: new Ext.grid.ColumnModel({
                defaults: { sortable: false },
                columns: [
                    { header: 'Description<br />&nbsp;', width: 250, menuDisabled: true },
                    { header: 'Unit<br />&nbsp;', menuDisabled: true },
                    { header: 'Unit Price<br />&nbsp;', menuDisabled: true },
                    { header: 'Usage Per Period<br />&nbsp;', menuDisabled: true },
                    { header: 'Cost Per Period<br />&nbsp;', menuDisabled: true },
                    { header: 'Usage Per Period<br />Override', menuDisabled: true },
                    { header: 'Cost Per Period<br />Override', menuDisabled: true },
                    { header: 'Qty Diff.<br />&nbsp;', menuDisabled: true },
                    { header: 'Price Diff.<br />&nbsp;', menuDisabled: true }
                ]
            }),
            plugins: group
        });

        this.addChildControl(Ext.create({
            xtype: 'box', html: '<h2 class="page-title">Supply Expenditures</h2>'
        }), 'container');
        var tabs = new Ext.TabPanel({
            activeTab: 0,
            border: false,
            ctCls: 'ux-tab-1',
            autoHeight: true,
            items: [{ title: 'Paper Worksheet', xtype: 'box', html: '<h2 class="page-sub-title">Paper Supplies</h2>' },
                    { title: 'Plastic Worksheet', xtype: 'box', html: '<h2 class="page-sub-title">Plastic Supplies</h2>' },
                    { title: 'Janitorial Worksheet', xtype: 'box', html: '<h2 class="page-sub-title">Janitorial Supplies</h2>' },
                    { title: 'Hand Soap Worksheet', xtype: 'box', html: '<h2 class="page-sub-title">Hand Soap Supplies</h2>'}]
        });

        this.addChildControl(tabs, 'container');
        //this.addChildControl(supplyExpSelect, 'container');

        //        this.addChildControl(gridTitleI = Ext.create({
        //            xtype: 'box', html: '<h2 class="page-sub-title">Paper Supplies</h2>'
        //        }), 'container');
        //        this.addChildControl(gridTitleII = Ext.create({
        //            hidden: true, xtype: 'box', html: '<h2 class="page-sub-title">Plastic Supplies</h2>'
        //        }), 'container');
        //        this.addChildControl(gridTitleIII = Ext.create({
        //            hidden: true, xtype: 'box', html: '<h2 class="page-sub-title">Janitorial Supplies</h2>'
        //        }), 'container');

        //        this.addChildControl(gridTitleIV = Ext.create({
        //            hidden: true, xtype: 'box', html: '<h2 class="page-sub-title">Hand Soap Supplies</h2>'
        //        }), 'container');
        this.addChildControl(gridIVActions = new Ext.Panel({
            header: false, border: false,
            buttons: [
                { ctCls: 'ux-button-1', text: 'Save', hander: function () { } },
                { ctCls: 'ux-button-1', text: 'Add Row', hander: function () { } },
                { ctCls: 'ux-button-1', text: 'Cancel', hander: function () { } },
                { ctCls: 'ux-button-1', text: 'Print', hander: function () { } }
            ]
        }), 'container');
        this.addChildControl(gridIV, 'container');

        Bud.page.SupplyExpendituresPage.superclass.createChildControls.call(this);
    },
    dataBind: function () {
        this.arrayStore.loadData(Bdg.store.Supply);
        Bud.page.SupplyExpendituresPage.superclass.dataBind.call(this);
    }
});

WebLight.PageMgr.registerType('supplyexpenditures', Bud.page.SupplyExpendituresPage);
