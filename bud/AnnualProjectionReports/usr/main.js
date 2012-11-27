_builtInTemplate_99c0f840 = ['<h1 class="page-title">Annual Projection Reports</h1> <div id="container"></div>'];

Ext.ns('Ext.ux.grid');

Ext.ux.grid.ColumnHeaderGroup = Ext.extend(Ext.util.Observable, {

    constructor: function(config){
        this.config = config;
    },

    init: function(grid){
        Ext.applyIf(grid.colModel, this.config);
        Ext.apply(grid.getView(), this.viewConfig);
    },

    viewConfig: {
        initTemplates: function(){
            this.constructor.prototype.initTemplates.apply(this, arguments);
            var ts = this.templates || {};
            if(!ts.gcell){
                ts.gcell = new Ext.XTemplate('<td class="x-grid3-hd x-grid3-gcell x-grid3-td-{id} ux-grid-hd-group-row-{row} {cls}" style="{style}">', '<div {tooltip} class="x-grid3-hd-inner x-grid3-hd-{id}" unselectable="on" style="{istyle}">', this.grid.enableHdMenu ? '<a class="x-grid3-hd-btn" href="#"></a>' : '', '{value}</div></td>');
            }
            this.templates = ts;
            this.hrowRe = new RegExp("ux-grid-hd-group-row-(\\d+)", "");
        },

        renderHeaders: function(){
            var ts = this.templates, headers = [], cm = this.cm, rows = cm.rows, tstyle = 'width:' + this.getTotalWidth() + ';';

            for(var row = 0, rlen = rows.length; row < rlen; row++){
                var r = rows[row], cells = [];
                for(var i = 0, gcol = 0, len = r.length; i < len; i++){
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

        onColumnWidthUpdated: function(){
            this.constructor.prototype.onColumnWidthUpdated.apply(this, arguments);
            Ext.ux.grid.ColumnHeaderGroup.prototype.updateGroupStyles.call(this);
        },

        onAllColumnWidthsUpdated: function(){
            this.constructor.prototype.onAllColumnWidthsUpdated.apply(this, arguments);
            Ext.ux.grid.ColumnHeaderGroup.prototype.updateGroupStyles.call(this);
        },

        onColumnHiddenUpdated: function(){
            this.constructor.prototype.onColumnHiddenUpdated.apply(this, arguments);
            Ext.ux.grid.ColumnHeaderGroup.prototype.updateGroupStyles.call(this);
        },

        getHeaderCell: function(index){
            return this.mainHd.query(this.cellSelector)[index];
        },

        findHeaderCell: function(el){
            return el ? this.fly(el).findParent('td.x-grid3-hd', this.cellSelectorDepth) : false;
        },

        findHeaderIndex: function(el){
            var cell = this.findHeaderCell(el);
            return cell ? this.getCellIndex(cell) : false;
        },

        updateSortIcon: function(col, dir){
            var sc = this.sortClasses, hds = this.mainHd.select(this.cellSelector).removeClass(sc);
            hds.item(col).addClass(sc[dir == "DESC" ? 1 : 0]);
        },

        handleHdDown: function(e, t){
            var el = Ext.get(t);
            if(el.hasClass('x-grid3-hd-btn')){
                e.stopEvent();
                var hd = this.findHeaderCell(t);
                Ext.fly(hd).addClass('x-grid3-hd-menu-open');
                var index = this.getCellIndex(hd);
                this.hdCtxIndex = index;
                var ms = this.hmenu.items, cm = this.cm;
                ms.get('asc').setDisabled(!cm.isSortable(index));
                ms.get('desc').setDisabled(!cm.isSortable(index));
                this.hmenu.on('hide', function(){
                    Ext.fly(hd).removeClass('x-grid3-hd-menu-open');
                }, this, {
                    single: true
                });
                this.hmenu.show(t, 'tl-bl?');
            }else if(el.hasClass('ux-grid-hd-group-cell') || Ext.fly(t).up('.ux-grid-hd-group-cell')){
                e.stopEvent();
            }
        },

        handleHdMove: function(e, t){
            var hd = this.findHeaderCell(this.activeHdRef);
            if(hd && !this.headersDisabled && !Ext.fly(hd).hasClass('ux-grid-hd-group-cell')){
                var hw = this.splitHandleWidth || 5, r = this.activeHdRegion, x = e.getPageX(), ss = hd.style, cur = '';
                if(this.grid.enableColumnResize !== false){
                    if(x - r.left <= hw && this.cm.isResizable(this.activeHdIndex - 1)){
                        cur = Ext.isAir ? 'move' : Ext.isWebKit ? 'e-resize' : 'col-resize'; // col-resize
                                                                                                // not
                                                                                                // always
                                                                                                // supported
                    }else if(r.right - x <= (!this.activeHdBtn ? hw : 2) && this.cm.isResizable(this.activeHdIndex)){
                        cur = Ext.isAir ? 'move' : Ext.isWebKit ? 'w-resize' : 'col-resize';
                    }
                }
                ss.cursor = cur;
            }
        },

        handleHdOver: function(e, t){
            var hd = this.findHeaderCell(t);
            if(hd && !this.headersDisabled){
                this.activeHdRef = t;
                this.activeHdIndex = this.getCellIndex(hd);
                var fly = this.fly(hd);
                this.activeHdRegion = fly.getRegion();
                if(!(this.cm.isMenuDisabled(this.activeHdIndex) || fly.hasClass('ux-grid-hd-group-cell'))){
                    fly.addClass('x-grid3-hd-over');
                    this.activeHdBtn = fly.child('.x-grid3-hd-btn');
                    if(this.activeHdBtn){
                        this.activeHdBtn.dom.style.height = (hd.firstChild.offsetHeight - 1) + 'px';
                    }
                }
            }
        },

        handleHdOut: function(e, t){
            var hd = this.findHeaderCell(t);
            if(hd && (!Ext.isIE || !e.within(hd, true))){
                this.activeHdRef = null;
                this.fly(hd).removeClass('x-grid3-hd-over');
                hd.style.cursor = '';
            }
        },

        handleHdMenuClick: function(item){
            var index = this.hdCtxIndex, cm = this.cm, ds = this.ds, id = item.getItemId();
            switch(id){
                case 'asc':
                    ds.sort(cm.getDataIndex(index), 'ASC');
                    break;
                case 'desc':
                    ds.sort(cm.getDataIndex(index), 'DESC');
                    break;
                default:
                    if(id.substr(0, 5) == 'group'){
                        var i = id.split('-'), row = parseInt(i[1], 10), col = parseInt(i[2], 10), r = this.cm.rows[row], group, gcol = 0;
                        for(var i = 0, len = r.length; i < len; i++){
                            group = r[i];
                            if(col >= gcol && col < gcol + group.colspan){
                                break;
                            }
                            gcol += group.colspan;
                        }
                        if(item.checked){
                            var max = cm.getColumnsBy(this.isHideableColumn, this).length;
                            for(var i = gcol, len = gcol + group.colspan; i < len; i++){
                                if(!cm.isHidden(i)){
                                    max--;
                                }
                            }
                            if(max < 1){
                                this.onDenyColumnHide();
                                return false;
                            }
                        }
                        for(var i = gcol, len = gcol + group.colspan; i < len; i++){
                            if(cm.config[i].fixed !== true && cm.config[i].hideable !== false){
                                cm.setHidden(i, item.checked);
                            }
                        }
                    }else{
                        index = cm.getIndexById(id.substr(4));
                        if(index != -1){
                            if(item.checked && cm.getColumnsBy(this.isHideableColumn, this).length <= 1){
                                this.onDenyColumnHide();
                                return false;
                            }
                            cm.setHidden(index, item.checked);
                        }
                    }
                    item.checked = !item.checked;
                    if(item.menu){
                        var updateChildren = function(menu){
                            menu.items.each(function(childItem){
                                if(!childItem.disabled){
                                    childItem.setChecked(item.checked, false);
                                    if(childItem.menu){
                                        updateChildren(childItem.menu);
                                    }
                                }
                            });
                        }
                        updateChildren(item.menu);
                    }
                    var parentMenu = item, parentItem;
                    while(parentMenu = parentMenu.parentMenu){
                        if(!parentMenu.parentMenu || !(parentItem = parentMenu.parentMenu.items.get(parentMenu.getItemId())) || !parentItem.setChecked){
                            break;
                        }
                        var checked = parentMenu.items.findIndexBy(function(m){
                            return m.checked;
                        }) >= 0;
                        parentItem.setChecked(checked, true);
                    }
                    item.checked = !item.checked;
            }
            return true;
        },

        beforeColMenuShow: function(){
            var cm = this.cm, rows = this.cm.rows;
            this.colMenu.removeAll();
            for(var col = 0, clen = cm.getColumnCount(); col < clen; col++){
                var menu = this.colMenu, title = cm.getColumnHeader(col), text = [];
                if(cm.config[col].fixed !== true && cm.config[col].hideable !== false){
                    for(var row = 0, rlen = rows.length; row < rlen; row++){
                        var r = rows[row], group, gcol = 0;
                        for(var i = 0, len = r.length; i < len; i++){
                            group = r[i];
                            if(col >= gcol && col < gcol + group.colspan){
                                break;
                            }
                            gcol += group.colspan;
                        }
                        if(group && group.header){
                            if(cm.hierarchicalColMenu){
                                var gid = 'group-' + row + '-' + gcol;
                                var item = menu.items.item(gid);
                                var submenu = item ? item.menu : null;
                                if(!submenu){
                                    submenu = new Ext.menu.Menu({
                                        itemId: gid
                                    });
                                    submenu.on("itemclick", this.handleHdMenuClick, this);
                                    var checked = false, disabled = true;
                                    for(var c = gcol, lc = gcol + group.colspan; c < lc; c++){
                                        if(!cm.isHidden(c)){
                                            checked = true;
                                        }
                                        if(cm.config[c].hideable !== false){
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
                            }else{
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

        renderUI: function(){
            this.constructor.prototype.renderUI.apply(this, arguments);
            Ext.apply(this.columnDrop, Ext.ux.grid.ColumnHeaderGroup.prototype.columnDropConfig);
            Ext.apply(this.splitZone, Ext.ux.grid.ColumnHeaderGroup.prototype.splitZoneConfig);
        }
    },

    splitZoneConfig: {
        allowHeaderDrag: function(e){
            return !e.getTarget(null, null, true).hasClass('ux-grid-hd-group-cell');
        }
    },

    columnDropConfig: {
        getTargetFromEvent: function(e){
            var t = Ext.lib.Event.getTarget(e);
            return this.view.findHeaderCell(t);
        },

        positionIndicator: function(h, n, e){
            var data = Ext.ux.grid.ColumnHeaderGroup.prototype.getDragDropData.call(this, h, n, e);
            if(data === false){
                return false;
            }
            var px = data.px + this.proxyOffsets[0];
            this.proxyTop.setLeftTop(px, data.r.top + this.proxyOffsets[1]);
            this.proxyTop.show();
            this.proxyBottom.setLeftTop(px, data.r.bottom);
            this.proxyBottom.show();
            return data.pt;
        },

        onNodeDrop: function(n, dd, e, data){
            var h = data.header;
            if(h != n){
                var d = Ext.ux.grid.ColumnHeaderGroup.prototype.getDragDropData.call(this, h, n, e);
                if(d === false){
                    return false;
                }
                var cm = this.grid.colModel, right = d.oldIndex < d.newIndex, rows = cm.rows;
                for(var row = d.row, rlen = rows.length; row < rlen; row++){
                    var r = rows[row], len = r.length, fromIx = 0, span = 1, toIx = len;
                    for(var i = 0, gcol = 0; i < len; i++){
                        var group = r[i];
                        if(d.oldIndex >= gcol && d.oldIndex < gcol + group.colspan){
                            fromIx = i;
                        }
                        if(d.oldIndex + d.colspan - 1 >= gcol && d.oldIndex + d.colspan - 1 < gcol + group.colspan){
                            span = i - fromIx + 1;
                        }
                        if(d.newIndex >= gcol && d.newIndex < gcol + group.colspan){
                            toIx = i;
                        }
                        gcol += group.colspan;
                    }
                    var groups = r.splice(fromIx, span);
                    rows[row] = r.splice(0, toIx - (right ? span : 0)).concat(groups).concat(r);
                }
                for(var c = 0; c < d.colspan; c++){
                    var oldIx = d.oldIndex + (right ? 0 : c), newIx = d.newIndex + (right ? -1 : c);
                    cm.moveColumn(oldIx, newIx);
                    this.grid.fireEvent("columnmove", oldIx, newIx);
                }
                return true;
            }
            return false;
        }
    },

    getGroupStyle: function(group, gcol){
        var width = 0, hidden = true;
        for(var i = gcol, len = gcol + group.colspan; i < len; i++){
            if(!this.cm.isHidden(i)){
                var cw = this.cm.getColumnWidth(i);
                if(typeof cw == 'number'){
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

    updateGroupStyles: function(col){
        var tables = this.mainHd.query('.x-grid3-header-offset > table'), tw = this.getTotalWidth(), rows = this.cm.rows;
        for(var row = 0; row < tables.length; row++){
            tables[row].style.width = tw;
            if(row < rows.length){
                var cells = tables[row].firstChild.firstChild.childNodes;
                for(var i = 0, gcol = 0; i < cells.length; i++){
                    var group = rows[row][i];
                    if((typeof col != 'number') || (col >= gcol && col < gcol + group.colspan)){
                        var gs = Ext.ux.grid.ColumnHeaderGroup.prototype.getGroupStyle.call(this, group, gcol);
                        cells[i].style.width = gs.width;
                        cells[i].style.display = gs.hidden ? 'none' : '';
                    }
                    gcol += group.colspan;
                }
            }
        }
    },

    getGroupRowIndex: function(el){
        if(el){
            var m = el.className.match(this.hrowRe);
            if(m && m[1]){
                return parseInt(m[1], 10);
            }
        }
        return this.cm.rows.length;
    },

    getGroupSpan: function(row, col){
        if(row < 0){
            return {
                col: 0,
                colspan: this.cm.getColumnCount()
            };
        }
        var r = this.cm.rows[row];
        if(r){
            for(var i = 0, gcol = 0, len = r.length; i < len; i++){
                var group = r[i];
                if(col >= gcol && col < gcol + group.colspan){
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
    }
});



/// <reference path="../references/jquery-1.4.1.js" />
/// <reference path="ext-all-budget.js" />
/// <reference path="../references/ext-jquery-adapter.js" />
/// <reference path="../references/weblight4extjs.js" />


jQuery.ajaxSettings.contentType = 'application/x-www-form-urlencoded; charset=utf-8';

WebLight.namespace('Bud', 'Bud.form');

Bud.Context = {
    userId: '[user]'
};

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
            this.fireEvent('valuechange', v);

        return this;
    }
});


/// <reference path="../../references/jquery-1.4.1.js" />
/// <reference path="../../references/ext-jquery-adapter.js" />
/// <reference path="../../references/ext-all.js" />
/// <reference path="../../references/weblight4extjs.js" />

WebLight.Router.mapRoute('^budget/annualprojection$', {
    xtype: 'annualProjectionRpt'
});


WebLight.namespace('Bud');

Ext.namespace("Bdg.store");
Ext.namespace("Bdg.object");





Bdg.store.Period1to5 = [	
					['4005 Full Service Bills', '4000', '92054.79', '92054.79', '92054.79', '92054.79', '92054.79', '92054.79', '92778.08', '92054.79'],
                    ['4010 Management Fee Billing', '5000', '0', '0', '-100', '0', '0', '0', '0', '0', '0'],
                    ['4020 Miscellaneous Income', '6000', '0', '0', '-2500', '0', '0', '0', '0', '0', '0'],
                    ['4030 Reimbursement Start-up Costs', '7000', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
                    ['4040 Reimbursement Direct Costs', '8000', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
                    ['4050 Reimbursement Equipment', '9000', '0', '0', '-260', '0', '0', '0', '0', '0', '0'],
                    ['4060 Quality Incentive Income', '10000', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
                    ['4070 Prepayment Discount', '11000', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
                    ['4080 Finalily', '12000', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0']
                    ];


Bdg.store.Period5to8 = [	
					['4005 Full Service Bills', '4000', '92054.79', '92054.79', '92054.79', '92054.79', '92054.79', '92054.79', '92778.08', '92054.79'],
                    ['4010 Management Fee Billing', '5000', '0', '0', '-100', '0', '0', '0', '0', '0', '0'],
                    ['4020 Miscellaneous Income', '6000', '0', '0', '-2500', '0', '0', '0', '0', '0', '0'],
                    ['4030 Reimbursement Start-up Costs', '7000', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
                    ['4040 Reimbursement Direct Costs', '8000', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
                    ['4050 Reimbursement Equipment', '9000', '0', '0', '-260', '0', '0', '0', '0', '0', '0'],
                    ['4060 Quality Incentive Income', '10000', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
                    ['4070 Prepayment Discount', '11000', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
                    ['4080 Finalily', '12000', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0']
                    ];
					
Bdg.store.Period8to12 = [	
					['4005 Full Service Bills', '4000', '92054.79', '92054.79', '92054.79', '92054.79', '92054.79', '92054.79', '92778.08', '92054.79'],
                    ['4010 Management Fee Billing', '5000', '0', '0', '-100', '0', '0', '0', '0', '0', '0'],
                    ['4020 Miscellaneous Income', '6000', '0', '0', '-2500', '0', '0', '0', '0', '0', '0'],
                    ['4030 Reimbursement Start-up Costs', '7000', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
                    ['4040 Reimbursement Direct Costs', '8000', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
                    ['4050 Reimbursement Equipment', '9000', '0', '0', '-260', '0', '0', '0', '0', '0', '0'],
                    ['4060 Quality Incentive Income', '10000', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
                    ['4070 Prepayment Discount', '11000', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
                    ['4080 Finalily', '12000', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0']
                    ];

Bdg.store.Period13 = [	
					['4005 Full Service Bills', '4000', '92054.79', '92054.79', '', '', '92054.79', '92054.79', '92778.08', '92054.79'],
                    ['4010 Management Fee Billing', '5000', '0', '0', '', '', '0', '0', '0', '0', '0'],
                    ['4020 Miscellaneous Income', '6000', '0', '0', '', '', '0', '0', '0', '0', '0'],
                    ['4030 Reimbursement Start-up Costs', '7000', '0', '0', '', '', '0', '0', '0', '0', '0'],
                    ['4040 Reimbursement Direct Costs', '8000', '0', '0', '', '', '0', '0', '0', '0', '0'],
                    ['4050 Reimbursement Equipment', '9000', '0', '0', '', '', '0', '0', '0', '0', '0'],
                    ['4060 Quality Incentive Income', '10000', '0', '0', '', '', '0', '0', '0', '0', '0'],
                    ['4070 Prepayment Discount', '11000', '0', '0', '', '', '0', '0', '0', '0', '0'],
                    ['4080 Finalily', '12000', '0', '0', '', '', '0', '0', '0', '0', '0', '0']
                    ];										








/// <reference path="../Core.js" />


WebLight.namespace('Bud.page');

Bud.page.BudgetPage = WebLight.extend(WebLight.Page, {

    _fscYear: 0,
    _fscYearTitle: '',
    _hcmHouseCode: 0,
    _hcmHouseCodeTitle: '',
    _hcmJob: 0,
    _hcmJobTitle: '',


    // obsolete methods
    getFiscalYearId: function () { return this._fscYear; },
    getFiscalYear: function () { return this._fscYearTitle; },
    getHouseCode: function () { return this._hcmHouseCode; },
    getJobCode: function () { return this._hcmJob; },

    getFscYear: function () { return this._fscYear; },
    getHcmHouseCode: function () { return this._hcmHouseCode; },
    getHcmJob: function () { return this._hcmJob; },
    getFscYearTitle: function () { return this._fscYearTitle; },
    getHcmHouseCodeTitle: function () { return this._hcmHouseCodeTitle; },
    getHcmJobTitle: function () { return this._hcmJobTitle; },

    setContext: function (hcmHouseCode, hcmJob, fscYear, hcmHouseCodeTitle, hcmJobTitle, fscYearTitle) {
        if (!hcmHouseCode || hcmHouseCode == ''
                || !hcmJob || hcmJob == ''
                || !fscYear || fscYear == ''
        )
            return;

        if (this._fscYear == fscYear && this._hcmHouseCode == hcmHouseCode && this._hcmJob == hcmJob)
            return;

        this._fscYearTitle = fscYearTitle;
        this._hcmHouseCode = hcmHouseCode;
        this._hcmJob = hcmJob;
        this._fscYear = fscYear;
        this._hcmHouseCodeTitle = hcmHouseCodeTitle;
        this._hcmJobTitle = hcmJobTitle;

        this.fireEvent('contextChanged');
    }
});




/// <reference path="../references/jquery-1.4.1.js" />
/// <reference path="ext-all-budget.js" />
/// <reference path="../references/ext-jquery-adapter.js" />
/// <reference path="../references/weblight4extjs.js" />



WebLight.namespace('Bud.page');

Bud.page.AnlPrjRptPage = WebLight.extend(Bud.page.BudgetPage, {
    title: 'Budget Vs Actual Report',
	//html: '<% Import path="markup.htm" %>',
    html: _builtInTemplate_99c0f840[0],
	
  	_AnlPrjRptStore: null,
	_AnlPrjRptStore1: null,
	_AnlPrjRptStore2: null,
	_AnlPrjRptStore3: null,
 
	
	 createChildControls: function () {
        this._AnlPrjRptStore = new Ext.data.ArrayStore({
            fields: ['field1', 'field2', 'field3', 'field4', 'field5', 'field6', 'field7', 'field8', 'field9', 'field10']
        });
        this._AnlPrjRptStore1 = new Ext.data.ArrayStore({
            fields: ['field1', 'field2', 'field3', 'field4', 'field5', 'field6', 'field7', 'field8', 'field9', 'field10', 'field11', 'field12', 'field13', 'field14', 'field15']
        });
		 this._AnlPrjRptStore2 = new Ext.data.ArrayStore({
            fields: ['field1', 'field2', 'field3', 'field4', 'field5', 'field6', 'field7', 'field8', 'field9', 'field10', 'field11', 'field12', 'field13', 'field14', 'field15']
        });
		 this._AnlPrjRptStore3 = new Ext.data.ArrayStore({
            fields: ['field1', 'field2', 'field3', 'field4', 'field5', 'field6', 'field7', 'field8', 'field9', 'field10', 'field11', 'field12', 'field13', 'field14', 'field15']
        });

        var staffingSelect = new Ext.Panel({
            header: false,
            border: false,
            autoHeight: true,
            bodyStyle: 'border-bottom:2px solid #336600;margin:10px 0;padding:10px;',
            items: [
                    { xtype: 'radiogroup', columns: 4, items: [
                        { boxLabel: 'Annual Projection Period From 1 to 4', name: 'cb-custwidth', inputValue: 1, checked: true },
						{ boxLabel: 'Annual Projection Period From 5 to 8', name: 'cb-custwidth', inputValue: 1, checked: true },
						{ boxLabel: 'Annual Projection Period From 9 to 12', name: 'cb-custwidth', inputValue: 1, checked: true },
                        { boxLabel: 'Annual Projection Period 13', name: 'cb-custwidth', inputValue: 2 }
                    ],
                        listeners: {
                            'change': function (obj, checked) {
                                var v = checked.getRawValue();
                                switch (v) {
                                    case '1':
                                        panel1.show();
                                        panel2.hide();
										panel3.hide();
										panel4.hide();
                                        break;
                                    case '2':
                                        panel1.hide();
                                        panel2.show();
										panel3.hide();
										panel4.hide();
                                        break;
									case '3':
                                        panel1.hide();
                                        panel2.hide();
										panel3.show();
										panel4.hide();
                                        break;
									case '4':
                                        panel1.hide();
                                        panel2.hide();
										panel3.hide();
										panel4.show();
                                        break;
                                }
                            }
                        }
                    }]
        });
		
		   var group = new Ext.ux.grid.ColumnHeaderGroup({
            rows: [[
                   { header: '', colspan: 2 },
                    { header: 'Period 1', colspan: 2, align: 'center' },
                    { header: 'Period 2', colspan: 2, align: 'center' },
                    { header: 'Period 3', colspan: 2, align: 'center' },
					{ header: 'Period 4', colspan: 2, align: 'center' }
					
					]
            ]
        });
		
        var panel1 = new Ext.Panel({
            header: false,
            border: false,
            autoHeight: true, 
			title: 'Annual Projection Period From 1 to 4',
            items: [
                new WebLight.grid.GridPanel({
                    ctCls: 'ux-grid-1',
                    store: this._AnlPrjRptStore,
                    autoHeight: true,
                    viewConfig: {
                        forceFit: true
                    },
                    cm: new Ext.grid.ColumnModel({
                        defaults: { sortable: false },
                        columns: [
                          	{ header: '<center>' + 'Item(s)' + '</center>', width: 150 },
		                    { header: '&nbsp;' },
		                    { header: '<center>' + 'Actuals' + '</center>', width: 60, css: 'text-align:right;color:#43A643;font-weight:bold;' },
		                    { header: '<center>' + 'Budget' + '</center>', width: 60,  css: 'text-align:right;color:#43A643;font-weight:bold;' },
		                    { header: '<center>' + 'Actuals' + '</center>', width: 60, css:  'text-align:right;color:#43A643;font-weight:bold;'},
		                    { header: '<center>' + 'Budget' + '</center>', width: 60,  css:  'text-align:right;color:#43A643;font-weight:bold;' },
		                    { header: '<center>' + 'Actuals' + '</center>', width: 60, css:  'text-align:right;color:#43A643;font-weight:bold;'},
		                    { header: '<center>' + 'Budget' + '</center>', width: 60,  css:  'text-align:right;color:#43A643;font-weight:bold;'},
							{ header: '<center>' + 'Actuals' + '</center>', width: 60, css:  'text-align:right;color:#43A643;font-weight:bold;'},
		                    { header: '<center>' + 'Budget' + '</center>', width: 60,  css:  'text-align:right;color:#43A643;font-weight:bold;'}

                        ]
                    }),
					plugins: group
                })
					
            ]
		
        });
		
		var group = new Ext.ux.grid.ColumnHeaderGroup({
            rows: [[
                   { header: '', colspan: 2 },
                    { header: 'Period 5', colspan: 2, align: 'center' },
                    { header: 'Period 6', colspan: 2, align: 'center' },
                    { header: 'Period 7', colspan: 2, align: 'center' },
					{ header: 'Period 8', colspan: 2, align: 'center' }
					
					]
            ]
        });
        var panel2 = new Ext.Panel({
            header: false,
            border: false,
            autoHeight: true, 
			title: 'Annual Projection Period From 5 to 8',
            //hidden:true,
            items: [
                new WebLight.grid.GridPanel({
                    ctCls: 'ux-grid-1',
                    store: this._AnlPrjRptStore1,
                    autoHeight: true,
                    viewConfig: {
                        forceFit: true
                    },
                    cm: new Ext.grid.ColumnModel({
                        defaults: { sortable: false },
                        columns: [
                            { header: '<center>' + 'Item(s)' + '</center>', width: 150 },
		                    { header: '&nbsp;' },
		                    { header: '<center>' + 'Actuals' + '</center>', width: 60, css:  'text-align:right;color:#43A643;font-weight:bold;'},
		                    { header: '<center>' + 'Budget' + '</center>', width: 60,  css:  'text-align:right;color:#43A643;font-weight:bold;'},
		                    { header: '<center>' + 'Actuals' + '</center>', width: 60, css:  'text-align:right;color:#43A643;font-weight:bold;'},
		                    { header: '<center>' + 'Budget' + '</center>', width: 60,  css:  'text-align:right;color:#43A643;font-weight:bold;'},
		                    { header: '<center>' + 'Actuals' + '</center>', width: 60, css:  'text-align:right;color:#43A643;font-weight:bold;'},
		                    { header: '<center>' + 'Budget' + '</center>', width: 60,  css:  'text-align:right;color:#43A643;font-weight:bold;'},
							{ header: '<center>' + 'Actuals' + '</center>', width: 60, css:  'text-align:right;color:#43A643;font-weight:bold;'},
		                    { header: '<center>' + 'Budget' + '</center>', width: 60,  css:  'text-align:right;color:#43A643;font-weight:bold;'}

                        ]
                    }),
					plugins: group
                })
            ]
        });
		
		
		var group = new Ext.ux.grid.ColumnHeaderGroup({
            rows: [[
                   { header: '', colspan: 2 },
                    { header: 'Period 9', colspan: 2, align: 'center' },
                    { header: 'Period 10', colspan: 2, align: 'center' },
                    { header: 'Period 11', colspan: 2, align: 'center' },
					{ header: 'Period 12', colspan: 2, align: 'center' }
					
					]
            ]
        });
		var panel3 = new Ext.Panel({
            header: false,
            border: false,
            autoHeight: true, 
			title: 'Annual Projection Period From 9 to 12',
            items: [
                new WebLight.grid.GridPanel({
                    ctCls: 'ux-grid-1',
                    store: this._AnlPrjRptStore2,
                    autoHeight: true,
                    viewConfig: {
                        forceFit: true
                    },
                    cm: new Ext.grid.ColumnModel({
                        defaults: { sortable: false },
                        columns: [
                          	{ header: '<center>' + 'Item(s)' + '</center>', width: 150 },
		                    { header: '&nbsp;' },
		                    { header: '<center>' + 'Actuals' + '</center>', width: 60, css:  'text-align:right;color:#43A643;font-weight:bold;'},
		                    { header: '<center>' + 'Budget' + '</center>', width: 60,  css:  'text-align:right;color:#43A643;font-weight:bold;'},
		                    { header: '<center>' + 'Actuals' + '</center>', width: 60, css:  'text-align:right;color:#43A643;font-weight:bold;'},
		                    { header: '<center>' + 'Budget' + '</center>', width: 60,  css:  'text-align:right;color:#43A643;font-weight:bold;'},
		                    { header: '<center>' + 'Actuals' + '</center>', width: 60, css:  'text-align:right;color:#43A643;font-weight:bold;'},
		                    { header: '<center>' + 'Budget' + '</center>', width: 60,  css:  'text-align:right;color:#43A643;font-weight:bold;'},
							{ header: '<center>' + 'Actuals' + '</center>', width: 60, css:  'text-align:right;color:#43A643;font-weight:bold;'},
		                    { header: '<center>' + 'Budget' + '</center>', width: 60,  css:  'text-align:right;color:#43A643;font-weight:bold;'}

                        ]
                    }),
					plugins: group
                })
            ]
        });
		
		var group = new Ext.ux.grid.ColumnHeaderGroup({
            rows: [[
                   { header: '', colspan: 2 },
                    { header: 'Period 13', colspan: 2, align: 'center' },
                    { header: '', colspan: 2, align: 'center' },
                    { header: 'YTD thru Period 6', colspan: 2, align: 'center' },
					{ header: '% of', colspan: 2, align: 'center' }
					
					]
            ]
        });
		var panel4 = new Ext.Panel({
            header: false,
            border: false,
            autoHeight: true, 
			title: 'Annual Projection Period 13',
            items: [
                new WebLight.grid.GridPanel({
                    ctCls: 'ux-grid-1',
                    store: this._AnlPrjRptStore3,
                    autoHeight: true,
                    viewConfig: {
                        forceFit: true
                    },
                    cm: new Ext.grid.ColumnModel({
                        defaults: { sortable: false },
                        columns: [
                          	{ header: '<center>' + 'Item(s)' + '</center>', width: 150 },
		                    { header: '&nbsp;' },
		                    { header: '<center>' + 'Actuals' + '</center>', width: 60, css:  'text-align:right;color:#43A643;font-weight:bold;'},
		                    { header: '<center>' + 'Budget' + '</center>', width: 60, css:  'text-align:right;color:#43A643;font-weight:bold;'},
		                    { header: '<center>' + '' + '</center>', width: 60, css:  'text-align:right;color:#43A643;font-weight:bold;'},
		                    { header: '<center>' + '' + '</center>', width: 60, css:  'text-align:right;color:#43A643;font-weight:bold;'},
		                    { header: '<center>' + 'Actuals' + '</center>', width: 60, css:  'text-align:right;color:#43A643;font-weight:bold;'},
		                    { header: '<center>' + 'Budget' + '</center>', width: 60, css:  'text-align:right;color:#43A643;font-weight:bold;'},
							{ header: '<center>' + 'Actuals' + '</center>', width: 60, css:  'text-align:right;color:#43A643;font-weight:bold;'},
		                    { header: '<center>' + 'Budget' + '</center>', width: 60, css:  'text-align:right;color:#43A643;font-weight:bold;'}

                        ]
                    }),
					plugins: group
                })
            ]
        });


        var tabs = new Ext.TabPanel({
            activeTab: 0,
            border: false,
            ctCls: 'ux-tab-1',
            autoHeight: true,
            items: [panel1, panel2, panel3, panel4]
        });

        this.addChildControl(tabs, 'container');
        Bud.page.AnlPrjRptPage.superclass.createChildControls.call(this);


    },
	
	dataBind: function () {
        this._AnlPrjRptStore.loadData(Bdg.store.Period1to5);
        this._AnlPrjRptStore1.loadData(Bdg.store.Period5to8);
		this._AnlPrjRptStore2.loadData(Bdg.store.Period8to12);
		this._AnlPrjRptStore3.loadData(Bdg.store.Period13);
        Bud.page.AnlPrjRptPage.superclass.dataBind.call(this);
    }

});


WebLight.PageMgr.registerType('annualProjectionRpt', Bud.page.AnlPrjRptPage);





