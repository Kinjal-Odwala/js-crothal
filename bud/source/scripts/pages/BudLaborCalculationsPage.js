/// <reference path="../../references/jquery-1.4.1.js" />
/// <reference path="../ext-all-budget.js" />
/// <reference path="../../references/ext-jquery-adapter.js" />
/// <reference path="../../references/weblight4extjs.js" />

WebLight.namespace('Bud.page');

Bud.page.LaborCalculationsPage = WebLight.extend(Bud.page.BudgetPage, {
    title: 'Labor Calc',
    html: '<% import path="..\templates\bLayout.htm" %>',
    createChildControls: function () {
        var calSelect = new Ext.Panel({
            header: false,
            border: false,
            autoHeight: true,
            bodyStyle: 'border-bottom:2px solid #336600;margin:10px 0;padding:10px;',
            items: [
                    { xtype: 'radiogroup', columns: 2, vertical: true, items: [
                        { boxLabel: 'I.Sick Pay', name: 'cb-custwidth', inputValue: 1, checked: true },
                        { boxLabel: 'II.Legal Holidays', name: 'cb-custwidth', inputValue: 2 },
                        { boxLabel: 'III.Vacation', name: 'cb-custwidth', inputValue: 3 },
                        { boxLabel: 'IV.Prod Employees Health/Dental/Life and Union Contributions & BI-Weekly Cost', name: 'cb-custwidth', inputValue: 4 },
                        { boxLabel: 'V. & VI.Net Prod Days Per Emp & FTEs', name: 'cb-custwidth', inputValue: 5 },
                        { boxLabel: 'VII.Labor Standards', name: 'cb-custwidth', inputValue: 6 },
                        { boxLabel: 'VIII.Labor Standard In Dollars', name: 'cb-custwidth', inputValue: 7 }
                    ],
                        listeners: {
                            'change': function (obj, checked) {
                                var v = checked.getRawValue();
                                var arr = ['I', 'II', 'III', 'IV', 'V_VI', 'VII', 'VIII'];
                                for (var i = 0; i < arr.length; i++) {
                                    if (i + 1 == parseInt(v)) {
                                        var key = arr[i].split('_');
                                        for (var n = 0; n < key.length; n++) {
                                            eval('if(typeof gridTitle' + key[n] + ' != "undefined") gridTitle' + key[n] + '.show();');
                                            eval('if(typeof panel' + key[n] + ' != "undefined") panel' + key[n] + '.show();');
                                        }
                                    }
                                    else {
                                        var key = arr[i].split('_');
                                        for (var n = 0; n < key.length; n++) {
                                            eval('if(typeof gridTitle' + key[n] + ' != "undefined") gridTitle' + key[n] + '.hide();');
                                            eval('if(typeof panel' + key[n] + ' != "undefined") panel' + key[n] + '.hide();');
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
        });

        this.addChildControl(Ext.create({
            xtype: 'box', html: '<h2 class="page-title">Labor Calculations</h2>'
        }), 'container');

        //this.addChildControl(calSelect, 'container');

        var gridTitleI = Ext.create({
            xtype: 'box', html: '<h2 class="page-sub-title">I.Sick Pay</h2>'
        });
        var panelI = Ext.create({
            style: 'margin:10px 0', xtype: 'panel', border: false, items: [
                { border: false, html: '<table style="width:100%" class="ux-table"><tbody>\
                        <tr class="odd"><td>Sick day entitlements earned per year (days per employee)</td>\
                        <td><input type="text" value="0" /></td></tr>\
                        <tr><td>Average sick days taken over last 52 weeks (days per employee)</td>\
                        <td><input type="text" value="0" /></td></tr>\
                        <tr class="odd"><td>Proj. number of sick days to be used in budget year (days per employee)</td>\
                        <td><input type="text" value="0" /></td></tr>\
                        </tbody></table>'
                }
            ], buttons: [
                { ctCls: 'ux-button-1', text: 'Save', handler: function () { } },
                { ctCls: 'ux-button-1', text: 'Cancel', handler: function () { } }
            ]
        });

        var gridTitleII = Ext.create({
             xtype: 'box', html: '<h2 class="page-sub-title">II.Legal Holidays</h2>'
        });
        var panelII = Ext.create({
             style: 'margin:10px 0', xtype: 'panel', border: false, items: [
                { border: false, html: '<table style="width:100%" class="ux-table"><tbody>\
                    <tr class="odd"><td>Number of Employee Personal Days Granted Per Year</td>\
                    <td><input type="text" value="0" /></td></tr>\
                    <tr><td>Other Paid Leave</td>\
                    <td><input type="text" value="0" /></td></tr>\
                    <tr class="odd"><td>&nbsp;</td><td></td></tr>\
                    </tbody></table>'
                , buttons: [
                    { ctCls: 'ux-button-1', text: 'Save', handler: function () { } },
                    { ctCls: 'ux-button-1', text: 'Cancel', handler: function () { } }
                ]
                }, { border: false, html: '<table style="width:100%" class="ux-table">\
                        <thead><tr class="green"><th>Holiday</th><th>Period</th></tr></thead><tbody>\
                        <tr class="odd"><td>Christmas</td><td></tr><tr><td>&nbsp;</td><td></td></tr>\
                        <tr class="odd"><td>&nbsp;</td><td></tr><tr><td>&nbsp;</td><td></td></tr>\
                        <tr class="odd"><td>&nbsp;</td><td></tr><tr><td>&nbsp;</td><td></td></tr>\
                        <tr class="odd"><td>&nbsp;</td><td></tr><tr><td>&nbsp;</td><td></td></tr>\
                        <tr class="odd"><td>&nbsp;</td><td></tr><tr><td>&nbsp;</td><td></td></tr>\
                        <tr class="odd"><td>&nbsp;</td><td></td></tr>\
                        </tbody></table>'
                    , buttons: [
                        { ctCls: 'ux-button-1', text: 'Add Holiday', handler: function () { } },
                        { ctCls: 'ux-button-1', text: 'Update', handler: function () { } },
                        { ctCls: 'ux-button-1', text: 'Cancel', handler: function () { } }
                    ]
                }
            ]
        });

        var gridTitleIII = Ext.create({
            xtype: 'box', html: '<h2 class="page-sub-title">III.Vacation</h2>'
        });
        var panelIII = Ext.create({
            style: 'margin:10px 0', xtype: 'panel', border: false, items: [
                new WebLight.grid.GridPanel({
                    ctCls: 'ux-grid-1',
                    autoHeight: true,
                    store: new Ext.data.JsonStore(),
                    cm: new Ext.grid.ColumnModel({ defaults: { sortable: false }, columns: [
                        { header: 'Employees' },
                        { header: 'Annual Vacation Entitlement', width: 300 },
                        { header: 'Proj Vac Days Entitlement', width: 300 }
                    ]
                    })
                }), { style: 'margin:10px 0', border: false,
                    html: '<table style="width:100%"><tr><td>Average Vacation Entitlement</td>\
                    <td style="text-align:right">3 days</td></tr></table>'
                }
            ], buttons: [
                { ctCls: 'ux-button-1', text: 'Print', handler: function () { } }
            ]
        });

        var gridTitleIV = Ext.create({
             xtype: 'box', html: '<h2 class="page-sub-title">IV.Prod Employees Health/Dental/Life and Union Contributions & BI-Weekly Cost</h2>'
        });
        var panelIV = Ext.create({
             style: 'margin:10px 0', xtype: 'panel', border: false, items: [
                { border: false, html: '<p class="table-title">Table1 - # of Employees</p>\
                    <table class="ux-table"><thead><tr><th></th><th>Medical 1</th><th>Medical 2</th>\
                    <th>Liberty Plan</th><th>Dental Only</th><th>Total</th><th>Life</th>\
                    <th>Union</th></tr></thead><tbody>\
                    <tr class="odd"><td>Single Coverage</td><td><input type="text" value="0"></td><td><input type="text" value="0"></td>\
                    <td><input type="text" value="0"></td><td><input type="text" value="0"></td>\
                    <td>0</td><td><input type="text" value="0"></td><td><input type="text" value="0"></td></tr>\
                    <tr><td>Family Coverage</td><td><input type="text" value="0"></td><td><input type="text" value="0"></td>\
                    <td><input type="text" value="0"></td><td><input type="text" value="0"></td>\
                    <td>0</td><td><input type="text" value="0"></td><td><input type="text" value="0"></td></tr>\
                    <tr class="odd"><td>Total</td><td>0</td><td>0</td>\
                    <td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr></tbody</table>'
                                    },
                    { border: false, html: '<p class="table-title">Table2 - BI weekly Cost of Health/Dental/Life Insurance Contributions</p>\
                    <table class="ux-table"><thead><tr><th></th><th>Medical 1</th><th>Medical 2</th>\
                    <th>Liberty Plan</th><th>Dental Only</th><th>Total</th><th>Life</th>\
                    <th>Union</th></tr></thead><tbody>\
                    <tr class="odd"><td>Single Coverage</td><td><input type="text" value="0"></td><td><input type="text" value="0"></td>\
                    <td><input type="text" value="0"></td><td><input type="text" value="0"></td>\
                    <td>0</td><td><input type="text" value="0"></td><td><input type="text" value="0"></td></tr>\
                    <tr><td>Family Coverage</td><td><input type="text" value="0"></td><td><input type="text" value="0"></td>\
                    <td><input type="text" value="0"></td><td><input type="text" value="0"></td>\
                    <td>0</td><td><input type="text" value="0"></td><td><input type="text" value="0"></td></tr>\
                    <tr class="odd"><td>Total</td><td>0</td><td>0</td>\
                    <td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr></tbody</table>'
                    },
                    { border: false, html: '<p class="table-title">Productive Employees Health/Dental/Life Insurance BI-Weekly Cost</p>\
                    <table style="width:100%" class="ux-table"><thead><tr><th>Period</th><th>&nbsp;1&nbsp;</th><th>&nbsp;2&nbsp;</th><th>&nbsp;3&nbsp;</th>\
                    <th>&nbsp;4&nbsp;</th><th>&nbsp;5&nbsp;</th><th>&nbsp;6&nbsp;</th><th>&nbsp;7&nbsp;</th><th>&nbsp;8&nbsp;</th>\
                    <th>&nbsp;9&nbsp;</th><th>&nbsp;10&nbsp;</th><th>&nbsp;11&nbsp;</th><th>&nbsp;12&nbsp;</th><th>&nbsp;13&nbsp;</th>\
                    <th>Total</th></tr></thead><tbody>\
                    <tr class="odd"><td>Single Coverage</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td>\
                    <td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>\
                    <tr><td>Family Coverage</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td>\
                    <td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>\
                    <tr class="odd"><td>Tot Med/Dental/Life</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td>\
                    <td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>\
                    <tr><td>% Adjustment</td><td>0%</td><td>0%</td><td>0%</td><td>10%</td><td>10%</td><td>10%</td><td>10%</td><td>10%</td>\
                    <td>10%</td><td>10%</td><td>10%</td><td>10%</td><td>10%</td><td></td></tr>\
                    <tr class="odd"><td>Adjust Total</td><td>0.00</td><td>0.00</td><td>0.00</td><td>0.00</td><td>0.00</td><td>0.00</td><td>0.00</td><td>0.00</td>\
                    <td>0.00</td><td>0.00</td><td>0.00</td><td>0.00</td><td>0.00</td><td>0.00</td></tr>\
                    <tr><td colspan="15"></td></tr>\
                    <tr class="odd"><td>Union Contributions</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td>\
                    <td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>\
                    </tbody</table>'
                }
            ], buttons: [
                { ctCls: 'ux-button-1', text: 'Save', handler: function () { } },
                { ctCls: 'ux-button-1', text: 'Print', handler: function () { } }
            ]
        });

        var gridTitleV = Ext.create({
            xtype: 'box', html: '<h2 class="page-sub-title">V.Computation Of Net Productive Days Per Employee</h2>'
        });
        var panelV = Ext.create({
            style: 'margin:10px 0', xtype: 'panel', border: false, items: [
                { border: false, html: 'Work Days per 52 wks: 260' },
                new WebLight.grid.GridPanel({
                    ctCls: 'ux-grid-1',
                    autoHeight: true,
                    store: new Ext.data.JsonStore(),
                    cm: new Ext.grid.ColumnModel({ defaults: { sortable: false }, columns: [
                        { header: 'Paid Leave', width: 300 },
                        { header: 'Days' },
                        { header: 'Percentage' }
                    ]
                    })
                })
            ]
        });

        var gridTitleVI = Ext.create({
            xtype: 'box', html: '<h2 class="page-sub-title">VI.Estimate Of FTEs needs for productive and nonproductive labor</h2>'
        });
        var panelVI = Ext.create({
             style: 'margin:10px 0', xtype: 'panel', border: false, items: [
                { border: false, html: '<table style="width:100%" class="ux-table"><tbody>\
                <tr class="odd"><td>Hours Per Day Per Employee</td><td><input type="text" value="0" /></td></tr>\
                <tr><td style="text-align:right">Approximate Staffing in FTE Required</td><td>0</td></tr>\
                </tbody></table>',
                    buttons: [
                    { ctCls: 'ux-button-1', text: 'Update', handler: function () { } },
                    { ctCls: 'ux-button-1', text: 'Cancel', handler: function () { } },
                    { ctCls: 'ux-button-1', text: 'Print', handler: function () { } }
                ]
                }
            ]
        });

        var gridTitleVII = Ext.create({
           xtype: 'box', html: '<h2 class="page-sub-title">VII.Labor Standards</h2>'
        });
        var panelVII = Ext.create({
             style: 'margin:10px 0', xtype: 'panel', border: false, items: [
                { border: false, html: '<table style="width:100%" class="ux-table-2"></tbody>\
                    <tr><td>A. Labor standard before short staffing:</td><td>0</td></tr>\
                    </tbody></table><table class="ux-table" style="width:100%"><tbody>\
                    <tr class="odd"><td>Projected number of new Employees</td><td><input type="text" value="0" /></td></tr>\
                    <tr><td>Projected hours to train each employee while overlapping with existing employee</td><td><input type="text" value="0" /></td></tr>\
                    <tr class="odd"><td>Total hours spent training new employees</td><td>0</td></tr>\
                    <tr><td>Sub-Total Productive Labor Standard</td><td>0</td></tr>\
                    </tbody></table>'
                }, { border: false, html: '<table style="width:100%" class="ux-table-2"></tbody>\
                    <tr><td>B. Adjusted labor standard due to short-staffing</td><td>% Factor</td><td>&nbsp;</td></tr>\
                    </tbody></table><table class="ux-table" style="width:100%"><tbody>\
                    <tr class="odd"><td>Non replacement of employees on vacation</td><td><input type="text" value="0" />%</td><td>0</td></tr>\
                    <tr><td>Non replacement of employees on sick pay</td><td><input type="text" value="0" />%</td><td>0</td></tr>\
                    <tr class="odd"><td>Non replacement for paid time off in lieu of working a legal holiday</td><td><input type="text" value="0" />%</td><td>0</td></tr>\
                    <tr><td>Non replacement of employees on personal leave</td><td><input type="text" value="0" />%</td><td>0</td></tr>\
                    <tr class="odd"><td style="text-align:right;font-weight:bold">Sub-Total of Short-Staffing</td><td></td><td>0</td></tr>\
                    <tr><td>Sub-Total Productive Labor Standards</td><td></td><td>0</td></tr>\
                    </tbody></table>'
                }, { border: false, html: '<table style="width:100%" class="ux-table-2"></tbody>\
                    <tr><td>C. Computation of short-starffing on legal holidays</td><td>0</td></tr>\
                    </tbody></table>'
                }, { border: false, html: '<table style="width:100%" class="ux-table-2"></tbody>\
                    <tr><td>D. Net Productive Standard</td><td>0</td></tr>\
                    </tbody></table>'
                }, { border: false, html: '<table style="width:100%" class="ux-table-2"></tbody>\
                    <tr><td>E. Computation of Paid Leave Standard</td><td></td></tr>\
                    </tbody></table>\
                    <table style="width:100%" class="ux-table"></tbody>\
                    <tr class="odd"><td>Sick Pay Standard</td><td>0</td></tr>\
                    <tr><td>Legal Holiday Standard</td><td>0</td></tr>\
                    <tr class="odd"><td>Personal Leave Standard</td><td>0</td></tr>\
                    <tr><td>Vacation Accrual Standard</td><td>0</td></tr>\
                    <tr class="odd"><td style="text-align:right;font-weight:bold">Paid Leave Standards</td><td>0</td></tr>\
                    <tr><td>Total 52 Week Paid Hours Standard</td><td>0</td></tr>\
                    </tbody></table>'
                }
            ]
        });

        var gridTitleVIII = Ext.create({
            xtype: 'box', html: '<h2 class="page-sub-title">VIII.Computation Of Labor Standard In Dollars</h2>'
        });
        var panelVIII = Ext.create({
             style: 'margin:10px 0', xtype: 'panel', border: false, items: [
            { border: false, html: '<table class="ux-table-2" style="width:100%"><tbody>\
        <tr><td>A. Current Avg Wage Rate(from employee data file):</td><td>$6.48</td></tr></tbody></table>\
        <table style="width:100%" class="ux-table"><tbody>\
        <tr class="odd"><td>Avg wage rate excluding differential<td></td><td>$6.48</td></tr>\
        </tbody></table>'
            }, { border: false, html: '<table class="ux-table-2" style="width:100%"><tbody>\
        <tr><td>B. Project Effect of Merit Increase:</td><td></td></tr></tbody></table>\
        <table style="width:100%" class="ux-table"><tbody>\
        <tr class="odd"><td>#Employees to get merit increase</td><td>0</td></tr>\
        <tr><td>Total # of employees</td><td>3</td></tr>\
        <tr class="odd"><td>Avg amount of merit increase per hour</td><td>$<input type="text" value="0" /></td></tr>\
        <tr><td>Total increase in wage cost/per pay period</td><td>$0.00</td></tr>\
        <tr class="odd"><td># of employees who will leave</td><td><input type="text" value="0" /></td></tr>\
        <tr><td>Average reduction in wage rate of their replacement(Avg wage rate minus starting wage rate)</td><td>$6.48</td></tr>\
        <tr class="odd"><td>Starting wage rate</td><td>$<input type="text" value="0" /></td></tr>\
        <tr><td>Decrease in wage rate/per pay period</td><td>$0.00</td></tr>\
        <tr class="odd"><td>Net effect of Avg wage rate of merit increase</td><td>$0.00</td></tr>\
        </tbody></table>'
            }, { border: false, html: '<table style="width:100%" class="ux-table-2"><tbody>\
        <tr><td>C. Projected Avg Wage Rate before cost of living increase including defferential</td><td>$6.48</td></tr>\
        </tbody></table>'
            }, { border: false, html: '<table class="ux-table-2" style="width:100%"><tbody>\
        <tr><td>D. Cost of Living Increase</td><td></td></tr></tbody></table>\
        <table style="width:100%" class="ux-table"><tbody>\
        <tr class="odd"><td>Estimated date of increase(period)</td><td><input type="text" value="1" /></td></tr>\
        <tr><td>Estimated increase per hour</td><td><input type="text" value="1" /></td></tr>\
        </tbody></table>'
            }, { border: false, html: '<table style="width:100%" class="ux-table-2"><tbody>\
        <tr><td>E. Estimated Avg Wage Rate including COL increase</td><td>$6.48</td></tr>\
        </tbody></table>'
            }, { border: false, html: '<table style="width:100%" class="ux-table-2"><tbody>\
        <tr><td>F.Paid Leave does not get Evening Shift Differential</td><td>$6.48</td></tr>\
        </tbody></table>'
            }, { border: false, html: '<table style="width:100%" class="ux-table-2"><tbody>\
        <tr><td>Average Wage Rate for paid leave after COL increase excluding night differential</td><td>$6.48</td></tr>\
        </tbody></table>'
            }
            ], buttons: [
                    { ctCls: 'ux-button-1', text: 'Update', handler: function () { } },
                    { ctCls: 'ux-button-1', text: 'Cancel', handler: function () { } },
                    { ctCls: 'ux-button-1', text: 'Print', handler: function () { } }
            ]
        });

        var tabs = new Ext.TabPanel({
            activeTab: 0,
            border: false,
            ctCls: 'ux-tab-2',
            autoHeight: true,
            items: [
                   { title: 'Sick Pay', header: false, border: false, autoHeight:true,items: [gridTitleI, panelI] },
                   { title: 'Legal Holidays', header: false, border: false, autoHeight: true, items: [gridTitleII, panelII] },
                   { title: 'Vacation', header: false, border: false, autoHeight: true, items: [gridTitleIII, panelIII] },
                   { title: 'Prod Employees Health/Dental/Life <br/>and Union Contributions & BI-Weekly Cost', autoHeight: true, header: false, border: false, items: [gridTitleIV, panelIV] },
                   { title: '.Net Prod Days Per Emp & FTEs', autoHeight: true, header: false, border: false, items: [gridTitleV, panelV] },
                   { title: 'Labor Standards', autoHeight: true, header: false, border: false, items: [gridTitleVII, panelVII] },
                   { title: 'Labor Standard In Dollars', autoHeight: true, header: false, border: false, items: [gridTitleVIII, panelVIII] }
                ]
        });
        this.addChildControl(tabs, 'container');
        Bud.page.LaborCalculationsPage.superclass.createChildControls.call(this);
    }
});

WebLight.PageMgr.registerType('laborcalculations', Bud.page.LaborCalculationsPage);