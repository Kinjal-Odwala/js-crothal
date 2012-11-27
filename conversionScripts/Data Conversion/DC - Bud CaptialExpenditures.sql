
INSERT INTO TeamFinV2.[dbo].[BudCapitalExpenditures]
           ([BudCapeDescription]
           ,[BudCapePeriodInstalled]
           ,[BudCapeCost]
           ,[BudCapeUsefulLife]
           ,[BudCapePeriodDisposed]
           ,[BudCapePeriodDepreciation]
           ,[BudCapeJustification]
           ,[HcmHouseCode]
           ,[HcmJob]
           ,[FscYear]
           ,[BudCapeCapitalType]
           ,[BudCapeEnteredBy]
           ,[BudCapeEnteredAt])
   

SELECT 
		[EquipmentDescription]
      ,[PeriodInstalled]
      ,[Cost]
      ,[UsefulLife]
      ,[PeriodDisposed]
      ,[PeriodDepreciation],
       CASE YearInstalled WHEN 0 THEN [JustificationDisposed] ELSE JustificationInstalled END  , 
      HC.HcmhouseCode,
      1 AS HcmJob,
      FY.FscYear
      ,CASE YearInstalled WHEN 0 THEN 2 ELSE 1 END AS BudCapeCapitalType
		,'Sys',GETDATE()
 FROM [TeamFin].[dbo].[bgtCapitalExpenditures] CE
  INNER JOIN TeamFinV2..FscYears FY ON FY.FscYeaTitle=(CASE WHEN CE.YearInstalled = 0 AND CE.YearDisposed > 0
	THEN CE.YearDisposed ELSE CE.YearInstalled END)
  INNER JOIN ESMV2.dbo.AppUnits AU ON AU.AppUniBrief = ce.HouseCode
	INNER JOIN TeamFinV2.dbo.HcmHouseCodes HC ON AU.AppUnit = HC.AppUnit