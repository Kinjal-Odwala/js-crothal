/*!
 * Ext JS Library 3.2.1
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */


Ext.onReady(function(){
    // create the Data Store
    var store = new Ext.data.Store({
        // load using HTTP
        url: 'test.xml',

        // the return will be XML, so lets set up a reader
        reader: new Ext.data.XmlReader({
               // records will have an "Item" tag
               record: 'item',
               id: 'id'
           }, [
               // set up the fields mapping into the xml doc
               // The first needs mapping, the others are very basic
                //{name: 'Author', mapping: 'ItemAttributes > Author'},
               //'Title', 'Manufacturer', 'ProductGroup'
				{name: 'id', mapping: 'ItemAttributes > id'},				
               	'Itms', 'testData', 'actuals','budget', 'variance', 'projection', 'actuals1','budget1', 'variance1', 'projection1', 'revenue'
           ])
    });

    // create the grid
    var grid = new Ext.grid.GridPanel({
        store: store,
        columns: [
			//{header: "id", width: 120, dataIndex: 'id', sortable: true},
			{header: "Itms", width: 120, dataIndex: 'Itms', sortable: true},
			{header: " ", width: 120, dataIndex: 'testData', sortable: true},
			{header: "Actuals", width: 120, dataIndex: 'actuals', sortable: true},
			{header: "Budget", width: 120, dataIndex: 'budget', sortable: true},
			{header: "Variance", width: 120, dataIndex: 'variance', sortable: true},
			{header: "Projection", width: 120, dataIndex: 'projection', sortable: true},
			{header: "Actuals", width: 120, dataIndex: 'actuals1', sortable: true},
			{header: "Budget", width: 120, dataIndex: 'budget1', sortable: true},
			{header: "Variance", width: 120, dataIndex: 'variance1', sortable: true},
			{header: "Projection", width: 120, dataIndex: 'projection1', sortable: true},
			{header: "Revenue", width: 120, dataIndex: 'revenue', sortable: true}
        ],
        renderTo:'example-grid',
        width:'100%',
        height:400
    });

    store.load();
});

	
	