--SELECT * FROM TeamFin.dbo.bgtCapExpDepreciation
--SELECT * FROM TeamFinV2.dbo.BudCapExpDepreciations

TRUNCATE TABLE TeamFinV2.[dbo].[BudCapExpDepreciations]
GO

INSERT INTO TeamFinV2.[dbo].[BudCapExpDepreciations]
	( [BudCapedTotDeprec1]
	, [BudCapedTotDeprec2]
	, [BudCapedTotDeprec3]
	, [BudCapedTotDeprec4]
	, [BudCapedTotDeprec5]
	, [BudCapedTotDeprec6]
	, [BudCapedTotDeprec7]
	, [BudCapedTotDeprec8]
	, [BudCapedTotDeprec9]
	, [BudCapedTotDeprec10]
	, [BudCapedTotDeprec11]
	, [BudCapedTotDeprec12]
	, [BudCapedTotDeprec13]
	, [BudCapedTotDepreciation]	
	, [FscYear]
	, [HcmHouseCode]
	, [HcmJob]	
	, [BudCapedEnteredBy]
	, [BudCapedEnteredAt]
	)   
SELECT 
	[TotDeprec1]
	, [TotDeprec2]
	, [TotDeprec3]
	, [TotDeprec4]
	, [TotDeprec5]
	, [TotDeprec6]
	, [TotDeprec7]
	, [TotDeprec8]
	, [TotDeprec9]
	, [TotDeprec10]
	, [TotDeprec11]
	, [TotDeprec12]
	, [TotDeprec13]
	, [TotDepreciation]
	, FY.FscYear
    , HC.HcmhouseCode
    , 1
    , EnteredBy
    , EnteredAt
FROM [TeamFin].[dbo].[bgtCapExpDepreciation] CE
	INNER JOIN TeamFinV2.dbo.FscYears FY ON FY.FscYeaTitle = CE.FiscalYear
	INNER JOIN ESMV2.dbo.AppUnits AU ON AU.AppUniBrief = CE.HouseCode
	INNER JOIN TeamFinV2.dbo.HcmHouseCodes HC ON AU.AppUnit = HC.AppUnit