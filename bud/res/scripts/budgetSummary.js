_builtInTemplate_a7063646 = ['<?xml version="1.0" encoding="utf-8" ?><transmission>  <target id="iiAuthorization" requestId="1">    <authorization id="1">      <authorize id="41" path="\\crothall\\chimes\\fin\\Budgeting"></authorize>      <authorize id="42" path="\\crothall\\chimes\\fin\\Budgeting\\AnnualizedBudget"></authorize>      <authorize id="16059" path="\\crothall\\chimes\\fin\\Budgeting\\AnnualizedBudget\\Read"></authorize>      <authorize id="16060" path="\\crothall\\chimes\\fin\\Budgeting\\AnnualizedBudget\\Write"></authorize>      <authorize id="44" path="\\crothall\\chimes\\fin\\Budgeting\\AnnualProjections"></authorize>      <authorize id="16063" path="\\crothall\\chimes\\fin\\Budgeting\\AnnualProjections\\ByPeriod"></authorize>      <authorize id="16064" path="\\crothall\\chimes\\fin\\Budgeting\\AnnualProjections\\ByPeriod\\Read"></authorize>      <authorize id="16065" path="\\crothall\\chimes\\fin\\Budgeting\\AnnualProjections\\ByPeriod\\Write"></authorize>      <authorize id="16066" path="\\crothall\\chimes\\fin\\Budgeting\\AnnualProjections\\WORForecast"></authorize>      <authorize id="16067" path="\\crothall\\chimes\\fin\\Budgeting\\AnnualProjections\\WORForecast\\Read"></authorize>      <authorize id="16068" path="\\crothall\\chimes\\fin\\Budgeting\\AnnualProjections\\WORForecast\\Write"></authorize>      <authorize id="1213" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration"></authorize>      <authorize id="16069" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration\\AnnualInformation"></authorize>      <authorize id="16070" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration\\AnnualInformation\\Read"></authorize>      <authorize id="16071" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration\\AnnualInformation\\Write"></authorize>      <authorize id="16072" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration\\ApproveBudget"></authorize>      <authorize id="16073" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration\\ApproveBudget\\Approve"></authorize>      <authorize id="16074" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration\\ApproveBudget\\Read"></authorize>      <authorize id="16075" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration\\ApproveBudget\\Reject"></authorize>      <authorize id="16076" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration\\ApproveBudget\\Write"></authorize>      <authorize id="16077" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration\\DeleteBudget"></authorize>      <authorize id="16078" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration\\DeleteBudget\\Read"></authorize>      <authorize id="16079" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration\\DeleteBudget\\Write"></authorize>      <authorize id="16080" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration\\ExportBudget"></authorize>      <authorize id="16081" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration\\ExportBudget\\Read"></authorize>      <authorize id="16082" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration\\ExportBudget\\Write"></authorize>      <authorize id="43" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetSummary"></authorize>      <authorize id="16061" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetSummary\\Read"></authorize>      <authorize id="16062" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetSummary\\Write"></authorize>    </authorization>  </target></transmission>','<?xml version="1.0" encoding="utf-8"?><transmission>  <target id="iiCache" requestId="7">    <store id="houseCodeJobs" activeId="20422" criteria="houseCodeId:12180,jobType:0,storeId:houseCodeJobs,userId:[user],">      <item id="20422" houseCodeId="12180" hirNode="14035" houseCodeTitle="" job="1" jobId="1" jobNumber="0000" jobTitle="[None]" jobDescription="[None]" overrideSiteTax="false" stateType="0" language1="" language2="" language3="" defaultHouseCode="false" active="true" />    </store>  </target></transmission>','<div style="color: #FFF; background-color: #659A66; padding: 10px; margin: 0 0 10px;">    <table width="100%" class="ann-proj-table">        <tbody>            <tr>                <td style="width: 35px;" class="label">Site:</td>                <td style="width: 300px"><div id="house-code-holder"></div></td>                <td style="width: 35px;" class="label">Job:</td>                <td style="width: 160px"><div id="job-code-holder"></div></td>                <td style="width: 80px;" class="label">Fiscal Year:</td>                <td style="width: 100px"><div id="fiscal-year-holder"></div></td>                <td style="width: 80px;" class="label">Period:</td>                <td style="width: 100px"><div id="period-start-holder"></div></td>                <td style="width: 10px;" class="label">-</td>                <td style="width: 100px"><div id="period-end-holder"></div></td>                <td>&nbsp;</td>                <td style="width: 120px;"></td>            </tr>        </tbody>    </table></div><div id="page-status"></div><div style="padding: 0 5px">    <p style="float:left">        The current page is READONLY.</p>        <div style="float:right"><span id="load-button-holder"></span></div></div><div style="clear:both;height:1px;"></div><div id="budget-summary-grid" style="padding: 10px 5px;"></div><br /><br />'];/*!
 * Ext JS Library 3.2.0
 * Copyright(c) 2006-2010 Ext JS, LLC
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
Ext.ns('Ext.ux.grid');

Ext.ux.grid.ColumnHeaderGroup = Ext.extend(Ext.util.Observable, {

    _grid: null,

    constructor: function (config) {
        this.config = config;
    },

    refreshHeader: function (rows) {
        if (this._grid)
            this._grid.colModel.rows = [rows];
    },

    init: function (grid) {
        Ext.applyIf(grid.colModel, this.config);
        Ext.apply(grid.getView(), this.viewConfig);
        this._grid = grid;
    },

    viewConfig: {
        initTemplates: function () {
            this.constructor.prototype.initTemplates.apply(this, arguments);
            var ts = this.templates || {};
            if (!ts.gcell) {
                ts.gcell = new Ext.XTemplate('<td class="x-grid3-hd x-grid3-gcell x-grid3-td-{id} ux-grid-hd-group-row-{row} {cls}" style="{style}">', '<div {tooltip} class="x-grid3-hd-inner x-grid3-hd-{id}" unselectable="on" style="{istyle}">', this.grid.enableHdMenu ? '<a class="x-grid3-hd-btn" href="#"></a>' : '', '{value}</div></td>');
            }
            this.templates = ts;
            this.hrowRe = new RegExp("ux-grid-hd-group-row-(\\d+)", "");
        },

        renderHeaders: function () {
            var ts = this.templates, headers = [], cm = this.cm, rows = cm.rows, tstyle = 'width:' + this.getTotalWidth() + ';';

            for (var row = 0, rlen = rows.length; row < rlen; row++) {
                var r = rows[row], cells = [];
                for (var i = 0, gcol = 0, len = r.length; i < len; i++) {
                    var group = r[i];
                    group.colspan = group.colspan || 1;
                    var id = this.getColumnId(group.dataIndex ? cm.findColumnIndex(group.dataIndex) : gcol), gs = Ext.ux.grid.ColumnHeaderGroup.prototype.getGroupStyle.call(this, group, gcol);
                    cells[i] = ts.gcell.apply({
                        cls: 'ux-grid-hd-group-cell',
                        id: id,
                        row: row,
                        style: 'width:' + gs.width + ';' + (gs.hidden ? 'display:none;' : '') + (group.align ? 'text-align:' + group.align + ';' : ''),
                        tooltip: group.tooltip ? (Ext.QuickTips.isEnabled() ? 'ext:qtip' : 'title') + '="' + group.tooltip + '"' : '',
                        istyle: group.align == 'right' ? 'padding-right:16px' : '',
                        btn: this.grid.enableHdMenu && group.header,
                        value: group.header || '&nbsp;'
                    });
                    gcol += group.colspan;
                }
                headers[row] = ts.header.apply({
                    tstyle: tstyle,
                    cells: cells.join('')
                });
            }
            headers.push(this.constructor.prototype.renderHeaders.apply(this, arguments));
            return headers.join('');
        },

        onColumnWidthUpdated: function () {
            this.constructor.prototype.onColumnWidthUpdated.apply(this, arguments);
            Ext.ux.grid.ColumnHeaderGroup.prototype.updateGroupStyles.call(this);
        },

        onAllColumnWidthsUpdated: function () {
            this.constructor.prototype.onAllColumnWidthsUpdated.apply(this, arguments);
            Ext.ux.grid.ColumnHeaderGroup.prototype.updateGroupStyles.call(this);
        },

        onColumnHiddenUpdated: function () {
            this.constructor.prototype.onColumnHiddenUpdated.apply(this, arguments);
            Ext.ux.grid.ColumnHeaderGroup.prototype.updateGroupStyles.call(this);
        },

        getHeaderCell: function (index) {
            return this.mainHd.query(this.cellSelector)[index];
        },

        findHeaderCell: function (el) {
            return el ? this.fly(el).findParent('td.x-grid3-hd', this.cellSelectorDepth) : false;
        },

        findHeaderIndex: function (el) {
            var cell = this.findHeaderCell(el);
            return cell ? this.getCellIndex(cell) : false;
        },

        updateSortIcon: function (col, dir) {
            var sc = this.sortClasses, hds = this.mainHd.select(this.cellSelector).removeClass(sc);
            hds.item(col).addClass(sc[dir == "DESC" ? 1 : 0]);
        },

        handleHdDown: function (e, t) {
            var el = Ext.get(t);
            if (el.hasClass('x-grid3-hd-btn')) {
                e.stopEvent();
                var hd = this.findHeaderCell(t);
                Ext.fly(hd).addClass('x-grid3-hd-menu-open');
                var index = this.getCellIndex(hd);
                this.hdCtxIndex = index;
                var ms = this.hmenu.items, cm = this.cm;
                ms.get('asc').setDisabled(!cm.isSortable(index));
                ms.get('desc').setDisabled(!cm.isSortable(index));
                this.hmenu.on('hide', function () {
                    Ext.fly(hd).removeClass('x-grid3-hd-menu-open');
                }, this, {
                    single: true
                });
                this.hmenu.show(t, 'tl-bl?');
            } else if (el.hasClass('ux-grid-hd-group-cell') || Ext.fly(t).up('.ux-grid-hd-group-cell')) {
                e.stopEvent();
            }
        },

        handleHdMove: function (e, t) {
            var hd = this.findHeaderCell(this.activeHdRef);
            if (hd && !this.headersDisabled && !Ext.fly(hd).hasClass('ux-grid-hd-group-cell')) {
                var hw = this.splitHandleWidth || 5, r = this.activeHdRegion, x = e.getPageX(), ss = hd.style, cur = '';
                if (this.grid.enableColumnResize !== false) {
                    if (x - r.left <= hw && this.cm.isResizable(this.activeHdIndex - 1)) {
                        cur = Ext.isAir ? 'move' : Ext.isWebKit ? 'e-resize' : 'col-resize'; // col-resize
                        // not
                        // always
                        // supported
                    } else if (r.right - x <= (!this.activeHdBtn ? hw : 2) && this.cm.isResizable(this.activeHdIndex)) {
                        cur = Ext.isAir ? 'move' : Ext.isWebKit ? 'w-resize' : 'col-resize';
                    }
                }
                ss.cursor = cur;
            }
        },

        handleHdOver: function (e, t) {
            var hd = this.findHeaderCell(t);
            if (hd && !this.headersDisabled) {
                this.activeHdRef = t;
                this.activeHdIndex = this.getCellIndex(hd);
                var fly = this.fly(hd);
                this.activeHdRegion = fly.getRegion();
                if (!(this.cm.isMenuDisabled(this.activeHdIndex) || fly.hasClass('ux-grid-hd-group-cell'))) {
                    fly.addClass('x-grid3-hd-over');
                    this.activeHdBtn = fly.child('.x-grid3-hd-btn');
                    if (this.activeHdBtn) {
                        this.activeHdBtn.dom.style.height = (hd.firstChild.offsetHeight - 1) + 'px';
                    }
                }
            }
        },

        handleHdOut: function (e, t) {
            var hd = this.findHeaderCell(t);
            if (hd && (!Ext.isIE || !e.within(hd, true))) {
                this.activeHdRef = null;
                this.fly(hd).removeClass('x-grid3-hd-over');
                hd.style.cursor = '';
            }
        },

        handleHdMenuClick: function (item) {
            var index = this.hdCtxIndex, cm = this.cm, ds = this.ds, id = item.getItemId();
            switch (id) {
                case 'asc':
                    ds.sort(cm.getDataIndex(index), 'ASC');
                    break;
                case 'desc':
                    ds.sort(cm.getDataIndex(index), 'DESC');
                    break;
                default:
                    if (id.substr(0, 5) == 'group') {
                        var i = id.split('-'), row = parseInt(i[1], 10), col = parseInt(i[2], 10), r = this.cm.rows[row], group, gcol = 0;
                        for (var i = 0, len = r.length; i < len; i++) {
                            group = r[i];
                            if (col >= gcol && col < gcol + group.colspan) {
                                break;
                            }
                            gcol += group.colspan;
                        }
                        if (item.checked) {
                            var max = cm.getColumnsBy(this.isHideableColumn, this).length;
                            for (var i = gcol, len = gcol + group.colspan; i < len; i++) {
                                if (!cm.isHidden(i)) {
                                    max--;
                                }
                            }
                            if (max < 1) {
                                this.onDenyColumnHide();
                                return false;
                            }
                        }
                        for (var i = gcol, len = gcol + group.colspan; i < len; i++) {
                            if (cm.config[i].fixed !== true && cm.config[i].hideable !== false) {
                                cm.setHidden(i, item.checked);
                            }
                        }
                    } else {
                        index = cm.getIndexById(id.substr(4));
                        if (index != -1) {
                            if (item.checked && cm.getColumnsBy(this.isHideableColumn, this).length <= 1) {
                                this.onDenyColumnHide();
                                return false;
                            }
                            cm.setHidden(index, item.checked);
                        }
                    }
                    item.checked = !item.checked;
                    if (item.menu) {
                        var updateChildren = function (menu) {
                            menu.items.each(function (childItem) {
                                if (!childItem.disabled) {
                                    childItem.setChecked(item.checked, false);
                                    if (childItem.menu) {
                                        updateChildren(childItem.menu);
                                    }
                                }
                            });
                        }
                        updateChildren(item.menu);
                    }
                    var parentMenu = item, parentItem;
                    while (parentMenu = parentMenu.parentMenu) {
                        if (!parentMenu.parentMenu || !(parentItem = parentMenu.parentMenu.items.get(parentMenu.getItemId())) || !parentItem.setChecked) {
                            break;
                        }
                        var checked = parentMenu.items.findIndexBy(function (m) {
                            return m.checked;
                        }) >= 0;
                        parentItem.setChecked(checked, true);
                    }
                    item.checked = !item.checked;
            }
            return true;
        },

        beforeColMenuShow: function () {
            var cm = this.cm, rows = this.cm.rows;
            this.colMenu.removeAll();
            for (var col = 0, clen = cm.getColumnCount(); col < clen; col++) {
                var menu = this.colMenu, title = cm.getColumnHeader(col), text = [];
                if (cm.config[col].fixed !== true && cm.config[col].hideable !== false) {
                    for (var row = 0, rlen = rows.length; row < rlen; row++) {
                        var r = rows[row], group, gcol = 0;
                        for (var i = 0, len = r.length; i < len; i++) {
                            group = r[i];
                            if (col >= gcol && col < gcol + group.colspan) {
                                break;
                            }
                            gcol += group.colspan;
                        }
                        if (group && group.header) {
                            if (cm.hierarchicalColMenu) {
                                var gid = 'group-' + row + '-' + gcol;
                                var item = menu.items.item(gid);
                                var submenu = item ? item.menu : null;
                                if (!submenu) {
                                    submenu = new Ext.menu.Menu({
                                        itemId: gid
                                    });
                                    submenu.on("itemclick", this.handleHdMenuClick, this);
                                    var checked = false, disabled = true;
                                    for (var c = gcol, lc = gcol + group.colspan; c < lc; c++) {
                                        if (!cm.isHidden(c)) {
                                            checked = true;
                                        }
                                        if (cm.config[c].hideable !== false) {
                                            disabled = false;
                                        }
                                    }
                                    menu.add({
                                        itemId: gid,
                                        text: group.header,
                                        menu: submenu,
                                        hideOnClick: false,
                                        checked: checked,
                                        disabled: disabled
                                    });
                                }
                                menu = submenu;
                            } else {
                                text.push(group.header);
                            }
                        }
                    }
                    text.push(title);
                    menu.add(new Ext.menu.CheckItem({
                        itemId: "col-" + cm.getColumnId(col),
                        text: text.join(' '),
                        checked: !cm.isHidden(col),
                        hideOnClick: false,
                        disabled: cm.config[col].hideable === false
                    }));
                }
            }
        },

        renderUI: function () {
            this.constructor.prototype.renderUI.apply(this, arguments);
            Ext.apply(this.columnDrop, Ext.ux.grid.ColumnHeaderGroup.prototype.columnDropConfig);
            Ext.apply(this.splitZone, Ext.ux.grid.ColumnHeaderGroup.prototype.splitZoneConfig);
        }
    },

    splitZoneConfig: {
        allowHeaderDrag: function (e) {
            return !e.getTarget(null, null, true).hasClass('ux-grid-hd-group-cell');
        }
    },

    columnDropConfig: {
        getTargetFromEvent: function (e) {
            var t = Ext.lib.Event.getTarget(e);
            return this.view.findHeaderCell(t);
        },

        positionIndicator: function (h, n, e) {
            var data = Ext.ux.grid.ColumnHeaderGroup.prototype.getDragDropData.call(this, h, n, e);
            if (data === false) {
                return false;
            }
            var px = data.px + this.proxyOffsets[0];
            this.proxyTop.setLeftTop(px, data.r.top + this.proxyOffsets[1]);
            this.proxyTop.show();
            this.proxyBottom.setLeftTop(px, data.r.bottom);
            this.proxyBottom.show();
            return data.pt;
        },

        onNodeDrop: function (n, dd, e, data) {
            var h = data.header;
            if (h != n) {
                var d = Ext.ux.grid.ColumnHeaderGroup.prototype.getDragDropData.call(this, h, n, e);
                if (d === false) {
                    return false;
                }
                var cm = this.grid.colModel, right = d.oldIndex < d.newIndex, rows = cm.rows;
                for (var row = d.row, rlen = rows.length; row < rlen; row++) {
                    var r = rows[row], len = r.length, fromIx = 0, span = 1, toIx = len;
                    for (var i = 0, gcol = 0; i < len; i++) {
                        var group = r[i];
                        if (d.oldIndex >= gcol && d.oldIndex < gcol + group.colspan) {
                            fromIx = i;
                        }
                        if (d.oldIndex + d.colspan - 1 >= gcol && d.oldIndex + d.colspan - 1 < gcol + group.colspan) {
                            span = i - fromIx + 1;
                        }
                        if (d.newIndex >= gcol && d.newIndex < gcol + group.colspan) {
                            toIx = i;
                        }
                        gcol += group.colspan;
                    }
                    var groups = r.splice(fromIx, span);
                    rows[row] = r.splice(0, toIx - (right ? span : 0)).concat(groups).concat(r);
                }
                for (var c = 0; c < d.colspan; c++) {
                    var oldIx = d.oldIndex + (right ? 0 : c), newIx = d.newIndex + (right ? -1 : c);
                    cm.moveColumn(oldIx, newIx);
                    this.grid.fireEvent("columnmove", oldIx, newIx);
                }
                return true;
            }
            return false;
        }
    },

    getGroupStyle: function (group, gcol) {
        var width = 0, hidden = true;
        for (var i = gcol, len = gcol + group.colspan; i < len; i++) {
            if (!this.cm.isHidden(i)) {
                var cw = this.cm.getColumnWidth(i);
                if (typeof cw == 'number') {
                    width += cw;
                }
                hidden = false;
            }
        }
        return {
            width: (Ext.isBorderBox || (Ext.isWebKit && !Ext.isSafari2) ? width : Math.max(width - this.borderWidth, 0)) + 'px',
            hidden: hidden
        };
    },

    updateGroupStyles: function (col) {
        var tables = this.mainHd.query('.x-grid3-header-offset > table'), tw = this.getTotalWidth(), rows = this.cm.rows;
        for (var row = 0; row < tables.length; row++) {
            tables[row].style.width = tw;
            if (row < rows.length) {
                var cells = tables[row].firstChild.firstChild.childNodes;
                for (var i = 0, gcol = 0; i < cells.length; i++) {
                    var group = rows[row][i];
                    if ((typeof col != 'number') || (col >= gcol && col < gcol + group.colspan)) {
                        var gs = Ext.ux.grid.ColumnHeaderGroup.prototype.getGroupStyle.call(this, group, gcol);
                        cells[i].style.width = gs.width;
                        cells[i].style.display = gs.hidden ? 'none' : '';
                    }
                    gcol += group.colspan;
                }
            }
        }
    },

    getGroupRowIndex: function (el) {
        if (el) {
            var m = el.className.match(this.hrowRe);
            if (m && m[1]) {
                return parseInt(m[1], 10);
            }
        }
        return this.cm.rows.length;
    },

    getGroupSpan: function (row, col) {
        if (row < 0) {
            return {
                col: 0,
                colspan: this.cm.getColumnCount()
            };
        }
        var r = this.cm.rows[row];
        if (r) {
            for (var i = 0, gcol = 0, len = r.length; i < len; i++) {
                var group = r[i];
                if (col >= gcol && col < gcol + group.colspan) {
                    return {
                        col: gcol,
                        colspan: group.colspan
                    };
                }
                gcol += group.colspan;
            }
            return {
                col: gcol,
                colspan: 0
            };
        }
        return {
            col: col,
            colspan: 1
        };
    },

    getDragDropData: function (h, n, e) {
        if (h.parentNode != n.parentNode) {
            return false;
        }
        var cm = this.grid.colModel, x = Ext.lib.Event.getPageX(e), r = Ext.lib.Dom.getRegion(n.firstChild), px, pt;
        if ((r.right - x) <= (r.right - r.left) / 2) {
            px = r.right + this.view.borderWidth;
            pt = "after";
        } else {
            px = r.left;
            pt = "before";
        }
        var oldIndex = this.view.getCellIndex(h), newIndex = this.view.getCellIndex(n);
        if (cm.isFixed(newIndex)) {
            return false;
        }
        var row = Ext.ux.grid.ColumnHeaderGroup.prototype.getGroupRowIndex.call(this.view, h),
            oldGroup = Ext.ux.grid.ColumnHeaderGroup.prototype.getGroupSpan.call(this.view, row, oldIndex),
            newGroup = Ext.ux.grid.ColumnHeaderGroup.prototype.getGroupSpan.call(this.view, row, newIndex),
            oldIndex = oldGroup.col;
        newIndex = newGroup.col + (pt == "after" ? newGroup.colspan : 0);
        if (newIndex >= oldGroup.col && newIndex <= oldGroup.col + oldGroup.colspan) {
            return false;
        }
        var parentGroup = Ext.ux.grid.ColumnHeaderGroup.prototype.getGroupSpan.call(this.view, row - 1, oldIndex);
        if (newIndex < parentGroup.col || newIndex > parentGroup.col + parentGroup.colspan) {
            return false;
        }
        return {
            r: r,
            px: px,
            pt: pt,
            row: row,
            oldIndex: oldIndex,
            newIndex: newIndex,
            colspan: oldGroup.colspan
        };
    }
});

/**
 * @class GetIt.GridPrinter
 * @author Ed Spencer (edward@domine.co.uk)
 * Class providing a common way of printing Ext.Components. Ext.ux.Printer.print delegates the printing to a specialised
 * renderer class (each of which subclasses Ext.ux.Printer.BaseRenderer), based on the xtype of the component.
 * Each renderer is registered with an xtype, and is used if the component to print has that xtype.
 * 
 * See the files in the renderers directory to customise or to provide your own renderers.
 * 
 * Usage example:
 * 
 * var grid = new Ext.grid.GridPanel({
 *   colModel: //some column model,
 *   store   : //some store
 * });
 * 
 * Ext.ux.Printer.print(grid);
 * 
 */
Ext.ux.Printer = function () {

    return {
        /**
        * @property renderers
        * @type Object
        * An object in the form {xtype: RendererClass} which is manages the renderers registered by xtype
        */
        renderers: {},

        /**
        * Registers a renderer function to handle components of a given xtype
        * @param {String} xtype The component xtype the renderer will handle
        * @param {Function} renderer The renderer to invoke for components of this xtype
        */
        registerRenderer: function (xtype, renderer) {
            this.renderers[xtype] = new (renderer)();
        },

        /**
        * Returns the registered renderer for a given xtype
        * @param {String} xtype The component xtype to find a renderer for
        * @return {Object/undefined} The renderer instance for this xtype, or null if not found
        */
        getRenderer: function (xtype) {
            return this.renderers[xtype];
        },

        generateHtml: function (title, bodyMaster, cssFile) {
            var snippets = ['<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
      '<html>',
        '<head>',
          '<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />',
        (cssFile ? '<link href="' + cssFile + '" rel="stylesheet" type="text/css" media="screen,print" />' : ''),
          '<title>' + title + '</title>',
        '</head>',
        '<body>',
         (bodyMaster || ''),
        '</body>',
      '</html>'];
            return snippets.join('');
        },

        print: function (title, body, components, cssFile) {
            var me = this;
            var html = this.generateHtml(title, body, cssFile);

            if (Ext.isObject(components)) {
                for (var item in components) {
                    var cmpHtml;
                    if (Ext.isString(components[item]) || Ext.isNumber(components[item]))
                        cmpHtml = components[item];
                    else
                        cmpHtml = me.renderCmp(components[item]);
                    reg = new RegExp("\\{" + item + "\\}", "gm");
                    html = html.replace(reg, cmpHtml);
                }
            }

            var win = window.open('', '_new');

            win.document.write(html);
            win.document.close();

            win.print();
            //win.close();
        },

        renderCmp: function (component) {
            var xtypes = component.getXTypes().split('/');

            //iterate backwards over the xtypes of this component, dispatching to the most specific renderer
            for (var i = xtypes.length - 1; i >= 0; i--) {
                var xtype = xtypes[i],
            renderer = this.getRenderer(xtype);

                if (renderer != undefined) {
                    return renderer.generateHTML(component);
                    break;
                }
            }
            return '[component render undefined]';
        },

        /**
        * Prints the passed grid. Reflects on the grid's column model to build a table, and fills it using the store
        * @param {Ext.Component} component The component to print
        */
        print1: function (component) {
            var xtypes = component.getXTypes().split('/');

            //iterate backwards over the xtypes of this component, dispatching to the most specific renderer
            for (var i = xtypes.length - 1; i >= 0; i--) {
                var xtype = xtypes[i],
            renderer = this.getRenderer(xtype);

                if (renderer != undefined) {
                    renderer.print(component);
                    break;
                }
            }
        }
    };
} ();

/**
 * Override how getXTypes works so that it doesn't require that every single class has
 * an xtype registered for it.
 */
Ext.override(Ext.Component, {
  getXTypes : function(){
      var tc = this.constructor;
      if(!tc.xtypes){
          var c = [], sc = this;
          while(sc){ //was: while(sc && sc.constructor.xtype) {
            var xtype = sc.constructor.xtype;
            if (xtype != undefined) c.unshift(xtype);
            
            sc = sc.constructor.superclass;
          }
          tc.xtypeChain = c;
          tc.xtypes = c.join('/');
      }
      return tc.xtypes;
  }
});

/**
 * @class Ext.ux.Printer.BaseRenderer
 * @extends Object
 * @author Ed Spencer
 * Abstract base renderer class. Don't use this directly, use a subclass instead
 */
Ext.ux.Printer.BaseRenderer = Ext.extend(Object, {


    /**
    * Prints the component
    * @param {Ext.Component} component The component to print
    */
    print: function (component) {
        var name = component && component.getXType
             ? String.format("print_{0}_{1}", component.getXType(), component.id)
             : "print";

        var win = window.open('', name);

        win.document.write(this.generateHTML(component));
        win.document.close();

        win.print();
        win.close();
    },

    /**
    * Generates the HTML Markup which wraps whatever this.generateBody produces
    * @param {Ext.Component} component The component to generate HTML for
    * @return {String} An HTML fragment to be placed inside the print window
    */
    generateHTML: function (component) {
        //    return new Ext.XTemplate(
        //      '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
        //      '<html>',
        //        '<head>',
        //          '<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />',
        //          '<link href="' + this.stylesheetPath + '" rel="stylesheet" type="text/css" media="screen,print" />',
        //          '<title>' + this.getTitle(component) + '</title>',
        //        '</head>',
        //        '<body>',
        //          this.generateBody(component),
        //        '</body>',
        //      '</html>'
        //    ).apply(this.prepareData(component));
        return new Ext.XTemplate(this.generateBody(component)).apply(this.prepareData(component));
    },

    /**
    * Returns the HTML that will be placed into the print window. This should produce HTML to go inside the
    * <body> element only, as <head> is generated in the print function
    * @param {Ext.Component} component The component to render
    * @return {String} The HTML fragment to place inside the print window's <body> element
    */
    generateBody: Ext.emptyFn,

    /**
    * Prepares data suitable for use in an XTemplate from the component 
    * @param {Ext.Component} component The component to acquire data from
    * @return {Array} An empty array (override this to prepare your own data)
    */
    prepareData: function (component) {
        return component;
    },

    /**
    * Returns the title to give to the print window
    * @param {Ext.Component} component The component to be printed
    * @return {String} The window title
    */
    getTitle: function (component) {
        return typeof component.getTitle == 'function' ? component.getTitle() : (component.title || "Printing");
    },

    /**
    * @property stylesheetPath
    * @type String
    * The path at which the print stylesheet can be found (defaults to 'stylesheets/print.css')
    */
    stylesheetPath: 'stylesheets/print.css'
});

/**
 * @class Ext.ux.Printer.ColumnTreeRenderer
 * @extends Ext.ux.Printer.BaseRenderer
 * @author Ed Spencer
 * Helper class to easily print the contents of a column tree
 */
Ext.ux.Printer.ColumnTreeRenderer = Ext.extend(Ext.ux.Printer.BaseRenderer, {

  /**
   * Generates the body HTML for the tree
   * @param {Ext.tree.ColumnTree} tree The tree to print
   */
  generateBody: function(tree) {
    var columns = this.getColumns(tree);
    
    //use the headerTpl and bodyTpl XTemplates to create the main XTemplate below
    var headings = this.headerTpl.apply(columns);
    var body     = this.bodyTpl.apply(columns);
    
    return String.format('<table>{0}<tpl for=".">{1}</tpl></table>', headings, body);
  },
    
  /**
   * Returns the array of columns from a tree
   * @param {Ext.tree.ColumnTree} tree The tree to get columns from
   * @return {Array} The array of tree columns
   */
  getColumns: function(tree) {
    return tree.columns;
  },
  
  /**
   * Descends down the tree from the root, creating an array of data suitable for use in an XTemplate
   * @param {Ext.tree.ColumnTree} tree The column tree
   * @return {Array} Data suitable for use in the body XTemplate
   */
  prepareData: function(tree) {
    var root = tree.root,
        data = [],
        cols = this.getColumns(tree),
        padding = this.indentPadding;
        
    var f = function(node) {
      if (node.hidden === true || node.isHiddenRoot() === true) return;
      
      var row = Ext.apply({depth: node.getDepth() * padding}, node.attributes);
      
      Ext.iterate(row, function(key, value) {
        Ext.each(cols, function(column) {
          if (column.dataIndex == key) {
            row[key] = column.renderer ? column.renderer(value) : value;
          }
        }, this);        
      });
      
      //the property used in the first column is renamed to 'text' in node.attributes, so reassign it here
      row[this.getColumns(tree)[0].dataIndex] = node.attributes.text;
      
      data.push(row);
    };
    
    root.cascade(f, this);
    
    return data;
  },
  
  /**
   * @property indentPadding
   * @type Number
   * Number of pixels to indent node by. This is multiplied by the node depth, so a node with node.getDepth() == 3 will
   * be padded by 45 (or 3x your custom indentPadding)
   */
  indentPadding: 15,
  
  /**
   * @property headerTpl
   * @type Ext.XTemplate
   * The XTemplate used to create the headings row. By default this just uses <th> elements, override to provide your own
   */
  headerTpl:  new Ext.XTemplate(
    '<tr>',
      '<tpl for=".">',
        '<th width="{width}">{header}</th>',
      '</tpl>',
    '</tr>'
  ),
 
  /**
   * @property bodyTpl
   * @type Ext.XTemplate
   * The XTemplate used to create each row. This is used inside the 'print' function to build another XTemplate, to which the data
   * are then applied (see the escaped dataIndex attribute here - this ends up as "{dataIndex}")
   */
  bodyTpl:  new Ext.XTemplate(
    '<tr>',
      '<tpl for=".">',
        '<td style="padding-left: {[xindex == 1 ? "\\{depth\\}" : "0"]}px">\{{dataIndex}\}</td>',
      '</tpl>',
    '</tr>'
  )
});

Ext.ux.Printer.registerRenderer('columntree', Ext.ux.Printer.ColumnTreeRenderer);

/**
 * @class Ext.ux.Printer.GridPanelRenderer
 * @extends Ext.ux.Printer.BaseRenderer
 * @author Ed Spencer
 * Helper class to easily print the contents of a grid. Will open a new window with a table where the first row
 * contains the headings from your column model, and with a row for each item in your grid's store. When formatted
 * with appropriate CSS it should look very similar to a default grid. If renderers are specified in your column
 * model, they will be used in creating the table. Override headerTpl and bodyTpl to change how the markup is generated
 */
Ext.ux.Printer.GridPanelRenderer = Ext.extend(Ext.ux.Printer.BaseRenderer, {
  
  /**
   * Generates the body HTML for the grid
   * @param {Ext.grid.GridPanel} grid The grid to print
   */
  generateBody: function(grid) {
    var columns = this.getColumns(grid);
    
    //use the headerTpl and bodyTpl XTemplates to create the main XTemplate below
    var headings = this.headerTpl.apply(columns);
    var body     = this.bodyTpl.apply(columns);
    
    return String.format('<table>{0}<tpl for=".">{1}</tpl></table>', headings, body);
  },
  
  /**
   * Prepares data from the grid for use in the XTemplate
   * @param {Ext.grid.GridPanel} grid The grid panel
   * @return {Array} Data suitable for use in the XTemplate
   */
  prepareData: function(grid) {
    //We generate an XTemplate here by using 2 intermediary XTemplates - one to create the header,
    //the other to create the body (see the escaped {} below)
    var columns = this.getColumns(grid);
  
    //build a useable array of store data for the XTemplate
    var data = [];
    grid.store.data.each(function(item) {
      var convertedData = {};
      
      //apply renderers from column model
      Ext.iterate(item.data, function(key, value) {
        Ext.each(columns, function(column) {
          if (column.dataIndex == key) {
            convertedData[key] = column.renderer ? column.renderer(value, null, item) : value;
            return false;
          }
        }, this);
      });
    
      data.push(convertedData);
    });
    
    return data;
  },
  
  /**
   * Returns the array of columns from a grid
   * @param {Ext.grid.GridPanel} grid The grid to get columns from
   * @return {Array} The array of grid columns
   */
  getColumns: function(grid) {
    var columns = [];
    
  	Ext.each(grid.getColumnModel().config, function(col) {
  	  if (col.hidden != true) columns.push(col);
  	}, this);
  	
  	return columns;
  },
  
  /**
   * @property headerTpl
   * @type Ext.XTemplate
   * The XTemplate used to create the headings row. By default this just uses <th> elements, override to provide your own
   */
  headerTpl:  new Ext.XTemplate(
    '<tr>',
      '<tpl for=".">',
        '<th>{header}</th>',
      '</tpl>',
    '</tr>'
  ),
 
   /**
    * @property bodyTpl
    * @type Ext.XTemplate
    * The XTemplate used to create each row. This is used inside the 'print' function to build another XTemplate, to which the data
    * are then applied (see the escaped dataIndex attribute here - this ends up as "{dataIndex}")
    */
  bodyTpl:  new Ext.XTemplate(
    '<tr>',
      '<tpl for=".">',
        '<td>\{{dataIndex}\}</td>',
      '</tpl>',
    '</tr>'
  )
});

Ext.ux.Printer.registerRenderer('grid', Ext.ux.Printer.GridPanelRenderer);

/**
* Prints the contents of an Ext.Panel
*/
Ext.ux.Printer.PanelRenderer = Ext.extend(Ext.ux.Printer.BaseRenderer, {

    /**
    * Generates the HTML fragment that will be rendered inside the <html> element of the printing window
    */
    generateBody: function (panel) {
        return String.format("<div class='x-panel-print'>{0}</div>", panel.body.dom.innerHTML);
    }
});

Ext.ux.Printer.registerRenderer("panel", Ext.ux.Printer.PanelRenderer);



/// <reference path="../../references/jquery-1.4.1.js" />
/// <reference path="../../references/ext-jquery-adapter.js" />
/// <reference path="../../references/ext-all.js" />
/// <reference path="../../references/weblight4extjs.js" />


Ext.namespace("Bdg.store");
Ext.namespace("Bdg.object");

Bdg.store.Contract = [['4005 Full Service Bills', '92054.79', '92054.79', '92054.79', '92054.79', '92054.79', '92054.79', '92054.79', '92778.08', '93895.89', '93895.89', '93895.89', '93895.89', '93895.89', '1206641.06'],
                        ['4010 Management Fee Billing', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
                        ['4020 Miscellaneous Income', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
                        ['4030 Reimbursement Start-up Costs', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
                        ['4040 Reimbursement Direct Costs', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
                        ['4050 Reimbursement Equipment', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
                        ['4060 Quality Incentive Income', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
                        ['4070 Prepayment Discount', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
                        ['4080 Finalily', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0']
                        ];

Bdg.store.Staff = [['name', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
                    ['text', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0']];


Bdg.store.Employee = [['Jackson,Bo', '1', '0', '', '7.75', '0', '0', '7.75', '60', '465.00', '465.00', '12090.00'],
                    ['Simpson,Bo', '1', '1', '', '10.00', '0', '0', '10.00', '80', '800.00', '800.00', '20800.00'],
                    ['Simpson,Homer', '1', '2', '', '2.00', '0', '0', '2.00', '80', '160.00', '160.00', '4160.00']];

Bdg.store.Hist = [['Joseph', 'Director of POH', '80000', '1', 'Annual', '2', '81600']];

Bdg.store.Hist1 = [['Joseph Smith', '92054.79', '92054.79', '92054.79', '92054.79', '92054.79',
                '92054.79', '92054.79', '92778.08', '93895.89', '93895.89', '93895.89', '93895.89', '93895.89', '1206641.06']];

Bdg.store.Labor = [['Productive Hours', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0'],
                  ['Short Staffing Legal Holidays', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0'],
                  ['Productive Hours Standard', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
                  ['Average Wage Rate', '$6.48', '$6.48', '$6.48', '$6.48', '$6.48', '$6.48', '$6.48', '$6.48', '$6.48', '$6.48', '$6.48', '$6.48', '$6.48', '$6.48'],
                  ['Prod Labor Standard Cost', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0'],
                  ['Average Wage Rate For Paid Leave', '$6.48', '$6.48', '$6.48', '$6.48', '$6.48', '$6.48', '$6.48', '$6.48', '$6.48', '$6.48', '$6.48', '$6.48', '$6.48', '$6.48'],
                  ['Paid Leave Calculation', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0'],
                  ['Sick Pay', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0'],
                  ['Personal and Other Pay', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0'],
                  ['Legal Holiday', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0'],
                  ['Sub-total Paid Leave', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0'],
                  ['Vacation Pay Account', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0.00', '$0'],
                  ['Overtime Hours', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0'],
                  ['Cost associated with Overtime', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0'],
                  ['Total Labor Cost', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0', '$0']
                 ];

Bdg.store.Supply = [['', 'cs', '45', '2', '90', '2', '90', '0', '0'], ['Remove', '0', '26.2', '10', '265', '4', '106', '-6', '-159']];

Bdg.store.Captial = [['PDA', '1', '8000.00', '3', '205.13', 'TeamOps']];

Bdg.store.Captial1 = [['', '0', '0', '0', '']];

Bdg.store.Captial3 = [['PDA', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '2666.69'],
                    ['Total New Depreciation', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '2666.69'],
                    ['Carry Forward Depr.per Sch', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
                    ['Less Disposed Equipment', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
                    ['Total Depreciation', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '2666.69']
                    ];
Bdg.store.Captial2 = [['PDA', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '205.13', '2666.69']];
Bdg.store.Captial4 = [['', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0']];

Bdg.store.Adj = [['Management Fee Billings', '4010', '0', '0', '0', '0', '0', '0', '0', '-2.000', '0', '0', '0', '0', '0', '-2.000'],
                ['Management Labor', '5610', '0', '0', '0', '0', '0', '0', '0', '0', '-4.000', '0', '0', '0', '0', '-2.000'],
                ['Fringe Benefits Management', '5805', '0', '0', '0', '0', '0', '0', '0', '0', '-4.000', '0', '0', '0', '0', '-2.000'],
                ['Plastic Supplies', '6205', '0', '0', '0', '0', '0', '0', '0', '0', '-4.000', '0', '0', '0', '0', '-2.000']];

Bdg.store.Detail = [['General Liab Ins--Fringe', '5950', '644', '644', '644', '644', '644', '644', '644', '635', '657', '657', '657', '657', '657', '8,433', '0.70%'],
                    ['Plastic Supplies', '6025', '196', '196', '196', '196', '196', '196', '196', '196', '196', '196', '196', '196', '196', '2,548', '0.21%'],
                    ['Computer Related  Charge', '6240', '125', '0', '125', '0', '125', '0', '125', '0', '-4.000', '0', '0', '0', '0', '875', '0.07%'],
                    ['Repairs And Maintenance', '6310', '100', '100', '100', '100', '100', '100', '200', '200', '200', '200', '200', '200', '200', '2,000', '0.17%'],
                    ['Travel-Hotel/Auto/Other', '6430', '5,000', '1', '0', '2,000', '1,000', '0', '0', '10,000', '0', '0', '0', '0', '0', '18,000', '1.49%'],
                    ['Office Supplies', '6605', '50', '50', '50', '50', '50', '0', '0', '0', '0', '125', '0', '0', '0', '250', '0.02%'],
                    ['Uniforms', '7770', '100', '100', '100', '100', '100', '100', '100', '100', '100', '100', '100', '100', '100', '1,300', '0.11%'],
                    ['Depreciation', '8605', '205', '205', '205', '205', '205', '205', '205', '205', '205', '205', '205', '205', '205', '2665', '0.22%']];

Bdg.store.summary = [['Productive Labor', '5210', '305', '0', '0', '-305', '-100.00%', ''],
                      ['Manegement Labor', '5610', '0', '0', '77,600', '77,600', '0.00%', ''],
                      ['Frige Benefits-Management', '5610', '0', '0', '77,600', '77,600', '0.00%', ''],
                      ['General Liab Ins--Fringe', '5610', '0', '0', '77,600', '77,600', '0.00%', ''],
                      ['Plastic Suuplies', '5610', '0', '0', '77,600', '77,600', '0.00%', ''],
                      ['Computer Related Charge', '5610', '0', '0', '77,600', '77,600', '0.00%']];

Bdg.store.Approval = [['', '', '2011', '9999 Text Site', '', '', '5/11/10 2:30PM']];

Bdg.store = (function () {
    var getTimeStore = function () {
        var i = 0;
        var data = [];
        for (i = 0; i < 24; i++) {
            data.push([i * 2, i + ':00'])
        }

        return new Ext.data.ArrayStore({
            fields: ['id', 'name'],
            data: data
        });
    }

    return {
        TimeStore: getTimeStore()
    }
})();



jQuery.ajaxSettings.contentType = 'application/x-www-form-urlencoded; charset=utf-8';

WebLight.namespace('Bud', 'Bud.form', 'Bud.page', 'Bud.grid');

var host = document.location.host;
if (!window.top.fin) {
    //window.top.fin = { appUI: { houseCodeId: 227, glbFscYear: 2, glbFscPeriod: 18} };
    window.top.fin = { appUI: { glbFscYear: 4, glbFscPeriod: 46} };
}

Bud.getGlobalHouseCodeStore = function () {
    if (!top.globalHouseCodeStore) {
        top.globalHouseCodeStore = new Bud.data.HouseCodeStore();
        top.globalHouseCodeStore.load();
    }
    else if (top.globalHouseCodeStore.getCount() > 0) {
        top.globalHouseCodeStore.fireEvent('load', top.globalHouseCodeStore, top.globalHouseCodeStore.getRange());
    }
    return top.globalHouseCodeStore;
};

Bud.Context = {
    userId: document.location.host == 'localhost' ? 'RAYMOND-DEV-XP\\Raymond+Liu' : '[user]',
    isTest: document.location.host == 'localhost',
    ytdBusinessDays: 261,
    getStickyHcmHouseCode: function () {
        var hcmHouseCode = window.top.fin.appUI.houseCodeId;
        if (!hcmHouseCode)
            return 0;
        return hcmHouseCode;
    },

    getStickyFscYear: function () {
        var fscYear = window.top.fin.appUI.glbFscYear;
        if (!fscYear)
            return 0;
        return fscYear;
    },

    getStickyFscPeriod: function () {

        var fscPeriod = window.top.fin.appUI.glbFscPeriod;
        if (!fscPeriod)
            return 0;
        return fscPeriod;
    },

    setStickyHouseCode: function (appUnit, id, name, brief, hirNode) {
        if (window.top.fin.appUI) {
            window.top.fin.appUI.unitId = appUnit;
            window.top.fin.appUI.houseCodeId = parseFloat(id);
            window.top.fin.appUI.houseCodeTitle = name;
            window.top.fin.appUI.houseCodeBrief = brief;
            window.top.fin.appUI.hirNode = hirNode;
        }
    },

    setStickyFiscalYear: function (id, name) {
        if (window.top.fin.appUI) {
            window.top.fin.appUI.glbFscYear = parseFloat(id);
            window.top.fin.appUI.glbfiscalYear = name;
        }
    },

    setStickyFiscalPeriod: function (id, name) {
        if (window.top.fin.appUI) {
            window.top.fin.appUI.glbFscPeriod = parseFloat(id);
            window.top.fin.appUI.glbPeriod = name;
        }
    }
};

Ext.override(Ext.form.Field, {

    showItem: function () {
        if (!Ext.isEmpty(this.getEl()))
            this.getEl().up('.x-form-item').setDisplayed(true);
    },

    hideItem: function () {
        if (!Ext.isEmpty(this.getEl()))
            this.getEl().up('.x-form-item').setDisplayed(false);
    }
});

Ext.override(Ext.form.DisplayField, {
    setRawValue: function (v) {

        if (this.htmlEncode) {
            v = Ext.util.Format.htmlEncode(v);
        }
        if (this.dateFormat && Ext.isDate(v)) {
            v = v.dateFormat(this.dateFormat);
        }

        if (this.numberFormat) {
            if (v == 0 || v == '') {
                if (this.numberFormat.indexOf(',') > 0)
                    v = this.numberFormat.substring(4);
                else
                    v = this.numberFormat;
            }
            else if (typeof v == 'number')
                v = Ext.util.Format.number(v, this.numberFormat);
        }

        if (this.rendered) {

            if (Ext.isEmpty(v)) {
                this.el.dom.innerHTML = '';
            }
            else {
                this.el.dom.innerHTML = v;
            }
        }
        else {
            this.value = v;
        }
    }
});

Ext.override(Ext.form.NumberField, {
    allowBlank: false
});

Bud.form.DropdownList = Ext.extend(Ext.form.ComboBox, {
    mode: 'local',
    forceSelection: true,
    triggerAction: 'all',
    selectOnFocus: true,
    editable: false,
    layzeInit: false,
    typeAhead: true,
    allowBlank: false,
    initComponent: function () {
        Bud.form.DropdownList.superclass.initComponent.call(this);
    },
    setValue: function (v) {
        var oldValue = this.value;
        this.innerValue = v;
        Bud.form.DropdownList.superclass.setValue.call(this, v);

        if (oldValue != v)
            this.fireEvent('valuechange', v, this.getRawValue());

        return this;
    }
});


Bud.grid.GridPanel = Ext.extend(WebLight.grid.GridPanel, {

    constructor: function (config) {

        if (config && config.width) {
            if (config.width > $(window).width() - 35)
                config.width = $(window).width() - 35;
        }

        Bud.grid.GridPanel.superclass.constructor.call(this, config);
    }
});

Bud.grid.EditorGridPanel = Ext.extend(Ext.grid.EditorGridPanel, {

    lastSelectedCell: null,

    constructor: function (config) {

        if (config && config.width) {
            if (config.width > $(window).width() - 35)
                config.width = $(window).width() - 35;
        }

        Bud.grid.EditorGridPanel.superclass.constructor.call(this, config);
    },

    initComponent: function () {
        Bud.grid.EditorGridPanel.superclass.initComponent.call(this);

        var me = this;

        this.getView().on('beforerefresh', function (gv) {
            me.lastSelectedCell = me.getSelectionModel().getSelectedCell();
        });

        /// fix staffing hours page, shift combo changing bug.
        ///  start
        me.on('render', function () {
            me.getStore().on('beforeload', function () {
                me.getSelectionModel().clearSelections();

            });
            me.resizeHeaderDiv();

            me.getView().on('refresh', function () {
                me.resizeHeaderDiv();
            });
        });
        //// end



        /// add event listener at last
        setTimeout(function () {
            me.getView().on('refresh', function (gv) {
                if (me.lastSelectedCell) {
                    me.getSelectionModel().select(me.lastSelectedCell[0], me.lastSelectedCell[1]);
                    me.startEditing(me.lastSelectedCell[0], me.lastSelectedCell[1]);
                    me.lastSelectedCell = null;
                }
            });
        }, 100);
    },

    resizeHeaderDiv: function () {
        // fix ie7 scrolled header width issue
        var gridWidth = $('#' + this.id).width();
        var headerWidth = $('.x-grid3-header-offset', $('#' + this.id)).width();
        if (headerWidth < gridWidth)
            headerWidth = gridWidth - 25;
        $('.x-grid3-header', $('#' + this.id)).width(headerWidth);

    },
    startEditing: function (row, col) {
        var me = this;

        if (me.lastSelectedCell && row == me.lastSelectedCell[0] && col == me.lastSelectedCell[1]) {
            return;
        }
        this.stopEditing();
        if (this.colModel.isCellEditable(col, row)) {
            this.view.ensureVisible(row, col, true);
            var r = this.store.getAt(row),
                field = this.colModel.getDataIndex(col),
                e = {
                    grid: this,
                    record: r,
                    field: field,
                    value: r.data[field],
                    row: row,
                    column: col,
                    cancel: false
                };
            if (this.fireEvent("beforeedit", e) !== false && !e.cancel) {
                this.editing = true;
                var ed = this.colModel.getCellEditor(col, row);
                if (!ed) {
                    return;
                }
                if (!ed.rendered) {
                    ed.parentEl = this.view.getEditorParent(ed);
                    ed.on({
                        scope: this,
                        render: {
                            fn: function (c) {
                                c.field.focus(false, true);
                            },
                            single: true,
                            scope: this
                        },
                        specialkey: function (field, e) {
                            this.getSelectionModel().onEditorKey(field, e);
                        },
                        complete: this.onEditComplete,
                        canceledit: this.stopEditing.createDelegate(this, [true])
                    });
                }
                Ext.apply(ed, {
                    row: row,
                    col: col,
                    record: r
                });
                this.lastEdit = {
                    row: row,
                    col: col
                };
                this.activeEditor = ed;
                // Set the selectSameEditor flag if we are reusing the same editor again and
                // need to prevent the editor from firing onBlur on itself.
                ed.selectSameEditor = (this.activeEditor == this.lastActiveEditor);
                var v = this.preEditValue(r, field);

                ed.startEdit(this.view.getCell(row, col).firstChild, Ext.isDefined(v) ? v : '');

                /// 2nd parameter need set true, for IE bug.
                ed.field.focus(true, true);
                // Clear the selectSameEditor flag
                (function () {
                    if (ed.noNeedDeleteselectSameEditor !== true)
                        delete ed.selectSameEditor;
                }).defer(50);
            }
        }
    }
});

function GetCursorLocation(textbox) {
    var CurrentSelection, FullRange, SelectedRange, LocationIndex = -1;
    if (typeof textbox.selectionStart == "number") {
        LocationIndex = textbox.selectionStart;
    }
    else if (document.selection && textbox.createTextRange) {
        CurrentSelection = document.selection;
        if (CurrentSelection) {
            SelectedRange = CurrentSelection.createRange();
            FullRange = textbox.createTextRange();
            FullRange.setEndPoint("EndToStart", SelectedRange);
            LocationIndex = FullRange.text.length;
        }
    }
    return LocationIndex;
}


//http://www.sencha.com/forum/showthread.php?81026-Excel-style-cell-editing-in-EditorGridPanel
Ext.override(Ext.grid.CellSelectionModel, {
    handleKeyDown: function (e) {
        // Original code commented out so standard keys can be used to start editing cells.
        //        if(!e.isNavKeyPress()){
        //            return;
        //        }

        var g = this.grid, s = this.selection;

        // If the cell is not selected and it's selectable then select it.
        // When does this happen?
        if (!s) {
            //console.log('select none-selected cell.');
            e.stopEvent();
            var cell = g.walkCells(0, 0, 1, this.isSelectable, this);
            if (cell) {
                this.select(cell[0], cell[1]);
            }
            return;
        }
        var sm = this;
        var walk = function (row, col, step) {
            return g.walkCells(row, col, step, sm.isSelectable, sm);
        };
        var k = e.getKey(), r = s.cell[0], c = s.cell[1];
        var newCell;

        if (!e.isNavKeyPress() && !e.isSpecialKey()) {
            // Added BY: Aaron Prohaska, 2009.09.21.14:15
            // Allow regular keys to start editing so we can type directly into cells.

            var keyCode = k;
            /*
            The String.fromCharCode method is return the charactor in upper case so I'm converting
            it back to lower case then later checking if the shiftKey was used and converting to upper case.
            */
            var keyValue = String.fromCharCode(keyCode).toLowerCase();
            var record = g.getStore().getAt(r);
            var field = g.colModel.getDataIndex(c);

            // Shift + charector should be upper case charector.
            if (e.shiftKey) {
                //console.log('e.shiftKey');
                keyValue = keyValue.toUpperCase();
            }

            g.startEditing(r, c);
            record.data[field] = keyValue;
        } else {
            switch (k) {
                case e.TAB:
                    if (e.shiftKey) {
                        newCell = walk(r, c - 1, -1);
                    } else {
                        newCell = walk(r, c + 1, 1);
                    }
                    break;
                case e.DOWN:
                    newCell = walk(r + 1, c, 1);
                    break;
                case e.UP:
                    newCell = walk(r - 1, c, -1);
                    break;
                case e.RIGHT:
                    newCell = walk(r, c + 1, 1);
                    break;
                case e.LEFT:
                    newCell = walk(r, c - 1, -1);
                    break;
                case e.ENTER:
                    if (g.isEditor && !g.editing) {
                        g.startEditing(r, c);
                        e.stopEvent();
                        // Added BY: Aaron Prohaska, 2009.09.21.14:15
                        // Set focus back to cell after pressing ENTER key.
                        g.getView().focusCell(r, c);
                        return;
                    }
                    break;
            }
        }

        if (newCell) {
            this.select(newCell[0], newCell[1]);
            e.stopEvent();
        }
    },
    onEditorKey: function (field, e) {
        var newCell = null;
        var k = e.getKey(), newCell, g = this.grid, ed = g.activeEditor;
        if (k == e.TAB) {
            if (e.shiftKey) {
                newCell = g.walkCells(ed.row, ed.col - 1, -1, this.acceptsNav, this);
            } else {
                newCell = g.walkCells(ed.row, ed.col + 1, 1, this.acceptsNav, this);
            }
            e.stopEvent();
        } else if (k == e.ENTER) {
            ed.completeEdit();
            e.stopEvent();
        } else if (k == e.ESC) {
            e.stopEvent();
            ed.cancelEdit();
            // Set focus back to cell after pressing ESC key.
            g.getView().focusCell(ed.row, ed.col);
        } else if (k == e.DOWN) {
            // When in edit mode and down arrow is pressed navigate to the cell on the next row down.
            ed.completeEdit();
            e.stopEvent();
            newCell = g.walkCells(ed.row + 1, ed.col, 1, this.acceptsNav, this);
            ed.noNeedDeleteselectSameEditor = true;
            ed.field.focus(true,true);
        } else if (k == e.UP) {
            // When in edit mode and down arrow is pressed navigate to the cell on the next row up.
            ed.completeEdit();
            e.stopEvent();
            newCell = g.walkCells(ed.row - 1, ed.col, -1, this.acceptsNav, this);
            ed.noNeedDeleteselectSameEditor = true;
            ed.field.focus(true,true);
        }
        else if (k == e.LEFT) {
            //alert('ok');
            //            var id = ed.id;
            //            var el = document.getElementById(id);
            //            debugger;
            //            alert(GetCursorLocation(document.getElementById(ed.id)));
        }

        var me = this;
        if (newCell) {

            //            if (window._focusTimer)
            //                clearTimeout(window._focusTimer);
            //            window._focusTimer = setTimeout(function () {
            g.startEditing(newCell[0], newCell[1]);
            setTimeout(function () { ed.field.focus(true,true); }, 100);
            //            }, 50);
        }
    }
});

function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

if (!window.console)
    window.console = { log: function () { } }

function calcDaysInDateRange(date1, date2) {
    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);
    return Math.round((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

function calcBusinessDays(date1, date2) {

    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);

    var iWeekday1 = date1.getDay();                // day of week
    var iWeekday2 = date2.getDay();

    // calculate differnece in weeks (1000mS * 60sec * 60min * 24hrs * 7 days = 604800000)
    // use Math.ceil instead of Math.floor to fix Daylight saving date issue.  example 2013/03
    var dayCount = Math.round((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24))
                                + (iWeekday1 == 6 ? -1 : iWeekday1) + (iWeekday2 == 0 ? 0 : 7 - iWeekday2);

    var weekCount = dayCount / 7;

    var businessDays = weekCount * 5 - (iWeekday1 <= 5 && iWeekday1 >= 1 ? iWeekday1 - 1 : 0)
                                                    - (iWeekday2 <= 5 && iWeekday2 > 0 ? 5 - iWeekday2 : 0);

    return businessDays;

}


Ext.ns('fin.bud');


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


var globalLoadingCounter = 0;
window.isSavedSuccessfully = false;

fin.bud.loading = function () {
    globalLoadingCounter++;
    $('#itemStatusImage').removeClass('Normal').addClass('Loading');
    $('#itemModifiedImage').removeClass('Modified');
    $('#itemStatusText').html('Loading, please wait...');
}

fin.bud.saving = function () {
    globalLoadingCounter++;
    $('#itemStatusImage').removeClass('Normal').addClass('Loading');
    $('#itemModifiedImage').removeClass('Modified');
    $('#itemStatusText').html('Saving, please wait...');
}

fin.bud.saved = function () {
    globalLoadingCounter--;
    window.isSavedSuccessfully = true;

    setTimeout(function () {
        if (globalLoadingCounter <= 0) {
            fin.bud.normal(window.__fin_modified);
            globalLoadingCounter = 0;

            setTimeout(function () {
                window.isSavedSuccessfully = false;
            }, 5000);
        }
    }, 20);
}

fin.bud.isValidGrid = function (grid) {
    if (typeof grid == 'string')
        grid = Ext.getCmp(grid);
    var rows = grid.store.data.length;
    var cols = grid.colModel.config.length;

    for (var row = 0; row < rows; row++) {
        var record = grid.store.getAt(row);
        for (var col = 0; col < cols; col++) {
            var cellEditor = grid.colModel.getCellEditor(col, row);
            if (cellEditor != undefined && grid.colModel.isCellEditable(col,row)) {
                var columnName = grid.colModel.getDataIndex(col);
                var columnValue = record.data[columnName];
                cellEditor.field.setValue(columnValue);
                if (!cellEditor.field.isValid()) {
                    grid.startEditing(row, col);
                    return false;
                }
            }
        }
    }
    return true;
}

fin.bud.normal = function (isModified) {
    $('#itemStatusImage').removeClass('Loading').addClass('Normal');
    $('#itemStatusText').css('color','#032D23').html(window.isSavedSuccessfully && !isModified ? 'Data saved successfully.' : 'Normal');
    if (isModified === true) {
        $('#itemModifiedImage').addClass('Modified');
    }
    else {
        $('#itemModifiedImage').removeClass('Modified');
    }
}

fin.bud.loaded = function () {
    globalLoadingCounter--;

    setTimeout(function () {
        if (globalLoadingCounter <= 0) {
            fin.bud.normal(window.__fin_modified);
            globalLoadingCounter = 0;
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

fin.bud.dirtyCheck = function () { return !fin.bud.modified(); }



WebLight.form.FormView = WebLight.extend(WebLight.Control, {

    simulateTabKey: false,

    _fields: null,

    constructor: function (config) {

        var me = this;

        me.addEvents('bound', 'storechanged');

        /// init fields
        me._fields = new Ext.util.MixedCollection();

        var setValues = function (values) {

            if (Ext.isArray(values)) { // array of objects
                for (var i = 0, len = values.length; i < len; i++) {
                    var v = values[i];
                    var f = me.getFieldByName(v.name);
                    if (f) {
                        f.setRawValue(v.value);
                        f.suspendEvents(false);
                        f.setValue(v.value);
                        f.resumeEvents();
                    }
                }
            } else { // object hash

                me._fields.each(function (item, index, length) {
                    var value = values[item.name];

                    /// if not in data schema, ignore it
                    if (value != undefined) {

                        if (value == null)
                            value = '';
                        /// Combobox need use setRawValue, Checkbox need use setValue

                        item.setRawValue(value);
                        item.suspendEvents(false);
                        item.setValue(value);
                        item.resumeEvents();
                    }
                }, me);

            }
        };

        var storeUpdateMonitor = function (store, record, operation) {
            // 2010/12/23 fix, need include REJECT and COMMIT notify
            if (record == me.boundRecord)  // && operation == Ext.data.Record.EDIT)
                setValues(record ? record.data : {});
        };

        /// remove field containers
        var resetHtmls = function () {
            me._fields.each(function (item, index, length) {
                var fieldContainer = me.$child(item.name);
                var $innerField = fieldContainer.children();
                $innerField.insertAfter(fieldContainer);
                fieldContainer.remove();
                //                if (me.enterKeyAsTabKey)
                //                    $innerField.keyup(function (event) {
                //                        if (event.keyCode == 13) {
                //                            if (item.nextCtrl)
                //                                item.nextCtrl.focus();
                //                            event.preventDefault();
                //                        }
                //                    });
            });
        };

        var refreshFields = function () {



            if (me.boundRecord)
                setValues(me.boundRecord.data);
        };

        /// update current bound
        /// if record is null ,act as unbind feature
        var updateBound = function (record) {

            me.boundRecord = record;
            setValues(record ? record.data : {});

            if (record)
                me.fireEvent('bound', record);
        };

        var setValue = function (name, value) {
            if (me.boundRecord && name) {
                // if (me.boundRecord.get(name) != value) {
                if (Ext.isArray(value)) {
                    /// checkboxgroup
                    var newValue = [];
                    Ext.each(value, function (item) {
                        newValue.push(name);
                    });
                    value = newValue;
                }
                else if (Ext.isObject(value)) {
                    // maybe radiogroup
                    if (value.inputValue)
                        value = value.inputValue;
                }
                me.boundRecord.set(name, value);
                //  }
            }
        };

        /// bind field value to record
        var applyFieldValueToRecord = function (field) {
            setValue(field.name, field.getValue());
        };

        var attachChangeEvent = function (f) {
            f.on({
                scope: me
                    , change: function (field) {
                        if (!me.boundRecord && me.store) {
                            var value = field.getValue();

                            var record = me.store.newRecord();
                            me.store.add(record);
                            updateBound(record);
                            setValue(field.name, value);
                        }
                        else
                            applyFieldValueToRecord(field);
                        me.fireEvent('change', field.name, value);

                    }
            });
        };

        var initField = function (f) {
            // register field if name defined. 
            if (f.name) {
                me._fields.add(f.name, f);
                attachChangeEvent(f);
            }

            var label = me.$child(f.name + 'Label');
            if (label.length)
                label.html(f.fieldLabel);

            if (f.xtype == 'compositefield' || f.xtype == 'checkboxgroup') {
                /// must do it in render method
                /// because compositefield not initialize, it still config, and after it rendered, the items will convert to MixedCollection, not array
                /// cannot use Ext.each method.
                f.on('render', function () {
                    f.items.each(function (innerField) {
                        if (innerField.name/* && innerField.xtype != 'radio'*/) {
                            me._fields.add(innerField.name, innerField);
                            attachChangeEvent(innerField);
                        }
                    });
                });
            }
        };
        me.initField = initField;

        var initStore = function (store) {

            if (store.bindControl)
                store.bindControl(me);

            store.on('update', storeUpdateMonitor);

            store.on('beforesubmit', function () {

                // sometimes bind store to 2 formpanels, like View mode and Edit mode
                /// we need ingore view mode because it not changed.
                /// if not ,it will be some issue, because current.bindRecord is null
                if (!me.boundRecord)
                    return;

                /// because changed reject feature, if call form.reset method
                /// record will be removed from store
                /// if submit ,need ensure new record in store
                if (me.store.indexOf(me.boundRecord) == -1)
                    me.store.add(me.boundRecord);

                // sometimes combobox or checkbox cannot save value to record correctly.
                // below code ensure all fields applied to record.
                me._fields.each(function (item, index, length) {
                    if (item.xtype != 'displayfield')
                        applyFieldValueToRecord(item);
                }, me);
            }, this);

            if (store.getCount() > 0) {
                if (store.selectedIndex)
                    updateBound(store.getAt(store.selectedIndex()));
                else
                    updateBound(store.getAt(0));
            }

            store.on('selectedIndexChanged', function () {
                if (store.selectedIndex) {
                    if (store.selectedIndex() == -1)
                        updateBound(null);
                    else
                        updateBound(store.getAt(store.selectedIndex()));
                }
                else
                    updateBound(store.getAt(0));
            });
        };

        WebLight.form.FormView.superclass.constructor.call(this, config);

        if (me.items) {
            WebLight.each(me.items, function (item, index) {
                ctrl = item;
                if (!ctrl.events)
                    ctrl = me.createComponent(item);
                me.addChildControl(ctrl, ctrl.name);
            });
            //            delete me.items;

        }

        if (config.store) {
            initStore(config.store);
        }

        me.on('storechanged', function (newStore, oldStore) {
            initStore(newStore);
            if (oldStore && oldStore.unbindControl) {
                oldStore.unbindControl(me);
                oldStore.un('update', storeUpdateMonitor);
            }
        });

        var simulateTabKey = function () {
            if (me.simulateTabKey === true)
            // exclude textarea and button fields ':input:not(textarea):not(:button):visible'
                var inputs = $(':input:visible', me.$this).keypress(function (e) {
                    var type = $(this).attr('type');
                    if (this.tagName == 'TEXTAREA' || type == 'button' || type == 'image' || type == 'submit')
                        return;

                    if (e.which == 13) {
                        e.preventDefault();
                        var nextInput = inputs.get(inputs.index(this) + 1);
                        if (nextInput) { nextInput.focus(); nextInput.select(); }
                    }
                });
        };

        me.on('render', function () { resetHtmls(); refreshFields(); simulateTabKey(); });
    },

    _setValues: function (values) {

        if (Ext.isArray(values)) { // array of objects
            for (var i = 0, len = values.length; i < len; i++) {
                var v = values[i];
                var f = me.getFieldByName(v.name);
                if (f) {
                    f.setRawValue(v.value);
                    f.suspendEvents(false);
                    f.setValue(v.value);
                    f.resumeEvents();
                }
            }
        } else { // object hash

            me._fields.each(function (item, index, length) {
                var value = values[item.name];

                /// if not in data schema, ignore it
                if (value != undefined) {

                    if (value == null)
                        value = '';
                    /// Combobox need use setRawValue, Checkbox need use setValue

                    item.setRawValue(value);
                    item.suspendEvents(false);
                    item.setValue(value);
                    item.resumeEvents();
                }
            }, me);

        }
    },

    _initField: function (f) {
        // register field if name defined. 
        if (f.name) {
            me._fields.add(f.name, f);
            attachChangeEvent(f);
        }

        var label = me.$child(f.name + 'Label');
        if (label.length)
            label.html(f.fieldLabel);

        if (f.xtype == 'compositefield' || f.xtype == 'checkboxgroup') {
            /// must do it in render method
            /// because compositefield not initialize, it still config, and after it rendered, the items will convert to MixedCollection, not array
            /// cannot use Ext.each method.
            f.on('render', function () {
                f.items.each(function (innerField) {
                    if (innerField.name/* && innerField.xtype != 'radio'*/) {
                        me._fields.add(innerField.name, innerField);
                        attachChangeEvent(innerField);
                    }
                });
            });
        }
    },

    _attachChangeEvent: function (f) {
        f.on({
            scope: me
                    , change: function (field) {
                        if (!me.boundRecord && me.store) {
                            var value = field.getValue();

                            var record = me.store.newRecord();
                            me.store.add(record);
                            updateBound(record);
                            setValue(field.name, value);
                        }
                        else
                            applyFieldValueToRecord(field);
                    }
        });
    },

    loadTemplate: function (html, container) {
        var me = this;
        if (me.$this != container) {
            WebLight.form.FormView.superclass.loadTemplate.call(me, html, container);
            return;
        }

        var regex = new RegExp('\{.*?\}', 'gi');
        var match;

        var formattedHtml = html;
        var cmps = [];
        this.cmpIndex = 0;
        while (match = regex.exec(formattedHtml)) {
            var config = Ext.decode(match[0]);
            if (!config.name)
                config.name = String.format('{0}', this.cmpIndex++);

            var replaceHtml = String.format('<span id="{0}"></span>', config.name);
            formattedHtml = formattedHtml.replace(match[0], replaceHtml);
            cmps.push(config);
        }

        WebLight.form.FormView.superclass.loadTemplate.call(this, formattedHtml, container);

        Ext.each(cmps, function (item, index) {
            me.addChildControl(Ext.create(item), item.name);

            me.$child(item.name).replaceWith(me.$child(item.name).html());
        });
    },

    // private
    applyDefaults: function (c) {
        var d = this.defaults;
        if (d) {
            if (Ext.isFunction(d)) {
                d = d.call(this, c);
            }
            if (Ext.isString(c)) {
                c = Ext.ComponentMgr.get(c);
                Ext.apply(c, d);
            } else if (!c.events) {
                Ext.applyIf(c, d);
            } else {
                Ext.apply(c, d);
            }
        }
        return c;
    },

    // private
    createComponent: function (config, defaultType) {
        if (config.render) {
            return config;
        }
        var c = Ext.create(config, defaultType || this.defaultType);
        return c;
    },

    _lastField: null,
    addChildControl: function (control, containerId) {
        var me = this;
        WebLight.form.FormView.superclass.addChildControl.call(this, control, containerId);

        if (me.isField(control)) {
            me.initField(control);
            //            if (me.enterKeyAsTabKey) {
            //                if (me._lastField) {
            //                    me._lastField.nextCtrl = control;
            //                }

            //                me._lastField = control;
            //            }
        }
        return me;
    },

    getBoundRecord: function () {
        return this.boundRecord;
    },

    addField: function (field) {
        if (this.isField(field))
            this.addChildControl(field, field.name);
    },

    isValid: function () {
        var valid = true;
        this._fields.each(function (f) {
            if (!f.validate()) {
                valid = false;
            }
        });
        return valid;
    },

    findField: function (name) {
        if (this._fields && this._fields.containsKey(name))
            return this._fields.get(name);
        return null;
    },

    bindStore: function (store) {
        if (store != this.store) {
            var oldStore = this.store;
            this.store = store;
            this.fireEvent('storechanged', store, oldStore);
        }
        return this;
    },

    ///obsolete, use findField
    getFieldByName: function (name) {
        return this.findField(name);
    },

    // Determine if a Component is usable as a form Field.
    isField: function (c) {
        return !!c.name && !!c.setValue && !!c.getValue && !!c.markInvalid && !!c.clearInvalid;
    }

});


WebLight.override(WebLight.form.FormPanel, {
    autoStoreMask: false
});

WebLight.override(WebLight.grid.GridPanel, {
    autoStoreMask: false
});

WebLight.override(WebLight.form.FormView, {
    autoStoreMask: false
});

/// <reference path="../../references/jquery-1.4.1.js" />
/// <reference path="../Core.js" />

WebLight.data.Store = Ext.extend(Ext.data.Store, {

    trackingChanges: false,

    /// Your changes have not been saved. \r\n\r\n Discard the changes?
    discardMessage: 'Your changes have not been saved. \r\n\r\n Discard the changes?',

    constructor: function (config) {
        config = config || {};
        var me = this;
        var current = this;

        WebLight.data.Store.superclass.constructor.call(this, config);

        this.changes = [];

        this.boundControls = [];

        var computeFields = function (record) {
            if (null == me._computedFields)
                return;

            WebLight.each(me._computedFields, function (item, index) {
                var value = 0;
                switch (item[1]) {
                    case 'func':
                        value = item[2](record);
                        break;
                    case 'sum':
                        var value = 0;
                        WebLight.each(item[2], function (field, fieldIndex) {
                            value += record.get(field) || 0;
                        });
                        break;
                };

                if (record.get(item[0] != value))
                    record.set(item[0], value);
            });
        };

        var calculateColumns = function (record) {
            if (me._columnSummaryRelations == null)
                return;

            WebLight.each(me._columnSummaryRelations, function (relation, index) {
                var value = 0;

                WebLight.each(relation[1], function (column, columnIndex) {
                    var rValue = record.get(column);
                    if (rValue)
                        value += rValue;
                });

                if (record.get(relation[0]) != value)
                    record.set(relation[0], value);
            });
        };

        var calculateRows = function (record) {
            if (null == me._rowSummaryRelations)
                return;

            WebLight.each(me._rowSummaryRelations, function (relation, index) {
                if (!record || relation[2].indexOf(record) != -1) {
                    WebLight.each(relation[1], function (column) {
                        var value = 0;
                        WebLight.each(relation[2], function (r) {
                            var rValue = r.get(column);
                            if (rValue)
                                value += rValue;
                        });

                        if (relation[0].get(column) != value)
                            relation[0].set(column, value);

                    });
                }
            });
        };


        this.on('add', function (store, records, index) {
            Ext.each(records, function (record) {
                if (store.changes.indexOf(record) == -1) {
                    //TODO:
                    //                    record.set('_sysStatus', 1);
                    //                    record.set('_sysName', this.otype);
                    store.changes.push(record);
                    computeFields(record);
                    calculateColumns(record);
                    calculateRows(record);
                }
            }, this);
        });

        this.on('remove', function (store, record, index) {
            var sysStatus = record.get('_sysStatus');
            if (sysStatus == 1)
            //if remove new record, just take it out from changes array
                store.changes.remove(record);
            else if (store.changes.indexOf(record) < 0) {
                // push record in changes
                store.changes.push(record);
            }
            record.set('_sysStatus', 3);
        });

        this.on('update', function (store, record, action) {
            if (action == Ext.data.Record.REJECT || action == Ext.data.Record.COMMIT) {
                if (store.changes.indexOf(record) >= 0)
                    store.changes.remove(record);
                /// remove rejected new record
                if (action == Ext.data.Record.REJECT && record.get('_sysStatus') == 1)
                    this.remove(record);
            }
            else if (action == Ext.data.Record.EDIT) {
                if (store.changes.indexOf(record) == -1) {
                    store.changes.push(record);
                    if (record.get('_sysStatus') != 1)
                        record.set('_sysStatus', 2);
                }
                computeFields(record);
                calculateColumns(record);
                calculateRows(record);
            }
        });

        var maskControls = function (message) {
            WebLight.each(current.boundControls, function (item, index, array) {
                if (item.getEl) {
                    var el = item.getEl();

                    if (item.autoStoreMask === false)
                        return;

                    if (el && el.mask && el.isMasked && !el.isMasked())
                        el.mask(message, 'x-mask-loading');
                }
            }, current);
        };

        var unmaskControls = function () {
            WebLight.each(current.boundControls, function (item, index, array) {
                if (item.getEl) {
                    var el = item.getEl();
                    ///ATTENTION, cannot check el.isMasked(), 
                    /// because if element is hidden or parent is hidden, it always return false even if masked
                    if (el && el.unmask)    // && el.isMasked && el.isMasked())
                        el.unmask();
                }
            }, current);
        };

        this.on('beforeload', function () {

            maskControls(Ext.LoadMask.prototype.msg);
        }, this);
        this.on('load', function () {
            /// ensure selectedIndex less than page count;
            current.selectedIndex(current.selectedIndex());
            /// let method executed after other event listener
            unmaskControls();
        });

        this.on('beforesubmit', function () {
            maskControls('Saving');
        });
        this.on('submit', function () {
            unmaskControls();
        });

        //        me.on('datachanged', function () {
        //            me.changes = [];
        //        });

        me.on('datachanged', function () {
            me._columnSummaryRelations = null;
            me.clearComputedFieldSettings();
            me._rowSummaryRelations = null;
            me.changes = [];

            setTimeout(function () {
                me.each(function (record) {
                    computeFields(record);
                    calculateColumns(record);
                });
                calculateRows();
            }, 100);
        });

    },
    bindControl: function (control) {
        if (this.boundControls.indexOf(control) < 0)
            this.boundControls.push(control);
    },
    unbindControl: function (control) {
        if (this.boundControls.indexOf(control) >= 0)
            this.boundControls.remove(control);
    },

    getChangedRecords: function () {
        return this.changes || [];
    },


    rejectChanges: function () {
        WebLight.data.Store.superclass.rejectChanges.call(this);
        this.changes = [];
    },
    /// load data
    load: function (options) {
        if (!this.trackingChanges || this.changes.length == 0)
        { return WebLight.data.Store.superclass.load.call(this, options); }
        else
            Ext.MessageBox.confirm('Confirm', discardMessage, function (btn) {
                if (btn == 'yes')
                    return WebLight.data.Store.superclass.load.call(this, options);
            }, this);
        return false;
    },

    // create new record 
    newRecord: function (defaultData) {
        var me = this;
        if (!WebLight.isDefined(this.recordType)) {
            alert('record Type not defined');
            return null;
        }

        var id = null;
        if (me.idProperty && defaultData && defaultData[me.idProperty])
            id = defaultData[me.idProperty];
        return new this.recordType(Ext.apply(defaultData || {}, { _sysStatus: 1 }), id);
    },

    isNewRecord: function (record) {
        return record.get('_sysStatus') == 1;
    },

    selectedIndex: function () {
        if (!this._selectedIndex)
            this._selectedIndex = 0;

        if (!arguments || arguments.length == 0)
            return this._selectedIndex;

        var index = arguments[0];
        if (index < 0)
            index = 0;

        if (this._selectedIndex != index || this._selectedIndex >= this.getCount()) {
            if (this.getCount() == 0)
                this._selectedIndex = -1;
            else
                this._selectedIndex = index;

            if (this._selectedIndex >= this.getCount())
                this._selectedIndex = 0;
        }
        /// CANNOT put fireEvent in above scope, because if store reload,and index in count range, the event not fired
        /// but it need be fired, because need update formpanel selected record
        this.fireEvent('selectedIndexChanged', this, this._selectedIndex);
        return this;
    },

    _rowSummaryRelations: null,

    addRowRelations: function (type, source, target, columns) {
        var me = this;
        if (type == 'sum') {
            if (me._rowSummaryRelations == null)
                me._rowSummaryRelations = [];

            var sources = source;
            if (!WebLight.isArray(source))
                sources = [source];

            var targetExisted = false;
            WebLight.each(me._rowSummaryRelations, function (item, index) {
                if (item[0] == target) {
                    item[2] = item[2].concat(sources).unique();
                    targetExisted = true;
                    return true;
                }
            });

            if (!targetExisted)
                me._rowSummaryRelations.push([target, columns, sources]);

        }
        return me;
    },



    _computedFields: null,
    clearComputedFieldSettings: function () {
        var me = this;
        me._computedFields = null;
    },
    setComputedField: function (field, computeType, expression) {
        var me = this;
        if (me._computedFields == null)
            me._computedFields = [];

        WebLight.each(me._computedFields, function (item, index) {
            if (item[0] == field) {
                me._computedFields.remove(item);
                return true;
            }
        });

        me._computedFields.push([field, computeType, expression]);
    },

    _columnSummaryRelations: null,
    addColumnRelations: function (type, source, target) {
        var me = this;
        if (type == 'sum') {

            if (me._columnSummaryRelations == null)
                me._columnSummaryRelations = [];

            var sources = source;
            if (!WebLight.isArray(source))
                sources = [source];

            me._columnSummaryRelations.push([target, sources]);
        }
    }
});



WebLight.data.Store.create = function (cacheId, creator) {
    // shift arguments if data argument was omited
    if (jQuery.isFunction(cacheId)) {
        creator = cacheId;
        cacheId = null;
    }

    if (!WebLight.data.Store.__cachedStores)
        WebLight.data.Store.__cachedStores = new Ext.util.MixedCollection();

    var store;
    if (cacheId) {
        store = WebLight.data.Store.__cachedStores.get(cacheId);
        if (store)
            return store;
    }

    store = creator();

    if (cacheId)
        WebLight.data.Store.__cachedStores.add(cacheId, store);

    return store;
};




WebLight.Router.mapRoute('^budget/startbudget$', {
    xtype: 'startbudget'
});
WebLight.Router.mapRoute('^budget/contractbilling$', {
    xtype: 'contractbilling'
});
WebLight.Router.mapRoute('^budget/staffing$', {
    xtype: 'staffing'
});
WebLight.Router.mapRoute('^budget/employee$', {
    xtype: 'employee'
});
WebLight.Router.mapRoute('^budget/mgthist$', {
    xtype: 'managementhistory'
});
WebLight.Router.mapRoute('^budget/laborcalculate$', {
    xtype: 'laborcalculations'//, pfcOnly: false
});
WebLight.Router.mapRoute('^budget/fnllaborcalc$', {
    xtype: 'finallaborcalculations'
});
WebLight.Router.mapRoute('^budget/supplyexp$', {
    xtype: 'supplyexpenditures'
});
WebLight.Router.mapRoute('^budget/capitalexp$', {
    xtype: 'capitalexpenditures'
});
WebLight.Router.mapRoute('^budget/bgtadj$', {
    xtype: 'budgetadjustments'
});
WebLight.Router.mapRoute('^budget/bgtdetails$', {
    xtype: 'budgetdetails'
});
WebLight.Router.mapRoute('^budget/bgtsummary$', {
    xtype: 'budgetsummary'
});
WebLight.Router.mapRoute('^budget/bgtapproval$', {
    xtype: 'budgetapproval'
});

/******************* Annual Projections ******************/

WebLight.Router.mapRoute('^projection/annualprojectionsbyperiod$', {
    xtype: 'annualprojectionsbyperiod',cacheable:true
});
WebLight.Router.mapRoute('^projection/worforecast$', {
    xtype: 'worforecast', cacheable: true
});

/******************* Budget Summary ******************/

WebLight.Router.mapRoute('^budSummary/summary$', {
    xtype: 'budgetsummary'
});

/******************* Transaction Summary ******************/

WebLight.Router.mapRoute('^ledger/transactionsummary$', {
    xtype: 'transactionsummary'
});

/******************* Epay Schedule ******************/

WebLight.Router.mapRoute('^epaySchedule/uploadsites$', {
    xtype: 'epaySchedule_uploadsites'
});
WebLight.Router.mapRoute('^epaySchedule/epaytaskcallhistory$', {
    xtype: 'epaytaskcallhistory'
});

WebLight.Router.mapRoute('^epaySchedule/uploademployees$', {
    xtype: 'epaySchedule_uploademployees'
});

WebLight.Router.mapRoute('^epaySchedule/downloadhours$', {
    xtype: 'epaySchedule_downloadhours'
});

/// <reference path="Core.js" />

Bud.NavbarItem = Ext.extend(Ext.Button, {
    url: null,
    initComponent: function () {

        Bud.NavbarItem.superclass.initComponent.call(this);

        if (!this.handler && this.url) {
            this.setHandler(function () {
                if (!fin.bud.modified())
                    WebLight.Router.route(this.url);
            }, this);
        }

    }
});

/// <reference path="Core.js" />

Bud.BudgetSummaryNavBar = Ext.extend(Ext.Toolbar, {
    initComponent: function () {
        var menuItems = [];

        menuItems.push(new Bud.NavbarItem({
            text: 'Budget Summary',
            pattern: 'budSummary/summary',
            url: '/budSummary/summary'
        }));

        this.items = menuItems;
        this.menuItems = menuItems;

        Bud.BudgetSummaryNavBar.superclass.initComponent.call(this);

        var toggleActiveButton = function (url) {
            Ext.each(menuItems, function (item) {
                if (item.pattern) {
                    var regex = new RegExp(item.pattern, 'gi');
                    regex.test(url) ? item.addClass('x-btn-active') : item.removeClass('x-btn-active');
                }
            });
        };

        WebLight.PageMgr.on('load', function (url, page) {
            toggleActiveButton(url);
        });

        WebLight.PageMgr.on('resume', function (url, page) {
            toggleActiveButton(url);
        });
    }
});


WebLight.namespace('Bud.data');


Bud.data.XmlReader = WebLight.extend(Ext.data.XmlReader, {

    dataLoaded: false,

    read: function (response) {
        var me = this;
        me.dataLoaded = true;
        var text = response.responseText;
        if (text.indexOf('transmission Error') > 0)
            me.dataLoaded = false;

        var doc = response.responseXML;
        if (!doc) {
            throw { message: "XmlReader.read: XML Document not available" };
        }
        return this.readRecords(doc);
    }
});


Bud.data.XmlStore = WebLight.extend(WebLight.data.Store, {

    /// default api url
    url: '/net/crothall/chimes/fin/bud/act/Provider.aspx',

    recordName: 'item',

    isAnnualizedStore: true,

    /// constructor
    constructor: function (config) {
        var me = this;
        config = config || {};
        var fields = config.fields || this.fields;
        var reader = config.reader || this.reader;
        var idProperty = config.idProperty || this.idProperty;
        if (!idProperty)
            idProperty = '@id';

        if (!reader && fields && fields.length) {
            reader = new Bud.data.XmlReader({ record: me.recordName, idProperty: idProperty }, fields);
            config.reader = reader;
            this.reader = reader;
        }

        Bud.data.XmlStore.superclass.constructor.call(this, config);

        this.on('beforeload', function () { fin.bud.loading(); });
        this.on('beforesubmit', function () { fin.bud.saving(); });
        this.on('submit', function () { fin.bud.saved(); });
        this.on('load', function () { fin.bud.loaded(); });

    },

    isDataLoaded: function () {
        return this.reader.dataLoaded;
    },

    requestId: 2,
    moduleId: 'bud',
    targetId: 'iiCache',
    storeId: '',

    getRequestId: function () {
        var me = this;
        switch (me.storeId) {
            case 'hcmHouseCodes':
                return 3;
            case 'houseCodes':
                return 4;
            case 'budAnnualBudgets':
                return 5;
            case 'budAnnualInformations':
                return 6;
            case 'houseCodeJobs':
                return 7;
            case 'fiscalYears':
                return 8;
        }
        return 2;
    },

    getStoreId: function () { return this.storeId; },

    getCriteria: function () {
        return {};
    },

    /// generate request xml content
    getRequestXml: function () {
        var arr = ['<criteria>'];
        var criteria = this.getCriteria();

        var userId = '[user]';
        var host = document.location.host;
        if (host == 'localhost' || host.substr(0, 10) == 'persistech')
            userId = 'RAYMOND-DEV-XP\\Raymond Liu';

        criteria = Ext.apply(criteria || {}, { storeId: this.getStoreId(), userId: userId });

        for (i in criteria) {
            arr.push(String.format('{0}:{1},', i, criteria[i]));
        }

        arr.push('</criteria>');

        return arr.join('');
    },

    load: function (options) {

        this.setBaseParam('requestId', this.getRequestId());
        this.setBaseParam('moduleId', this.moduleId);
        this.setBaseParam('targetId', this.targetId);
        this.setBaseParam('requestXml', this.getRequestXml());

        Bud.data.XmlStore.superclass.load.call(this, {});
    },

    reload: function (options) {
        // do not call subclass load event
        this.setBaseParam('requestId', this.getRequestId());
        this.setBaseParam('moduleId', this.moduleId);
        this.setBaseParam('targetId', this.targetId);
        this.setBaseParam('requestXml', this.getRequestXml());

        Bud.data.XmlStore.superclass.load.call(this, {});
    },

    loadData: function (xml) {
        var doc;
        if (window.ActiveXObject) {
            doc = new ActiveXObject("Microsoft.XMLDOM");
            doc.async = "false";
            doc.loadXML(xml);
        } else {
            doc = new DOMParser().parseFromString(xml, "text/xml");
        }

        Bud.data.XmlStore.superclass.loadData.call(this, doc);
    },

    addAttributes: function (data) { },

    _ignoredRecords: null,
    ignoreRecords: function (records) {
        var me = this;
        if (null == me._ignoredRecords)
            me._ignoredRecords = [];
        if (WebLight.isArray(records))
            me._ignoredRecords.concat(records);
        else
            me._ignoredRecords.push(records);

    },

    getChangedRecords: function () {
        var me = this;
        var records = Bud.data.XmlStore.superclass.getChangedRecords.call(this);

        if (null == me._ignoredRecords)
            return records;

        var changedRecords = [];
        WebLight.each(records, function (r) {
            if (me._ignoredRecords.indexOf(r) == -1)
                changedRecords.push(r);
        });
        return changedRecords;
    },

    adjSubmitValue: function(column, value){
        return value;
    },

    /// submit changes to server
    submitChanges: function (callback) {
        var current = this;
        this.fireEvent('beforesubmit', this);

        var xml = ['<transaction id="1">'];
        var hcmHouseCode = 0;
        var hcmJob = 0;
        var fscYear = 0;

        var htmlEncode = function (str) {
            return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        }


        Ext.each(this.getChangedRecords(), function (item, index) {

            xml.push('<');
            xml.push(current.getStoreId().replace(/s$/, ''));
            current.addAttributes(item.data);
            for (key in item.data) {
                var value = current.adjSubmitValue(key, item.data[key], item.data);
                if (Ext.isDate(value))
                    value = Ext.util.Format.date(value, 'm/d/Y');
                else if (Ext.isString(value))
                    value = htmlEncode(value);
                xml.push(String.format(' {0}="{1}"', key, value));

                if (key == 'hcmHouseCode')
                    hcmHouseCode = parseFloat(value);
                else if (key == 'hcmJob')
                    hcmJob = parseFloat(value);
                else if (key == 'fscYear') {
                    fscYear = parseFloat(value);

                }
            }
            xml.push('/>');
        }, this);

        xml.push('</transaction>');

        var postData = String.format('moduleId={0}&requestId={1}&requestXml={2}&&targetId=iiTransaction',
            this.moduleId, this.requestId, encodeURIComponent(xml.join('').replace(/\&/gi, '&amp;')));

        jQuery.post(this.url, postData, function (data, status) {
            var innerCallback = function () {
                if (callback)
                    callback(data, status);
                current.fireEvent('submit');
                current.changes = [];
            };

            if (current.isAnnualizedStore)
                current.updateBudDetails(hcmHouseCode, hcmJob, fscYear, innerCallback);
            else
                innerCallback();
        });
    },

    updateBudDetails: function (hcmHouseCode, hcmJob, fscYear, callback) {

        var xml = '<transaction id="1"><budDetailUpdate hcmHouseCode="' + hcmHouseCode + '" hcmJob="' + hcmJob + '" fscYear="' + fscYear + '"/></transaction>';
        var postData = String.format('moduleId={0}&requestId={1}&requestXml={2}&&targetId=iiTransaction',
            this.moduleId, this.requestId, encodeURIComponent(xml));

        jQuery.post(this.url, postData, function (data, status) {
            if (callback)
                callback(data, status);
            callback();
        });
    }

});

Bud.data.XmlStore._requestId = 2;



Bud.data.AuthorizationStore = WebLight.extend(Bud.data.XmlStore, {

    url: '/net/crothall/chimes/fin/bud/act/Provider.aspx',

    moduleId: 'bud',

    targetId: 'iiAuthorization',

    recordName: 'authorize',

    fields: [
               { name: 'id', mapping: '@id' },
               { name: 'path', mapping: '@path' }
           ],

    getRequestXml: function () {
        return '<authorization id="1"><authorize path="\\crothall\\chimes\\fin\\Budgeting"/></authorization>';
    },

    loadSampleData: function () {
        this.loadData(_builtInTemplate_a7063646[0]);
    },

    allowBudgetRead: function () {
        // return this.idAuthorized(16059);
        return this.authorized('\\crothall\\chimes\\fin\\Budgeting\\AnnualizedBudget\\Read');
    },

    allowBudgetWrite: function () {
        // return this.idAuthorized(16060);
        return this.authorized('\\crothall\\chimes\\fin\\Budgeting\\AnnualizedBudget\\Write');
    },

    allowWORRead: function () {
        return this.authorized('\\crothall\\chimes\\fin\\Budgeting\\AnnualProjections\\WORForecast\\Read');
    },

    allowWORWrite: function () {
        return this.authorized('\\crothall\\chimes\\fin\\Budgeting\\AnnualProjections\\WORForecast\\Write');
    },

    allowAnnualProjectionRead: function () {
        return this.authorized('\\crothall\\chimes\\fin\\Budgeting\\AnnualProjections\\ByPeriod\\Read');
    },

    allowAnnualProjectionWrite: function () {
        return this.authorized('\\crothall\\chimes\\fin\\Budgeting\\AnnualProjections\\ByPeriod\\Write');
    },

    allowBudgetSummaryRead: function () {
        return this.authorized('\\crothall\\chimes\\fin\\Budgeting\\BudgetSummary\\Read');
    },

    allowBudgetSummaryWrite: function () {
        return this.authorized('\\crothall\\chimes\\fin\\Budgeting\\BudgetSummary\\Write');
    },

    allowApproveBudget: function () {
        return this.authorized('\\crothall\\chimes\\fin\\Budgeting\\AnnualizedBudget\\ApproveBudget\\Approve');
    },

    allowRejectBudget: function () {
        return this.authorized('\\crothall\\chimes\\fin\\Budgeting\\AnnualizedBudget\\ApproveBudget\\Reject');
    },

    authorized: function (path) {

        if (Bud.Context.isTest)
            return true;

        return this.queryBy(function (record) {
            return record.get('path') == path;
        }).getCount() > 0;
    },

    idAuthorized: function (id) {

        return this.queryBy(function (record) {
            return record.get('id') == id;
        }).getCount() > 0;
    }

});

WebLight.namespace('Bud.data');

Bud.data.FiscalYearStore = WebLight.extend(Bud.data.XmlStore, {

    url: '/net/crothall/chimes/fin/app/act/Provider.aspx',

    moduleId: 'fsc',
    storeId: 'fiscalYears',

    fields: [
               { name: 'id', mapping: '@id' },
               { name: 'title', mapping: '@title' }
           ],

    minFscYear: 1,

    constructor: function (config) {
        Bud.data.FiscalYearStore.superclass.constructor.call(this, config);
        var me = this;
        this.on('load', function () {
            this.each(function (record) {
                if (record.get('id') < me.minFscYear)
                    me.remove(record);
            });
        });
    }
});


Bud.data.FiscalPeriodStore = WebLight.extend(Bud.data.XmlStore, {

    url: '/net/crothall/chimes/fin/app/act/Provider.aspx',

    moduleId: 'fsc',

    fiscalYearId: 0,
    storeId: 'fiscalPeriods',

    constructor: function (config) {
        Bud.data.FiscalPeriodStore.superclass.constructor.call(this, config);

        this.on({

            add: { fn: this.updateTotals },

            remove: { fn: this.updateTotals },

            update: { fn: this.updateTotals },

            datachanged: { fn: this.updateTotals }

        });

        this.on('load', function () {
            Bud.Context.ytdBusinessDays = this.getTotalBusinessDays();

            if (Bud.Context.primaryNav && Bud.Context.primaryNav.currentBudgetLaborCalcMethod == 1)
                Bud.Context.ytdBusinessDays4Final = 364;     //this.getTotalDays();
            else
                Bud.Context.ytdBusinessDays4Final = this.getTotalBusinessDays();

            console.log(Bud.Context.ytdBusinessDays, Bud.Context.ytdBusinessDays4Final);
        });
    },

    updateTotals: function () {
        this.suspendEvents(false);
        for (var i = 0; i < this.getCount(); i++) {
            var r = this.getAt(i);
            var startDate = Ext.util.Format.date(r.get('startDate'), 'm/d/Y');
            var endDate = Ext.util.Format.date(r.get('endDate'), 'm/d/Y');
            r.set('friendlyTitle', String.format('{0}: {1} - {2}', r.get('title'), startDate, endDate));
        }
        this.resumeEvents();
    },

    getCriteria: function () {
        return { fiscalYearId: this.fiscalYearId };
    },

    fields: [
               { name: 'id', mapping: '@id' },
               { name: 'fiscalYearId', mapping: '@year' },
               { name: 'title', mapping: '@title' },
               { name: 'fiscalYear', mapping: '@fscYeaTitle' },
               { name: 'startDate', mapping: '@startDate', type: 'date', dateFormat: 'n/j/Y' },
               { name: 'endDate', mapping: '@endDate', type: 'date', dateFormat: 'n/j/Y' },
               { name: 'friendlyTitle' }
           ],

    load: function (fiscalYearId) {
        this.fiscalYearId = fiscalYearId;
        Bud.data.FiscalPeriodStore.superclass.load.call(this);
    },

    getByTitle: function (title) {
        var me = this;

        var recordIndex = me.findBy(function (record, id) {
            return record.get('title') == title;
        });

        return me.getAt(recordIndex);
    },

    getBusinessDaysByTitle: function (title) {
        var me = this;
        var record = me.getByTitle(title);

        return calcBusinessDays(record.get('startDate'), record.get('endDate'));

    },

    getDaysByTitle: function (title) {
        var me = this;
        var record = me.getByTitle(title);

        return calcDaysInDateRange(record.get('startDate'), record.get('endDate'));

    },

    getTotalDays: function () {
        var me = this;
        if (me.getCount() == 0)
            return 0;
        var period1 = me.getByTitle(1);
        var period12 = me.getByTitle(12);
        return calcDaysInDateRange(period1.get('startDate'), period12.get('endDate'));

    },

    getTotalBusinessDays: function () {
        var me = this;
        var period1 = me.getByTitle(1);
        var period12 = me.getByTitle(12);
        return calcBusinessDays(period1.get('startDate'), period12.get('endDate'));

    }


});


WebLight.namespace('Bud.data');

Bud.data.HouseCodeReader = WebLight.extend(Ext.data.XmlReader, {

    read: function (response) {
       top.bud_housecodexml = response.responseText;
       var doc = response.responseXML;
       if (!doc) {
           throw { message: "XmlReader.read: XML Document not available" };
       }
       return this.readRecords(doc);
    }
});

Bud.data.HouseCodeStore = WebLight.extend(Bud.data.XmlStore, {

    url: '/net/crothall/chimes/fin/hcm/act/provider.aspx',

    moduleId: 'hcm',

    storeId: 'hcmHouseCodes',

    getCriteria: function () {
        var me = this;

        return { appUnitBrief: me.baseParams['query'] || '' };
    },

    fields: [
               { name: 'id', mapping: '@id' },
               { name: 'name', mapping: '@name' },
               { name: 'number', mapping: '@number' },
               { name: 'brief', mapping: '@brief' },
               { name: 'appUnit', mapping: '@appUnit' },
               { name: 'hirNode', mapping: '@hirNode' }
           ]

    ,constructor: function (config) {
        config = config || {};
        var reader = new Bud.data.HouseCodeReader({ record: 'item', idProperty: '@id' }, this.fields);
        config.reader = reader;
        Bud.data.HouseCodeStore.superclass.constructor.call(this, config);

    }

   , load: function (options) {
        if (top.bud_housecodexml)
            this.loadData(top.bud_housecodexml);
        else {
            this.setBaseParam('requestId', this.getRequestId());
            this.setBaseParam('moduleId', this.moduleId);
            this.setBaseParam('targetId', this.targetId);
            this.setBaseParam('requestXml', this.getRequestXml());

            Bud.data.XmlStore.superclass.load.call(this, {});
        }
    }
});



WebLight.namespace('Bud.data');

Bud.data.JobCodeStore = WebLight.extend(Bud.data.XmlStore, {

    url: '/net/crothall/chimes/fin/hcm/act/Provider.aspx',

    moduleId: 'hcm',

    idProperty: '@jobId',

    fields: [
               { name: 'id', mapping: '@id' },
               { name: 'jobTitle', mapping: '@jobTitle' },
               { name: 'jobDescription', mapping: '@jobDescription' },
               { name: 'jobNumber', mapping: '@jobNumber' },
               { name: 'houseCodeId', mapping: '@houseCodeId' },
               { name: 'jobId', mapping: '@jobId' }
           ],
    storeId: 'houseCodeJobs',

    getCriteria: function () {
        return { houseCodeId: this.houseCodeId, jobType: 0 };
    },

    loadLocalData: function (houseCode) {
        this.houseCodeId = houseCode;

        this.loadData(_builtInTemplate_a7063646[1]);
    },


    load: function (houseCode) {
        this.houseCodeId = houseCode;
        Bud.data.JobCodeStore.superclass.load.call(this);
    }
});


/// <reference path="../Core.js" />

WebLight.namespace('Bud.data');

Bud.data.BudgetAccountStore = WebLight.extend(Bud.data.XmlStore, {

    url: '/net/crothall/chimes/fin/bud/act/Provider.aspx',

    moduleId: 'bud',

    storeId: 'budFscAccounts',

    wor: '',

    fields: [
        { name: 'id', mapping: '@id', type: 'float' },
        { name: 'accountCategoryId', mapping: '@accountCategoryId', type: 'float' },
        { name: 'accountCategory', mapping: '@accountCategory' },
        { name: 'code', mapping: '@code' },
        { name: 'glHeader', mapping: '@glHeader' },
        { name: 'isNegative', mapping: '@isNegative', type: 'bool' },
        { name: 'name', mapping: '@name' },
        { name: 'categoryDisplayOrder', mapping: '@categoryDisplayOrder', type: 'float' },
        { name: 'displayOrder', mapping: '@displayOrder', type: 'float' },
        { name: 'friendlyName' }
    ],

    constructor: function (config) {

        Bud.data.BudgetAccountStore.superclass.constructor.call(this, config);

        this.on({

            add: { fn: this.updateTotals },

            remove: { fn: this.updateTotals },

            update: { fn: this.updateTotals },

            datachanged: { fn: this.updateTotals }

        });

    },

    load: function (wor) {
        /// 20110816  add a checking on annual projection and wor page to list only fscaccounts.fscaccwor = 1
        if (wor)
            this.wor = wor;

        Bud.data.BudgetAccountStore.superclass.load.call(this);

    },

    getCriteria: function () {
        return { budget: 1, wor: this.wor };
    },

    updateTotals: function () {
        this.suspendEvents(false);

        this.each(function (record) {
            var code = record.get('code');
            var name = record.get('name');
            record.set('friendlyName', String.format('{0} - {1}', code, name));
        });

        this.resumeEvents();
    }
});


/// <reference path="../Core.js" />

WebLight.namespace('Bud.data');

Bud.data.BudDetailsStore = WebLight.extend(Bud.data.XmlStore, {

    url: '/net/crothall/chimes/fin/bud/act/Provider.aspx',

    moduleId: 'bud',

    storeId: 'budDetails',

    _hcmHouseCode: 0,
    _fscYear: 0,
    _hcmJob: 0,
    includeReadOnly: false,

    _accountStore: null,
    isInitialed: false,

    fields: [
        { name: 'id', mapping: '@id', type: 'float' },
        { name: 'hcmHouseCode', mapping: '@hcmHouseCode', type: 'float' },
        { name: 'hcmJob', mapping: '@hcmJob', type: 'float' },
        { name: 'fscYear', mapping: '@fscYear', type: 'float' },
        { name: 'fscAccount', mapping: '@fscAccount', type: 'float' },
        { name: 'amount', mapping: '@amount', type: 'float' },
        { name: 'entAt', mapping: '@entAt', type: 'date' },
        { name: 'entBy', mapping: '@entBy', type: 'string' },
        { name: 'isReadOnly', mapping: '@isReadOnly', type: 'bool' },
        { name: 'period0', mapping: '@period0', type: 'float' },       // auto spread column
        {name: 'period1', mapping: '@period1', type: 'float' },
        { name: 'period2', mapping: '@period2', type: 'float' },
        { name: 'period3', mapping: '@period3', type: 'float' },
        { name: 'period4', mapping: '@period4', type: 'float' },
        { name: 'period5', mapping: '@period5', type: 'float' },
        { name: 'period6', mapping: '@period6', type: 'float' },
        { name: 'period7', mapping: '@period7', type: 'float' },
        { name: 'period8', mapping: '@period8', type: 'float' },
        { name: 'period9', mapping: '@period9', type: 'float' },
        { name: 'period10', mapping: '@period10', type: 'float' },
        { name: 'period11', mapping: '@period11', type: 'float' },
        { name: 'period12', mapping: '@period12', type: 'float' },
        { name: 'period13', mapping: '@period13', type: 'float' },
        { name: 'period14', mapping: '@period14', type: 'float' },
        { name: 'period15', mapping: '@period15', type: 'float' },
        { name: 'period16', mapping: '@period16', type: 'float' },
        { name: 'total', type: 'float' },
        { name: 'fscAccCode' },
        { name: 'description' },
        { name: 'accountCategoryId', type: 'float' },
        { name: 'accountCategory' },
        { name: 'percentage', type: 'float' },
        { name: 'isNegative' },
        { name: 'priority', type: 'float' }
    ],

    constructor: function (config) {

        Bud.data.BudDetailsStore.superclass.constructor.call(this, config);

        this.on({

            add: { fn: this.updateTotals },

            remove: { fn: this.updateTotals },

            update: {
                fn:
                    function(arg1, record){
                        //if (record.get('id') > 300)         //account row
                            this.updateTotals();
                    }
                    
            }

        });

    },

    getAccountCategory: function (categoryId) {
        var me = this;
        return me.queryBy(function (r, id) {
            return r.get('id') == categoryId;
        }).items[0];

    },

    getTotalRow: function () {
        return this.getAt(this.getCount() - 1);
    },

    getCriteria: function () {
        return { hcmHouseCode: this._hcmHouseCode, fscYear: this._fscYear, hcmJob: this._hcmJob, includeReadOnly: this.includeReadOnly ? "1" : "0" };
    },

    addAttributes: function (data) {
        Ext.apply(data, { hcmHouseCode: this._hcmHouseCode, hcmJob: this._hcmJob, fscYear: this._fscYear });
    },

    round2: function (d) {
        return Math.round(d * 100) / 100;
    },

    calculate: function (v, total) {
        if (total)
            return v / total;
        if (v)
            return 1;
        return 0;
    },

    calculating: true,

    updateTotals: function () {
        var me = this;
        me.currentUpdatingTick++;
        var updatingTick = me.currentUpdatingTick;

        setTimeout(function () { me.innerUpdateTotals(updatingTick); }, 2000);
    },

    currentUpdatingTick: 0,



    innerUpdateTotals: function (updatingTick) {

        var me = this;
        if (updatingTick != me.currentUpdatingTick)
            return;

        if (me.calculating)
            return;

        this.suspendEvents(false);

        me.calculating = true;

        if (this.isInitialed) {
            var allTotal = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

            this.each(function (record) {
                if (!record.get('fscAccCode')) {
                    var cateId = record.get('id');

                    var recordCollection = me.queryBy(function (r, id) {
                        return r.get('accountCategoryId') == cateId;
                    });

                    var periods = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    recordCollection.each(function (item, index) {
                        var isNeg = item.get('isNegative');

                        for (var i = 0; i < 16; i++) {
                            var fieldName = 'period' + (i + 1);
                            var value = (parseFloat(item.get(fieldName)) || 0);

                            periods[i] += isNeg ? -value : value;

                            if (item.get('accountCategoryId'))
                                allTotal[i] += isNeg ? -value : value;
                        }
                    });

                    for (var i = 0; i < 16; i++) {
                        var fieldName = 'period' + (i + 1);
                        if (record.get(fieldName) != me.round2(periods[i]))
                            record.set(fieldName, me.round2(periods[i]));
                    }
                }
            });

            // total row
            var totalRow = this.getAt(this.getCount() - 1);
            for (var i = 0; i < 16; i++) {
                var fieldName = 'period' + (i + 1);
                /// is g/l accoount isnegative is true, (which are most revenue related accounts), 
                /// when adding total, flip to negative on those numbers
                ///then flip total one more time. so postive means revenue more than expense means making money
                /// otherwise all reveneu and expense are positve numbers
                totalRow.set(fieldName, me.round2(-allTotal[i]));
            }

            this.each(function (record) {
                var total = 0;
                for (var i = 0; i < 12; i++) {
                    var fieldName = 'period' + (i + 1);
                    total += (parseFloat(record.get(fieldName)) || 0);
                }
                if (record.get('total') != me.round2(total))
                    record.set('total', me.round2(total));
            });

            var r = this.queryBy(function (record, id) {
                return record.get('id') == 45 && record.get('accountCategoryId') == 0;
            });
            if (r && r.getCount() == 1) {
                var total = r.get(0).get('total');
                me.each(function (rec) {
                    var newValue = me.calculate(rec.get('total'), total);
                    if (newValue != rec.get('percentage'))
                        rec.set('percentage', newValue);
                });
            }

        }

        me.calculating = false;
        this.resumeEvents();
        // commit changes for data loaded.
        // mark all data is valid, not dirty.
        if (me.firstCalculating === true) {
            me.commitChanges();
            me.firstCalculating = false;
        }

        this.resumeEvents();

        this.fireEvent('datarefresh', this);
    },

    getChangedRecords: function () {
        var records = [];
        var recs = Bud.data.BudDetailsStore.superclass.getChangedRecords.call(this);
        Ext.each(recs, function (rec, index) {
            if (rec.get('fscAccount') && (rec.get('_sysStatus') == 1 || rec.get('_sysStatus') == 2))
                records.push(rec);
        });

        return records;
    },

    load: function (hcmHouseCode, hcmJob, fscYear) {

        this._fscYear = fscYear;
        this._hcmHouseCode = hcmHouseCode;
        this._hcmJob = hcmJob;

        Bud.data.BudDetailsStore.superclass.load.call(this);
    },

    reload: function () {
        var me = this;

        me.isInitialed = false;
        Bud.data.BudDetailsStore.superclass.reload.call(this);
    },

    assign: function (store) {
        if (this.getCount() > 0) {
            this.each(function (record) {
                var rec = store.getById(record.get('fscAccount'));
                if (rec) {
                    record.set('fscAccCode', rec.get('code'));
                    record.set('description', rec.get('name'));
                    record.set('accountCategoryId', rec.get('accountCategoryId'));
                    record.set('accountCategory', rec.get('accountCategory'));
                    record.set('isNegative', rec.get('isNegative'));
                    record.set('priority', rec.get('accountCategoryId') == 45 ? 10 : 1);
                }
            });

            //this.sort('fscAccCode', 'ASC');
            this.sort([{ field: 'priority', direction: 'DESC' }, { field: 'accountCategoryId', direction: 'ASC' }, { field: 'fscAccCode', direction: 'ASC' }], 'ASC');
        }
    },

    relateTo: function (store) {
        var me = this;
        this._accountStore = store;

        var periods = {};
        for (var i = 0; i < 16; i++) {
            var fieldName = String.format('period{0}', i + 1);
            periods[fieldName] = 0;
        }

        if (this.getCount() == 0) {
            this.add(me.newRecord(Ext.apply({ id: 0, description: 'Total'}, periods)));
            return;
        }

        me.calculating = true;
        me.assign(store);

        for (var i = 0; i < this.getCount(); i++) {
            var record = this.getAt(i);
            var cateId = record.get('accountCategoryId');
            var cateName = record.get('accountCategory');

            var collection = me.queryBy(function (r, id) {
                return r.get('accountCategoryId') == cateId;
            });

            var length = collection.getCount();
            me.insert(i + length, me.newRecord(Ext.apply({ id: cateId, description: cateName, accountCategoryId: 0 }, periods)));
            i += length;
        }

        this.add(me.newRecord(Ext.apply({ id: 0, description: 'Total' }, periods)));

        me.calculating = false;
        this.isInitialed = true;

        me.firstCalculating = true;

        me.updateTotals();
    },

    addNewRecord: function (record) {
        var me = this;
        me.calculating = true;

        var accCode = record.get('code');
        var cateId = record.get('accountCategoryId');
        var cateName = record.get('accountCategory');

        var mix = me.queryBy(function (rec) {
            return rec.get('fscAccCode') == accCode;
        });
        if (mix.getCount() > 0) {
            alert('Account already exists.');
            return;
        }

        var periods = {};
        for (var i = 0; i < 16; i++) {
            var fieldName = String.format('period{0}', i + 1);
            periods[fieldName] = 0;
        }

        var insertRecord = function (index) {
            me.insert(index, me.newRecord(Ext.apply({
                description: record.get('name'),
                fscAccCode: accCode,
                fscAccount: record.get('id'),
                accountCategoryId: cateId,
                accountCategory: cateName,
                isReadOnly: 0,
                isNegative: record.get('isNegative')
            }, periods)));
        }

        var c = me.queryBy(function (r, id) {
            return r.get('accountCategoryId') == cateId;
        });

        var sumIndex = me.findBy(function (r) {
            return !r.get('fscAccCode') && r.get('id') == cateId && r.get('accountCategoryId') == 0;
        });

        if (sumIndex < 0) {
            insertRecord(0);
            me.insert(1, me.newRecord(Ext.apply({ id: cateId, description: cateName, accountCategoryId: 0 }, periods)));
        }
        else {
            insertRecord(sumIndex);
        }

        me.isInitialed = true;
        me.calculating = false;

        me.updateTotals();
    }
});


/// <reference path="../Core.js" />

Bud.data.BudgetSummaryStore = WebLight.extend(Bud.data.XmlStore, {

    budDetailStore: null,
    fscAccountStore: null,
    appJDEGLTransactionStore: null,
    fscPeriodStore: null,
    isAnnualizedStore: false,

    hcmHouseCode: -1,
    hcmJob: -1,
    fscYear: -1,

    _endField: 1,

    _loading: false,
    _loadedStoreCount: 0,

    _totalRow: null,

    _appJDEGLTransactionStore: null,

    constructor: function (config) {
        var me = this;

        var fields = [
            { name: 'fscAccount', type: 'float' },
            { name: 'title' },
            { name: 'accCode' },
            { name: 'isNegative', type: 'bool' },
            { name: 'accountCategoryId', type: 'float' },
            { name: 'accountCategory' },
            { name: 'priority', type: 'float' }
        ];

        for (var i = 1; i <= 13; i++) {
            fields.push({ name: 'actual' + i, type: 'float' },
                { name: 'budget' + i, type: 'float' });
        }

        fields.push({ name: 'actualYTD', type: 'float' },
                { name: 'budgetYTD', type: 'float' });

        fields.push({ name: 'actualTotal', type: 'float' },
                { name: 'budgetTotal', type: 'float' });

        config = Ext.apply(config || {}, { record: 'item',
            idProperty: '@fscAccount',
            fields: fields
        });

        Bud.data.BudgetSummaryStore.superclass.constructor.call(this, config);

        me.on({
            add: { fn: this.calculateStore },
            remove: { fn: this.calculateStore },
            update: { fn: this.calculateStore }
        });

        me.budDetailStore = new Bud.data.BudDetailsStore();
        me.appJDEGLTransactionStore = new Bud.data.BudAppJDEGLTransactionStore();
        me.fscPeriodStore = new Bud.data.FiscalPeriodStore();
        me._appJDEGLTransactionStore = new Bud.data.BudAppJDEGLTransactionStore();

        me.budDetailStore.on('load', me.subStoreLoaded.createDelegate(this));
        me.appJDEGLTransactionStore.on('load', me.subStoreLoaded.createDelegate(this));
        me.fscPeriodStore.on('load', me.subStoreLoaded.createDelegate(this));
    },

    clearStore: function () {
        var me = this;

        me.suspendEvents(false);

        // me.removeAll(); // can't use!
        me.remove(me.getRange());
        me._appJDEGLTransactionStore.removeAll();

        me.resumeEvents();
    },

    _addingTotalRow: false,
    subStoreLoaded: function () {
        var me = this;
        me._loadedStoreCount += 1;

        if (me._loadedStoreCount == 3) {
            me._loading = false;

            me.clearStore();

            me.suspendEvents(false);

            me.populateStore();

            // identify _addingTotalRow, skip run updateTotals method
            me._addingTotalRow = true;
            me.add(me._totalRow);
            // ignore total row changes
            me.ignoreRecords(me._totalRow);
            me._addingTotalRow = false;
            // calculate totalrow, apply data summary to totalRow
            me.calculateStore();

            me.resumeEvents();

            me.fireEvent('load', me);
        }
    },

    load: function (hcmHouseCode, hcmJob, fscYear, endField) {
        var me = this;

        if (this._loading)
            return;

        this._endField = endField;
        this.hcmHouseCode = hcmHouseCode;
        this.hcmJob = hcmJob;
        this.fscYear = fscYear;

        this._loadedStoreCount = 0;

        this.budDetailStore.load(hcmHouseCode, hcmJob, fscYear);
        // all periods of current year
        this.appJDEGLTransactionStore.load(hcmHouseCode, hcmJob, fscYear, 0, 1);
        this.fscPeriodStore.load(fscYear);

        var initData = me.initDataRecord(0, 'Total');
        me._totalRow = this.newRecord(initData);
    },

    initDataRecord: function (fscAccount, title) {
        var initData = { fscAccount: fscAccount,
            title: title,
            actualYTD: 0,
            budgetYTD: 0,
            actualTotal: 0,
            budgetTotal: 0
        };
        for (var i = 1; i <= 13; i++) {
            initData['actual' + i] = 0;
            initData['budget' + i] = 0;
        }
        return initData;
    },

    getByFscAccount: function (fscAccount) {
        var me = this;

        var records = me.queryBy(function (rec) {
            return rec.get('fscAccount') == fscAccount;
        });

        var record = records.get(0);

        if (!record) {
            var fscAccountRecord = me.fscAccountStore.getById(fscAccount);
            var title = !!fscAccountRecord ? fscAccountRecord.get('friendlyName') : String.format('Unknown "{0}"', fscAccount);
            var initData = me.initDataRecord(fscAccount, title);

            record = me.newRecord(Ext.apply({
                accCode: fscAccountRecord.get('code'),
                isNegative: fscAccountRecord.get('isNegative'),
                accountCategoryId: fscAccountRecord.get('accountCategoryId'),
                accountCategory: fscAccountRecord.get('accountCategory')
            }, initData));

            me.add([record]);
        }

        return record;
    },

    calculateAppJDEGLTransactionStore: function (r) {
        var me = this;


        var id = r.get('hcmHouseCode') * 1000000 + r.get('fscAccount') * 10000 + r.get('fscPeriod') * 100 + r.get('fscYear')

        var summaryRow = me._cachedJdegl.get(id);

        if (!summaryRow) {
            summaryRow = this._appJDEGLTransactionStore.newRecord(Ext.apply({}, r.data));
            this._appJDEGLTransactionStore.add(summaryRow);
            me._cachedJdegl.add(id, [summaryRow, r.get('appJDEtAmount')]);
            return;
        }
        else {
            //summaryRow.set('appJDEtAmount', r.get('appJDEtAmount') + summaryRow.get('appJDEtAmount'));
            summaryRow[1] += r.get('appJDEtAmount');
        }

        //        return;

        //        var records = this._appJDEGLTransactionStore.queryBy(function (rec) {
        //            return rec.get('hcmHouseCode') == r.get('hcmHouseCode')
        //                && rec.get('fscYear') == r.get('fscYear')
        //                && rec.get('fscPeriod') == r.get('fscPeriod')
        //                && rec.get('fscAccount') == r.get('fscAccount');
        //        });

        //        var record = records.get(0);

        //        if (!record) {
        //            this._appJDEGLTransactionStore.add(r);
        //        }
        //        else {
        //            var v = r.get('appJDEtAmount') + record.get('appJDEtAmount');
        //            record.set('appJDEtAmount', v);
        //        }
    },

    groupAppJDEGLTransactionStore: function () {
        var me = this;

        me._cachedJdegl = new Ext.util.MixedCollection();

        this.appJDEGLTransactionStore.each(function (record) {
            me.calculateAppJDEGLTransactionStore(record);
        });

        if (me._cachedJdegl) {
            me._cachedJdegl.each(function (item) {
                item[0].set('appJDEtAmount', item[1]);
            });

        }
    },

    populateStore: function () {
        var me = this;
        me._calculating = true;

        me.groupAppJDEGLTransactionStore();

        me.budDetailStore.each(function (r, index) {

            var record = me.getByFscAccount(r.get('fscAccount'));
            for (var i = 1; i <= 13; i++)
                record.set('budget' + i, r.get('period' + i));
        });
        me._appJDEGLTransactionStore.each(function (r, index) {
            var appJDEtAmount = r.get('appJDEtAmount');
            // ignore zero values or valueless than 0.005
            if (Math.round(appJDEtAmount * 100) / 100 == 0)
                return;

            var record = me.getByFscAccount(r.get('fscAccount'));
            var period = r.get('fscPeriod');

            var rec = me.fscPeriodStore.getById(period);
            record.set('actual' + rec.get('title'), appJDEtAmount);
        });

        me.groupStore();

        me._calculating = false;
    },

    groupStore: function () {
        var me = this;

        for (var i = 0; i < this.getCount(); i++) {
            var record = this.getAt(i);
            var fscAccount = me.fscAccountStore.getById(record.get('fscAccount'));
            record.set('priority', fscAccount.get('accountCategoryId') == 45 ? 10 : 1);
        };

        //this.sort('orderIndex', 'ASC');
        this.sort([{ field: 'priority', direction: 'DESC' }, { field: 'accountCategoryId', direction: 'ASC' }, { field: 'accCode', direction: 'ASC' }], 'ASC');

        //me.sort('accCode', 'ASC');

        for (var i = 0; i < this.getCount(); i++) {
            var record = this.getAt(i);
            var cateId = record.get('accountCategoryId');
            var cateName = record.get('accountCategory');

            var collection = me.queryBy(function (r, id) {
                return r.get('accountCategoryId') == cateId;
            });

            var length = collection.getCount();
            var initData = me.initDataRecord(cateId, cateName);
            me.insert(i + length, me.newRecord(Ext.apply({ accountCategoryId: 0 }, initData)));
            i += length;
        }

    },

    decimal2: function (v) {
        if (v && typeof v == 'number')
            return Math.round(v * 100) / 100;
        return v;
    },

    _calculating: false,
    calculateStore: function () {
        var me = this;

        if (me._calculating || me._addingTotalRow)
            return;

        me.suspendEvents(false);

        me._calculating = true;

        var i = 0, j = 0;

        var groups = me.queryBy(function (record) {
            return !record.get('accCode')
        });

        groups.each(function (rec) {
            var total = new Ext.util.MixedCollection();
            for (i = 1; i <= 13; i++) {
                total.add('actual' + i, 0);
                total.add('budget' + i, 0);
            }

            var cateId = rec.get('fscAccount');
            var groupRecords = me.queryBy(function (r) {
                return r.get('accountCategoryId') == cateId;
            });

            groupRecords.each(function (r) {
                var actual = 0, budget = 0;
                var isNeg = r.get('isNegative');

                for (j = 1; j <= 13; j++) {
                    actual = isNeg ? -(r.get('actual' + j) || 0) : (r.get('actual' + j) || 0);
                    budget = isNeg ? -(r.get('budget' + j) || 0) : (r.get('budget' + j) || 0);

                    total.replace('actual' + j, total.get('actual' + j) + actual);
                    total.replace('budget' + j, total.get('budget' + j) + budget);
                }
            });

            for (i = 1; i <= 13; i++) {
                rec.set('actual' + i, me.decimal2(total.get('actual' + i)));
                rec.set('budget' + i, me.decimal2(total.get('budget' + i)));
            }
        });

        this.each(function (record) {
            var actualYTD = 0;
            var budgetYTD = 0;

            var actualTotal = 0;
            var budgetTotal = 0;

            for (i = 1; i <= 13; i++) {
                if (me._endField >= i) {
                    actualYTD += record.get('actual' + i) || 0;
                    budgetYTD += record.get('budget' + i) || 0;
                }
                actualTotal += record.get('actual' + i) || 0;
                budgetTotal += record.get('budget' + i) || 0;
            }

            record.set('actualYTD', me.decimal2(actualYTD));
            record.set('budgetYTD', me.decimal2(budgetYTD));

            record.set('actualTotal', me.decimal2(actualTotal));
            record.set('budgetTotal', me.decimal2(budgetTotal));
        });

        me._calculating = false;

        me.resumeEvents();
        this.fireEvent('datarefresh', this);
    }

});

/// <reference path="../Core.js" />

Bud.page.BudgetSummaryPage = WebLight.extend(WebLight.Page, {

    html: _builtInTemplate_a7063646[2],
    title: 'Budget Summary',

    _houseCodeStore: null,
    _jobCodeStore: null,
    _fiscalYearStore: null,

    _accountStore: null,

    _fscPeriodStartComboBox: null,
    _fscPeriodEndComboBox: null,
    _houseCodeComboBox: null,
    _hcmJobComboBox: null,
    _fscYearComboBox: null,

    _loadButton: null,
    _colModel: null,
    _gridHeaderGroup: null,
    _summaryGrid: null,
    _summaryStore: null,

    _currentHcmHouseCode: null,

    createBudgetFields: function () {
        var me = this;

        var periodData = [];

        for (var i = 1; i <= 13; i++) {
            periodData.push([i, String.format('Period {0}', i)]);
        }

        var periodStore = new Ext.data.ArrayStore({
            fields: ['id', 'name'],
            data: periodData
        });

        this._houseCodeComboBox = new Ext.form.ComboBox({
            store: me._houseCodeStore,
            displayField: 'name',
            valueField: 'id',
            mode: 'local',
            forceSelection: true,
            triggerAction: 'all',
            selectOnFocus: true,
            //editable: false,
            layzeInit: false,
            typeAhead: true,
            allowBlank: false, minChars: 1,
            width: 290
        });
        this._hcmJobComboBox = new Bud.form.DropdownList({
            store: me._jobCodeStore,
            displayField: 'jobTitle',
            valueField: 'jobId',
            allowBlank: true,
            width: 150
        });
        this._fscYearComboBox = new Bud.form.DropdownList({
            store: me._fiscalYearStore,
            displayField: 'title',
            valueField: 'id',
            allowBlank: true,
            width: 90
        });

        this._houseCodeComboBox.on('select', function (combo, record, index) {
            me._loaded = false;
            me._jobCodeStore.removeAll();
            me._currentHcmHouseCode = record.get('id');
            me._hcmJobComboBox.setValue('');
            Bud.Context.setStickyHouseCode(record.get('appUnit'), record.get('id'), record.get('name'), record.get('brief'), record.get('hirNode'));
            me._jobCodeStore.load(record.get('id'));
        });
        this._fscYearComboBox.on('select', function (combo, record, index) {
            Bud.Context.setStickyFiscalYear(record.get('id'), record.get('title'));
        });

        this._houseCodeComboBox.on('blur', function (combo, record, index) {
            if (me._currentHcmHouseCode != combo.getValue()) {
                me._currentHcmHouseCode = combo.getValue();
                var record1 = me._houseCodeStore.getById(me._currentHcmHouseCode);
                Bud.Context.setStickyHouseCode(record1.get('appUnit'), record1.get('id'), record1.get('name'), record1.get('brief'), record1.get('hirNode'));
                me._jobCodeStore.load(me._currentHcmHouseCode);
            }
        });

        this._fscPeriodStartComboBox = new Bud.form.DropdownList({
            store: periodStore,
            displayField: 'name',
            valueField: 'id',
            allowBlank: true,
            width: 90,
            editable: false
        });
        this._fscPeriodEndComboBox = new Bud.form.DropdownList({
            store: periodStore,
            displayField: 'name',
            valueField: 'id',
            allowBlank: true,
            width: 90,
            editable: false
        });
        this._fscPeriodStartComboBox.setValue(1);
        this._fscPeriodEndComboBox.setValue(1);

        this._fscPeriodStartComboBox.on('valuechange', function (v) {
            var end = me._fscPeriodEndComboBox.getValue();

            if (v > end)
                me._fscPeriodStartComboBox.setValue(end);

        });
        this._fscPeriodEndComboBox.on('valuechange', function (v) {
            var start = me._fscPeriodStartComboBox.getValue();

            if (start > v)
                me._fscPeriodEndComboBox.setValue(start);

        });

        this._loadButton = new Ext.Button({
            text: ' Load Data ', width: 100, disabled: true, ctCls: 'ux-button-1',
            handler: function () {
                var start = me._fscPeriodStartComboBox.getValue();
                var end = me._fscPeriodEndComboBox.getValue();

                me.setColumnVisible(start, end);

                me.loadGridStore();
            }
        });

        this.addChildControl(this._houseCodeComboBox, 'house-code-holder');
        this.addChildControl(this._fscPeriodStartComboBox, 'period-start-holder');
        this.addChildControl(this._fscPeriodEndComboBox, 'period-end-holder');
        this.addChildControl(this._hcmJobComboBox, 'job-code-holder');
        this.addChildControl(this._fscYearComboBox, 'fiscal-year-holder');
        this.addChildControl(this._loadButton, 'load-button-holder');
    },

    _loadingData: false,

    loadGridStore: function () {
        var me = this;

        var end = me._fscPeriodEndComboBox.getValue();
        $('div.x-grid3-hd-inner:contains("YTD thru")').text('YTD thru Period' + end);

        me.getEl().mask('Loading...');
        this._loadingData = true;

        var houseCode = this._houseCodeComboBox.getValue();
        var jobCode = this._hcmJobComboBox.getValue();
        var fscYear = this._fscYearComboBox.getValue();

        this._summaryStore.load(houseCode, jobCode, fscYear, end);
    },

    customerRenderer: function (value, meta, record, rowIndex, colIndex, store) {
        var style = [];
        if (!record.get('accCode')) {
            style.push('font-weight:bold;');
        }

        if (typeof value == 'number') {
            if (record.get('title') == 'Revenue' || record.get('title') == 'Total')
                value = -value;

            style.push('text-align:right;');
            if (!record.get('fscAccount') && !record.get('accCode')) {
                if (value < 0)
                    style.push('color:#FF0000;');
                else if (value > 0)
                    style.push('color:#377812;');
            }

            value = Ext.util.Format.number(value, '0,000.00');
        }
        else {
            if (!record.get('accCode'))
                style.push('text-align:right;');
        }

        meta.attr = 'style="' + style.join('') + '"';

        return value;
    },

    generateColumnModel: function () {
        var me = this;
        var i = 0;

        var columns = [
            { header: 'Items', dataIndex: 'title', width: 250 },
            { header: '&nbsp;', dataIndex: 'accCode', width: 50 }
        ];
        var descriptionRow = [{ header: '', colspan: 2}];

        for (i = 1; i <= 13; i++) {

            columns.push({ header: 'Actuals', dataIndex: 'actual' + i, width: 65, hidden: true });
            columns.push({ header: 'Budget', dataIndex: 'budget' + i, width: 65, hidden: true });
            columns.push({ header: 'Variance', dataIndex: 'actual' + i, width: 65, hidden: true,
                renderer: function (value, meta, rec) {
                    var n = (this.id - 1) / 3;
                    var budget = parseFloat(rec.get('budget' + n));

                    var val = 0;
                    if (rec.get('accountCategory') == 'Revenue') {

                        val = Ext.util.Format.number(parseFloat(value) - budget, "0,000.00");
                    }
                    else {
                        val = Ext.util.Format.number(budget - parseFloat(value), "0,000.00");
                    }
                    meta.attr = 'style="' + me.getStyle(rec, val) + '"';

                    return val;
                }
            });

            descriptionRow.push({ header: 'Period' + i, colspan: 3, align: 'center' });
        }

        columns.push({ header: 'Actual', dataIndex: 'actualYTD', width: 70 });
        columns.push({ header: 'Budget', dataIndex: 'budgetYTD', width: 70 });
        columns.push({ header: 'Variance', dataIndex: '', width: 70,
            renderer: function (value, meta, rec) {

                var val = 0;
                if (rec.get('accountCategory') == 'Revenue' || rec.get('title') == 'Revenue') {

                    val = Ext.util.Format.number(parseFloat(rec.get('actualYTD')) - parseFloat(rec.get('budgetYTD')), "0,000.00");
                }
                else {
                    val = Ext.util.Format.number(parseFloat(rec.get('budgetYTD')) - parseFloat(rec.get('actualYTD')), "0,000.00");
                }
                meta.attr = 'style="' + me.getStyle(rec, val) + '"';
                return val;
            }
        });

        columns.push({ header: 'Actual', dataIndex: 'actualTotal', width: 70 });
        columns.push({ header: 'Budget', dataIndex: 'budgetTotal', width: 70 });
        columns.push({ header: 'Variance', dataIndex: '', width: 70,
            renderer: function (value, meta, rec) {
                var val = 0;
                if (rec.get('accountCategory') == 'Revenue' || rec.get('title') == 'Revenue') {

                    val = Ext.util.Format.number(parseFloat(rec.get('actualTotal')) - parseFloat(rec.get('budgetTotal')), "0,000.00");
                }
                else {
                    val = Ext.util.Format.number(parseFloat(rec.get('budgetTotal')) - parseFloat(rec.get('actualTotal')), "0,000.00");
                }
                meta.attr = 'style="' + me.getStyle(rec, val) + '"';
                return val;
            }
        });


        descriptionRow.push({ header: 'YTD thru Period1', colspan: 3, align: 'center' });
        descriptionRow.push({ header: 'Fiscal Yr. Totals', colspan: 3, align: 'center' });

        this._gridHeaderGroup = new Ext.ux.grid.ColumnHeaderGroup({
            rows: [descriptionRow]
        });

        this._colModel = new Ext.grid.ColumnModel({
            defaults: { sortable: false, renderer: me.customerRenderer },
            columns: columns
        });
    },

    createSummaryGrid: function () {
        var me = this;

        this.generateColumnModel();

        this._summaryGrid = new WebLight.grid.GridPanel({
            header: false,
            enableHdMenu: false,
            cm: this._colModel,
            plugins: [me._gridHeaderGroup],
            store: this._summaryStore
        });

        $(window).resize(function () {
            me._summaryGrid.setHeight($(window).height() - 175);

        });

        this.addChildControl(this._summaryGrid, 'budget-summary-grid');
        this._summaryGrid.setHeight($(window).height() - 175);

    },

    setColumnVisible: function (start, end) {
        var me = this;
        var i, col1Index, col2Index, col3Index;
        var isHidden;

        var cm = me._summaryGrid.getColumnModel();

        for (i = 1; i <= 13; i++) {
            isHidden = !(i >= start && i <= end);
            col1Index = 3 * (i - 1) + 2;
            col2Index = 3 * (i - 1) + 3;
            col3Index = 3 * (i - 1) + 4;

            cm.setHidden(col1Index, isHidden);
            cm.setHidden(col2Index, isHidden);
            cm.setHidden(col3Index, isHidden);
        }
        //$('x-grid3-viewport', $('#' + me._summaryGrid.id)).width($('.x-grid3-header-offset', $('#' + me._summaryGrid.id)).width());
    },

    createChildControls: function () {
        var me = this;

        $('#' + this.getClientId('page-status')).append('<div id="itemStatusDiv"><div class="itemStatusImage Normal" id="itemStatusImage"></div>' +
			'<div class="itemModifiedImage" id="itemModifiedImage"></div><div id="itemStatusText">Normal</div></div>');

        this._houseCodeStore = new Bud.data.HouseCodeStore(); // Bud.getGlobalHouseCodeStore();
        this._jobCodeStore = new Bud.data.JobCodeStore();
        this._fiscalYearStore = new Bud.data.FiscalYearStore();

        this._accountStore = new Bud.data.BudgetAccountStore();
        this._fiscalPeriodStore = new Bud.data.FiscalPeriodStore();

        this._summaryStore = new Bud.data.BudgetSummaryStore({
            fscAccountStore: me._accountStore
        });

        this.createBudgetFields();
        this.createSummaryGrid();

        Bud.page.BudgetSummaryPage.superclass.createChildControls.call(this);

    },

    dataBind: function () {
        var me = this;
        this.getEl().mask('Loading...');

        this._jobCodeStore.on('load', function (store, records, options) {
            if (records.length > 0)
                me._hcmJobComboBox.setValue(records[0].get('jobId'));
            else
                me._hcmJobComboBox.setValue('');
            me._loadCount++;
            me.enableLoadButton();
        });


        //        if (me._houseCodeStore.getCount() > 0) {

        //            var records = me._houseCodeStore.getRange();

        //            if (records.length > 0) {
        //                if (Bud.Context.getStickyHcmHouseCode() != 0) {
        //                    me._houseCodeComboBox.setValue(Bud.Context.getStickyHcmHouseCode());
        //                }
        //                else {
        //                    me._houseCodeComboBox.setValue(records[0].get('id'));
        //                }
        //                me._jobCodeStore.load(me._houseCodeComboBox.getValue());
        //            }
        //            else
        //                me._houseCodeComboBox.setValue('');
        //            me._loadCount++;
        //        }
        //        else {
        this._houseCodeStore.on('load', function (store, records, options) {
            if (records.length > 0) {
                //me._houseCodeComboBox.setValue(records[0].get('id'));
                if (Bud.Context.getStickyHcmHouseCode() != 0)
                    me._houseCodeComboBox.setValue(Bud.Context.getStickyHcmHouseCode());
                else
                    me._houseCodeComboBox.setValue(records[0].get('id'));
                me._jobCodeStore.load(me._houseCodeComboBox.getValue());
            }
            else
                me._houseCodeComboBox.setValue('');
            me._loadCount++;
        });
        // }

        me._fiscalPeriodStore.on('load', function (store, records, options) {
            me._loadCount++;

            // 2011/07/01 
            // Start period should always default to period 1, and ending period to the current period.
            var currentPeriods = me._fiscalPeriodStore.queryBy(function (r) {
                var today = new Date();
                return r.get('startDate') <= today && r.get('endDate') >= today;
            });

            if (currentPeriods.getCount() > 0)
                me._fscPeriodEndComboBox.setValue(currentPeriods.get(0).get('title'));

            me.enableLoadButton();
        });

        this._fiscalYearStore.on('load', function (store, records, options) {
            if (records.length > 0) {
                if (Bud.Context.getStickyFscYear() != 0) {
                    me._fscYearComboBox.setValue(Bud.Context.getStickyFscYear());
                    me._fiscalPeriodStore.load(Bud.Context.getStickyFscYear());
                }
                else {
                    me._fscYearComboBox.setValue(records[0].get('id'));
                    me._fiscalPeriodStore.load(records[0].get('id'));
                }

            }
            else
                me._fscYearComboBox.setValue('');
            me._loadCount++;
        });

        this._accountStore.on('load', function () {
            me._loadCount++;
            me.enableLoadButton();
        });
        this._accountStore.load();

        this._houseCodeStore.load();
        this._fiscalYearStore.load();

        this._summaryStore.on('load', function () {
            me.getEl().unmask();
            me._loadingData = false;
        });

        this._summaryStore.on('datarefresh', function () {
            setTimeout(function () {
                me._summaryGrid.getView().refresh();
            }, 100);
        });

        Bud.page.BudgetSummaryPage.superclass.dataBind.call(this);
    },

    _loadCount: 0,
    enableLoadButton: function () {
        var me = this;

        if (this._loadCount == 5) {
            this.getEl().unmask();
            this._loadButton.enable();
        }
    },

    getStyle: function (record, value) {
        var style = [];

        if (!record.get('accCode')) {
            style.push('font-weight:bold;');
        }

        style.push('text-align:right;');
        if (record.get('title') == 'Total') {

            if (parseFloat(value) < 0)
                style.push('color:#FF0000;');
            else if (parseFloat(value) > 0)
                style.push('color:#377812;');
        }

        return style.join(' ');
    }

});

WebLight.PageMgr.registerType('budgetsummary', Bud.page.BudgetSummaryPage);


/// <reference path="XmlStore.js" />

Bud.data.BudAppJDEGLTransactionStore = Ext.extend(Bud.data.XmlStore, {

    url: '/net/crothall/chimes/fin/bud/act/Provider.aspx',

    moduleId: 'bud',

    storeId: 'appJDEGLTransactions',

    _hcmHouseCode: 0,
    _hcmJob: 0,
    _fscYear: 0,
    _fscPeriod: 0,
    _annualized: 0,

    getCriteria: function () {
        return {
            hcmHouseCode: this._hcmHouseCode,
            hcmJob: this._hcmJob,
            fscYear: this._fscYear,
            fscPeriod: this._fscPeriod,
            annualized: this._annualized
        };
    },

    load: function (hcmHouseCode, hcmJob, fscYear, fscPeriod, annualized) {

        this._hcmHouseCode = hcmHouseCode;
        this._hcmJob = hcmJob;
        this._fscYear = fscYear;
        this._fscPeriod = fscPeriod;
        this._annualized = annualized;

        Bud.data.BudAppJDEGLTransactionStore.superclass.load.call(this);
    },

    fields: [
        { name: 'id', mapping: '@id', type: 'int' },
        { name: 'hcmHouseCode', mapping: '@hcmHouseCode', type: 'int' },
        { name: 'hcmJob', mapping: '@hcmJob', type: 'int' },
        { name: 'fscYear', mapping: '@fscYear', type: 'int' },
        { name: 'fscPeriod', mapping: '@fscPeriod', type: 'int' },
        { name: 'fscAccount', mapping: '@fscAccount', type: 'int' },
        { name: 'appJDEtAmount', mapping: '@appJDEtAmount', type: 'float' },
        { name: 'annualized', type: 'float' }
    ]

});

