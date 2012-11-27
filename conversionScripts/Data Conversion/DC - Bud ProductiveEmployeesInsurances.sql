TRUNCATE TABLE TeamFinV2.[dbo].[BudProductiveEmployeesInsurances]
GO

INSERT INTO TeamFinV2.[dbo].[BudProductiveEmployeesInsurances]
	([HcmHouseCode]
      ,[HcmJob]
      ,[FscYear]
      ,[BudProeiSingleHMOCount]
      ,[BudProeiSinglePOSCount]
      ,[BudProeiSingleLibertyCount]
      ,[BudProeiSingleDentalCount]
      ,[BudProeiSingleLifeCount]
      ,[BudProeiSingleUnionCount]
      ,[BudProeiFamilyHMOCount]
      ,[BudProeiFamilyPOSCount]
      ,[BudProeiFamilyLibertyCount]
      ,[BudProeiFamilyDentalCount]
      ,[BudProeiFamilyLifeCount]
      ,[BudProeiFamilyUnionCount]
      ,[BudProeiSingleHMOCost]
      ,[BudProeiSinglePOSCost]
      ,[BudProeiSingleLibertyCost]
      ,[BudProeiSingleDentalCost]
      ,[BudProeiSingleLifeCost]
      ,[BudProeiSingleUnionCost]
      ,[BudProeiFamilyHMOCost]
      ,[BudProeiFamilyPOSCost]
      ,[BudProeiFamilyLibertyCost]
      ,[BudProeiFamilyDentalCost]
      ,[BudProeiFamilyLifeCost]
      ,[BudProeiFamilyUnionCost]
      ,[BudProeiModBy]
      ,[BudProeiModAt])
      
SELECT hc.HcmHouseCode
	  , 1
	  , fy.FscYear
	  ,[SingleHMOCount]
      ,[SinglePOSCount]
      ,[SingleLibertyCount]
      ,[SingleDentalCount]
      ,[SingleLifeCount]
      ,[SingleUnionCount]
      ,[FamilyHMOCount]
      ,[FamilyPOSCount]
      ,[FamilyLibertyCount]
      ,[FamilyDentalCount]
      ,[FamilyLifeCount]
      ,[FamilyUnionCount]
      ,[SingleHMOCost]
      ,[SinglePOSCost]
      ,[SingleLibertyCost]
      ,[SingleDentalCost]
      ,[SingleLifeCost]
      ,[SingleUnionCost]
      ,[FamilyHMOCost]
      ,[FamilyPOSCost]
      ,[FamilyLibertyCost]
      ,[FamilyDentalCost]
      ,[FamilyLifeCost]
      ,[FamilyUnionCost]
      , 'Sys'
      , GETDATE()
	FROM [TeamFin].[dbo].[ProductiveEmployeesInsurance] pei
	INNER JOIN TeamFinV2..FscYears fy ON fy.FscYeaTitle= pei.FiscalYear
  INNER JOIN ESMV2.dbo.AppUnits AU ON AU.AppUniBrief = pei.HouseCode
	INNER JOIN TeamFinV2.dbo.HcmHouseCodes HC ON AU.AppUnit = HC.AppUnit