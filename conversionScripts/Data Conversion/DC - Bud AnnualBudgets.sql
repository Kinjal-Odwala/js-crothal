TRUNCATE TABLE TeamFinV2..BudAnnualBudgets
GO

INSERT INTO TeamFinV2..BudAnnualBudgets
SELECT
LockedDown,Exported,FY.FscYear,hc.hcmHouseCode,EnteredBy,EnteredAt,BudgetStartDate,BudgetStartedBy,1,
CASE WHEN ApprovedBySite IS NOT NULL AND ApprovedBySite='Approved' THEN 1 ELSE 0 END 
FROM TeamFin..bgtAnnual BAB
INNER JOIN TeamFinV2..FscYears FY ON FY.FscYeaTitle = BAB.FiscalYear
INNER JOIN ESMV2.dbo.AppUnits AU ON AU.AppUniBrief = BAB.HouseCode
INNER JOIN TeamFinV2.dbo.HcmHouseCodes HC ON AU.AppUnit = HC.AppUnit
