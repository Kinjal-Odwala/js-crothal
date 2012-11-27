

INSERT INTO TeamFinV2.[dbo].[BudEmployeeLocks]
	([HcmHouseCode]
      ,[HcmJob]
      ,[FscYear]
      ,[EmpEmployeeGeneral]
      ,[BudEmplEmployeeName]
      ,[BudEmplDifferentialPayRate]
      ,[BudEmplOtherPayRate]
      ,[BudEmplVacationDays]
      ,[BudEmplMeritIncrease]
      ,[BudEmplLastIncreaseDate]
      ,[BudEmplFscPeriodOfIncrease]
      ,[BudEmplTypeMeritPromotion]
      ,[BudEmplFiscalIncrease]
      ,[BudEmplDueIncrease]
      ,[BudEmplModBy]
      ,[BudEmplModAt]
      ,[BudEmplYearsOfService]
      ,[BudEmplExempt]
      ,[BudEmplPosition]
      ,[BudEmplPayRate]
      ,[BudEmplScheduledHours]
      ,[BudEmplAnnualSalary])
      
SELECT hc.HcmHouseCode
	  , 1
	  , fy.FscYear
	  , EmpEmployeeGeneral
      ,emp.LName + ', ' + emp.FName  AS [Name] 
      ,emp.DiffPayRate
      ,emp.OtherPayRate
      ,emp.VacationDays
      ,emp.MeritIncrease
      ,emp.LastIncreaseDate
      ,emp.PeriodOfIncrease
      ,emp.TypeMeritPromotion
      ,emp.FiscalIncrease
      ,emp.DueIncreases
      ,emp.EnteredBy
      ,emp.EnteredAt
	  , emp.fiscalyear- cast(datename(year,eg.empempghiredate) as int) -- BudEmplYearsOfService
      ,emp.bExempt
      ,emp.EmpPosition
      ,emp.PayRate
      ,emp.ScheduledHours
      , CASE  
		WHEN emp.bExempt = 1 AND emp.bHourly = 0 THEN emp.PayRate 
		WHEN emp.bExempt = 1 AND emp.bHourly = 1 
		THEN (emp.PayRate * emp.ScheduledHours) * (CASE WHEN tfe.PayFreq = 'B' THEN 26 ELSE 52 END)
		ELSE NULL END AS BudEmplAnnualSalary
      
	FROM [TeamFin].[dbo].[bgtEmployees_LockDown] emp
	INNER JOIN TeamFinV2..FscYears fy ON fy.FscYeaTitle= emp.FiscalYear
		INNER JOIN ESMV2.dbo.AppUnits AU ON AU.AppUniBrief = emp.HouseCode
	INNER JOIN TeamFinV2.dbo.HcmHouseCodes HC ON AU.AppUnit = HC.AppUnit
	LEFT OUTER JOIN TeamFinV2.dbo.EmpEmployeeGenerals EG On EG.EmpEmpgEmployeeNumber = emp.EmployeeNum
	LEFT JOIN [TeamFin].[dbo].Employees tfe ON
	emp.EmployeeNum = tfe.EmployeeNum
--where emp.housecode = '1543' and emp.fiscalyear = 2011

UNION 

SELECT hc.HcmHouseCode
	  , 1
	  , fy.FscYear
	  , '' AS EmpEmployeeGeneral
      ,emp.Name  
      ,'' AS DiffPayRate
      ,'' AS OtherPayRate
      ,'' AS VacationDays
      ,'' AS MeritIncrease
      ,emp.LastIncreaseDate
      ,emp.PeriodOfIncrease
      ,emp.TypeMeritPromotion
      ,emp.FiscalIncrease
      ,'' AS DueIncreases
      ,emp.EnteredBy
      ,emp.EnteredAt
	  , '' --emp.fiscalyear- cast(datename(year,eg.empempghiredate) as int) -- BudEmplYearsOfService
      ,1 bExempt
      ,emp.EmpPosition
      ,emp.AnnualSalary AS PayRate
      ,'' AS ScheduledHours
      , emp.AnnualSalary AS BudEmplAnnualSalary
      
	FROM [TeamFin].dbo.bgtPersSalaries emp
	INNER JOIN TeamFinV2..FscYears fy ON fy.FscYeaTitle= emp.FiscalYear
		INNER JOIN ESMV2.dbo.AppUnits AU ON AU.AppUniBrief = emp.HouseCode
	INNER JOIN TeamFinV2.dbo.HcmHouseCodes HC ON AU.AppUnit = HC.AppUnit
	
--where emp.housecode = '1543' and emp.fiscalyear = 2011

ORDER BY
emp.LName + ', ' + emp.FName 


