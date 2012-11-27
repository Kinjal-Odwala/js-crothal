--Also update users TRISHA, RAYMOND, QUEENIE etc

--1. Update Report menu to point to QAS EBR

	Update Appmenuitems 
	Set Appmeniactiondata = '/fin/rpt/report/usr/markup.htm?redirectURL=https://chimyresultsqas.compassmanager.com/gateway/app/usr/markup.htm?iniGroupId:1&hirReportId:0&standalone=true'
	Where Appmenuitem= 79

--2. Update Session updates

	--Select * from M_Env_Environments
	Update M_Env_Environments Set M_Env_Env_Default = 0 Where M_Env_Environment = 4
	Update M_Env_Environments Set M_Env_Env_Default = 1 Where M_Env_Environment = 3

--3. Update for EBR Report server

	Update dbo.M_RPT_PROJECT_EXE_TARGETS_CONFIG Set M_RPT_SERVER=3 Where M_RPT_PROJECT_EXE_TARGET=4;
	Update dbo.M_RPT_SYSTEM_EXE_TARGETS_CONFIG  Set M_RPT_SERVER=3 Where M_RPT_SYSTEM_EXE_TARGET =1;

--- Updates for iiT database

--1. Update Report menu to point to QAS EBR

	Update Appmenuitems 
	Set Appmeniactiondata = '/fin/rpt/report/usr/markup.htm?redirectURL=http://aix.persistech.com/gatewayfin/app/usr/markup.htm?iniGroupId:1&hirReportId:0&standalone=true'
	Where Appmenuitem= 79

--2. Update Session updates

	--Select * from M_Env_Environments
	Update M_Env_Environments Set M_Env_Env_Default = 0 Where M_Env_Environment in (4,3)
	Update M_Env_Environments Set M_Env_Env_Default = 1 Where M_Env_Environment = 2

--3. Update for EBR Report server
	--Select * from M_RPT_SERVERs
	Update dbo.M_RPT_PROJECT_EXE_TARGETS_CONFIG Set M_RPT_SERVER=1 Where M_RPT_PROJECT_EXE_TARGET=4;
	Update dbo.M_RPT_SYSTEM_EXE_TARGETS_CONFIG  Set M_RPT_SERVER=1 Where M_RPT_SYSTEM_EXE_TARGET =1;

