USE [TeamFinv2]
GO

/****** Object:  View [dbo].[VBudMopSnapshots]    Script Date: 12/12/2018 4:00:13 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

ALTER VIEW [dbo].[VBudMopSnapshots]
AS 

SELECT 
BudMopSnapshots.*,
FscYear
 FROM BudMopSnapshots
INNER JOIN FscPeriods ON BudMopSnapshots.FscPeriod = FscPeriods.FscPeriod

GO