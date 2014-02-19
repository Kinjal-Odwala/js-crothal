window.__weblight_t_fbd3614b = ['<?xml version="1.0" encoding="utf-8"?><transmission>  <target id="iiCache" requestId="2">    <store id="appDataCollectors" activeId="0" criteria="storeId:appDataCollectors,userId:[user],">      <item id="1" houseCodeId="363" moduleId="5" numberOfColumns="6" frequency="Monthly" lockout="true" email="1" emailAddress="admin@crothall.com" message="True" messageText="Your monthly BI Statistics update is overdue. Click here to enter the data now before you can no longer access the other modules." lockoutMessage="True" lockoutMessageText="Your monthly BI Statistics update is overdue. You will no longer be able to access any modules until you complete the update. Click here to enter the data now." />    </store>  </target></transmission>','<?xml version="1.0" encoding="utf-8"?><transmission>  <target id="iiCache" requestId="2">    <store id="appDataCollectorTasks" activeId="0" criteria="storeId:appDataCollectorTasks,userId:[user],">      <item id="42" appUserId="1630" dataCollectorId="1" module="House Code" houseCodeId="466" houseCodeBrief="900002" frequency="Weekly" messageText="Your monthly BI Statistics update is overdue. Click here to enter the data now before you can no longer access the other modules." description="Patient Stat" startDate="9/12/2011" endDate="11/11/2011" active="True" modBy="Compass-usa\setup" modAt="9/20/2011 4:35:37 PM" />      <item id="25" appUserId="1630" dataCollectorId="1" module="House Code" houseCodeId="466" houseCodeBrief="900002" frequency="Weekly" messageText="Your monthly BI Statistics update is overdue. Click here to enter the data now before you can no longer access the other modules." description="Patient Stat" startDate="9/19/2011" endDate="11/18/2011" active="True" modBy="Compass-usa\setup" modAt="9/20/2011 4:35:30 PM" />      <item id="50" appUserId="1630" dataCollectorId="3" module="House Code" houseCodeId="306" houseCodeBrief="1003" frequency="Weekly" messageText="Your monthly BI Statistics update is overdue. Click here to enter the data now before you can no longer access the other modules." description="Client Data" startDate="9/12/2011" endDate="11/11/2011" active="True" modBy="Compass-usa\setup" modAt="9/20/2011 4:35:37 PM" />      <item id="33" appUserId="1630" dataCollectorId="3" module="House Code" houseCodeId="306" houseCodeBrief="1003" frequency="Weekly" messageText="Your monthly BI Statistics update is overdue. Click here to enter the data now before you can no longer access the other modules." description="Client Data" startDate="9/19/2011" endDate="11/18/2011" active="True" modBy="Compass-usa\setup" modAt="9/20/2011 4:35:30 PM" />    </store>  </target></transmission>','<div id="title" class="notification-title" style="width:100%">Notifications</div><div style="margin: 5px 10px 10px 10px;"><div id="itemStatusDiv"><div id="itemStatusImage" class="itemStatusImage"></div><div id="itemModifiedImage" class="itemModifiedImage"></div><div id="itemStatusText">Loading, please wait...</div></div><div style="clear:both;height:5px;"></div><div id="dataCollectorTask-grid"></div></div><div style="height: 100px">    <div id="task-form">    </div>    <div id="divButtons" style="padding-left: 8px"> <div class="iiButton AnchorSave" id="AnchorSave">        <div class="iiButtonPart Begin" id="AnchorSaveBegin">        </div>        <div class="iiButtonPart Middle" id="AnchorSaveMiddle">            <span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span></div>        <div class="iiButtonPart End" id="AnchorSaveEnd">        </div>    </div>    <div class="iiButton AnchorCancel" id="AnchorCancel">        <div class="iiButtonPart Begin" id="AnchorCancelBegin">        </div>        <div class="iiButtonPart Middle" id="AnchorCancelMiddle">            <span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span></div>        <div class="iiButtonPart End" id="AnchorCancelEnd">        </div>    </div></div></div>','<div id="{0}_container">    <div class="LabelhouseCodeAreaLeft" id="{0}_title">{1}:       </div>    <div class="InputTextAreaRight"><div id="{0}">{2}</div></div></div>','<div id="{0}_container">    <div class="LabelhouseCodeAreaLeft" id="{0}_title">{1}:       </div>    <div class="LabelhouseCodeAreaRight"><div id="{0}">{2}</div></div></div>',''];

/**
* Copyright (c) 2009 Sergiy Kovalchuk (serg472@gmail.com)
* 
* Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
* and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
*  
* Following code is based on Element.mask() implementation from ExtJS framework (http://extjs.com/)
*
*/
; (function ($) {

    /**
    * Displays loading mask over selected element(s). Accepts both single and multiple selectors.
    *
    * @param label Text message that will be displayed on top of the mask besides a spinner (optional). 
    * 				If not provided only mask will be displayed without a label or a spinner.  	
    * @param delay Delay in milliseconds before element is masked (optional). If unmask() is called 
    *              before the delay times out, no mask is displayed. This can be used to prevent unnecessary 
    *              mask display for quick processes.   	
    */
    $.fn.maskEl = function (label, delay) {
        $(this).each(function () {
            if (delay !== undefined && delay > 0) {
                var element = $(this);
                element.data("_mask_timeout", setTimeout(function () { $.maskElement(element, label) }, delay));
            } else {
                $.maskElement($(this), label);
            }
        });
    };

    /**
    * Removes mask from the element(s). Accepts both single and multiple selectors.
    */
    $.fn.unmaskEl = function () {
        $(this).each(function () {
            $.unmaskElement($(this));
        });
    };

    /**
    * Checks if a single element is masked. Returns false if mask is delayed or not displayed. 
    */
    $.fn.isElMasked = function () {
        return this.hasClass("masked");
    };

    $.maskElement = function (element, label) {

        //if this element has delayed mask scheduled then remove it and display the new one
        if (element.data("_mask_timeout") !== undefined) {
            clearTimeout(element.data("_mask_timeout"));
            element.removeData("_mask_timeout");
        }

        if (element.isElMasked()) {
            $.unmaskElement(element);
        }

        if (element.css("position") == "static") {
            element.addClass("masked-relative");
        }

        element.addClass("masked");

        var maskDiv = $('<div class="loadmask"></div>');

        //auto height fix for IE
        if (navigator.userAgent.toLowerCase().indexOf("msie") > -1) {
            maskDiv.height(element.height() + parseInt(element.css("padding-top")) + parseInt(element.css("padding-bottom")));
            maskDiv.width(element.width() + parseInt(element.css("padding-left")) + parseInt(element.css("padding-right")));
        }

        //fix for z-index bug with selects in IE6
        if (navigator.userAgent.toLowerCase().indexOf("msie 6") > -1) {
            element.find("select").addClass("masked-hidden");
        }

        element.append(maskDiv);

        if (label !== undefined) {
            var maskMsgDiv = $('<div class="loadmask-msg" style="display:none;"></div>');
            maskMsgDiv.append('<div>' + label + '</div>');
            element.append(maskMsgDiv);

            //calculate center position
            maskMsgDiv.css("top", Math.round(element.height() / 2 - (maskMsgDiv.height() - parseInt(maskMsgDiv.css("padding-top")) - parseInt(maskMsgDiv.css("padding-bottom"))) / 2) + "px");
            maskMsgDiv.css("left", Math.round(element.width() / 2 - (maskMsgDiv.width() - parseInt(maskMsgDiv.css("padding-left")) - parseInt(maskMsgDiv.css("padding-right"))) / 2) + "px");

            maskMsgDiv.show();
        }

    };

    $.unmaskElement = function (element) {
        //if this element has delayed mask scheduled then remove it
        if (element.data("_mask_timeout") !== undefined) {
            clearTimeout(element.data("_mask_timeout"));
            element.removeData("_mask_timeout");
        }

        element.find(".loadmask-msg,.loadmask").remove();
        element.removeClass("masked");
        element.removeClass("masked-relative");
        element.find("select").removeClass("masked-hidden");
    };

})(jQuery);
// vim: ts=4:sw=4:nu:fdc=4:nospell
/*global Ext */
/**
 * @singleton 
 * @class Ext.ux.util
 *
 * Contains utilities that do not fit elsewhere
 *
 * @author     Ing. Jozef Sakáloš
 * @copyright  (c) 2009, Ing. Jozef Sakáloš
 * @version    1.0
 * @date       30. January 2009
 * @revision   $Id: Ext.ux.util.js 620 2009-03-09 12:41:44Z jozo $
 *
 * @license
 * Ext.ux.util.js is licensed under the terms of
 * the Open Source LGPL 3.0 license.  Commercial use is permitted to the extent
 * that the code/component(s) do NOT become part of another Open Source or Commercially
 * licensed development library or toolkit without explicit permission.
 *
 * <p>License details: <a href="http://www.gnu.org/licenses/lgpl.html"
 * target="_blank">http://www.gnu.org/licenses/lgpl.html</a></p>
 *
 * @donate
 * <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
 * <input type="hidden" name="cmd" value="_s-xclick">
 * <input type="hidden" name="hosted_button_id" value="3430419">
 * <input type="image" src="https://www.paypal.com/en_US/i/btn/x-click-butcc-donate.gif" 
 * border="0" name="submit" alt="PayPal - The safer, easier way to pay online.">
 * <img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1">
 * </form>
 */

Ext.ns('Ext.ux.util');

// {{{
/**
 * @param {String} s
 * @return {String} MD5 sum
 * Calculates MD5 sum of the argument
 * @forum   28460
 * @author  <a href="http://extjs.com/forum/member.php?u=13648">wm003</a>
 * @version 1.0
 * @date    20. March 2008
 *
 */
Ext.ux.util.MD5 = function(s) {
    var hexcase = 0;
    var chrsz = 8;

    function safe_add(x, y){
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }
    function bit_rol(num, cnt){
        return (num << cnt) | (num >>> (32 - cnt));
    }
    function md5_cmn(q, a, b, x, s, t){
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
    }
    function md5_ff(a, b, c, d, x, s, t){
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }
    function md5_gg(a, b, c, d, x, s, t){
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }
    function md5_hh(a, b, c, d, x, s, t){
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function md5_ii(a, b, c, d, x, s, t){
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    function core_md5(x, len){
        x[len >> 5] |= 0x80 << ((len) % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;
        var a =  1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d =  271733878;
        for(var i = 0; i < x.length; i += 16){
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;
            a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
            d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
            b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
            d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
            c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
            d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
            d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);
            a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
            d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
            c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
            b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
            a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
            d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
            c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
            d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
            c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
            a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
            d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
            c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
            b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);
            a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
            d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
            b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
            d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
            c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
            d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
            c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
            a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
            d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
            b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);
            a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
            d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
            c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
            d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
            d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
            a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
            d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
            b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);
            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
        }
        return [a, b, c, d];
    }
    function str2binl(str){
        var bin = [];
        var mask = (1 << chrsz) - 1;
        for(var i = 0; i < str.length * chrsz; i += chrsz) {
            bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (i%32);
        }
        return bin;
    }
    function binl2hex(binarray){
        var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
        var str = "";
        for(var i = 0; i < binarray.length * 4; i++) {
            str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) + hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);
        }
        return str;
    }
    return binl2hex(core_md5(str2binl(s), s.length * chrsz));
};  
// }}}
// {{{
/**
 * Clone Function
 * @param {Object/Array} o Object or array to clone
 * @return {Object/Array} Deep clone of an object or an array
 * @author Ing. Jozef Sakáloš
 */
Ext.ux.util.clone = function(o) {
	if(!o || 'object' !== typeof o) {
		return o;
	}
	if('function' === typeof o.clone) {
		return o.clone();
	}
	var c = '[object Array]' === Object.prototype.toString.call(o) ? [] : {};
	var p, v;
	for(p in o) {
		if(o.hasOwnProperty(p)) {
			v = o[p];
			if(v && 'object' === typeof v) {
				c[p] = Ext.ux.util.clone(v);
			}
			else {
				c[p] = v;
			}
		}
	}
	return c;
}; // eo function clone
// }}}
// {{{
/**
 * Copies the source object properties with names that match target object properties to the target. 
 * Undefined properties of the source object are ignored even if names match.
 * This way it is possible to create a target object with defaults, apply source to it not overwriting 
 * target defaults with <code>undefined</code> values of source.
 * @param {Object} t The target object
 * @param {Object} s (optional) The source object. Equals to scope in which the function runs if omitted. That 
 * allows to set this function as method of any object and then call it in the scope of that object. E.g.:
 * <pre>
 * var p = new Ext.Panel({
 * &nbsp;	 prop1:11
 * &nbsp;	,prop2:22
 * &nbsp;	,<b>applyMatching:Ext.ux.util.applyMatching</b>
 * &nbsp;	// ...
 * });
 * var t = p.applyMatching({prop1:0, prop2:0, prop3:33});
 * </pre>
 * The resulting object:
 * <pre>
 * t = {prop1:11, prop2:22, prop3:33};
 * </pre>
 * @return {Object} Original passed target object with properties updated from source
 */
Ext.ux.util.applyMatching = function(t, s) {
	var s = s || this;
	for(var p in t) {
		if(t.hasOwnProperty(p) && undefined !== s[p]) {
			t[p] = s[p];
		}
	}
	return t;
}; // eo function applyMatching
// }}}

// conditional override
// {{{
/**
 * Same as {@link Ext#override} but overrides only if method does not exist in the target class
 * @member Ext
 * @param {Object} origclass
 * @param {Object} overrides
 */
Ext.overrideIf = 'function' === typeof Ext.overrideIf ? Ext.overrideIf : function(origclass, overrides) {
	if(overrides) {
		var p = origclass.prototype;
		for(var method in overrides) {
			if(!p[method]) {
				p[method] = overrides[method];
			}
		}
	}
};
// }}}

// RegExp
// {{{
/**
 * @class RegExp
 */
if('function' !== typeof RegExp.escape) {
	/**
	 * Escapes regular expression
	 * @param {String} s
	 * @return {String} The escaped string
	 * @static
	 */
	RegExp.escape = function(s) {
		if('string' !== typeof s) {
			return s;
		}
		return s.replace(/([.*+?\^=!:${}()|\[\]\/\\])/g, '\\$1');
	};
}
Ext.overrideIf(RegExp, {

	/**
	 * Clones RegExp object
	 * @return {RegExp} Clone of this RegExp
	 */
	 clone:function() {
		return new RegExp(this);
	} // eo function clone
});
// }}}

// Array
// {{{
Ext.overrideIf(Array, {
	// {{{
	/**
	 * One dimensional copy. Use {@link Ext.ux.util#clone Ext.ux.util.clone} to deeply clone an Array.
	 * @member Array
	 * @return {Array} New Array that is copy of this
	 */
	 copy:function() {
		var a = [];
		for(var i = 0, l = this.length; i < l; i++) {
			a.push(this[i]);
		}
		return a;
	} // eo function copy
	// }}}
	// {{{
	/**
	 * Not used anyway as Ext has its own indexOf
	 * @member Array
	 * @return {Integer} Index of v or -1 if not found
	 * @param {Mixed} v Value to find indexOf
	 * @param {Integer} b Starting index
	 */
	,indexOf:function(v, b) {
		for(var i = +b || 0, l = this.length; i < l; i++) {
			if(this[i] === v) { 
				return i; 
			}
		}
		return -1;
	} // eo function indexOf
	// }}}
	// {{{
	/**
	 * Returns intersection of this Array and passed arguments
	 * @member Array
	 * @return {Array} Intersection of this and passed arguments
	 * @param {Mixed} arg1 (optional)
	 * @param {Mixed} arg2 (optional)
	 * @param {Mixed} etc. (optional)
	 */
	,intersect:function() {
		if(!arguments.length) {
			return [];
		}
		var a1 = this, a2, a;
		for(var k = 0, ac = arguments.length; k < ac; k++) {
			a = [];
			a2 = arguments[k] || [];
			for(var i = 0, l = a1.length; i < l; i++) {
				if(-1 < a2.indexOf(a1[i])) {
					a.push(a1[i]);
				}
			}
			a1 = a;
		}
		return a.unique();
	} // eo function intesect
	// }}}
	// {{{
	/**
	 * Returns last index of passed argument
	 * @member Array
	 * @return {Integer} Index of v or -1 if not found
	 * @param {Mixed} v Value to find indexOf
	 * @param {Integer} b Starting index
	 */
	,lastIndexOf:function(v, b) {
		b = +b || 0;
		var i = this.length; 
		while(i-- > b) {
			if(this[i] === v) { 
				return i; 
			}
		}
		return -1;
	} // eof function lastIndexOf
	// }}}
	// {{{
	/**
	 * @member Array
	 * @return {Array} New Array that is union of this and passed arguments
	 * @param {Mixed} arg1 (optional)
	 * @param {Mixed} arg2 (optional)
	 * @param {Mixed} etc. (optional)
	 */
	,union:function() {
		var a = this.copy(), a1;
		for(var k = 0, ac = arguments.length; k < ac; k++) {
			a1 = arguments[k] || [];
			for(var i = 0, l = a1.length; i < l; i++) {
				a.push(a1[i]);
			}
		}
		return a.unique();
	} // eo function union
	// }}}
	// {{{
	/**
	 * Removes duplicates from array
	 * @member Array
	 * @return {Array} New Array with duplicates removed
	 */
	,unique:function() {
		var a = [], i, l = this.length;
		for(i = 0; i < l; i++) {
			if(a.indexOf(this[i]) < 0) { 
				a.push(this[i]); 
			}
		}
		return a;
	} // eo function unique
	// }}}

});
// }}}

// eof

if (top.ui.ctl.menu) {
	var me = this;
	top.ui.ctl.menu.Dom.me.registerDirtyCheck(dirtyCheck, me);
}

function dirtyCheck(me) {
	return !window.top.fin.cmn.status.itemValid();
}
            
function modified(status) {
	window.top.fin.appUI.modified = status;
	
	if (status)
		me.setStatus("Edit");
}

function setStatus(status) {
	var me = this;
	
	me.$itemStatusImage = $("#app-notification-itemStatusImage");
	me.$itemModifiedImage = $("#app-notification-itemModifiedImage");
	me.$itemStatusText = $("#app-notification-itemStatusText");
	
	if (status == "New")
		message = "New";
	else if (status == "Loading" || status == "Saving" || status == "Exporting" || status == "Uploading" || status == "Importing")
		message = status + ", please wait...";
	else if (status == "Saved")
		message = "Data saved successfully.";
	else if (status == "Imported")
		message = "Data imported successfully.";
	else if (status == "Exported")
		message = "Data exported successfully.";
	else if (status == "Locked")
		message = "The current page is Readonly.";
	else if (status == "Error")
		message = "Error while updating the data.";
	else
		message = "Normal";

	if (status == "Locked")
		me.$itemModifiedImage.addClass("Locked");
	else
		me.$itemModifiedImage.removeClass("Locked");		

	if (status == "Edit")
		me.$itemModifiedImage.addClass("Modified");		
	else
		me.$itemModifiedImage.removeClass("Modified");
		

	if (status == "Edit" || status == "Loaded" || status == "Saved" || status == "Imported" || status == "Exported")
		status = "Normal";

	me.$itemStatusImage.attr("class", "itemStatusImage " + status);
	me.$itemStatusText.text(message);
}

Ext.Ajax.timeout = 300000; //5 minutes

jQuery.ajaxSettings.contentType = 'application/x-www-form-urlencoded; charset=utf-8';

Ext.namespace('eFin', 'eFin.data', 'eFin.ctrl', 'eFin.page', 'eFin.page.app', 'eFin.data.app', 'eFin.ctrl.app','eFin.data.hcm');

Ext.override(WebLight.Control, {

    mask: function (msg) {
        if (!msg)
            msg = 'Please wait...';
        //this.$this.maskEl(msg);
		setStatus(msg.replace("...", ""));
		Ext.getBody().mask(msg);
    },
    unmask: function (msg) {
        //this.$this.unmaskEl();
		if (window.top.fin.appUI.modified)
			setStatus("Edit");
		else
			setStatus(msg);
		Ext.getBody().unmask();
    }

});

Ext.override(WebLight.Page, {

    mask: function (msg) {
        if (!msg)
            msg = 'Please wait...';
        //this.$this.maskEl(msg);
		setStatus(msg.replace("...", ""));
		Ext.getBody().mask(msg);
    },
    unmask: function (msg) {
        //this.$this.unmaskEl();
		if (window.top.fin.appUI.modified)
			setStatus("Edit");
		else
			setStatus(msg);
		Ext.getBody().unmask();
    }

});

Ext.grid.RowNumberer = function(config){
    Ext.apply(this, config);
    if(this.rowspan){
        this.renderer = this.renderer.createDelegate(this);
    }
};

Ext.grid.RowNumberer.prototype = {   
    header: "#",    
    width: 45,
    sortable: true,
    fixed:true,
    menuDisabled:true,
    dataIndex: '',
    id: '0',
    rowspan: undefined,
	cls:'ux-grid-2',
    renderer : function(v, p, record, rowIndex){
        if(this.rowspan){
            p.cellAttr = 'rowspan="'+this.rowspan+'"';
        }
        return rowIndex+1;
    }
};


Ext.EventManager.onWindowResize(function () {
	
	if(Ext.get('app-notification-task-form') != null) {
		var el = Ext.get('app-notification-task-form').select('div.columns');
		el.setHeight($(window).height() - 105);
	}	
});
		
eFin.data.XmlReader = Ext.extend(Ext.data.XmlReader, {

    read: function (response) {
        var xml = this.formatXml(response.responseText);
        var doc;
        if (window.ActiveXObject) {
            doc = new ActiveXObject("Microsoft.XMLDOM");
            doc.async = "false";
            doc.loadXML(xml);
        } else {
            doc = new DOMParser().parseFromString(xml, "text/xml");
        }

        if (!doc) {
            throw { message: "XmlReader.read: XML Document not available" };
        }
        return this.readRecords(doc);
    },

    /// fix returned data is "True" and "False" issue
    formatXml: function (input) {

        input = input.replace(/"True"/gi, '"true"');
        input = input.replace(/"False"/gi, '"false"');
        return input;
    }

});

eFin.data.XmlStore = WebLight.extend(WebLight.data.Store, {

    /// default api url
    url: '/net/crothall/chimes/fin/app/act/Provider.aspx',

    recordName: 'item',

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
            reader = new eFin.data.XmlReader({ record: me.recordName, idProperty: idProperty }, fields);
            config.reader = reader;
            this.reader = reader;
        }

        eFin.data.XmlStore.superclass.constructor.call(this, config);

    },

    requestId: 2,
    moduleId: 'app',
    targetId: 'iiCache',
    storeId: '',

    getRequestId: function () { return this.requestId; },

    getStoreId: function () { return this.storeId; },

    getCriteria: function () { return {}; },

    getRequestXml: function () {
        var arr = ['<criteria>'];
        var criteria = this.getCriteria();

        var userId = '[user]';

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

        eFin.data.XmlStore.superclass.load.call(this, {});
    },

    reload: function (options) {
        // do not call subclass load event
        this.setBaseParam('requestId', this.getRequestId());
        this.setBaseParam('moduleId', this.moduleId);
        this.setBaseParam('targetId', this.targetId);
        this.setBaseParam('requestXml', this.getRequestXml());

        eFin.data.XmlStore.superclass.load.call(this, {});
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

        eFin.data.XmlStore.superclass.loadData.call(this, doc);
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
        var records = eFin.data.XmlStore.superclass.getChangedRecords.call(this);

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
            for (key in item.data) {
                var value = item.data[key];
                if (Ext.isDate(value))
                    value = Ext.util.Format.date(value, 'm/d/Y');
                else if (Ext.isString(value))
                    value = value.replace(/"/gi, '&quot;');
                xml.push(String.format(' {0}="{1}"', key, value));

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
            };
            innerCallback();
        });
    }

});

eFin.data.XmlStore._requestId = 2;
//http://localhost/net/crothall/chimes/fin/app/act/Provider.aspx?moduleId=app&targetId=iiCache&requestId=1&requestXml=%3Ccriteria%3EstoreId:appDataCollectors,userId:[user]%3C/criteria%3E

/*
<item id="1" houseCodeId="363" moduleId="5" numberOfColumns="6" frequency="Monthly" 
lockout="True" email="True" emailAddress="admin@crothall.com" message="True" 
messageText="Your monthly BI Statistics update is overdue. Click here to enter the data now before you can no longer access the other modules." lockoutMessage="True" 
lockoutMessageText="Your monthly BI Statistics update is overdue. You will no longer be able to access any modules until you complete the update. Click here to enter the data now."/>

*/

eFin.data.app.DataCollectorStore = WebLight.extend(eFin.data.XmlStore, {

    url: '/net/crothall/chimes/fin/app/act/Provider.aspx',

    moduleId: 'app',

    recordName: 'item',

    storeId: 'appDataCollectors',

    fields: [
               { name: 'id', mapping: '@id', type: 'float' },
               { name: 'houseCodeId', mapping: '@houseCodeId', type: 'float' },
               { name: 'houseCodeBrief', mapping: '@houseCodeBrief' },
               { name: 'moduleId', mapping: '@moduleId', type: 'float' },
               { name: 'numberOfColumns', mapping: '@numberOfColumns', type: 'float' },
               { name: 'frequency', mapping: '@frequency' },
               { name: 'lockout', mapping: '@lockout', type: 'bool' },
               { name: 'email', mapping: '@email', type: 'bool' },
               { name: 'emailAddress', mapping: '@emailAddress' },
               { name: 'columns', mapping: '@columns' },
               { name: 'users', mapping: '@users' },
               { name: 'message', mapping: '@message', type: 'bool' },
               { name: 'messageText', mapping: '@messageText' },
               { name: 'lockoutMessage', mapping: '@lockoutMessage', type: 'bool' },
               { name: 'lockoutMessageText', mapping: '@lockoutMessageText' },
                 { name: 'active', mapping: '@active', type: 'bool' },
               { name: 'description', mapping: '@description' }
           ]

    , loadSampleData: function () {
        this.loadData(window.__weblight_t_fbd3614b[0]);
    }
});
/*
<item id="22" number="22" name="HcmHoucBedsLicensed"/>
*/

eFin.data.app.ModuleColumnStore = WebLight.extend(eFin.data.XmlStore, {

    url: '/net/crothall/chimes/fin/app/act/Provider.aspx',

    moduleId: 'app',

    recordName: 'item',

    storeId: 'appModuleColumns',

    moduleName: '',

    fields: [
               { name: 'id', mapping: '@id', type: 'float' },
               { name: 'number', mapping: '@number', type: 'float' },
               { name: 'name', mapping: '@name' },
               { name: 'description', mapping: '@description' }
           ]
    ,
    load: function (moduleName) {
        this.moduleName = moduleName;


        eFin.data.app.ModuleColumnStore.superclass.load.call(this);
    },

    getCriteria: function () {
        return { module: this.moduleName };
    }
});
/*
<item id="3" dataCollectorId="1" numberOfColumns="6" frequency="Monthly" brief="BedsLicensed" title="Beds Licensed" displayOrder="3" active="True"/>
*/

eFin.data.app.DataCollectorColumnStore = WebLight.extend(eFin.data.XmlStore, {

    url: '/net/crothall/chimes/fin/app/act/Provider.aspx',

    moduleId: 'app',

    recordName: 'item',

    storeId: 'appDataCollectorColumns',

    dataCollectorId: 0,

    fields: [
               { name: 'id', mapping: '@id', type: 'float' },
               { name: 'dataCollectorId', mapping: '@dataCollectorId', type: 'int' },
               { name: 'moduleColumn', mapping: '@moduleColumnId', type: 'float' },
               { name: 'brief', mapping: '@brief', type: 'string' },
               { name: 'numberOfColumns', mapping: '@numberOfColumns', type: 'int' },
               { name: 'title', mapping: '@title', type: 'string' },
               { name: 'active', mapiing: '@active', type: 'bool' },
               { name: 'displayOrder', mapping: '@displayOrder', type: 'int' },
			   { name: 'validation', mapping: '@validation', type: 'string' },
			   { name: 'referenceTableName', mapping: '@referenceTableName', type: 'string' }
           ]
    ,
    load: function (dataCollectorId) {
        this.dataCollectorId = dataCollectorId;


        eFin.data.app.ModuleColumnStore.superclass.load.call(this);
    },

    getCriteria: function () {
        return { dataCollectorId: this.dataCollectorId };
    }
});


eFin.data.app.DataCollectorTaskStore = WebLight.extend(eFin.data.XmlStore, {
    url: '/net/crothall/chimes/fin/app/act/Provider.aspx',

    moduleId: 'app',

    recordName: 'item',

    storeId: 'appDataCollectorTasks',

    fields: [
                 { name: 'id', mapping: '@id', type: 'int' },
                 { name: 'appUserId', mapping: '@appUserId', type: 'int' },
                 { name: 'dataCollectorId', mapping: '@dataCollectorId', type: 'int' },
                 { name: 'module', mapping: '@module', type: 'string' },
                 { name: 'houseCodeId', mapping: '@houseCodeId', type: 'int' },
                { name: 'houseCodeBrief', mapping: '@houseCodeBrief' },
                { name: 'frequency', mapping: '@frequency', type: 'string' },
                 { name: 'messageText', mapping: '@messageText', type: 'string' },
                 { name: 'lockMessageText', mapping: '@lockMessageText', type: 'string' },
                 { name: 'startDate', mapping: '@startDate', type: 'DateTime' },
                 { name: 'endDate', mapping: '@endDate', type: 'DateTime' },
                 { name: 'active', mapping: '@active', type: 'bool' },
                 { name: 'modBy', mapping: '@modBy', type: 'string' },
                 { name: 'modAt', mapping: '@modAt', type: 'DateTime' },
                 { name: 'description', mapping: '@description', type: 'string' }
                ],

    loadSampleData: function () {
        this.loadData(window.__weblight_t_fbd3614b[1]);
    }
});

eFin.data.app.hcmSiteTypeStore = WebLight.extend(eFin.data.XmlStore, {
    url: '/net/crothall/chimes/fin/app/act/Provider.aspx',

    moduleId: 'app',

    recordName: 'item',

    storeId: 'hcmSiteTypes',

    fields: [
                 { name: 'id', mapping: '@id', type: 'int' },                 
                 { name: 'name', mapping: '@name', type: 'string' }
                ],
});

eFin.data.app.remitToStore = WebLight.extend(eFin.data.XmlStore, {
    url: '/net/crothall/chimes/fin/app/act/Provider.aspx',

    moduleId: 'app',

    recordName: 'item',

    storeId: 'remitToLocations',

    fields: [
                 { name: 'id', mapping: '@id', type: 'int' },                 
                 { name: 'name', mapping: '@name', type: 'string' }
                ],
});

eFin.data.app.budgetLaborCalcMethodStore = WebLight.extend(eFin.data.XmlStore, {
    url: '/net/crothall/chimes/fin/app/act/Provider.aspx',

    moduleId: 'app',

    recordName: 'item',

    storeId: 'budgetLaborCalcMethods',

    fields: [
                 { name: 'id', mapping: '@id', type: 'int' },                 
                 { name: 'name', mapping: '@name', type: 'string' }
                ],
});

eFin.data.app.budgetTemplateStore = WebLight.extend(eFin.data.XmlStore, {
    url: '/net/crothall/chimes/fin/app/act/Provider.aspx',

    moduleId: 'app',

    recordName: 'item',

    storeId: 'budgetTemplates',

    fields: [
                 { name: 'id', mapping: '@id', type: 'int' },                 
                 { name: 'name', mapping: '@name', type: 'string' }
                ],
});

eFin.data.app.serviceTypeStore = WebLight.extend(eFin.data.XmlStore, {
    url: '/net/crothall/chimes/fin/app/act/Provider.aspx',

    moduleId: 'app',

    recordName: 'item',

    storeId: 'serviceTypes',

    fields: [
                 { name: 'id', mapping: '@id', type: 'int' },                 
                 { name: 'name', mapping: '@name', type: 'string' }
                ],
});

eFin.page.app.Notification = WebLight.extend(WebLight.Page, {
    html: window.__weblight_t_fbd3614b[2],
    title: 'Notification',

    dataCollectorTaskStore: null,
    dataCollectorTaskGrid: null,
	dataCollectorColumnStore: null,
    dataCollectorStore: null,
    dataCollectorTaskForm: null,
	dataCollectorTaskId:0,
	dataCollectorId: 0,	
	houseCode:0,
	frequency:'Monthly',
	description:'',
	rowNumber:-1,	
	
    createDataCollectorTaskGrid: function () {
        var me = this;

        var dataCollectorTaskCMModel = new Ext.grid.ColumnModel({
            columns: [
							new Ext.grid.RowNumberer(),
                              { dataIndex: 'module', header: 'MODULE', align: 'left', width: 100 },
                              { dataIndex: 'houseCodeBrief', header: 'HOUSECODE', align: 'left', width: 100 },
                              { dataIndex: 'frequency', header: 'FREQUENCY', align: 'left', width: 100 },
                              { dataIndex: 'startDate', header: 'DEADLINE', align: 'left', width: 100 },
                            { header: 'DESCRIPTION', dataIndex: 'description', width: 150 },
                              { dataIndex: 'messageText', header: 'MESSAGE', align: 'left', width: 250,
                                  renderer: function (value, meta, record) {
                                      return '<div style="white-space:normal;">' + value.replace(/\n/gi, '<br/>') + '</div>';
                                  }
                              }
                             ]
        });

        me.dataCollectorTaskGrid = new Ext.grid.GridPanel({
            store: me.dataCollectorTaskStore,
            autoHeight: true,
            autoWidth: true,
            ctCls: 'ux-grid-2',
            enableHdMenu: false,
            layout:'fit',
            cm: dataCollectorTaskCMModel,
            stripeRows: true,
            viewConfig: {
                forceFit: true,
                scrollOffset: 0
            }
        });

        me.dataCollectorTaskGrid.on('rowclick', function (grid, rowIndex, e) {

            var record = me.dataCollectorTaskStore.getAt(rowIndex);
            var rows = me.dataCollectorTaskStore.queryBy(function (r) { return r.get('dataCollectorId') == record.get('dataCollectorId') && new Date(r.get('startDate')) < new Date(record.get('startDate')); });

            if (rows.getCount() > 0) {
                alert('You must finish the oldest task of this data collector first.');
                return;
            }			
			
			me.rowNumber = rowIndex;
			me.dataCollectorTaskId = record.get('id');
			me.dataCollectorId = record.get('dataCollectorId');
			me.houseCode = record.get('houseCodeBrief');
			me.frequency = record.get('frequency');
            me.description = record.get('description').replace(/\s/gi, '_');			
			
			me.dataCollectorColumnStore = new eFin.data.app.DataCollectorColumnStore();
			me.dataCollectorColumnStore.on('beforeload', function () { me.mask('Loading...'); });
			me.dataCollectorColumnStore.load(me.dataCollectorId);			
			me.dataCollectorColumnStore.on('load', function () { me.createDataCollectorTaskForm(); me.unmask("Loaded");});
        });

        me.addChildControl(me.dataCollectorTaskGrid, "dataCollectorTask-grid");
    },

    createChildControls: function () {
        var me = this;

        me.dataCollectorTaskStore = new eFin.data.app.DataCollectorTaskStore();
        me.createDataCollectorTaskGrid();
		
        me.dataCollectorTaskStore.on('beforeload', function () { me.mask('Loading...'); });
        me.dataCollectorTaskStore.on('load', function () { me.unmask("Loaded"); });
				
        me.initButtons();
		$("#app-notification-divButtons").hide();
		
		me.hcmSiteTypeStore = new eFin.data.app.hcmSiteTypeStore();
		me.hcmSiteTypeStore.load();
		
		me.remitToStore = new eFin.data.app.remitToStore();
		me.remitToStore.load();
		
		me.budgetLaborCalcMethodStore = new eFin.data.app.budgetLaborCalcMethodStore();
		me.budgetLaborCalcMethodStore.load();
		
		me.budgetTemplateStore = new eFin.data.app.budgetTemplateStore();
		me.budgetTemplateStore.load();
		
		me.serviceTypeStore = new eFin.data.app.serviceTypeStore();
		me.serviceTypeStore.load();
		
        eFin.page.app.Notification.superclass.createChildControls.call(this);
    },

    dataBind: function () {
        var me = this;

        me.dataCollectorTaskStore.load();

        eFin.page.app.Notification.superclass.dataBind.call(this);
    },
	
	createDataCollectorTaskForm: function () {

        var me = this;
        var html = [];

        var fields = [];
        html.push('<table class="task-fields">');
		html.push('<div style="margin:0px 10px 0px 10px">');
		html.push('<div id="divContainer" class="columnsContainer">');
		html.push('<div id="divColumns" class="columns">');
		html.push('<div style="height:10px;"></div>');
		
        html.push(String.format(window.__weblight_t_fbd3614b[4],
                    'HouseCode', 'HouseCode', me.houseCode));
        html.push(String.format(window.__weblight_t_fbd3614b[4],
                    'Frequency', 'Frequency', me.frequency));
        html.push(String.format(window.__weblight_t_fbd3614b[4],
                    'Description', 'Description', me.description.replace(/_/gi, ' ')));
        html.push(String.format(window.__weblight_t_fbd3614b[4],
                    'Date', 'Date', Ext.util.Format.date(new Date(), 'M d, Y')));
        me.dataCollectorColumnStore.each(function (item, index) {
            var fieldName = item.get('brief');
            var fieldTitle = item.get('title');
			var fieldValidation = item.get('validation');
			var fieldReferenceTableName = item.get('referenceTableName');

            html.push(String.format(window.__weblight_t_fbd3614b[3],
                    fieldName, fieldTitle, ''));
            fields.push(me.getEditor(fieldName, fieldTitle, fieldValidation, fieldReferenceTableName));
        });
		
		html.push('<div style="clear:both; height:10px;"></div>');
		html.push('</div>');
		html.push('</div>');
		html.push('</div>');
        html.push('</table>');

        me.dataCollectorTaskForm = new WebLight.form.DataView({
            html: html.join(''),
            fields: fields
        });

        me.addChildControl(me.dataCollectorTaskForm, 'task-form');

        me.dataCollectorTaskForm.updateData({});
		$("#app-notification-dataCollectorTask-grid").hide();
		$("#" + me.dataCollectorTaskForm.id + "-divContainer").show();
		$("#app-notification-divButtons").show();		
		$("#" + me.dataCollectorTaskForm.id + "-divColumns").height($(window).height() - 105);
    },

    getEditor: function (fieldName, fieldTitle, fieldValidation, fieldReferenceTableName) {
        var me = this;
		
        var config = { xtype: 'textfield', width: 150, name: fieldName, allowBlank: false , msgTarget: 'side', listeners: { 'change': function() { modified(true); } }};
		
		if (fieldReferenceTableName !=  '') {
			if (fieldName == 'HcmSiteType') {
				config = Ext.apply(config, { width: 150, xtype: 'combo', valueField: 'id', displayField: 'name', msgTarget: 'none', triggerAction: 'all', allowBlank: false, editable: false,
					listeners: {'change': function(){modified(true);}},
					store: me.hcmSiteTypeStore,mode: 'local'
				});
			}
			if (fieldName == 'HcmRemitToLocation') {
				config = Ext.apply(config, { width: 150, xtype: 'combo', valueField: 'id', displayField: 'name', msgTarget: 'none', triggerAction: 'all', allowBlank: false, editable: false,
					listeners: {'change': function(){modified(true);}},
					store: me.remitToStore,mode: 'local'
				});
			}
			if (fieldName == 'HcmBudgetLaborCalcMethod') {
				config = Ext.apply(config, { width: 150, xtype: 'combo', valueField: 'id', displayField: 'name', msgTarget: 'none', triggerAction: 'all', allowBlank: false, editable: false,
					listeners: {'change': function(){modified(true);}},
					store: me.budgetLaborCalcMethodStore,mode: 'local'
				});
			}
			if (fieldName == 'HcmBudgetTemplate') {
				config = Ext.apply(config, { width: 150, xtype: 'combo', valueField: 'id', displayField: 'name', msgTarget: 'none', triggerAction: 'all', allowBlank: false, editable: false,
					listeners: {'change': function(){modified(true);}},
					store: me.budgetTemplateStore,mode: 'local'
				});
			}
			if (fieldName == 'HcmServiceType') {
				config = Ext.apply(config, { width: 150, xtype: 'combo', valueField: 'id', displayField: 'name', msgTarget: 'none', triggerAction: 'all', allowBlank: false, editable: false,
					listeners: {'change': function(){modified(true);}},
					store: me.serviceTypeStore,mode: 'local'
				});
			}			
		}
		else {
			if (fieldValidation ==  'Int')
	            config = Ext.apply(config, { width: 150, minValue: 0, msgTarget: 'side', regex: /^[0-9]+$/, regexText: 'This field should only contain numbers', 
				listeners: { 'change': function() { modified(true); } }});
			else if (fieldValidation ==  'Decimal') {
							
				if (fieldName == 'HcmHoucDefaultLunchBreak') {
		            config = Ext.apply(config, { width: 150, xtype: 'combo', valueField: 'value', displayField: 'name', msgTarget: 'none',
						listeners: { 'change': function() { modified(true); } },
		                store: me.defaultLunchBreakStore, mode: 'local',
		                store: new Ext.data.ArrayStore({ fields: [{ name: 'value', type: 'float' }, 'name'], data: [[0.25, '0.25'], [0.5, '0.50'], [0.75, '0.75'], [1, '1.00']] })
		            });
		        }
		        else if (fieldName == 'HcmHoucLunchBreakTrigger') {
		            config = Ext.apply(config, { width: 150, xtype: 'combo', valueField: 'value', displayField: 'value', msgTarget: 'none',
						listeners: { 'change': function() { modified(true); } },
		                store: me.defaultLunchBreakStore, mode: 'local',
		                store: new Ext.data.ArrayStore({ fields: [{ name: 'value', type: 'float'}], data: [[4], [6], [8]] })
		            });
		        }
				else
					config = Ext.apply(config, { width: 150, minValue: 0, xtype: 'numberfield', msgTarget: 'side', 
					listeners: { 'change': function() { modified(true); } } });
			}            
	        else if (fieldValidation == 'DateTime')
	            config = Ext.apply(config, { width: 150, xtype: 'datefield', msgTarget: 'none',
				listeners: { 'change': function() { modified(true); } }});
	        else if (fieldValidation == 'Email')
	            config = Ext.apply(config, { width: 150, vtype: 'email', msgTarget: 'side', 
				listeners: { 'change': function() { modified(true); } }});
	        else if (fieldValidation == 'Phone')
	            config = Ext.apply(config, { width: 150, mask: '(999) 999-9999', msgTarget: 'side', 
				listeners: { 'change': function() { modified(true); } } });
	        else if (fieldValidation == 'Zip')
	            config = Ext.apply(config, { width: 150, mask: '99999?-9999', msgTarget: 'side', 
				listeners: { 'change': function() { modified(true); } } });
			else if (fieldValidation == 'Bit')
	            config = Ext.apply(config, { xtype: 'checkbox',
				listeners: { 'change': function() { modified(true); } }});
		}       

        return Ext.create(config);
    },
	
	initButtons: function () {
        var me = this;

        me.$cancelButton = me.$child('AnchorCancel');
        me.$saveButton = me.$child('AnchorSave');

        me.enableButton('AnchorCancel');
        me.enableButton('AnchorSave');

        me.$saveButton.click(function () {
            if (me.$saveButton.hasClass('Enabled') && me.dataCollectorTaskForm && me.dataCollectorTaskForm.isValid()) {
                me.saveData();
            }
        });

        me.$cancelButton.click(function () {
            if (me.$cancelButton.hasClass('Enabled')) {
				modified(false);
				me.unmask('Loaded');
				$("#app-notification-dataCollectorTask-grid").show();				
				$("#" + me.dataCollectorTaskForm.id + "-divContainer").hide();
				$("#app-notification-divButtons").hide();
            }
        });
    },

    saveData: function () {
        var me = this;
        var xml = ['<transaction id="1">'];

        xml.push('<');
        xml.push('dataCollectorTaskData');
        xml.push(String.format(' {0}="{1}"', 'AppDataCollectorTask', me.dataCollectorTaskId));
        var data = me.dataCollectorTaskForm.getData();
        for (key in data) {
            var value = data[key];
            if (Ext.isDate(value))
                value = Ext.util.Format.date(value, 'm/d/Y');
            else if (Ext.isString(value))
                value = value.replace(/"/gi, '&quot;');
			else if (Ext.isBoolean(value))
				value = (value ? 1 : 0);
            xml.push(String.format(' {0}="{1}"', key, value));
        }
        xml.push('/>');


        xml.push('</transaction>');

        var postData = String.format('moduleId={0}&requestId={1}&requestXml={2}&&targetId=iiTransaction',
            'app', 2, encodeURIComponent(xml.join('').replace(/\&/gi, '&amp;')));
		
        me.mask('Saving...');
        jQuery.post('/net/crothall/chimes/fin/app/act/Provider.aspx', postData, function (data, status) {
            var nodes = data.getElementsByTagName("appDataCollectorTask");
            if (nodes.length == 0)
				alert('The task has been completed by someone else.');			
			modified(false);
			me.unmask("Loaded");			
			me.dataCollectorTaskStore.removeAt(me.rowNumber);
			me.dataCollectorTaskGrid.getView().refresh();
			$("#app-notification-dataCollectorTask-grid").show();
			$("#" + me.dataCollectorTaskForm.id + "-divContainer").hide();
			$("#app-notification-divButtons").hide();			
        });
    },

    enableButton: function (name) {
        var me = this;

        me.$child(name).removeClass('Disabled').addClass('Enabled');
        me.$child(name + 'Begin').removeClass('Disabled').addClass('Enabled');
        me.$child(name + 'Middle').removeClass('Disabled').addClass('Enabled');
        me.$child(name + 'End').removeClass('Disabled').addClass('Enabled');
    }
});

WebLight.PageMgr.registerType('app.notification', eFin.page.app.Notification);
eFin.page.app.DataCollectorTask = WebLight.extend(WebLight.Page, {
    html: window.__weblight_t_fbd3614b[1],
    
});

WebLight.Router.mapRoute('^app/notification/main$', {
    xtype: 'app.notification'
});