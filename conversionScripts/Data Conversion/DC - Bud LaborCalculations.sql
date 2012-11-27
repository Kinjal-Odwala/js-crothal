TRUNCATE TABLE TeamFinV2.[dbo].[BudLaborCalculations]
GO

INSERT INTO TeamFinV2.[dbo].[BudLaborCalculations]
	([BudLabcSickDays]
      ,[BudLabcSickDaysTaken]
      ,[BudLabcSickDaysProjected]
      ,[BudLabcPersonalDays]
      ,[BudLabcOtherPaidLeave]
      ,[BudLabcEmployeeHoursPerDay]
      ,[BudLabcProjectedNewEmployees]
      ,[BudLabcProjectedEmployeeTrainingHours]
      ,[BudLabcNonReplaceVacationPerc]
      ,[BudLabcNonReplaceSickPayPerc]
      ,[BudLabcNonReplaceHolidayPerc]
      ,[BudLabcNonReplacePersonalPerc]
      ,[BudLabcMeritIncreasePerHour]
      ,[BudLabcEmployeesLeaving]
      ,[BudLabcStartingWageRate]
      ,[BudLabcEstimatedCOLPeriodOfIncrease]
      ,[BudLabcEstimatedCOLIncreasePerHour]
      ,[FscYear]
      ,[HcmHouseCode]
      ,[HcmJob]
      ,[BudLabcEnteredBy]
      ,[BudLabcEnteredAt])
      
SELECT [SickDays]
      ,[SickDaysTaken]
      ,[ProjectedSickDays]
      ,[PersonalDays]
      ,[OtherPaidLeave]
      ,[EmployeeHoursPerDay]
      ,[ProjectedNewEmployees]
      ,[ProjectedEmployeeTrainingHours]
      ,[NonReplaceVacationPerc]
      ,[NonReplaceSickPayPerc]
      ,[NonReplaceHolidayPerc]
      ,[NonReplacePersonalPerc]
      ,[MeritIncreasePerHour]
      ,[EmployeesLeaving]
      ,[StartingWageRate]
      ,[EstimatedCOLPeriodOfIncrease]
      ,[EstimatedCOLIncreasePerHour]
      , fy.FscYear
      , hc.HcmHouseCode
      , 1
      ,[EnteredBy]
      ,[EnteredAt]
	FROM [TeamFin].[dbo].[bgtLaborCalculations] lc
	INNER JOIN TeamFinV2..FscYears fy ON fy.FscYeaTitle= lc.FiscalYear
  INNER JOIN ESMV2.dbo.AppUnits AU ON AU.AppUniBrief = lc.HouseCode
	INNER JOIN TeamFinV2.dbo.HcmHouseCodes HC ON AU.AppUnit = HC.AppUnit