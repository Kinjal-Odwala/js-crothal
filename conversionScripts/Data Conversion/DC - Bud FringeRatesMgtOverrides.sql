--SELECT * FROM TeamFin.dbo.bgtFringeRatesMgtOverrides
--SELECT * FROM TeamFinV2.dbo.BudFringeRatesMgtOverrides

TRUNCATE TABLE TeamFinV2.[dbo].[BudFringeRatesMgtOverrides]
GO

INSERT INTO TeamFinV2.[dbo].[BudFringeRatesMgtOverrides]
	( [HcmHouseCode]
	, [HcmJob]
	, [FscYear]	
	, [BudFrirmoMgtFringeRate]
	)   
SELECT 
	HC.HcmHouseCode
	, 1
	, FY.FscYear
	, MgtFringeRate
FROM [TeamFin].[dbo].[bgtFringeRatesMgtOverrides] FR
	INNER JOIN TeamFinV2.dbo.FscYears FY ON FY.FscYeaTitle = FR.FiscalYear
	INNER JOIN ESMV2.dbo.AppUnits AU ON AU.AppUniBrief = FR.HouseCode
	INNER JOIN TeamFinV2.dbo.HcmHouseCodes HC ON AU.AppUnit = HC.AppUnit