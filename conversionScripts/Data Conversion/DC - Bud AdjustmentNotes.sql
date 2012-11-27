TRUNCATE TABLE  TeamFinV2.[dbo].[BudAdjustmentNotes]
GO

INSERT INTO TeamFinV2.[dbo].[BudAdjustmentNotes]
           ([FscYear]
           ,[BudAdjnNotes]
           ,[HcmHouseCode]
           ,[HcmJob]
           ,[BudAdjnEnteredBy]
           ,[BudAdjnEnteredAt])

select FY.FscYear,Notes,hc.HcmHouseCode,1,EnteredBy,EnteredAt 
FROM teamFin..bgtadjustmentnotes bjn
INNER JOIN TeamFinV2..FscYears FY ON FY.FscYeaTitle = bjn.FiscalYear
INNER JOIN ESMV2.dbo.AppUnits AU ON AU.AppUniBrief = bjn.HouseCode
INNER JOIN TeamFinV2.dbo.HcmHouseCodes HC ON AU.AppUnit = HC.AppUnit