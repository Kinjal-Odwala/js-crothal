TRUNCATE TABLE TeamFinV2.[dbo].[BudBillingPeriods]
GO

INSERT INTO TeamFinV2.[dbo].[BudBillingPeriods]
	([HcmHouseCode]
      ,[FscYear]
      ,[BudBilpRate]
      ,[BudBilpIncrease]
      ,[BudBilpDateEffective]
      ,[BudBilpDescription]
      ,[BudBilpCrtdBy]
      ,[BudBilpCrtdAt]
      ,[HcmJob])
      
SELECT hc.hcmHouseCode
	  , fy.FscYear
	  ,[Rate]
      ,[PercentIncrease]
      ,[DateEffective]
      ,[Other]
      ,[EnteredBy]
      ,[EnteredAt]
      , 1
      
	FROM [TeamFin].[dbo].[bgtBillingPeriods] bp
	INNER JOIN TeamFinV2..FscYears fy ON fy.FscYeaTitle= bp.FiscalYear
	INNER JOIN ESMV2.dbo.AppUnits AU ON AU.AppUniBrief = bp.HouseCode
	INNER JOIN TeamFinV2.dbo.HcmHouseCodes HC ON AU.AppUnit = HC.AppUnit
	