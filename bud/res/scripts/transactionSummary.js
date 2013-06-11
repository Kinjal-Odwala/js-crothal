_builtInTemplate_d5e3e8d0 = ['<?xml version="1.0" encoding="utf-8" ?><transmission>  <target id="iiAuthorization" requestId="1">    <authorization id="1">      <authorize id="41" path="\\crothall\\chimes\\fin\\Budgeting"></authorize>      <authorize id="42" path="\\crothall\\chimes\\fin\\Budgeting\\AnnualizedBudget"></authorize>      <authorize id="16059" path="\\crothall\\chimes\\fin\\Budgeting\\AnnualizedBudget\\Read"></authorize>      <authorize id="16060" path="\\crothall\\chimes\\fin\\Budgeting\\AnnualizedBudget\\Write"></authorize>      <authorize id="44" path="\\crothall\\chimes\\fin\\Budgeting\\AnnualProjections"></authorize>      <authorize id="16063" path="\\crothall\\chimes\\fin\\Budgeting\\AnnualProjections\\ByPeriod"></authorize>      <authorize id="16064" path="\\crothall\\chimes\\fin\\Budgeting\\AnnualProjections\\ByPeriod\\Read"></authorize>      <authorize id="16065" path="\\crothall\\chimes\\fin\\Budgeting\\AnnualProjections\\ByPeriod\\Write"></authorize>      <authorize id="16066" path="\\crothall\\chimes\\fin\\Budgeting\\AnnualProjections\\WORForecast"></authorize>      <authorize id="16067" path="\\crothall\\chimes\\fin\\Budgeting\\AnnualProjections\\WORForecast\\Read"></authorize>      <authorize id="16068" path="\\crothall\\chimes\\fin\\Budgeting\\AnnualProjections\\WORForecast\\Write"></authorize>      <authorize id="1213" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration"></authorize>      <authorize id="16069" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration\\AnnualInformation"></authorize>      <authorize id="16070" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration\\AnnualInformation\\Read"></authorize>      <authorize id="16071" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration\\AnnualInformation\\Write"></authorize>      <authorize id="16072" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration\\ApproveBudget"></authorize>      <authorize id="16073" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration\\ApproveBudget\\Approve"></authorize>      <authorize id="16074" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration\\ApproveBudget\\Read"></authorize>      <authorize id="16075" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration\\ApproveBudget\\Reject"></authorize>      <authorize id="16076" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration\\ApproveBudget\\Write"></authorize>      <authorize id="16077" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration\\DeleteBudget"></authorize>      <authorize id="16078" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration\\DeleteBudget\\Read"></authorize>      <authorize id="16079" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration\\DeleteBudget\\Write"></authorize>      <authorize id="16080" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration\\ExportBudget"></authorize>      <authorize id="16081" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration\\ExportBudget\\Read"></authorize>      <authorize id="16082" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetAdministration\\ExportBudget\\Write"></authorize>      <authorize id="43" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetSummary"></authorize>      <authorize id="16061" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetSummary\\Read"></authorize>      <authorize id="16062" path="\\crothall\\chimes\\fin\\Budgeting\\BudgetSummary\\Write"></authorize>    </authorization>  </target></transmission>','<div style="color: #FFF; background-color: #659A66; padding: 10px; margin: 0 0 10px;">    <table width="100%" class="ann-proj-table">        <tbody>            <tr>                <td style="width: 35px;" class="label">Site:</td>                <td style="width: 300px"><div id="house-code-holder"></div></td>                <td style="width: 35px;" class="label">Job:</td>                <td style="width: 160px"><div id="job-code-holder"></div></td>                <td style="width: 80px;" class="label">Fiscal Year:</td>                <td style="width: 100px"><div id="fiscal-year-holder"></div></td>                <td style="width: 80px;" class="label">Period:</td>                <td style="width: 100px"><div id="period-holder"></div></td>                <td>&nbsp;</td>            </tr>        </tbody>    </table></div><div style="padding: 0 5px">    <p style="float:left">        The current page is READONLY.</p>        <div style="float:right"><span id="load-button-holder"></span></div></div><div style="clear:both;height:1px;"></div><div id="transaction-summary-grid" style="padding: 10px 5px;"></div><br /><br />'];/*!
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

/*!
* Ext JS Library 3.0.0
* Copyright(c) 2006-2009 Ext JS, LLC
* licensing@extjs.com
* http://www.extjs.com/license
* 
* Modifications by Mykhail Stadnik <http://mikhailstadnik.com>:
*  - Nesting grids support added
*/
Ext.ns('Ext.grid');

/**
* @class Ext.ux.grid.RowExpander
* @extends Ext.util.Observable
* Plugin (ptype = 'rowexpander') that adds the ability to have a Column in a grid which enables
* a second row body which expands/contracts.  The expand/contract behavior is configurable to react
* on clicking of the column, double click of the row, and/or hitting enter while a row is selected.
*
* @ptype rowexpander
*/
Ext.grid.RowExpander = Ext.extend(Ext.util.Observable, {

    /**
    * @cfg {Boolean} expandOnEnter
    * <tt>true</tt> to toggle selected row(s) between expanded/collapsed when the enter
    * key is pressed (defaults to <tt>true</tt>).
    */
    expandOnEnter: true,

    /**
    * @cfg {Boolean} expandOnDblClick
    * <tt>true</tt> to toggle a row between expanded/collapsed when double clicked
    * (defaults to <tt>true</tt>).
    */
    expandOnDblClick: true,

    header: '',
    width: 20,
    sortable: false,
    fixed: true,
    menuDisabled: true,
    dataIndex: '',
    id: 'expander',
    lazyRender: true,
    enableCaching: true,
    actAsTree: false,
    treeLeafProperty: 'is_leaf',
    appendRowClass: true,
    alwaysAsLeaf : false,

    constructor: function(config) {
        if (!config.id) {
            config.id = Ext.id();
        }

        Ext.apply(this, config);

        var css =
			'.x-' + this.id + '-grid3-row-collapsed .x-grid3-row-expander { background-position:0 0; }' +
			'.x-' + this.id + '-grid3-row-expanded .x-grid3-row-expander { background-position:-25px 0; }' +
			'.x-' + this.id + '-grid3-row-collapsed .x-grid3-row-body { display:none !important; }' +
			'.x-' + this.id + '-grid3-row-expanded .x-grid3-row-body { display:block !important; }' +
			'.x-grid-expander-leaf .x-grid3-row-expander { background: none; }'
		;

        Ext.util.CSS.createStyleSheet(css, Ext.id());

        this.expanderClass = 'x-grid3-row-expander';
        this.rowExpandedClass = 'x-' + this.id + '-grid3-row-expanded';
        this.rowCollapsedClass = 'x-' + this.id + '-grid3-row-collapsed';
        this.leafClass = 'x-grid-expander-leaf';

        this.addEvents({
            /**
            * @event beforeexpand
            * Fires before the row expands. Have the listener return false to prevent the row from expanding.
            * @param {Object} this RowExpander object.
            * @param {Object} Ext.data.Record Record for the selected row.
            * @param {Object} body body element for the secondary row.
            * @param {Number} rowIndex The current row index.
            */
            beforeexpand: true,
            /**
            * @event expand
            * Fires after the row expands.
            * @param {Object} this RowExpander object.
            * @param {Object} Ext.data.Record Record for the selected row.
            * @param {Object} body body element for the secondary row.
            * @param {Number} rowIndex The current row index.
            */
            expand: true,
            /**
            * @event beforecollapse
            * Fires before the row collapses. Have the listener return false to prevent the row from collapsing.
            * @param {Object} this RowExpander object.
            * @param {Object} Ext.data.Record Record for the selected row.
            * @param {Object} body body element for the secondary row.
            * @param {Number} rowIndex The current row index.
            */
            beforecollapse: true,
            /**
            * @event collapse
            * Fires after the row collapses.
            * @param {Object} this RowExpander object.
            * @param {Object} Ext.data.Record Record for the selected row.
            * @param {Object} body body element for the secondary row.
            * @param {Number} rowIndex The current row index.
            */
            collapse: true
        });

        Ext.grid.RowExpander.superclass.constructor.call(this);

        if (this.tpl) {
            if (typeof this.tpl == 'string') {
                this.tpl = new Ext.Template(this.tpl);
            }
            this.tpl.compile();
        }

        this.state = {};
        this.bodyContent = {};
    },

    getRowClass: function(record, rowIndex, p, ds) {
        p.cols = p.cols - 1;
        var content = this.bodyContent[record.id];
        if (!content && !this.lazyRender) {
            content = this.getBodyContent(record, rowIndex);
        }
        if (content) {
            p.body = content;
        }
        var cssClass = this.state[record.id] ? this.rowExpandedClass : this.rowCollapsedClass;
        /// changed
        /// add alwaysAsLeaf property
        if (this.alwaysAsLeaf || this.actAsTree && record.get(this.treeLeafProperty)) {
            cssClass = this.leafClass;
        }
        return cssClass;
    },

    init: function(grid) {
        this.grid = grid;

        var view = grid.getView();
        view.getRowClass = this.getRowClass.createDelegate(this);

        view.enableRowBody = true;

        grid.on('render', this.onRender, this);
        grid.on('destroy', this.onDestroy, this);

        view.on('beforerefresh', this.onBeforeRefresh, this);
        view.on('refresh', this.onRefresh, this);
    },

    // @private
    onRender: function() {
        var grid = this.grid;
        var mainBody = grid.getView().mainBody;
        mainBody && mainBody.on('mousedown', this.onMouseDown, this, { delegate: '.' + this.expanderClass });
        if (this.expandOnEnter) {
            this.keyNav = new Ext.KeyNav(this.grid.getGridEl(), {
                'enter': this.onEnter,
                scope: this
            });
        }
        if (this.expandOnDblClick) {
            grid.on('rowdblclick', this.onRowDblClick, this);
        }
        if (this.actAsTree) {
            /**
            * Stop bubbling parent events 
            */
            grid.getEl().swallowEvent(['mouseover', 'mouseout', 'mousedown', 'click', 'dblclick']);
        }
    },

    // @private
    onBeforeRefresh: function() {
        var rows = this.grid.getEl().select('.' + this.rowExpandedClass);
        rows.each(function(row) {
            this.collapseRow(row.dom);
        }, this);
    },

    // @private
    onRefresh: function() {
        var rows = this.grid.getEl().select('.' + this.rowExpandedClass);
        rows.each(function(row) {
            Ext.fly(row).replaceClass(this.rowExpandedClass, this.rowCollapsedClass);
        }, this);
    },

    // @private    
    onDestroy: function() {
        this.keyNav.disable();
        delete this.keyNav;
        var mainBody = this.grid.getView().mainBody;
        mainBody && mainBody.un('mousedown', this.onMouseDown, this);
    },

    // @private
    onRowDblClick: function(grid, rowIdx, e) {
        this.toggleRow(rowIdx);
    },

    onEnter: function(e) {
        var g = this.grid;
        var sm = g.getSelectionModel();
        var sels = sm.getSelections();
        for (var i = 0, len = sels.length; i < len; i++) {
            var rowIdx = g.getStore().indexOf(sels[i]);
            this.toggleRow(rowIdx);
        }
    },

    getBodyContent: function(record, index) {
        if (!this.enableCaching) {
            return this.tpl.apply(record.data);
        }
        var content = this.bodyContent[record.id];
        if (!content) {
            content = this.tpl.apply(record.data);
            this.bodyContent[record.id] = content;
        }
        return content;
    },

    onMouseDown: function(e, t) {
        e.stopEvent();
        var row = e.getTarget('.x-grid3-row');
        this.toggleRow(row);
    },

    renderer: function(v, p, record) {
        p.cellAttr = 'rowspan="2"';
        return '<div class="' + this.expanderClass + '">&#160;</div>';
    },

    beforeExpand: function(record, body, rowIndex) {
        if (this.fireEvent('beforeexpand', this, record, body, rowIndex) !== false) {
            if (this.tpl && this.lazyRender) {
                body.innerHTML = this.getBodyContent(record, rowIndex);
            }
            return true;
        } else {
            return false;
        }
    },

    toggleRow: function(row) {
        if (typeof row == 'number') {
            row = this.grid.view.getRow(row);
        }
        if (Ext.fly(row).hasClass(this.leafClass)) {
            return;
        }
        this[Ext.fly(row).hasClass(this.rowCollapsedClass) ? 'expandRow' : 'collapseRow'](row);
    },

    expandRow: function(row) {
        if (typeof row == 'number') {
            row = this.grid.view.getRow(row);
        }
        if (Ext.fly(row).hasClass(this.leafClass)) {
            return;
        }
        var record = this.grid.store.getAt(row.rowIndex);
        var body = Ext.DomQuery.selectNode('tr:nth(2) div.x-grid3-row-body', row);
        if (this.beforeExpand(record, body, row.rowIndex)) {
            this.state[record.id] = true;
            Ext.fly(row).replaceClass(this.rowCollapsedClass, this.rowExpandedClass);
            this.fireEvent('expand', this, record, body, row.rowIndex);
        }
    },

    /**
    * Avoid memory leaks by destroying all nested grids recursively
    * 
    * @param {Ext.Element} - grid element to destroy
    */
    destroyNestedGrids: function(gridEl) {
        if (gridEl) {
            if (childGridEl = gridEl.child('.x-grid-panel')) {
                this.destroyNestedGrids(childGridEl);
            }
            var grid = Ext.getCmp(gridEl.id);
            if (grid && (grid != this.grid)) {
                if (grid instanceof Ext.grid.EditorGridPanel) {
                    var cm = grid.getColumnModel();
                    for (var i = 0, s = cm.getColumnCount(); i < s; i++) {
                        for (var ii = 0, ss = grid.getStore().getCount(); ii < ss; ii++) {
                            if (editor = cm.getCellEditor(i, ii)) {
                                editor.destroy();
                            }
                        }
                    }
                    cm.destroy();
                }
                grid.destroy();
            }
        }
    },

    collapseRow: function(row) {
        if (typeof row == 'number') {
            row = this.grid.view.getRow(row);
        }
        if (Ext.fly(row).hasClass(this.leafClass)) {
            return;
        }
        var record = this.grid.store.getAt(row.rowIndex);
        var body = Ext.fly(row).child('tr:nth(1) div.x-grid3-row-body', true);
        if (this.fireEvent('beforecollapse', this, record, body, row.rowIndex) !== false) {
            this.destroyNestedGrids(Ext.get(row).child('.x-grid-panel'));
            if (record) this.state[record.id] = false;
            Ext.fly(row).replaceClass(this.rowExpandedClass, this.rowCollapsedClass);
            this.fireEvent('collapse', this, record, body, row.rowIndex);
        }
    }
});

Ext.preg('rowexpander', Ext.grid.RowExpander);


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





jQuery.ajaxSettings.contentType = 'application/x-www-form-urlencoded; charset=utf-8';

WebLight.namespace('Bud', 'Bud.form', 'Bud.page', 'Bud.grid');

var host = document.location.host;
if (!window.top.fin) {
    //window.top.fin = { appUI: { houseCodeId: 227, glbFscYear: 2, glbFscPeriod: 18} };
    window.top.fin = { appUI: { houseCodeId: 415, glbFscYear: 4, glbFscPeriod: 46} };
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
    xtype: 'laborcalculations'
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
                WebLight.Router.route(this.url);
            }, this);
        }

    }
});

/// <reference path="Core.js" />

Bud.TransactionSummaryNavBar = Ext.extend(Ext.Toolbar, {
    initComponent: function () {
        var menuItems = [];

        menuItems.push(new Bud.NavbarItem({
            text: 'Transaction Summary',
            pattern: 'ledger/transactionsummary',
            url: '/ledger/transactionsummary'
        }));

        this.items = menuItems;
        this.menuItems = menuItems;

        Bud.TransactionSummaryNavBar.superclass.initComponent.call(this);

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
                var value = item.data[key];
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
        this.loadData(_builtInTemplate_d5e3e8d0[0]);
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
        { name: 'isNegative' }
    ],

    constructor: function (config) {

        Bud.data.BudDetailsStore.superclass.constructor.call(this, config);

        this.on({

            add: { fn: this.updateTotals },

            remove: { fn: this.updateTotals },

            update: { fn: this.updateTotals }

        });

    },

    getCriteria: function () {
        return { hcmHouseCode: this._hcmHouseCode, fscYear: this._fscYear, hcmJob: this._hcmJob };
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
                            var value = item.get(fieldName);

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
                    total += record.get(fieldName);
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
                }
            });

            /// changed at 2011/6/17
            this.sort('fscAccCode', 'ASC');
            //this.sort([{ field: 'accountCategoryId', direction: 'ASC' }, { field: 'fscAccCode', direction: 'ASC'}], 'ASC'); 
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
            this.add(me.newRecord(Ext.apply({ id: 0, description: 'Total' }, periods)));
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

Bud.data.AppJDEGLTransactionStore = WebLight.extend(Bud.data.XmlStore, {

    url: '/net/crothall/chimes/fin/glm/act/Provider.aspx',

    moduleId: 'glm',

    storeId: 'appJDEGLTransaction2',

    _hcmHouseCode: 0,
    _hcmJob: 0,
    _fscYear: 0,
    _fscPeriod: 0,
    _direction: 0,

    getCriteria: function () {
        return {
            hcmHouseCode: this._hcmHouseCode,
            hcmJob: this._hcmJob,
            fscYear: this._fscYear,
            fscPeriod: this._fscPeriod,
            direction: this._direction
        };
    },

    load: function (hcmHouseCode, hcmJob, fscYear, fscPeriod, direction) {

        this._hcmHouseCode = hcmHouseCode;
        this._fscYear = fscYear;
        this._fscPeriod = fscPeriod;
        this._hcmJob = hcmJob;
        this._direction = direction;

        Bud.data.AppJDEGLTransactionStore.superclass.load.call(this);
    },

    fields: [
        { name: 'id', mapping: '@id', type: 'int' },
        { name: 'hcmHouseCode', mapping: '@hcmHouseCode', type: 'int' },
        { name: 'hcmJob', mapping: '@hcmJob', type: 'int' },
        { name: 'fscYear', mapping: '@fscYear', type: 'int' },
        { name: 'fscPeriod', mapping: '@fscPeriod', type: 'int' },
        { name: 'fscAccount', mapping: '@fscAccount', type: 'int' },
        { name: 'vendor', mapping: '@vendor', type: 'string' },
        { name: 'week1', mapping: '@week1', type: 'float' },
        { name: 'week2', mapping: '@week2', type: 'float' },
        { name: 'week3', mapping: '@week3', type: 'float' },
        { name: 'week4', mapping: '@week4', type: 'float' },
        { name: 'total', mapping: '@total', type: 'float' }
    ]
});

/// <reference path="../Core.js" />

Bud.data.budRequest = function (requestXml, callback) {
    var data = String.format('moduleId=bud&requestId=1&requestXml={0}&&targetId=iiCache', encodeURIComponent(requestXml));

    jQuery.post('/net/crothall/chimes/fin/bud/act/Provider.aspx', data, function (data, status) {
        callback(data);
    });
}

Bud.data.TransactionSummaryStore = WebLight.extend(Bud.data.XmlStore, {

    hcmHouseCode: -1,
    hcmJob: -1,
    fscYear: -1,
    fscPeriod: -1,
    isAnnualizedStore: false,
    _periodTitle: 0,
    _addingTotalRow: false,
    _loading: false,
    _loadedStoreCount: 0,

    _totalRow: null,

    fscYearStore: null,
    fscPeriodStore: null,

    fscPeriodCount: 13,
    fscAccountStore: null,
    budDetailStore: null,
    appJDEGLTransactionStore: null,
    previousAppJDEGLTransactionStore: null,

    projectionStore: null,
    nextProjectionStore: null,

    constructor: function (config) {
        var me = this;

        var fields = [
            { name: 'fscAccount', type: 'float' },
            { name: 'title' },
            { name: 'accCode' },
            { name: 'isNegative', type: 'bool' },
            { name: 'accountCategoryId', type: 'float' },
            { name: 'accountCategory' },
            { name: 'vendor' },
            { name: 'week1', mapping: '@week1', type: 'float' },
            { name: 'week2', mapping: '@week2', type: 'float' },
            { name: 'week3', mapping: '@week3', type: 'float' },
            { name: 'week4', mapping: '@week4', type: 'float' },
            { name: 'total', type: 'float' },
            { name: 'budget', type: 'float' },
            { name: 'variance', type: 'float' },
            { name: 'actual', type: 'float' },
            { name: 'nextActual', type: 'float' },
            { name: 'currentActual', type: 'float' },
            { name: 'periodProjection1', type: 'float' },
            { name: 'periodProjection2', type: 'float' },
            { name: 'subStore', type: 'auto' },
            { name: 'noChildren', type: 'bool' }
        ];

        config = Ext.apply(config || {}, { record: 'item',
            idProperty: '@fscAccount',
            fields: fields
        });

        Bud.data.TransactionSummaryStore.superclass.constructor.call(this, config);

        me.on({
            add: { fn: this.calculateStore },
            remove: { fn: this.calculateStore },
            update: { fn: this.calculateStore }
        });

        var loadFiscalPeriodCloseDays = function () {
            var criteriaXml = '<criteria>variableName:FiscalPeriodCloseDays ,storeId:budSystemVariables,userId:[user],</criteria>';

            Bud.data.budRequest(criteriaXml, function (data) {
                me.fiscalPeriodCloseDays = $('item:first', $(data)).attr('variableValue');
            });

        };

        loadFiscalPeriodCloseDays();

        me.budDetailStore = new Bud.data.BudDetailsStore();
        me.appJDEGLTransactionStore = new Bud.data.AppJDEGLTransactionStore();
        me.previousAppJDEGLTransactionStore = new Bud.data.AppJDEGLTransactionStore();
        me.nextAppJDEGLTransactionStore = new Bud.data.AppJDEGLTransactionStore();

        me.projectionStore = new Bud.data.BudProjectedDetailStore();
        me.nextProjectionStore = new Bud.data.BudProjectedDetailStore();

        me.budDetailStore.on('load', me.subStoreLoaded.createDelegate(this));
        me.appJDEGLTransactionStore.on('load', me.subStoreLoaded.createDelegate(this));
        me.previousAppJDEGLTransactionStore.on('load', me.subStoreLoaded.createDelegate(this));
        me.nextAppJDEGLTransactionStore.on('load', me.subStoreLoaded.createDelegate(this));

        me.projectionStore.on('load', me.subStoreLoaded.createDelegate(this));
        me.nextProjectionStore.on('load', me.subStoreLoaded.createDelegate(this));
    },

    clearStore: function () {
        var me = this;

        me.suspendEvents(false);

        me.remove(me.getRange());

        me.resumeEvents();
    },

    subStoreLoaded: function () {
        var me = this;
        me._loadedStoreCount += 1;
        var period = parseInt(me._periodTitle);

        if (period < me.fscPeriodCount && me._loadedStoreCount == 4 || period == me.fscPeriodCount && me._loadedStoreCount == 5) {
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

    getByFscAccount: function (fscAccount) {
        var me = this;

        var records = me.queryBy(function (rec) {
            return rec.get('fscAccount') == fscAccount;
        });

        var record = records.get(0);

        if (!record) {
            var fscAccountRecord = me.fscAccountStore.getById(fscAccount);
            if (!fscAccountRecord)
                return null;

            var title = fscAccountRecord.get('friendlyName');
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

    groupStore: function () {
        var me = this;

        me.sort('accCode', 'ASC');

        for (var i = 0; i < this.getCount(); i++) {
            var record = this.getAt(i);
            var cateId = record.get('accountCategoryId');
            var cateName = record.get('accountCategory');

            var collection = me.queryBy(function (r, id) {
                return r.get('accountCategoryId') == cateId;
            });

            var length = collection.getCount();
            var initData = me.initDataRecord(cateId, cateName);
            me.insert(i + length, me.newRecord(Ext.apply({
                accountCategoryId: 0,
                isNegative: cateName == 'Revenue'
            }, initData)));
            i += length;
        }

    },

    populateStore: function () {
        var me = this;

        me._calculating = true;

        me.budDetailStore.each(function (r, index) {
            var record = me.getByFscAccount(r.get('fscAccount'));
            if (!!record) {
                record.set('budget', me.decimal2(r.get('period' + me._periodTitle)));
            }
        });

        var mix = new WebLight.util.MixedCollection();

        me.appJDEGLTransactionStore.each(function (r) {
            var account = r.get('fscAccount');
            if (mix.indexOfKey(account) < 0)
                mix.add(account, []);

            mix.get(account).push(r.data);
        });

        mix.eachKey(function (key, item) {
            var record = me.getByFscAccount(key);
            if (!!record) {
                record.set('noChildren', false);
                record.set('subStore', item);

                var w1 = 0, w2 = 0, w3 = 0, w4 = 0;
                for (var i = 0; i < item.length; i++) {
                    w1 += item[i]['week1'];
                    w2 += item[i]['week2'];
                    w3 += item[i]['week3'];
                    w4 += item[i]['week4'];
                }

                record.set('week1', me.decimal2(w1));
                record.set('week2', me.decimal2(w2));
                record.set('week3', me.decimal2(w3));
                record.set('week4', me.decimal2(w4));

                record.set('currentActual', me.decimal2(w1) + me.decimal2(w2) + me.decimal2(w3) + me.decimal2(w4));
                record.set('periodProjection1', me.decimal2(w1) + me.decimal2(w2) + me.decimal2(w3) + me.decimal2(w4));
            }
        });

        var mix2 = new WebLight.util.MixedCollection();

        me.previousAppJDEGLTransactionStore.each(function (r) {
            var account = r.get('fscAccount');
            if (mix2.indexOfKey(account) < 0)
                mix2.add(account, []);

            mix2.get(account).push(r.data);
        });

        mix2.eachKey(function (key, item) {
            var record = me.getByFscAccount(key);
            if (!!record) {
                var total = 0;

                for (var i = 0; i < item.length; i++) {
                    total += (item[i]['week1'] + item[i]['week2'] + item[i]['week3'] + item[i]['week4']);
                }

                record.set('actual', me.decimal2(total));
            }
        });

        var mix3 = new WebLight.util.MixedCollection();

        me.nextAppJDEGLTransactionStore.each(function (r) {
            var account = r.get('fscAccount');
            if (mix3.indexOfKey(account) < 0)
                mix2mix3.add(account, []);

            mix3.get(account).push(r.data);
        });

        mix3.eachKey(function (key, item) {
            var record = me.getByFscAccount(key);
            if (!!record) {
                var total = 0;

                for (var i = 0; i < item.length; i++) {
                    total += (item[i]['week1'] + item[i]['week2'] + item[i]['week3'] + item[i]['week4']);
                }

                record.set('nextActual', me.decimal2(total));
                record.set('periodProjection2', me.decimal2(total));
            }
        });

        var currentPeriodId = Bud.Context.getStickyFscPeriod();

        var currentPeriod = me.fscPeriodStore.getById(currentPeriodId);


        var selectedPeriodTitle = parseInt(me._periodTitle);
        var nextPeriodTitle = selectedPeriodTitle + 1;
        if (selectedPeriodTitle == me.fscPeriodCount)
            nextPeriodTitle = 1;


        var dayOfToday = (new Date()).getDate();

        //console.log(me.fiscalPeriodCloseDays, currentPeriod.get('title'), selectedPeriodTitle, dayOfToday);

        if (!currentPeriod || parseInt(currentPeriod.get('title')) <= selectedPeriodTitle || parseInt(currentPeriod.get('title')) - 1 == selectedPeriodTitle && dayOfToday < me.fiscalPeriodCloseDays) {
            me.projectionStore.each(function (rec) {
                var record = me.getByFscAccount(rec.get('fscAccount'));
                if (!!record)
                    record.set('periodProjection1', rec.get('period' + selectedPeriodTitle));
            });
        }


        if (nextPeriodTitle == 1) {
            me.nextProjectionStore.each(function (rec) {
                var record = me.getByFscAccount(rec.get('fscAccount'));
                if (!!record)
                    record.set('periodProjection2', rec.get('period1'));
            });
        }
        else if (!currentPeriod || parseInt(currentPeriod.get('title')) <= nextPeriodTitle || parseInt(currentPeriod.get('title')) -1 == nextPeriodTitle && dayOfToday < me.fiscalPeriodCloseDays) {
            me.projectionStore.each(function (rec) {
                var record = me.getByFscAccount(rec.get('fscAccount'));
                if (!!record) {
                    record.set('periodProjection2', rec.get('period' + (parseInt(me._periodTitle) + 1)));
                }
            });
        }
        /*
        console.log(currentPeriod);


        if (parseInt(me._periodTitle) == me.fscPeriodCount) {
        me.projectionStore.each(function (rec) {
        var record = me.getByFscAccount(rec.get('fscAccount'));
        if (!!record)
        record.set('periodProjection1', rec.get('period' + me.fscPeriodCount));
        });
        me.nextProjectionStore.each(function (rec) {
        var record = me.getByFscAccount(rec.get('fscAccount'));
        if (!!record)
        record.set('periodProjection2', rec.get('period1'));
        });
        }
        else {
        me.projectionStore.each(function (rec) {
        var record = me.getByFscAccount(rec.get('fscAccount'));
        if (!!record) {
        record.set('periodProjection1', rec.get('period' + me._periodTitle));
        record.set('periodProjection2', rec.get('period' + (parseInt(me._periodTitle) + 1)));
        }
        });
        }*/

        me.each(function (rec) {
            if (!rec.get('week1') && !rec.get('week2')
                && !rec.get('week3') && !rec.get('week4') && !rec.get('budget')
                && !rec.get('periodProjection1') && !rec.get('periodProjection2'))
                me.remove(rec);
        });

        me.groupStore();

        me._calculating = false;
    },

    decimal2: function (v) {
        if (v && typeof v == 'number')
            return Math.round(v * 100) / 100;
        return v;
    },

    calculateStore: function () {
        var me = this;

        if (me._calculating || me._addingTotalRow)
            return;

        me._calculating = true;

        var i = 0, j = 0;

        var groups = me.queryBy(function (record) {
            return !record.get('accCode')
        });

        groups.each(function (rec) {
            var w1 = 0, w2 = 0, w3 = 0, w4 = 0, budget = 0, actual = 0, proj1 = 0, proj2 = 0;

            var cateId = rec.get('fscAccount');
            var groupRecords = me.queryBy(function (r) {
                return r.get('accountCategoryId') == cateId;
            });

            groupRecords.each(function (r) {
                var isNeg = r.get('isNegative') && !r.get('accCode');

                if (cateId == 0)
                //total row, flip again
                    isNeg = !isNeg;

                w1 += isNeg ? -r.get('week1') : r.get('week1');
                w2 += isNeg ? -r.get('week2') : r.get('week2');
                w3 += isNeg ? -r.get('week3') : r.get('week3');
                w4 += isNeg ? -r.get('week4') : r.get('week4');
                budget += isNeg ? -r.get('budget') : r.get('budget');
                actual += isNeg ? -r.get('actual') : r.get('actual');
                proj1 += isNeg ? -r.get('periodProjection1') : r.get('periodProjection1');
                proj2 += isNeg ? -r.get('periodProjection2') : r.get('periodProjection2');
            });

            rec.set('week1', me.decimal2(w1));
            rec.set('week2', me.decimal2(w2));
            rec.set('week3', me.decimal2(w3));
            rec.set('week4', me.decimal2(w4));
            rec.set('budget', me.decimal2(budget));
            rec.set('actual', me.decimal2(actual));
            rec.set('periodProjection1', me.decimal2(proj1));
            rec.set('periodProjection2', me.decimal2(proj2));
        });

        this.each(function (record) {

            //2011/07/01
            // Variance Totals should be calculated with the following formula
            //Actuals-Budget=Variance

            var total = record.get('week1') + record.get('week2') + record.get('week3') + record.get('week4');
            record.set('total', me.decimal2(total));
            var isNeg = record.get('isNegative') || record.get('fscAccount') == 0;
            var variance = (isNeg || record.get('title') == 'Revenue') ? (total - record.get('budget')) : (record.get('budget') - total);
            record.set('variance', me.decimal2(variance));
        });

        me._calculating = false;
    },

    getNextYear: function () {
        var me = this;

        var nextYear = 0;

        var curYearTitle = me.fscYearStore.getById(me.fscYear).get('title');
        var records = me.fscYearStore.queryBy(function (record) {
            return parseInt(record.get('title')) == parseInt(curYearTitle) + 1;
        });

        if (!!records.get(0))
            nextYear = records.get(0).get('id');

        return nextYear;
    },

    load: function (hcmHouseCode, hcmJob, fscYear, fscPeriod, periodTitle) {
        var me = this;

        if (me._loading)
            return;

        me.clearStore();

        me.hcmHouseCode = hcmHouseCode;
        me.hcmJob = hcmJob;
        me.fscYear = fscYear;
        me.fscPeriod = fscPeriod;

        me._loadedStoreCount = 0;
        me._periodTitle = periodTitle;

        me.budDetailStore.load(hcmHouseCode, hcmJob, fscYear);
        me.appJDEGLTransactionStore.load(hcmHouseCode, hcmJob, fscYear, fscPeriod, 0);
        me.previousAppJDEGLTransactionStore.load(hcmHouseCode, hcmJob, fscYear, fscPeriod, -1);

        me.projectionStore.load(hcmHouseCode, hcmJob, fscYear);

        if (parseInt(me._periodTitle) == me.fscPeriodCount) {
            var nextYear = me.getNextYear();
            me.nextProjectionStore.load(hcmHouseCode, hcmJob, nextYear);
        }

        var initData = me.initDataRecord(0, 'Total');
        me._totalRow = this.newRecord(initData);
    },

    initDataRecord: function (fscAccount, title) {
        var initData = {
            fscAccount: fscAccount,
            title: title,
            week1: 0,
            week2: 0,
            week3: 0,
            week4: 0,
            total: 0,
            budget: 0,
            variance: 0,
            actual: 0,
            nextActual: 0,
            currentActual: 0,
            periodProjection1: 0,
            periodProjection2: 0,
            noChildren: true
        };

        return initData;
    }

});

/// <reference path="../Core.js" />

Bud.data.BudProjectedDetailStore = WebLight.extend(Bud.data.XmlStore, {
    url: '/net/crothall/chimes/fin/bud/act/Provider.aspx',

    moduleId: 'bud',
    storeId: 'budProjectedDetails',

    _hcmHouseCode: 0,
    _fscYear: 0,
    _hcmJob: 0,

    constructor: function (config) {

        Bud.data.BudProjectedDetailStore.superclass.constructor.call(this, config);

        this.on({

            add: { fn: this.updateTotals },

            remove: { fn: this.updateTotals },

            update: { fn: this.updateTotals },

            datachanged: { fn: this.updateTotals }

        });

    },

    updateTotals: function () {
        var me = this;
        this.suspendEvents(false);

        this.resumeEvents();

        this.fireEvent('datarefresh', this);
    },

    getCriteria: function () {
        return { hcmHouseCode: this._hcmHouseCode, fscYear: this._fscYear, hcmJob: this._hcmJob };
    },

    addAttributes: function (data) {
        Ext.apply(data, { hcmHouseCode: this._hcmHouseCode, hcmJob: this._hcmJob, fscYear: this._fscYear });
    },

    load: function (hcmHouseCode, hcmJob, fscYear) {

        this._fscYear = fscYear;
        this._hcmHouseCode = hcmHouseCode;
        this._hcmJob = hcmJob;

        Bud.data.BudProjectedDetailStore.superclass.load.call(this);
    },

    getChangedRecords: function () {
        var records = [];
        var me = this;
        var recs = Bud.data.BudProjectedDetailStore.superclass.getChangedRecords.call(this);

        Ext.each(recs, function (rec, index) {
            if (!me.isEmptyRecord(rec))
                records.push(rec);
        });

        return records;
    },

    isEmptyRecord: function (rec) {
        var i;
        var isEmpty = true;
        for (i = 1; i < 14; i++) {
            isEmpty &= !rec.get(String.format('period{0}', i));
        }
        return isEmpty;
    },

    fields: [
        { name: 'id', mapping: '@id', type: 'float' },
        { name: 'hcmHouseCode', mapping: '@hcmHouseCode', type: 'float' },
        { name: 'hcmJob', mapping: '@hcmJob', type: 'float' },
        { name: 'fscYear', mapping: '@fscYear', type: 'float' },
        { name: 'fscPeriod', mapping: '@fscPeriod', type: 'float' },
        { name: 'fscAccount', mapping: '@fscAccount', type: 'float' },
        { name: 'modAt', mapping: '@modAt', type: 'date' },
        { name: 'modBy', mapping: '@modBy', type: 'string' },
        { name: 'period1', mapping: '@period1', type: 'float' },
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
        { name: 'total', type: 'float' }
    ]
});

/// <reference path="../Core.js" />

Bud.data.AppJDEGLTransactionDetailStore = WebLight.extend(Bud.data.XmlStore, {

    url: '/net/crothall/chimes/fin/glm/act/Provider.aspx',

    moduleId: 'glm',

    storeId: 'appJDEGLTransactionDetail2',

    _hcmHouseCode: 0,
    _hcmJob: 0,
    _fscYear: 0,
    _fscPeriod: 0,
    _fscAccount: 0,

    getCriteria: function () {
        return {
            hcmHouseCode: this._hcmHouseCode,
            hcmJob: this._hcmJob,
            fscYear: this._fscYear,
            fscPeriod: this._fscPeriod,
            fscAccount: this._fscAccount
        };
    },

    load: function (hcmHouseCode, hcmJob, fscYear, fscPeriod, fscAccount) {
        var me = this;

        this._hcmHouseCode = hcmHouseCode;
        this._hcmJob = hcmJob;
        this._fscYear = fscYear;
        this._fscPeriod = fscPeriod;
        this._fscAccount = fscAccount;

        Bud.data.AppJDEGLTransactionDetailStore.superclass.load.call(this);
    },

    fields: [
        { name: 'id', mapping: '@id', type: 'int' },
        { name: 'hcmHouseCode', mapping: '@hcmHouseCode', type: 'int' },
        { name: 'hcmJob', mapping: '@hcmJob', type: 'int' },
        { name: 'fscYear', mapping: '@fscYear', type: 'int' },
        { name: 'fscPeriod', mapping: '@fscPeriod', type: 'int' },
        { name: 'fscAccount', mapping: '@fscAccount', type: 'int' },
        { name: 'amount', mapping: '@amount', type: 'float' },
        { name: 'crtdAt', mapping: '@crtdAt', type: 'date' },
        { name: 'crtdBy', mapping: '@crtdBy' },
        { name: 'description', mapping: '@description' },
        { name: 'documentNo', mapping: '@documentNo' },
        { name: 'documentType', mapping: '@documentType' },
        { name: 'glDate', mapping: '@glDate', type: 'date' },
        { name: 'invoiceDate', mapping: '@invoiceDate', type: 'date' },
        { name: 'invoiceNo', mapping: '@invoiceNo' },
        { name: 'lineNumber', mapping: '@lineNumber' },
        { name: 'post', mapping: '@post' },
        { name: 'orderNumber', mapping: '@orderNumber' },
        { name: 'tableType', mapping: '@tableType' },
        { name: 'teamFinId', mapping: '@teamFinId' },
        { name: 'vendor', mapping: '@vendor' },
        { name: 'vendorNumber', mapping: '@vendorNumber' }
    ]

});


Bud.page.TransactionSummaryPage = WebLight.extend(WebLight.Page, {

    html: _builtInTemplate_d5e3e8d0[1],
    title: 'Transaction Summary',

    _accountStore: null,
    _houseCodeStore: null,
    _jobCodeStore: null,
    _fiscalYearStore: null,
    _fscPeriodStore: null,

    _houseCodeComboBox: null,
    _hcmJobComboBox: null,
    _fscYearComboBox: null,
    _fscPeriodComboBox: null,
    _loadButton: null,

    _loadCount: 0,
    _loadingData: false,

    _gridColumnModel: null,
    _gridGroupHeader: null,
    _transactionSummaryGrid: null,
    _transactionSummaryStore: null,

    _rowExpander: null,
    _currentHcmHouseCode: null,

    createBudgetFields: function () {
        var me = this;

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
        this._fscPeriodComboBox = new Bud.form.DropdownList({
            store: me._fscPeriodStore,
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
        this._fscPeriodComboBox.on('select', function (combo, record, index) {
            // Bud.Context.setStickyFiscalPeriod(record.get('id'), record.get('title'));
        });

        this._houseCodeComboBox.on('blur', function (combo) {
            if (me._currentHcmHouseCode != combo.getValue()) {
                me._currentHcmHouseCode = combo.getValue();
                var record = me._houseCodeStore.getById(me._currentHcmHouseCode);
                Bud.Context.setStickyHouseCode(record.get('appUnit'), record.get('id'), record.get('name'), record.get('brief'), record.get('hirNode'));
                me._jobCodeStore.load(me._currentHcmHouseCode);
            }
        });

        this._fscYearComboBox.on('valuechange', function (v, t) {
            me._fscPeriodStore.removeAll();
            me._fscPeriodComboBox.setValue('');
            me._fscPeriodStore.load(v);
        });


        this._loadButton = new Ext.Button({
            text: ' Load Data ',
            width: 100,
            disabled: true,
            ctCls: 'ux-button-1',
            handler: function () {
                me.loadGridStore();
            }
        });

        this.addChildControl(this._houseCodeComboBox, 'house-code-holder');
        this.addChildControl(this._hcmJobComboBox, 'job-code-holder');
        this.addChildControl(this._fscYearComboBox, 'fiscal-year-holder');
        this.addChildControl(this._fscPeriodComboBox, 'period-holder');
        this.addChildControl(this._loadButton, 'load-button-holder');
    },

    loadGridStore: function () {
        var me = this;

        me.getEl().mask('Loading...');
        this._loadingData = true;

        var houseCode = this._houseCodeComboBox.getValue();
        var jobCode = this._hcmJobComboBox.getValue();
        var fscYear = this._fscYearComboBox.getValue();
        var fscPeriod = this._fscPeriodComboBox.getValue();
        var fscPeriodTitle = this._fscPeriodComboBox.getRawValue();

        this.refreshColumnModel();
        this.ensureGridCreated();

        var weeksHeader = this.getWeeksTitle();
        $('div.x-grid3-hd-inner:contains("Weeks")').text(weeksHeader);

        this._transactionSummaryStore.on('load', function (store) {
            //if (me._transactionSummaryGrid.getColumnModel().isHidden(1))
            //    me._transactionSummaryGrid.getColumnModel().setHidden(1, false);
            me._transactionSummaryGrid.getView().refresh();
            me.getEl().unmask();
            me._loadingData = false;
        });
        this._transactionSummaryStore.load(houseCode, jobCode, fscYear, fscPeriod, fscPeriodTitle);
    },

    getWeeksTitle: function () {
        var rec = this._fscPeriodStore.getById(this._fscPeriodComboBox.getValue());
        if (rec) {
            var startDate = Ext.util.Format.date(rec.get('startDate'), 'm/d');
            var endDate = Ext.util.Format.date(rec.get('endDate'), 'm/d');
            return 'Weeks:(' + startDate + ' - ' + endDate + ')';
        }
    },

    customRenderer: function (value, meta, record, rowIndex, colIndex, store) {
        var css = [];
        switch (typeof value) {
            case 'string':
                if (!record.get('accCode'))
                    css.push('text-align:right;');
                else
                    css.push('text-align:left;');
                break;
            case 'number':
                css.push('text-align:right;');
                break;
        }

        if (!record.get('accCode'))
            css.push('font-weight:bold;');

        if (colIndex == 9) {
            if (value > 0)
                css.push('color:#5B8E44;');
            else if (value < 0)
                css.push('color:#FF0000;');
        }

        meta.attr = 'style="' + css.join('') + '"';

        if (Ext.isNumber(value))
            return Ext.util.Format.number(value, '0,000.00');

        return value;
    },

    refreshColumnModel: function () {
        var me = this;

        this._rowExpander = new Ext.grid.RowExpander({
            tpl: '<div class="ux-row-expander-box"></div>',
            actAsTree: true,
            treeLeafProperty: 'noChildren',
            listeners: {
                expand: function (expander, record, body, rowIndex) {
                    var data = record.get('subStore');
                    var element = Ext.get(this.grid.getView().getRow(rowIndex)).child('.ux-row-expander-box');

                    if (data && data.length > 0)
                        me.createSubGrid(data, element);
                }
            }
        });

        var period = parseInt(this._fscPeriodComboBox.getRawValue());

        var weeksHeader = this.getWeeksTitle();
        var hideWeekColumns = false;

        if (me._fscPeriodStore.totalLength == 12)
            hideWeekColumns = true;

        this._gridGroupHeader = new Ext.ux.grid.ColumnHeaderGroup({
            rows: [[
                { header: '', colspan: 3 },
                { header: weeksHeader, colspan: 4, align: 'center' },
                { header: '', colspan: 3 },
                { header: 'Previous Period', align: 'center' },
                { header: 'Period Projections', colspan: 2, align: 'center' }
            ]]
        });

        var columns = [
            this._rowExpander,
            { header: 'Item(s)', dataIndex: 'title', width: 250 },
            { header: 'Code', dataIndex: 'accCode', width: 60 },
           { header: 'Week 1', dataIndex: 'week1', hidden: hideWeekColumns },
            { header: 'Week 2', dataIndex: 'week2', hidden: hideWeekColumns },
            { header: 'Week 3', dataIndex: 'week3', hidden: hideWeekColumns },
            { header: 'Week 4', dataIndex: 'week4', hidden: hideWeekColumns },
            { header: 'Total', dataIndex: 'total' },
            { header: 'Budget', dataIndex: 'budget' },
            { header: 'Variance', dataIndex: 'variance' },
            { header: 'Actual', dataIndex: 'actual' }
        ];

        columns.push({ header: period, dataIndex: 'periodProjection1' },
                { header: (period == me._fscPeriodStore.getCount()) ? 1 : (period + 1), dataIndex: 'periodProjection2' });

        if (this._gridColumnModel)
            this._gridColumnModel.setConfig(columns);
        else {
            this._gridColumnModel = new Ext.grid.ColumnModel({
                defaults: { sortable: false, align: 'center', renderer: me.customRenderer },
                columns: columns
            });
        }
    },

    ensureGridCreated: function () {
        if (!this._transactionSummaryGrid)
            this.createTransactionSummaryGrid();
    },

    _detailGrid: null,
    _detailStore: null,
    _detailWin: null,
    createDetailGrid: function () {
        var me = this;

        var tipRenderer = function (value, metadata, record, rowIndex, columnIndex, store) {
            metadata.attr = 'ext:qtip="' + value + '"';
            return value;
        }

        this._detailGrid = new Bud.grid.GridPanel({
            border: false,
            header: false, height: 400,
            enableHdMenu: false, hideHeaders: false,
            stripeRows: true,
            height: 380,
            loadMask: true,
            cm: new Ext.grid.ColumnModel({
                defaults: { sortable: false, width: 60, align: 'center', renderer: tipRenderer },
                columns: [
                        { header: 'GL Ticket<br />Date', dataIndex: 'glDate', renderer: Ext.util.Format.dateRenderer('m/d/y'), width: 60 },
                        { header: 'Document<br />Number', dataIndex: 'documentNo', width: 70 },
                        { header: 'Invoice<br />Number', dataIndex: 'invoiceNo', width: 80 },
                        { header: 'Invoice<br />Date', dataIndex: 'invoiceDate', renderer: Ext.util.Format.dateRenderer('m/d/y'), width: 60 },
                        { header: 'PO Number', dataIndex: 'orderNumber', width: 150 },
                        { header: '&nbsp;<br />Vendor', dataIndex: 'vendor', width: 100 },
                        { header: '&nbsp;<br />Description', dataIndex: 'description', width: 100 },
                        { header: '&nbsp;<br />Amount', dataIndex: 'amount' },
                        { header: 'Document<br />Type', dataIndex: 'documentType' },
                        { header: 'Import<br />Date', dataIndex: 'crtdAt', renderer: Ext.util.Format.dateRenderer('m/d/y') }
                    ]
            }),
            store: this._detailStore
        });
    },

    /*
    Create a pop up window with a grid,
    the store includes records
    which are related to the selected item in drilldown.
    */
    PopupSubGridRowDetail: function (record) {
        var me = this;
        this.__record = record;

        var reload = function () {
            var hcmHouseCode = me.__record.get('hcmHouseCode');
            var hcmJob = me.__record.get('hcmJob');
            var fscYear = me.__record.get('fscYear');
            var fscPeriod = me.__record.get('fscPeriod');
            var fscAccount = me.__record.get('fscAccount');

            me._detailStore.removeAll();
            me._detailStore.load(hcmHouseCode, hcmJob, fscYear, fscPeriod, fscAccount);
        }

        if (!this._detailWin) {
            this.createDetailGrid();

            this._detailWin = new Ext.Window({
                modal: true,
                width: 850,
                closeAction: 'hide',
                items: [this._detailGrid]
            });
            this._detailWin.on('show', function () {
                reload();
            });
        }

        this._detailWin.show();
    },

    createSubGrid: function (data, element) {
        var me = this;

        var groupedData = [];

        var getGroupedItem = function (ii) {
            var item = null;
            Ext.each(groupedData, function (i) {
                if (i.vendor == ii.vendor) {
                    item = i;
                    return false;
                }
            });

            if (null == item) {
                item = Ext.applyIf({ week1: 0, week2: 0, week3: 0, week4: 0, total: 0 }, ii);
                groupedData.push(item);
            }
            return item;
        };

        var applyData = function (item1, item2) {
            item1.id = item2.id;
            item1.week1 += parseFloat(item2.week1) || 0;
            item1.week2 += parseFloat(item2.week2) || 0;
            item1.week3 += parseFloat(item2.week3) || 0;
            item1.week4 += parseFloat(item2.week4) || 0;
            item1.total = item1.week1 + item1.week2 + item1.week3 + item1.week4;
        };

        Ext.each(data, function (item, index) {
            var groupItem = getGroupedItem(item);
            applyData(groupItem, item);
        });

        var store = new Bud.data.AppJDEGLTransactionStore();
        //      
        Ext.each(groupedData, function (item, index) {
            store.add(store.newRecord(item));
        });

        store.sort([
            { field: 'vendor', direction: 'ASC' },
            { field: 'week1', direction: 'ASC' },
            { field: 'week2', direction: 'ASC' },
            { field: 'week3', direction: 'ASC' },
            { field: 'week4', direction: 'ASC' }
        ]);

        var expander = new Ext.grid.RowExpander({ alwaysAsLeaf: true, actAsTree: true });

        var columns = [expander,
                { dataIndex: 'vendor', width: 285 },
                { dataIndex: 'week1' },
                { dataIndex: 'week2' },
                { dataIndex: 'week3' },
                { dataIndex: 'week4' }
			];

        var fscYear = this._fscYearComboBox.getValue();
        if (fscYear >= 4)
            columns = [expander,
                { dataIndex: 'vendor', width: 285 },
                { dataIndex: 'total'}];


        var colModel = new Ext.grid.ColumnModel({
            defaults: { sortable: false, align: 'right',
                renderer: function (v) {
                    if (Ext.isNumber(v))
                        return Ext.util.Format.number(v, '0,000.00');
                    return v;
                }
            },
            columns: columns
        });

        var grid = new WebLight.grid.GridPanel({
            style: 'margin:5px 0', autoHeight: true,
            plugins: expander,
            disableSelection: true,
            stripeRows: true,

            enableHdMenu: false,
            border: false,
            header: false,
            cm: colModel,
            store: store
        });

        grid.on('rowdblclick', function (g, rowIndex, e) {
            me.PopupSubGridRowDetail(g.getStore().getAt(rowIndex));
        });

        element && grid.render(element);

        return grid;
    },

    createTransactionSummaryGrid: function () {
        var me = this;

        this.refreshColumnModel();

        this._transactionSummaryGrid = new WebLight.grid.GridPanel({
            enableHdMenu: false, height: 400,

            ctCls: 'ux-grid-1',
            cm: this._gridColumnModel,
            plugins: [this._gridGroupHeader, this._rowExpander],
            store: this._transactionSummaryStore
        });

        this.addChildControl(this._transactionSummaryGrid, 'transaction-summary-grid');

        //me._transactionSummaryGrid.getColumnModel().setHidden(1, true);
    },

    createChildControls: function () {
        var me = this;

        this._houseCodeStore = new Bud.data.HouseCodeStore();
        this._jobCodeStore = new Bud.data.JobCodeStore();
        this._fiscalYearStore = new Bud.data.FiscalYearStore();
        this._fscPeriodStore = new Bud.data.FiscalPeriodStore();

        this._accountStore = new Bud.data.BudgetAccountStore();
        this._detailStore = new Bud.data.AppJDEGLTransactionDetailStore();


        this._transactionSummaryStore = new Bud.data.TransactionSummaryStore({
            fscAccountStore: this._accountStore,
            fscYearStore: this._fiscalYearStore,
            fscPeriodStore: this._fscPeriodStore
        });
        this.createBudgetFields();

        Bud.page.TransactionSummaryPage.superclass.createChildControls.call(this);
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

        this._houseCodeStore.on('load', function (store, records, options) {
            if (records.length > 0) {
                var hcmHouseCode;
                //me._houseCodeComboBox.setValue(records[0].get('id'));
                if (Bud.Context.getStickyHcmHouseCode() != 0) {
                    me._houseCodeComboBox.setValue(Bud.Context.getStickyHcmHouseCode());
                    hcmHouseCode = Bud.Context.getStickyHcmHouseCode();
                }
                else {
                    me._houseCodeComboBox.setValue(records[0].get('id'));
                    hcmHouseCode = records[0].get('id');
                }
                me._jobCodeStore.load(hcmHouseCode);
            }
            else
                me._houseCodeComboBox.setValue('');
            me._loadCount++;
        });

        me._fscPeriodStore.on('load', function (store, records, options) {
            if (records.length > 0) {
                var currentPeriods = me._fscPeriodStore.queryBy(function (r) {
                    var today = new Date();
                    return r.get('startDate') <= today && r.get('endDate') >= today;
                });

                if (currentPeriods.getCount() > 0)
                    me._fscPeriodComboBox.setValue(currentPeriods.get(0).get('id'));
                else
                    me._fscPeriodComboBox.setValue(records[0].get('id'));
                //                if (parent && parent.fin && parent.fin.appUI && parent.fin.appUI.glbFscPeriod != 0) {
                //                    me._fscPeriodComboBox.setValue(parent.fin.appUI.glbFscPeriod);
                //                }
                //                else {

                //}
            }
            else
                me._fscPeriodComboBox.setValue('');

            me._transactionSummaryStore.fscPeriodCount = records.length;
            console.log(records.length);
            me._loadCount++;
            me.enableLoadButton();
        });

        this._fiscalYearStore.on('load', function (store, records, options) {
            if (records.length > 0) {
                if (parent && parent.fin && parent.fin.appUI && parent.fin.appUI.glbFscYear != 0) {
                    me._fscYearComboBox.setValue(parent.fin.appUI.glbFscYear);
                    me._fscPeriodStore.load(parent.fin.appUI.glbFscYear);
                }
                else {
                    me._fscYearComboBox.setValue(records[0].get('id'));
                    me._fscPeriodStore.load(records[0].get('id'));
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

        Bud.page.TransactionSummaryPage.superclass.dataBind.call(this);
    },

    enableLoadButton: function () {
        var me = this;

        if (this._loadCount == 6) {
            this.getEl().unmask();
            this._loadButton.enable();
            this.ensureGridCreated();
        }
    }

});

WebLight.PageMgr.registerType('transactionsummary', Bud.page.TransactionSummaryPage);


