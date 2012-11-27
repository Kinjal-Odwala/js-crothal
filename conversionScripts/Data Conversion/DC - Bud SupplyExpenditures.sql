


INSERT INTO TeamFinV2.[dbo].[BudSupplyExpenditures]
	([BudSupePoItemID]
      ,[FscAccount]
      ,[BudSupeDescription]
      ,[BudSupeUnit]
      ,[BudSupeUsagePerPeriod]
      ,[BudSupeUsagePerPeriodOverride]
      ,[FscYear]
      ,[HcmHouseCode]
      ,[HcmJob]
      ,[BudSupeEnteredBy]
      ,[BudSupeEnteredAt]
      ,[BudSupeUnitPrice])
      
SELECT 0 PO_ItemID, 
	AccountCode, --fa.FscAccount, 
	[Description], 
	Unit, 
	UsagePerPeriod,
    UsagePerPeriodOveride,
    fy.FscYear,
	hc.HcmHouseCode,
    1,
    EnteredBy,
    EnteredAt,
    UnitPrice
	FROM [TeamFin].[dbo].[bgtSuppExp] se
	INNER JOIN TeamFinV2..FscYears fy ON fy.FscYeaTitle= se.FiscalYear
	INNER JOIN TeamFinV2..FscAccounts fa ON fa.FscAccCode = se.AccountCode
INNER JOIN ESMV2.dbo.AppUnits AU ON AU.AppUniBrief = se.HouseCode
	INNER JOIN TeamFinV2.dbo.HcmHouseCodes HC ON AU.AppUnit = HC.AppUnit
	