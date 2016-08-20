// Karma configuration
// Generated on Mon Aug 26 2013 10:22:19 GMT-0700 (US Mountain Standard Time)

module.exports = function(config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '../../',

        // frameworks to use
        frameworks: ["jasmine"],

        // list of files / patterns to load in the browser
        files: [
            'crothall/js-crothall-chimes-fin/testSetup.js',
            'crothall/js-crothall-chimes-fin/testConfig.js',
            '../jquery/jquery.js',
			'ii/js-ii-framework-core/krn/sys/cycligent_load.js',
			'ii/js-ii-framework-core/krn/sys/ajax_test.js',
            {pattern: 'ii/js-ii-framework-core/krn/sys/cycligent.js', included: false, served: true},
            {pattern: 'ii/js-ii-framework-core/krn/sys/kernel.js', included: false, served: true},
            {pattern: 'ii/js-ii-framework-core/krn/**/*.js', included: false, served: true},
			{pattern: 'crothall/js-crothall-chimes-fin/cmn/usr/*.js', included: false, served: true},
            {pattern: 'ii/js-ii-framework-ui/ctl/**/*.js', included: false, served: true},
            {pattern: 'ii/js-ii-framework-ui/cmn/**/*.js', included: false, served: true},
            {pattern: 'ii/js-ii-framework-ui/lay/**/*.js', included: false, served: true},
			{pattern: 'ii/js-ii-framework-ui/rpt/**/*.js', included: false, served: true},
	        //{pattern: 'crothall/js-crothall-chimes-fin/**/**/usr/*.js', included: false, served: true},
		    //{pattern: 'crothall/js-crothall-chimes-fin/**/*.js', included: false, served: true},
		    {pattern: 'crothall/js-crothall-chimes-fin/**/!(test).js', included: false, served: true},
			'crothall/js-crothall-chimes-fin/app/workflow/usr/test.js',
            'crothall/js-crothall-chimes-fin/hcm/pbjReport/usr/test.js',
			
//			'crothall/js-crothall-chimes-fin/bud/res/jquery-1.7.1.min.js',
//			'crothall/js-crothall-chimes-fin/cmn/usr/angular/angular.js',
//			'crothall/js-crothall-chimes-fin/cmn/usr/angular/angular-route.js',
//			'crothall/js-crothall-chimes-fin/cmn/usr/angular/ui-bootstrap-tpls-0.12.0.js',
//     	    'crothall/js-crothall-chimes-fin/_test-lib/node_modules/angular-mocks/angular-mocks.js',
//			'crothall/js-crothall-chimes-fin/emp/employeePAF/usr/fin.emp.employeePaf.js',
//			'crothall/js-crothall-chimes-fin/emp/employeePAF/usr/test.js'
        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
			'*.js': ['coverage'],
			"test/*-test.js": ["coverage"],
			'**/*.html': ['ng-html2js']
        },
		
		// list of files to exclude
        exclude: [
//          'crothall/js-crothall-chimes-fin/coverage/**/*.*',
//			'crothall/js-crothall-chimes-fin/cmn/usr/angular/**/*.*',
        ],

        // test results reporter to use
        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        reporters: ['coverage','progress', 'html'],

		coverageReporter: {
          type : 'html',
          dir : 'crothall/js-crothall-chimes-fin/coverage/',
          file : 'coverage.html'
        },

		htmlReporter: {
          outputFile: 'crothall/js-crothall-chimes-fin/teamFinUnitTestResults.html',
          useLegacyStyle:true,
          // Optional
          pageTitle: 'TeamFin Unit Tests',
          subPageTitle: 'TeamFin Unit Test Results'
        },
		
        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        //browsers: [],//'Chrome'
        browsers: ['Chrome'],

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 60000,

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false,

        proxies: {
//          '/fin': 'http://localhost:8080/fin',
//			'/adh': 'http://localhost:9876/base/crothall/js-crothall-chimes-fin/adh',
//			'/app': 'http://localhost:9876/base/crothall/js-crothall-chimes-fin/app',
//			'/bud': 'http://localhost:9876/base/crothall/js-crothall-chimes-fin/bud',
//			'/emp': 'http://localhost:9876/base/crothall/js-crothall-chimes-fin/emp',
//			'/epm': 'http://localhost:9876/base/crothall/js-crothall-chimes-fin/epm',
//			'/fsc': 'http://localhost:9876/base/crothall/js-crothall-chimes-fin/fsc',
//			'/glm': 'http://localhost:9876/base/crothall/js-crothall-chimes-fin/glm',
//			'/hcm': 'http://localhost:9876/base/crothall/js-crothall-chimes-fin/hcm',
//			'/inv': 'http://localhost:9876/base/crothall/js-crothall-chimes-fin/inv',
//			'/pay': 'http://localhost:9876/base/crothall/js-crothall-chimes-fin/pay',
//			'/pur': 'http://localhost:9876/base/crothall/js-crothall-chimes-fin/pur',
//			'/rev': 'http://localhost:9876/base/crothall/js-crothall-chimes-fin/rev',
//			'/rpt': 'http://localhost:9876/base/crothall/js-crothall-chimes-fin/rpt',
//			'/wom': 'http://localhost:9876/base/crothall/js-crothall-chimes-fin/wom',
//          '/krn/sys': 'http://localhost:9876/base/ii/js-ii-framework-core/krn/sys',
//          '/ctl/usr': 'http://localhost:9876/base/ii/js-ii-framework-ui/ctl/usr',
//          '/cmn/usr': 'http://localhost:9876/base/ii/js-ii-framework-ui/cmn/usr',
//          '/lay/usr': 'http://localhost:9876/base/ii/js-ii-framework-ui/lay/usr',
//          '/_test-lib': '/base/crothall/js-crothall-chimes-fin/_test-lib'
        }

        //urlRoot: '/fin/'
		//hostname: "127.0.0.1"
    });
};