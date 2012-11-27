TRUNCATE TABLE TeamFinV2.[dbo].[BudIncomeTypes]
GO

INSERT INTO TeamFinV2.[dbo].[BudIncomeTypes]
	([FscAccount]
      ,[BudInctPeriod1]
      ,[BudInctPeriod2]
      ,[BudInctPeriod3]
      ,[BudInctPeriod4]
      ,[BudInctPeriod5]
      ,[BudInctPeriod6]
      ,[BudInctPeriod7]
      ,[BudInctPeriod8]
      ,[BudInctPeriod9]
      ,[BudInctPeriod10]
      ,[BudInctPeriod11]
      ,[BudInctPeriod12]
      ,[BudInctPeriod13]
      ,[BudInctPeriod14]
      ,[BudInctPeriod15]
      ,[BudInctPeriod16]
      ,[FscYear]
      ,[HcmHouseCode]
      ,[HcmJob]
      ,[BudInctEnteredBy]
      ,[BudInctEnteredAt])
      
SELECT fa.FscAccount
      ,[Period1]
      ,[Period2]
      ,[Period3]
      ,[Period4]
      ,[Period5]
      ,[Period6]
      ,[Period7]
      ,[Period8]
      ,[Period9]
      ,[Period10]
      ,[Period11]
      ,[Period12]
      ,[Period13]
      ,0 ,0, 0
      , fy.FscYear
      , hc.HcmHouseCode
      , 1
      ,[EnteredBy]
      ,[EnteredAt]
      
	FROM [TeamFin].[dbo].[bgtIncomeType] it
	INNER JOIN TeamFinV2..FscYears fy ON fy.FscYeaTitle= it.FiscalYear
	INNER JOIN TeamFinV2..FscAccounts fa ON fa.FscAccCode = it.AccountCode
  INNER JOIN ESMV2.dbo.AppUnits AU ON AU.AppUniBrief = it.HouseCode
	INNER JOIN TeamFinV2.dbo.HcmHouseCodes HC ON AU.AppUnit = HC.AppUnit