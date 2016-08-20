describe("Hcm PbjReport", function() {

	it("Should load the pbjReport main.js file", function (done) {
        console.log("At hcm main test pending scripts = " + ii.imports.scriptsPending);

        ii.Import("fin.hcm.pbjReport.usr.main");
        ii.appLoad.notify(function scriptLoaded() {
            console.log("At hcm main notify");
            ii.appLoad.notifyClear(scriptLoaded);
            done();
        });
    });
	
	it("Should check the grid selection", function () {
        var me = fin.hcm.pbjReport.UserInterface.prototype;
		
		me.fileLocation = {
            text: {value: ""}
			, lastBlurValue: ""
			, setValue: function (value) {
                me.fileLocation.text.value = value;
                me.fileLocation.lastBlurValue = value;
            }
			, getValue: function () {
				return me.fileLocation.text.value;
//                if (me.fileLocation.text.value === "")
//                    return false;
//                else
//                    return true;
            }
        };
		
		me.fileLocationGrid = {
            data: [{
                id: 1
                , iiClass: "fin.hcm.pbjReport.FileLocation"
                , fileLocationId: 1
                , houseCodeId: 373
                , houseCode: "1455"
                , location: "D:\Build\PbjReports"
            }],
            activeRowIndex: 0
        };

		expect(me.fileLocation.getValue()).toEqual("");
 		me.itemSelect(0);
        expect(me.fileLocation.getValue()).toEqual("D:\Build\PbjReports");
    });
});