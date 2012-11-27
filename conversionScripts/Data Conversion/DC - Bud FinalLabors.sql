TRUNCATE TABLE TeamFinV2.[dbo].[BudFinalLabors]
GO

INSERT INTO TeamFinV2.[dbo].[BudFinalLabors]
	([BudFinlTitle]
      ,[BudFinlPeriod1]
      ,[BudFinlPeriod2]
      ,[BudFinlPeriod3]
      ,[BudFinlPeriod4]
      ,[BudFinlPeriod5]
      ,[BudFinlPeriod6]
      ,[BudFinlPeriod7]
      ,[BudFinlPeriod8]
      ,[BudFinlPeriod9]
      ,[BudFinlPeriod10]
      ,[BudFinlPeriod11]
      ,[BudFinlPeriod12]
      ,[BudFinlPeriod13]
      ,[FscYear]
      ,[HcmHouseCode]
      ,[HcmJob]
      ,[BudFinlEnteredBy]
      ,[BudFinlEnteredAt])
      
SELECT [Title]
      ,[Period1] ,[Period2]
      ,[Period3] ,[Period4]
      ,[Period5] ,[Period6]
      ,[Period7] ,[Period8]
      ,[Period9] ,[Period10]
      ,[Period11] ,[Period12]
      ,[Period13]
      ,fy.FscYear
      ,hc.HcmHouseCode
      , 0
      ,[EnteredBy]
      ,[EnteredAt]
	FROM [TeamFin].[dbo].[bgtFinalLabor] fl
	INNER JOIN TeamFinV2..FscYears fy ON fy.FscYeaTitle=fl.FiscalYear
	INNER JOIN ESMV2.dbo.AppUnits AU ON AU.AppUniBrief = fl.HouseCode
	INNER JOIN TeamFinV2.dbo.HcmHouseCodes HC ON AU.AppUnit = HC.AppUnit