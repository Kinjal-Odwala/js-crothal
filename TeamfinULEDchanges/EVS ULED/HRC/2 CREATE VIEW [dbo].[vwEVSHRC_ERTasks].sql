USE [HRC_ULED]
GO

/****** Object:  View [dbo].[vwHRC_ERTasks]    Script Date: 7/6/2018 10:00:45 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER OFF
GO


CREATE VIEW [dbo].[vwEVSHRC_ERTasks]  
AS  

select
	steTaskClass,
	stehirnode,
	Title
from [TT_REP].[dbo].tsktaskclasses with (nolock)
where
	(
		title in ('ER', 'ED', 'Emergency Department', 'Emergency Room')
		or brief in ('ER', 'ED', 'Emergency Department', 'Emergency Room')
		or title like '%Emergency%'
		or title like 'ER%'
		or title like 'ED%'
		or (title = 'ETAP' and steHirNode = 33867) --NYHQ ED Task
		or (title = 'ETC' and steHirNode = 76766) --Abington ED Task
		or brief like '%Emergency%'
		or brief like 'ER%'
		or brief like 'ED%'
	) 
	and active = 1
	and stefunctionalarea = 2




GO


