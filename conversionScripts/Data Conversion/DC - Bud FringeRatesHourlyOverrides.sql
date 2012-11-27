--SELECT * FROM TeamFin.dbo.bgtFringeRatesHourlyOverrides
--SELECT * FROM TeamFinV2.dbo.BudFringeRatesHourlyOverrides

TRUNCATE TABLE TeamFinV2.[dbo].[BudFringeRatesHourlyOverrides]
GO

INSERT INTO TeamFinV2.[dbo].[BudFringeRatesHourlyOverrides]
	( [HcmHouseCode]
	, [HcmJob]
	, [FscYear]	
	, [BudFrirhoHourlyFringeRate]
	)   
SELECT 
	HC.HcmHouseCode
	, 1
	, FY.FscYear
	, HourlyFringeRate
FROM [TeamFin].[dbo].[bgtFringeRatesHourlyOverrides] FR
	INNER JOIN TeamFinV2.dbo.FscYears FY ON FY.FscYeaTitle = FR.FiscalYear
	INNER JOIN ESMV2.dbo.AppUnits AU ON AU.AppUniBrief = FR.HouseCode
	INNER JOIN TeamFinV2.dbo.HcmHouseCodes HC ON AU.AppUnit = HC.AppUnit