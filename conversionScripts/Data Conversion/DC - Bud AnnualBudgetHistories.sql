
INSERT INTO [TeamFinv2].[dbo].[BudAnnualBudgetHistories]
           ([HcmHouseCode]
           ,[HcmJob]
           ,[FscYear]
           ,[BudAnnbhApprovedBySite]
           ,[BudAnnbhApprovedByRM]
           ,[BudAnnbhComments]
           ,[BudAnnbhCrtdBy]
           ,[BudAnnbhCrtdAt])
    

SELECT
	hc.HcmHouseCode,
	1 AS HcmJob,
	fy.FscYear,
	ah.ApprovedBySite AS BudAnnbhApprovedBySite,
	ah.ApprovedByRM AS BudAnnbhApprovedByRM,
	ah.Comments AS BudAnnbhComments,
	ah.EnteredBy AS BudAnnbhCrtdBy,
	ah.EnteredAt AS BudAnnbhCrtdAt
FROM
	chiuschp303.teamfin.dbo.bgtAnnualHistory ah
	INNER JOIN TeamFinV2.dbo.FscYears fy ON fy.FscYeaTitle = ah.FiscalYear
	INNER JOIN ESMV2.dbo.AppUnits au ON au.AppUniBrief = ah.HouseCode
	INNER JOIN TeamFinV2.dbo.HcmHouseCodes hc ON au.AppUnit = hc.AppUnit
WHERE
	ah.HouseCode = '1543' and ah.FiscalYear = 2011
ORDER BY
	ah.bgtAnnualHistory ASC
