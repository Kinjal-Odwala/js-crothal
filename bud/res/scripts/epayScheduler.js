_builtInTemplate_029d88e0 = [''];/*!
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



/*!
* Ext JS Library 3.1.1
* Copyright(c) 2006-2010 Ext JS, LLC
* licensing@extjs.com
* http://www.extjs.com/license
*/
/**
* @class Ext.form.Spinner
* @extends Ext.util.Observable
* Creates a Spinner control utilized by Ext.ux.form.SpinnerField
*/
Ext.form.Spinner = Ext.extend(Ext.util.Observable, {
    incrementValue: 1,
    alternateIncrementValue: 5,
    triggerClass: 'x-form-spinner-trigger',
    splitterClass: 'x-form-spinner-splitter',
    alternateKey: Ext.EventObject.shiftKey,
    defaultValue: 0,
    accelerate: false,

    constructor: function(config) {
        Ext.form.Spinner.superclass.constructor.call(this, config);
        Ext.apply(this, config);
        this.mimicing = false;
    },

    init: function(field) {
        this.field = field;

        field.afterMethod('onRender', this.doRender, this);
        field.afterMethod('onEnable', this.doEnable, this);
        field.afterMethod('onDisable', this.doDisable, this);
        field.afterMethod('afterRender', this.doAfterRender, this);
        field.afterMethod('onResize', this.doResize, this);
        field.afterMethod('onFocus', this.doFocus, this);
        field.beforeMethod('onDestroy', this.doDestroy, this);
    },

    doRender: function(ct, position) {
        var el = this.el = this.field.getEl();
        var f = this.field;

        if (!f.wrap) {
            f.wrap = this.wrap = el.wrap({
                cls: "x-form-field-wrap"
            });
        }
        else {
            this.wrap = f.wrap.addClass('x-form-field-wrap');
        }

        this.trigger = this.wrap.createChild({
            tag: "img",
            src: Ext.BLANK_IMAGE_URL,
            cls: "x-form-trigger " + this.triggerClass
        });

        if (!f.width) {
            this.wrap.setWidth(el.getWidth() + this.trigger.getWidth());
        }

        this.splitter = this.wrap.createChild({
            tag: 'div',
            cls: this.splitterClass,
            style: 'width:13px; height:2px;'
        });
        this.splitter.setRight((Ext.isIE) ? 1 : 2).setTop(10).show();

        this.proxy = this.trigger.createProxy('', this.splitter, true);
        this.proxy.addClass("x-form-spinner-proxy");
        this.proxy.setStyle('left', '0px');
        this.proxy.setSize(14, 1);
        this.proxy.hide();
        this.dd = new Ext.dd.DDProxy(this.splitter.dom.id, "SpinnerDrag", {
            dragElId: this.proxy.id
        });

        this.initTrigger();
        this.initSpinner();
    },

    doAfterRender: function() {
        var y;
        if (Ext.isIE && this.el.getY() != (y = this.trigger.getY())) {
            this.el.position();
            this.el.setY(y);
        }
    },

    doEnable: function() {
        if (this.wrap) {
            this.wrap.removeClass(this.field.disabledClass);
        }
    },

    doDisable: function() {
        if (this.wrap) {
            this.wrap.addClass(this.field.disabledClass);
            this.el.removeClass(this.field.disabledClass);
        }
    },

    doResize: function(w, h) {
        if (typeof w == 'number') {
            this.el.setWidth(w - this.trigger.getWidth());
        }
        this.wrap.setWidth(this.el.getWidth() + this.trigger.getWidth());
    },

    doFocus: function() {
        if (!this.mimicing) {
            this.wrap.addClass('x-trigger-wrap-focus');
            this.mimicing = true;
            Ext.get(Ext.isIE ? document.body : document).on("mousedown", this.mimicBlur, this, {
                delay: 10
            });
            this.el.on('keydown', this.checkTab, this);
        }
    },

    // private
    checkTab: function(e) {
        if (e.getKey() == e.TAB) {
            this.triggerBlur();
        }
    },

    // private
    mimicBlur: function(e) {
        if (!this.wrap.contains(e.target) && this.field.validateBlur(e)) {
            this.triggerBlur();
        }
    },

    // private
    triggerBlur: function() {
        this.mimicing = false;
        Ext.get(Ext.isIE ? document.body : document).un("mousedown", this.mimicBlur, this);
        this.el.un("keydown", this.checkTab, this);
        this.field.beforeBlur();
        this.wrap.removeClass('x-trigger-wrap-focus');
        this.field.onBlur.call(this.field);
    },

    initTrigger: function() {
        this.trigger.addClassOnOver('x-form-trigger-over');
        this.trigger.addClassOnClick('x-form-trigger-click');
    },

    initSpinner: function() {
        this.field.addEvents({
            'spin': true,
            'spinup': true,
            'spindown': true
        });

        this.keyNav = new Ext.KeyNav(this.el, {
            "up": function(e) {
                e.preventDefault();
                this.onSpinUp();
            },

            "down": function(e) {
                e.preventDefault();
                this.onSpinDown();
            },

            "pageUp": function(e) {
                e.preventDefault();
                this.onSpinUpAlternate();
            },

            "pageDown": function(e) {
                e.preventDefault();
                this.onSpinDownAlternate();
            },

            scope: this
        });

        this.repeater = new Ext.util.ClickRepeater(this.trigger, {
            accelerate: this.accelerate
        });
        this.field.mon(this.repeater, "click", this.onTriggerClick, this, {
            preventDefault: true
        });

        this.field.mon(this.trigger, {
            mouseover: this.onMouseOver,
            mouseout: this.onMouseOut,
            mousemove: this.onMouseMove,
            mousedown: this.onMouseDown,
            mouseup: this.onMouseUp,
            scope: this,
            preventDefault: true
        });

        this.field.mon(this.wrap, "mousewheel", this.handleMouseWheel, this);

        this.dd.setXConstraint(0, 0, 10)
        this.dd.setYConstraint(1500, 1500, 10);
        this.dd.endDrag = this.endDrag.createDelegate(this);
        this.dd.startDrag = this.startDrag.createDelegate(this);
        this.dd.onDrag = this.onDrag.createDelegate(this);
    },

    onMouseOver: function() {
        if (this.disabled) {
            return;
        }
        var middle = this.getMiddle();
        this.tmpHoverClass = (Ext.EventObject.getPageY() < middle) ? 'x-form-spinner-overup' : 'x-form-spinner-overdown';
        this.trigger.addClass(this.tmpHoverClass);
    },

    //private
    onMouseOut: function() {
        this.trigger.removeClass(this.tmpHoverClass);
    },

    //private
    onMouseMove: function() {
        if (this.disabled) {
            return;
        }
        var middle = this.getMiddle();
        if (((Ext.EventObject.getPageY() > middle) && this.tmpHoverClass == "x-form-spinner-overup") ||
        ((Ext.EventObject.getPageY() < middle) && this.tmpHoverClass == "x-form-spinner-overdown")) {
        }
    },

    //private
    onMouseDown: function() {
        if (this.disabled) {
            return;
        }
        var middle = this.getMiddle();
        this.tmpClickClass = (Ext.EventObject.getPageY() < middle) ? 'x-form-spinner-clickup' : 'x-form-spinner-clickdown';
        this.trigger.addClass(this.tmpClickClass);
    },

    //private
    onMouseUp: function() {
        this.trigger.removeClass(this.tmpClickClass);
    },

    //private
    onTriggerClick: function() {
        if (this.disabled || this.el.dom.readOnly) {
            return;
        }
        var middle = this.getMiddle();
        var ud = (Ext.EventObject.getPageY() < middle) ? 'Up' : 'Down';
        this['onSpin' + ud]();
    },

    //private
    getMiddle: function() {
        var t = this.trigger.getTop();
        var h = this.trigger.getHeight();
        var middle = t + (h / 2);
        return middle;
    },

    //private
    //checks if control is allowed to spin
    isSpinnable: function() {
        if (this.disabled || this.el.dom.readOnly) {
            Ext.EventObject.preventDefault(); //prevent scrolling when disabled/readonly
            return false;
        }
        return true;
    },

    handleMouseWheel: function(e) {
        //disable scrolling when not focused
        if (this.wrap.hasClass('x-trigger-wrap-focus') == false) {
            return;
        }

        var delta = e.getWheelDelta();
        if (delta > 0) {
            this.onSpinUp();
            e.stopEvent();
        }
        else
            if (delta < 0) {
            this.onSpinDown();
            e.stopEvent();
        }
    },

    //private
    startDrag: function() {
        this.proxy.show();
        this._previousY = Ext.fly(this.dd.getDragEl()).getTop();
    },

    //private
    endDrag: function() {
        this.proxy.hide();
    },

    //private
    onDrag: function() {
        if (this.disabled) {
            return;
        }
        var y = Ext.fly(this.dd.getDragEl()).getTop();
        var ud = '';

        if (this._previousY > y) {
            ud = 'Up';
        } //up
        if (this._previousY < y) {
            ud = 'Down';
        } //down
        if (ud != '') {
            this['onSpin' + ud]();
        }

        this._previousY = y;
    },

    //private
    onSpinUp: function() {
        if (this.isSpinnable() == false) {
            return;
        }
        if (Ext.EventObject.shiftKey == true) {
            this.onSpinUpAlternate();
            return;
        }
        else {
            this.spin(false, false);
        }
        this.field.fireEvent("spin", this);
        this.field.fireEvent("spinup", this);
    },

    //private
    onSpinDown: function() {
        if (this.isSpinnable() == false) {
            return;
        }
        if (Ext.EventObject.shiftKey == true) {
            this.onSpinDownAlternate();
            return;
        }
        else {
            this.spin(true, false);
        }
        this.field.fireEvent("spin", this);
        this.field.fireEvent("spindown", this);
    },

    //private
    onSpinUpAlternate: function() {
        if (this.isSpinnable() == false) {
            return;
        }
        this.spin(false, true);
        this.field.fireEvent("spin", this);
        this.field.fireEvent("spinup", this);
    },

    //private
    onSpinDownAlternate: function() {
        if (this.isSpinnable() == false) {
            return;
        }
        this.spin(true, true);
        this.field.fireEvent("spin", this);
        this.field.fireEvent("spindown", this);
    },

    spin: function(down, alternate) {
        var v = parseFloat(this.field.getValue());
        var incr = (alternate == true) ? this.alternateIncrementValue : this.incrementValue;
        (down == true) ? v -= incr : v += incr;

        v = (isNaN(v)) ? this.defaultValue : v;
        v = this.fixBoundries(v);
        this.field.setRawValue(v);
    },

    fixBoundries: function(value) {
        var v = value;

        if (this.field.minValue != undefined && v < this.field.minValue) {
            v = this.field.minValue;
        }
        if (this.field.maxValue != undefined && v > this.field.maxValue) {
            v = this.field.maxValue;
        }

        return this.fixPrecision(v);
    },

    // private
    fixPrecision: function(value) {
        var nan = isNaN(value);
        if (!this.field.allowDecimals || this.field.decimalPrecision == -1 || nan || !value) {
            return nan ? '' : value;
        }
        return parseFloat(parseFloat(value).toFixed(this.field.decimalPrecision));
    },

    doDestroy: function() {
        if (this.trigger) {
            this.trigger.remove();
        }
        if (this.wrap) {
            this.wrap.remove();
            delete this.field.wrap;
        }

        if (this.splitter) {
            this.splitter.remove();
        }

        if (this.dd) {
            this.dd.unreg();
            this.dd = null;
        }

        if (this.proxy) {
            this.proxy.remove();
        }

        if (this.repeater) {
            this.repeater.purgeListeners();
        }
    }
});





/*!
* Ext JS Library 3.1.1
* Copyright(c) 2006-2010 Ext JS, LLC
* licensing@extjs.com
* http://www.extjs.com/license
*/

/**
* @class Ext.ux.form.SpinnerField
* @extends Ext.form.NumberField
* Creates a field utilizing Ext.form.Spinner
* @xtype spinnerfield
*/
Ext.form.SpinnerField = Ext.extend(Ext.form.NumberField, {
    actionMode: 'wrap',
    deferHeight: true,
    autoSize: Ext.emptyFn,
    onBlur: Ext.emptyFn,
    adjustSize: Ext.BoxComponent.prototype.adjustSize,

    constructor: function(config) {
        var spinnerConfig = Ext.copyTo({}, config, 'incrementValue,alternateIncrementValue,accelerate,defaultValue,triggerClass,splitterClass');

        var spl = this.spinner = new Ext.form.Spinner(spinnerConfig);

        var plugins = config.plugins
			? (Ext.isArray(config.plugins)
				? config.plugins.push(spl)
				: [config.plugins, spl])
			: spl;

        Ext.form.SpinnerField.superclass.constructor.call(this, Ext.apply(config, { plugins: plugins }));
    },

    // private
    getResizeEl: function() {
        return this.wrap;
    },

    // private
    getPositionEl: function() {
        return this.wrap;
    },

    // private
    alignErrorIcon: function() {
        if (this.wrap) {
            this.errorIcon.alignTo(this.wrap, 'tl-tr', [2, 0]);
        }
    },

    validateBlur: function() {
        return true;
    }
});

Ext.reg('spinnerfield', Ext.form.SpinnerField);


/// <reference path="../../jquery/jquery-1.4.1.js" />
/// <reference path="../../extjs/ext-jquery-adapter.js" />
/// <reference path="../../extjs/ext-all.js" />
/// <reference path="../Sm.js" />

// Add the additional 'advanced' VTypes
Ext.apply(Ext.form.VTypes, {
    daterange: function(val, field) {
        var date = field.parseDate(val);

        if (!date) {
            return;
        }
        if (field.startDateField && (!field.dateRangeMax || (date.getTime() != field.dateRangeMax.getTime()))) {
            var start = Ext.getCmp(field.startDateField);
            start.setMaxValue(date);
            start.validate();
            field.dateRangeMax = date;
        }
        else if (field.endDateField && (!field.dateRangeMin || (date.getTime() != field.dateRangeMin.getTime()))) {
            var end = Ext.getCmp(field.endDateField);
            end.setMinValue(date);
            end.validate();
            field.dateRangeMin = date;
        }
        /*
        * Always return true since we're only using this vtype to set the
        * min/max allowed values (these are tested for after the vtype test)
        */
        return true;
    }
});

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

/// <reference path="../references/jquery-1.4.1.js" />
/// <reference path="../references/weblight4extjs.js" />


jQuery.ajaxSettings.contentType = 'application/x-www-form-urlencoded; charset=utf-8';

WebLight.namespace('Bud', 'Bud.form', 'Bud.page', 'Bud.grid');

Bud.Context = {
    userId: document.location.host == 'localhost' || document.location.host.substr(0, 10) == 'persistech' ? 'RAYMOND-DEV-XP\\Raymond+Liu' : '[user]'
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



Bud.grid.EditorGridPanel = Ext.extend(Ext.grid.EditorGridPanel, {

    lastSelectedCell: null,

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
                    delete ed.selectSameEditor;
                }).defer(50);
            }
        }
    }
});




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
    xtype: 'annualprojectionsbyperiod'
});
WebLight.Router.mapRoute('^projection/worforecast$', {
    xtype: 'worforecast'
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

/// <reference path="../Core.js" />

WebLight.namespace('Bud.data');

Bud.data.XmlStore = WebLight.extend(WebLight.data.Store, {

    /// default api url
    url: '/net/crothall/chimes/fin/bud/act/Provider.aspx',

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
            reader = new Ext.data.XmlReader({ record: 'item', idProperty: idProperty }, fields);
            config.reader = reader;
            this.reader = reader;
        }

        Bud.data.XmlStore.superclass.constructor.call(this, config);

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

        Ext.each(this.getChangedRecords(), function (item, index) {
            xml.push('<');
            xml.push(current.getStoreId().replace(/s$/, ''));
            current.addAttributes(item.data);
            for (key in item.data)
                xml.push(String.format(' {0}="{1}"', key, Ext.isDate(item.data[key]) ? Ext.util.Format.date(item.data[key], 'm/d/Y') : item.data[key]));

            xml.push('/>');
        }, this);

        xml.push('</transaction>');

        var postData = String.format('moduleId={0}&requestId={1}&requestXml={2}&&targetId=iiTransaction',
            this.moduleId, this.requestId, encodeURIComponent(xml.join('').replace(/\&/gi, '&amp;')));

        jQuery.post(this.url, postData, function (data, status) {
            if (callback)
                callback(data, status);
            current.fireEvent('submit');
        });
    }
});

Bud.data.XmlStore._requestId = 2;

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

Bud.EpayScheduleNavBar = Ext.extend(Ext.Toolbar, {
    initComponent: function () {
        var menuItems = [];

        menuItems.push(new Bud.NavbarItem({
            text: 'Upload Sites',
            pattern: 'epaySchedule/uploadsites',
            url: '/epaySchedule/uploadsites'
        }));
        
        this.items = menuItems;
        this.menuItems = menuItems;

        Bud.EpayScheduleNavBar.superclass.initComponent.call(this);

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

/// <reference path="../Core.js" />

WebLight.namespace('Bud.data');

Bud.data.BudSystemVariableStore = WebLight.extend(Bud.data.XmlStore, {
    url: '/net/crothall/chimes/fin/bud/act/Provider.aspx',

    moduleId: 'bud',

    storeId: 'budSystemVariables',

    _variableName: '',

    getCriteria: function () {
        return { variableName: this._variableName };
    },

    addAttributes: function (data) {
        Ext.apply(data, { variableName: this._variableName });
    },

    load: function (variableName) {
        this._variableName = variableName;

        Bud.data.BudSystemVariableStore.superclass.load.call(this);
    },

    fields: [
        { name: 'id', mapping: '@id', type: 'float' },
        { name: 'variableName', mapping: '@variableName', type: 'string' },
        { name: 'variableValue', mapping: '@variableValue', type: 'string' }
    ]

});

Bud.data.EpayScheduleStore = WebLight.extend(Bud.data.XmlStore, {

    _budSystemVariableStore: null,

    _loading: false,
    _calculating: false,
    _loadedStoreCount: 0,

    scheduleName: '',

    constructor: function (config) {
        var me = this;

        var fields = [];
        fields.push(
            { name: 'id', type: 'int' },
            { name: 'scheduleType', type: 'int' },
            { name: 'oneTimeOccurrenceDate', type: 'date' },
            { name: 'startDate', type: 'date' },
            { name: 'endDate', type: 'date' },
            { name: 'interval', type: 'int' },
            { name: 'weekDays', type: 'auto' },
            { name: 'dailyTime', type: 'auto' },
            { name: 'scheduleTime', type: 'int' }
        );

        config = Ext.apply(config || {}, { record: 'item',
            idProperty: '@id',
            fields: fields
        });

        Bud.data.EpayScheduleStore.superclass.constructor.call(this, config);

        me._budSystemVariableStore = new Bud.data.BudSystemVariableStore();
        me._budSystemVariableStore.on('load', me.subStoreLoaded.createDelegate(this));
    },

    subStoreLoaded: function () {
        var me = this;

        me._loadedStoreCount += 1;

        if (me._loadedStoreCount == 1) {
            me._loading = false;
            me.suspendEvents(false);

            me.populateStore();

            me.resumeEvents();

            me.fireEvent('load', me);
        }
    },

    load: function () {
        var me = this;

        if (me._loading)
            return;

        me._budSystemVariableStore.load(me.scheduleName);
    },

    populateStore: function () {
        var me = this;

        me._calculating = true;

        me.remove(me.getRange());
        if (me._budSystemVariableStore.getCount() == 0)
            return;

        var record = me._budSystemVariableStore.getAt(0);
        if (!record)
            return;

        //var data = "1;01/21/2011;02/01/2011;3;8,18,22";
        //var data = "2;01/21/2011;02/01/2011;2;1,2,3,4,5,6,7;16";

        var data = record.get('variableValue');
        if (!data)
            return;

        var rec = {};
        var i = 0;

        var values = data.split(';');
        var count = values.length;

        rec['scheduleType'] = parseInt(values[0]);
        switch (values[0]) {
            case '1':
                rec['startDate'] = new Date(values[1]);
                rec['endDate'] = new Date(values[2]);
                rec['interval'] = parseInt(values[3]);
                rec['dailyTime'] = !!values[4] ? values[4].split(',') : [];
                break;
            case '2':
                rec['startDate'] = new Date(values[1]);
                rec['endDate'] = new Date(values[2]);
                rec['interval'] = parseInt(values[3]);
                rec['weekDays'] = !!values[4] ? values[4].split(',') : [];
                rec['scheduleTime'] = parseInt(values[5]);
                break;
        }

        me.add(me.newRecord(rec));

        me._calculating = false;
    },

    saveChange: function (data) {
        var me = this;
        var vArr = [];

        vArr.push(data['scheduleType']);

        switch (data['scheduleType']) {
            case 1:
                vArr.push(Ext.util.Format.date(data['startDate'], 'm/d/Y'));
                vArr.push(Ext.util.Format.date(data['endDate'], 'm/d/Y'));
                vArr.push(data['recurInterval']);
                vArr.push(Ext.toArray(data['dailyTime']).join(','));
                break;
            case 2:
                vArr.push(Ext.util.Format.date(data['startDate'], 'm/d/Y'));
                vArr.push(Ext.util.Format.date(data['endDate'], 'm/d/Y'));
                vArr.push(data['recurInterval']);
                vArr.push(Ext.toArray(data['recurWeekdays']).join(','));
                vArr.push(data['scheduleTime']);
                break;
        }
        var value = vArr.join(';');

        if (me._budSystemVariableStore.getCount() == 0) {
            me._budSystemVariableStore.add(me._budSystemVariableStore.newRecord(
                { 'variableName': me.scheduleName, 'variableValue': value }));
        }
        else {
            me._budSystemVariableStore.getAt(0).set('variableValue', value)
        }
        me._budSystemVariableStore.submitChanges(function () {
            me.fireEvent('saved');
        });
    }

});

/// <reference path="../Core.js" />

Bud.page.EpaySchedulePage = WebLight.extend(WebLight.Page, {
    html: '<div id="schedule-form"></div>',
    title: 'Epay Scheduler',

    _scheduleForm: null,
    _epayScheduleStore: null,

    _loadingMask: null,

    scheduleName: '',
    taskName: '',

    mask: function () {
        var me = this;
        if (!me._loadingMask)
            me._loadingMask = new Ext.LoadMask(Ext.getBody(), { msg: "Please wait..." });
        me._loadingMask.show();
    },
    unmask: function () {
        var me = this;
        me._loadingMask.hide();
    },

    //#region form fields declaration

    _scheduleTypeField: null,
    _startDateField: null,
    _endDateField: null,

    _recursIntervalField: null,
    _recursIntervalTipField: null,
    _weekdayField: null,
    _scheduleTime: null,
    _dailyScheduleTime: null,

    //#endregion

    //#region form fields instance

    createFormFields: function () {
        var me = this;

        var currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 1);

        me._scheduleTypeField = new Ext.form.RadioGroup({
            fieldLabel: 'Schedule Type', name: 'scheduleType',
            columns: 3,
            items: [
                { boxLabel: 'Daily', name: 'scheduleType', id: 'rb-col-1', inputValue: 1, checked: true },
                { boxLabel: 'Weekly', name: 'scheduleType', id: 'rb-col-2', inputValue: 2 }
            ]
        });

        me._startDateField = Ext.create({
            fieldLabel: 'Start Date',
            name: 'startDate',
            xtype: 'datefield',
            allowBlank: false,
            //minValue: currentDate,
            vtype: 'daterange',
            endDateField: this.id + 'end',
            id: this.id + 'start',
            anchor: '80%'
        });
        me._endDateField = Ext.create({
            fieldLabel: 'End Date',
            name: 'endDate',
            xtype: 'datefield',
            allowBlank: false,
            minValue: currentDate,
            vtype: 'daterange',
            startDateField: this.id + 'start',
            id: this.id + 'end',
            anchor: '80%'
        });

        me._recursIntervalTipField = Ext.create({ xtype: 'displayfield', name: 'recursIntervalTip' });
        me._recursIntervalField = Ext.create({
            fieldLabel: 'Recurs every',
            name: 'recurInterval',
            xtype: 'spinnerfield',
            width: 150, value: 1, minValue: 1,
            allowBlank: false
        });
        me._weekdayField = new Ext.form.CheckboxGroup({
            name: 'recurWeekdays',
            hidden: true,
            fieldLabel: '', columns: 4, width: 500, vertical: true,
            items: [
                { boxLabel: 'Monday', name: 'monday', inputValue: 1 },
                { boxLabel: 'Tuesday', name: 'tuesday', inputValue: 2 },
                { boxLabel: 'Wednesday', name: 'wednesday', inputValue: 3 },
                { boxLabel: 'Thursday', name: 'thursday', inputValue: 4 },
                { boxLabel: 'Friday', name: 'friday', inputValue: 5 },
                { boxLabel: 'Saturday', name: 'saturday', inputValue: 6 },
                { boxLabel: 'Sunday', name: 'sunday', inputValue: 7 }
            ]
        });

        me._scheduleTime = new Bud.form.DropdownList({
            store: Bdg.store.TimeStore,
            name: 'scheduleTime',
            fieldLabel: 'Schedule Time',
            displayField: 'name',
            valueField: 'id', allowBlank: true
        });

        var timeItems = [];
        for (var i = 0; i < 24; i++) {
            timeItems.push({ boxLabel: i + ':00', name: 'dailyTime' + i, inputValue: i * 2 });
        }

        me._dailyScheduleTime = new Ext.form.CheckboxGroup({
            name: 'dailyTime',
            fieldLabel: 'Schedule Time', columns: 4, width: 500, vertical: true,
            items: timeItems
        });
    },

    //#endregion

    //#region schedule form created

    createScheduleForm: function () {
        var me = this;

        me.createFormFields();

        var durationFieldSet = new Ext.form.FieldSet({
            title: 'Duration',
            items: [me._startDateField, me._endDateField]
        });

        var frequencyFieldSet = new Ext.form.FieldSet({
            title: 'Frequency',
            collapsible: false,
            autoHeight: true, layout: 'column',
            defaults: { border: false },
            items: [
                { layout: 'form', columnWidth: .6, items: [me._recursIntervalField] },
                { layout: 'form', columnWidth: .4, items: [me._recursIntervalTipField] },
                { layout: 'form', columnWidth: 1, items: [me._weekdayField] }
            ]
        });

        var scheduleButton = new Ext.Button({
            text: 'Schedule it', ctCls: 'ux-button-1',
            handler: function () {
                if (me._scheduleForm.getForm().isValid()) {
                    me.mask();
                    var v = me.getFieldValues();
                    me._epayScheduleStore.saveChange(v);
                }
            }
        });

        var runButton = new Ext.Button({
            text: 'Run it now!', ctCls: 'ux-button-1',
            handler: function () {
                if (me._scheduleForm.getForm().isValid()) {
                    me.mask();
                    var xml = '	<transaction id="1"><budEpayRunItNow taskName="' + me.taskName + '" _sysStatus="2"/></transaction>';
                    var postData = String.format('moduleId={0}&requestId={1}&requestXml={2}&&targetId=iiTransaction',
                        'bud', '2', encodeURIComponent(xml.replace(/\&/gi, '&amp;')));

                    jQuery.post('/net/crothall/chimes/fin/bud/act/Provider.aspx', postData, function (data, status) {
                        me.unmask();
                        //TODO:alert();
                    });
                }
            }
        });

        me._scheduleForm = new Ext.form.FormPanel({
            style: 'padding:10px;',
            width: 600, border: false,
            items: [
                me._scheduleTypeField,
                durationFieldSet,
                frequencyFieldSet,
                me._dailyScheduleTime,
                me._scheduleTime
            ],
            buttons: [scheduleButton, runButton]
        });
        me.addChildControl(me._scheduleForm, 'schedule-form');

        me._scheduleTypeField.on('change', function (rg, radio) {
            var typeId = radio.inputValue;

            switch (typeId) {
                case 1:
                    me._weekdayField.hide();
                    me._recursIntervalTipField.setFieldLabel('day(s)');
                    me._dailyScheduleTime.showItem();
                    me._scheduleTime.allowBlank = true;
                    me._scheduleTime.hideItem();
                    break;
                case 2:
                    me._weekdayField.show();
                    me._recursIntervalTipField.setFieldLabel('week(s) on');
                    me._dailyScheduleTime.hideItem();
                    me._scheduleTime.showItem();
                    me._scheduleTime.allowBlank = false;
                    break;
            }

            me._scheduleForm.doLayout();
        });
    },

    //#endregion

    createChildControls: function () {
        var me = this;

        me._epayScheduleStore = new Bud.data.EpayScheduleStore({
            scheduleName: me.scheduleName
        });

        me.createScheduleForm();
        me.mask();

        Bud.page.EpaySchedulePage.superclass.createChildControls.call(this);
    },

    dataBind: function () {
        var me = this;

        me._epayScheduleStore.on('load', function (store) {
            if (store.getCount() > 0)
                me.setFieldValues(me._epayScheduleStore.getAt(0));
            me.unmask();
        });
        me._epayScheduleStore.on('saved', function (store) {
            me.unmask();
        });

        me._epayScheduleStore.load();

        Bud.page.EpaySchedulePage.superclass.dataBind.call(this);
    },

    setFieldValues: function (record) {
        var me = this;
        var i = 0;

        switch (record.get('scheduleType')) {
            case 1:
                me._scheduleTypeField.setValue('rb-col-1', true);

                me._startDateField.setValue(record.get('startDate'));
                me._endDateField.setValue(record.get('endDate'));
                me._recursIntervalField.setValue(record.get('interval'));

                var dailyTimeChecked = [];
                for (i = 0; i < 24; i++) {
                    dailyTimeChecked.push(false);
                }

                var dailyTimes = record.get('dailyTime');
                for (i = 0; i < dailyTimes.length; i++) {
                    dailyTimeChecked[parseInt(dailyTimes[i]) / 2] = true;
                }
                me._dailyScheduleTime.setValue(dailyTimeChecked);

                break;
            case 2:
                me._scheduleTypeField.setValue('rb-col-2', true);

                me._startDateField.setValue(record.get('startDate'));
                me._endDateField.setValue(record.get('endDate'));
                me._recursIntervalField.setValue(record.get('interval'));

                var daysChecked = [false, false, false, false, false, false, false];

                var weekdays = record.get('weekDays');
                for (i = 0; i < weekdays.length; i++) {
                    daysChecked[parseInt(weekdays[i]) - 1] = true;
                }

                me._weekdayField.setValue(daysChecked);
                me._scheduleTime.setValue(record.get('scheduleTime'));
                break;
        }
    },

    getFieldValues: function () {
        var me = this;
        var kvp = me._scheduleForm.getForm().getFieldValues();
        var data = {};
        for (var k in kvp) {
            var value = kvp[k];
            if (Ext.isArray(value)) {
                /// checkboxgroup
                var newValue = [];
                Ext.each(value, function (item) {
                    newValue.push(item.inputValue);
                });
                value = newValue;
            }
            else if (Ext.isObject(value)) {
                // maybe radiogroup
                if (value.inputValue)
                    value = value.inputValue;
            }
            data[k] = value;
        }
        return data;
    },

    render: function (el) {
        var me = this;
        Bud.page.EpaySchedulePage.superclass.render.call(this, el);

        me._scheduleTime.hideItem();
    }
});

Bud.page.EpayScheduleUploadSites = WebLight.extend(Bud.page.EpaySchedulePage, {
    title: 'Upload Sites - Epay Schedule',
    scheduleName: 'EpaySchedule_UploadSites',
    taskName: 'uploadsites'
});

WebLight.PageMgr.registerType('epaySchedule_uploadsites', Bud.page.EpayScheduleUploadSites);

