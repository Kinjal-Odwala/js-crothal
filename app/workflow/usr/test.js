describe("App Workflow", function() {
	it("Should load the workflow main.js file", function (done) {
        console.log("At app main test pending scripts = " + ii.imports.scriptsPending);

        ii.Import("fin.app.workflow.usr.main");
        ii.appLoad.notify(function scriptLoaded() {
            console.log("At app main notify");
            ii.appLoad.notifyClear(scriptLoaded);
            done();
        });
    });
});