TRUNCATE TABLE TeamFinV2..BudAnnualInformations
GO

INSERT INTO TeamFinV2.[dbo].[BudAnnualInformations]
           ([BudAnniStartDate]
           ,[BudAnniCutOffDate]
           ,[BudAnniGenLiabilityRate]
           ,[BudAnniGenLiabilityAccCodes]
           ,[BudAnniBenefitAdjStartPeriod]
           ,[BudAnniBenefitAdjEndPeriod]
           ,[BudAnniBenefitAdjPercent]
           ,[FscYear]
           ,[BudAnniAnnouncement])

SELECT 
		[StartDate]
      ,[CutOffDate]
      ,[GenLiabilityRate]
      ,[GenLiabilityAccCodes]
      ,[BenefitAdjStartPeriod]
      ,[BenefitAdjEndPeriod]
      ,[BenefitAdjPercent]
      ,Fscyear
      ,[Announcement]
  FROM [TeamFin].[dbo].[bgtAnnualInformation]
  INNER JOIN TeamFinV2..FscYears ON [bgtAnnualInformation].FiscalYear=FscYears.FscYeaTitle

  
GO

