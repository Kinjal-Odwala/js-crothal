TRUNCATE TABLE TeamFinV2.[dbo].[BudMgtHistoryPayrolls]
GO

INSERT INTO TeamFinV2.[dbo].[BudMgtHistoryPayrolls]
	([BudMgthpPeriod1]
      ,[BudMgthpPeriod2]
      ,[BudMgthpPeriod3]
      ,[BudMgthpPeriod4]
      ,[BudMgthpPeriod5]
      ,[BudMgthpPeriod6]
      ,[BudMgthpPeriod7]
      ,[BudMgthpPeriod8]
      ,[BudMgthpPeriod9]
      ,[BudMgthpPeriod10]
      ,[BudMgthpPeriod11]
      ,[BudMgthpPeriod12]
      ,[BudMgthpPeriod13]
      ,[FscYear]
      ,[HcmHouseCode]
      ,[HcmJob]
      ,[BudMgthpEnteredBy]
      ,[BudMgthpEnteredAt])
      
SELECT [Period1]
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
      , fy.FscYear
      , hc.HcmHouseCode
      , 1
      ,[EnteredBy]
      ,[EnteredAt]
	FROM [TeamFin].[dbo].[bgtMgtHistoryPayrolls] mhp
	INNER JOIN TeamFinV2..FscYears fy ON fy.FscYeaTitle= mhp.FiscalYear
  INNER JOIN ESMV2.dbo.AppUnits AU ON AU.AppUniBrief = mhp.HouseCode
	INNER JOIN TeamFinV2.dbo.HcmHouseCodes HC ON AU.AppUnit = HC.AppUnit