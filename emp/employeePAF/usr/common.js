var uppercaseFirstLetter = function (input) {
    return (!!input) ? input.replace(/^(.)|(\s|\-)(.)/g, function ($1) {
        return $1.toUpperCase();
    }) : '';
}

var lowercaseFirstLetter = function (input) {
    return (!!input) ? input.replace(/^(.)|(\s|\-)(.)/g, function ($1) {
        return $1.toLowerCase();
    }) : '';
}


var deserializeXml = function (xml, nodeName, options) {
    // options = {upperFirstLetter: true, boolItems: [], dateItems: []}

    options = options || {};

    var upperCaseItems = function (input) {
        var items = [];
        if (input && input.length) {
            $.each(input, function (index, item) {
                items.push(item.toUpperCase());
            });
        }
        return items;
    }

    var convertAttrName = function (name) {
        if (options.upperFirstLetter)
            return uppercaseFirstLetter(name);
        else

            return name;
    }

    var intItems = upperCaseItems(options.intItems);
    var boolItems = upperCaseItems(options.boolItems);
    var dateItems = upperCaseItems(options.dateItems);

    var $xml = null;

    if (angular.isString(xml)) {
        xml = $.parseXML(xml);
    }

    $xml = $(xml);

    var $el = $xml.find(nodeName);

    var items = [];

    $el.each(function (index, element) {
        var obj = {};
        $.each(element.attributes, function (index,key) {
            var value = key.value;

            if (boolItems.indexOf(key.name.toUpperCase()) >= 0)
                value = key.value == '1' || key.value == 'true';

            if (intItems.indexOf(key.name.toUpperCase()) >= 0)
                value = key.value == 0 ? null : key.value;

            if (dateItems.indexOf(key.name.toUpperCase()) >= 0)
            {
                value = !key.value || key.value.substr(0, 8) == '1/1/1900' ? null : key.value;
            }
          
            obj[convertAttrName(key.name)] = value;

        });

        if (Object.keys(obj).length > 0)
            items.push(obj);
    });
    return items;
}


