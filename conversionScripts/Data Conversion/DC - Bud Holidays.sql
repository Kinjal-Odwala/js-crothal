
TRUNCATE TABLE TeamFinV2.[dbo].[BudHolidays]
GO

INSERT INTO TeamFinV2.[dbo].[BudHolidays]
	([BudHolTitle]
      ,[FscPeriod]
      ,[FscYear]
      ,[HcmHouseCode]
      ,[HcmJob]
      ,[BudHolEnteredBy]
      ,[BudHolEnteredAt])
SELECT Title, 
	fp.FscPeriod,
	fy.FscYear,
	hc.HcmHouseCode,
	1,
	EnteredBy,
	EnteredAt
	FROM [TeamFin].[dbo].[bgtHolidays] h
		INNER JOIN TeamFinV2..FscYears fy ON fy.FscYeaTitle=h.FiscalYear
		INNER JOIN TeamFinV2..[FscPeriods] fp ON fp.FscYear = fy.FscYear
		INNER JOIN ESMV2.dbo.AppUnits AU ON AU.AppUniBrief = h.HouseCode
		INNER JOIN TeamFinV2.dbo.HcmHouseCodes HC ON AU.AppUnit = HC.AppUnit
	Where fp.FscPerTitle = h.Period