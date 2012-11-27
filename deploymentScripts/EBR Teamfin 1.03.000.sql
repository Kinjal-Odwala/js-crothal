--Steps to take when ESMv2 database is restored from Production or CT
--use esmv2
--go
--select * From M_RPT_PROJECT_EXE_TARGETS_CONFIG 
--select * From M_RPT_SYSTEM_EXE_TARGETS_CONFIG 
--update M_RPT_PROJECT_EXE_TARGETS_CONFIG set m_rpt_server = 1
--update M_RPT_SYSTEM_EXE_TARGETS_CONFIG set m_rpt_server = 1 where M_RPT_SYSTEM_EXE_TARGET = 1
--update Esmv2.dbo.AppMenuItems Set AppMeniActionData = '/fin/rpt/report/usr/markup.htm?redirectURL=http://aix.persistech.com/fingateway/app/usr/markup.htm?iniGroupId:1&hirReportId:0&standalone=true' Where AppMenuItem = 79 -- report menu
--xx

EBR Update for next release

select * from 
M_RPT_SYSTEM_EXE_TARGETS_CONFIG


insert into M_RPT_SYSTEM_EXE_TARGETS_CONFIG
values(2, 3, 'header,path,footer', getdate(), 'Fgarcia', 2)

select * from M_RPT_SYSTEM_VIEW_TYPES

Insert into M_RPT_SYSTEM_VIEW_TYPES
values(8, 'Y', getdate(), 'Frank Garcia', 'AuthenticaionHelper')

select * from M_RPT_SYSTEM_PLATFORM_VIEWS

Alter table M_RPT_SYSTEM_PLATFORM_VIEWS Alter column M_RPT_SYSPV_URL_FRAGMENT Varchar(500) not null
Insert into M_RPT_SYSTEM_PLATFORM_VIEWS values(
1, getdate(), 'GarciF01','Server=CGUNX189&Project=Compass+Group+-+Default+Project&Port=33002&evt=2048001&src=mstrWeb.2048001&currentViewMedia=2&documentID=382B61124836B0AE6412B5B53461ACF4&visMode=0',15,8)
Insert into M_RPT_SYSTEM_PLATFORM_VIEWS values(
2, getdate(), 'GarciF01','a=b',16,8)

update  esmv2.dbo.appmenuitems 
Set appmeniactiondata = '/fin/rpt/report/usr/markup.htm?redirectURL=http://aix.persistech.com/fingateway/app/usr/markup.htm?iniGroupId:1'
where appmenuitem = 80

update Esmv2.dbo.E_HIR_NODES view from CT to PROD

--**--** 1st Aug 2011

Update menu url to append following string '&standalone=true'
update  esmv2.dbo.appmenuitems 
Set appmeniactiondata = '/fin/rpt/report/usr/markup.htm?redirectURL=http://aix.persistech.com/fingateway/app/usr/markup.htm?iniGroupId:1&standalone=true'
where appmenuitem = 79

--storeId:hirReports >> removeReportNodes (which are not authorized) method was updated to remove iterative check.
--by Rene date 8/1/2011 core.hir.srv.hirHirenodesFetchService.cs
select * from approlegroups where approle not in (select approle from approles)
delete from approlegroups where approle not in (select approle from approles)
select * from approles
update approles set appRolIsMultiComplex = 0

Select * from M_rpt_reports
update M_rpt_reports set M_rpt_rep_title = 'Detailed P&amp;L' 
where e_hir_node = 12224 and M_rpt_rep_title = 'Detailed P&L'

--Production EBR updated on 10th Aug 2011.

--Coach Users not able to access the EBR application because HirNodeTop & Current were not set
--at AppRoles table -- 24th Aug 2011
Select * From AppUsers Where AppUseUserName Like  '%\SalinK01'
Select * From AppRoles Where AppUser = 3539 -- hirnodetop is null or hirnodecurrent = null
Select * From HirNodes Where HirNode In (Select HirNode From AppRoleNodes Where AppRole = 3708)
--took hirnode values from AppUser record
--Update AppRoles Set HirNodeTop=13703, HirNodeCurrent=13703 Where AppRole = 3708
/*
Select *
From M_RPT_SYSTEM_EXE_TARGETS_CONFIG st
	, M_RPT_PLATFORM_VIEWS spv
	, m_rpt_servers rs
Where st.m_rpt_ini_load_group = 2
And rs.m_rpt_server = st.m_rpt_server
And spv.m_rpt_platform_type = rs.m_rpt_platform_type--st.m_rpt_server 

select 
(rptserver3_.M_RPT_SER_URL_BASE+'?Server'+rptserver3_.M_RPT_SER_TITLE+'&Project='+rptproject0_.M_RPT_PROETC_TITLE+'&'+rptplatfor2_.M_RPT_PLAV_URL_FRAGMENT+rptview1_.M_RPT_REPV_OBJECT_ID+'&hiddenSections='+rptproject0_.M_RPT_PROETC_HIDDEN_SECTIONS) 
as col_0_0_ 
from M_RPT_PROJECT_EXE_TARGETS_CONFIG rptproject0_
	, M_RPT_SERVERS rptserver3_
	, M_RPT_REPORT_VIEWS rptview1_
	, M_RPT_PLATFORM_VIEWS 
	rptplatfor2_ 
where rptproject0_.M_RPT_SERVER=rptserver3_.M_RPT_SERVER 
	and rptproject0_.M_RPT_PROJECT=rptview1_.M_RPT_PROJECT 
	and rptview1_.M_RPT_REPORT_VIEW=128  
	and rptplatfor2_.M_RPT_VIEW_TYPE=rptview1_.M_RPT_VIEW_TYPE 
	and rptplatfor2_.M_RPT_PLATFORM_TYPE=rptserver3_.M_RPT_PLATFORM_TYPE

*/

-- fullpath for security nodes updated >> update only on production
select * from hirnodes 
where hirnodfullpath like '\crothall\chimes\fin\rpt\teamfin report\%' and hirhierarchy = 1

update hirnodes
	set hirnodfullpath = replace(hirnodfullpath,'fin\rpt\TeamFin Report\','fin\rpt\TeamFin Reports\')
		, hirnodlevel5 = 'TeamFin Reports'
where hirnodfullpath like '\crothall\chimes\fin\rpt\teamfin report\%' and hirhierarchy = 1
--