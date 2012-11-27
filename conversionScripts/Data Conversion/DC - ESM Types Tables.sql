/*
--Select * From ESMV2_DC.dbo.AppAlertClearTypes
--Select * From ESMV2_DC.dbo.AppAlertDisplayTypes
--Select * From ESMV2_DC.dbo.AppAlertExclusions
--Select * From ESMV2_DC.dbo.AppAlerts
--Select * From ESMV2_DC.dbo.AppAlertTypes
Select * From ESMV2_DC.dbo.AppFunctionalAreas
Select * From ESMV2_DC.dbo.AppGPOTypes
--Select * From ESMV2_DC.dbo.AppGroupUsers
Select * From ESMV2_DC.dbo.AppIndustryTypes
Select * From ESMV2_DC.dbo.AppLocationTypes
Select * From ESMV2_DC.dbo.AppMenuActions
Select * From ESMV2_DC.dbo.AppMenuDisplayTypes
Select * From ESMV2_DC.dbo.AppMenuItems
Select * From ESMV2_DC.dbo.AppMenuItemsMaster
Select * From ESMV2_DC.dbo.AppMenuStates
Select * From ESMV2_DC.dbo.AppOwnershipTypes
Select * From ESMV2_DC.dbo.AppPrimaryBusinessTypes
Select * From ESMV2_DC.dbo.AppProfitDesignationTypes
--Select * From ESMV2_DC.dbo.AppRoleGroups
--Select * From ESMV2_DC.dbo.AppRoleNodes
--Select * From ESMV2_DC.dbo.AppRoles
--Select * From ESMV2_DC.dbo.AppSites
--Select * From ESMV2_DC.dbo.AppSiteUnits
Select * From ESMV2_DC.dbo.AppStateTypes
Select * From ESMV2_DC.dbo.AppTraumaLevelTypes
--Select * From ESMV2_DC.dbo.AppUnits
--Select * From ESMV2_DC.dbo.AppUsers
--Select * From ESMV2_DC.dbo.AppZipCodeTypes
--Select * From ESMV2_DC.dbo.HirGroupNodes
--Select * From ESMV2_DC.dbo.HirGroups
Select * From ESMV2_DC.dbo.HirGroupTypes
Select * From ESMV2_DC.dbo.HirHierarchies
Select * From ESMV2_DC.dbo.HirLevels
--Select * From ESMV2_DC.dbo.HirNodes
--Select * From ESMV2_DC.dbo.PplPeople
--Select * From ESMV2_DC.dbo.PplPerformers
--Select * From ESMV2_DC.dbo.PplPerformerSkills
--Select * From ESMV2_DC.dbo.PplPersonRoles
--Select * From ESMV2_DC.dbo.PplRoles
--Select * From ESMV2_DC.dbo.PplSkills
--Select * From ESMV2_DC.dbo.PplSkillTypes
*/
Insert Into ESMV2_DC.dbo.AppFunctionalAreas(AppFunaBrief, AppFunaTitle, AppFunaDescription, AppFunaActive, AppFunaModBy, AppFunaModAt)
Select AppFunaBrief, AppFunaTitle, AppFunaDescription, AppFunaActive, 'Persistech\Data Conversion', GetDate() From ESMV2.dbo.AppFunctionalAreas

Insert Into ESMV2_DC.dbo.AppGPOTypes(AppGPOtBrief, AppGPOtTitle, AppGPOtDescription, AppGPOtDisplayOrder, AppGPOtActive, AppGPOtModBy, AppGPOtModAt)
Select AppGPOtBrief, AppGPOtTitle, AppGPOtDescription, AppGPOtDisplayOrder, AppGPOtActive, 'Persistech\Data Conversion', GetDate() From ESMV2.dbo.AppGPOTypes

Insert Into ESMV2_DC.dbo.AppIndustryTypes(AppIndtBrief, AppIndtTitle, AppIndtDescription, AppIndtDisplayOrder, AppIndtActive, AppIndtModBy, AppIndtModAt)
Select AppIndtBrief, AppIndtTitle, AppIndtDescription, AppIndtDisplayOrder, AppIndtActive, 'Persistech\Data Conversion', GetDate() From ESMV2.dbo.AppIndustryTypes

Insert Into ESMV2_DC.dbo.AppLocationTypes(AppLoctBrief, AppLoctTitle, AppLoctDescription, AppLoctDisplayOrder, AppLoctActive, AppLoctModBy, AppLoctModAt)
Select AppLoctBrief, AppLoctTitle, AppLoctDescription, AppLoctDisplayOrder, AppLoctActive, 'Persistech\Data Conversion', GetDate() From ESMV2.dbo.AppLocationTypes

Insert Into ESMV2_DC.dbo.AppMenuActions(AppMenaBrief, AppMenaTitle, AppMenaDescription, AppMenaDisplayOrder, AppMenaActive, AppMenaModBy, AppMenaModAt)
Select AppMenaBrief, AppMenaTitle, AppMenaDescription, AppMenaDisplayOrder, AppMenaActive, 'Persistech\Data Conversion', GetDate() From ESMV2.dbo.AppMenuActions

Insert Into ESMV2_DC.dbo.AppMenuDisplayTypes(AppMendtBrief, AppMendtTitle, AppMendtDescription, AppMendtDisplayOrder, AppMendtActive, AppMendtModBy, AppMendtModAt)
Select AppMendtBrief, AppMendtTitle, AppMendtDescription, AppMendtDisplayOrder, AppMendtActive, 'Persistech\Data Conversion', GetDate() From ESMV2.dbo.AppMenuDisplayTypes

Insert Into ESMV2_DC.dbo.AppMenuItems(AppMenuAction, AppMenuState, HirNode, AppMeniBrief, AppMeniTitle, AppMeniActive, AppMeniDisplayOrder, AppMeniID, AppMeniActionData, AppMenuDisplayType, AppMeniModBy, AppMeniModAt)
Select AppMenuAction, AppMenuState, HirNode, AppMeniBrief, AppMeniTitle, AppMeniActive, AppMeniDisplayOrder, AppMeniID, AppMeniActionData, AppMenuDisplayType, 'Persistech\Data Conversion', GetDate() From ESMV2.dbo.AppMenuItems

Insert Into ESMV2_DC.dbo.AppMenuItemsMaster(AppMenuAction, AppMenuState, AppMenIBrief, AppMenITitle, AppMenIActive, AppMenIDisplayOrder, AppMenIId, AppMenIActionData, App)
Select AppMenuAction, AppMenuState, AppMenIBrief, AppMenITitle, AppMenIActive, AppMenIDisplayOrder, AppMenIId, AppMenIActionData, App From ESMV2.dbo.AppMenuItemsMaster

Insert Into ESMV2_DC.dbo.AppMenuStates(AppMensBrief, AppMensTitle, AppMensDescription, AppMensDisplayOrder, AppMensActive, AppMensModBy, AppMensModAt)
Select AppMensBrief, AppMensTitle, AppMensDescription, AppMensDisplayOrder, AppMensActive, 'Persistech\Data Conversion', GetDate() From ESMV2.dbo.AppMenuStates

Insert Into ESMV2_DC.dbo.AppOwnershipTypes(AppOwntBrief, AppOwntTitle, AppOwntDescription, AppOwntDisplayOrder, AppOwntActive, AppOwntModBy, AppOwntModAt)
Select AppOwntBrief, AppOwntTitle, AppOwntDescription, AppOwntDisplayOrder, AppOwntActive, 'Persistech\Data Conversion', GetDate() From ESMV2.dbo.AppOwnershipTypes

Insert Into ESMV2_DC.dbo.AppPrimaryBusinessTypes(AppPribtBrief, AppPribtTitle, AppPribtDescription, AppPribtDisplayOrder, AppPribtActive, AppPribtModBy, AppPribtModAt)
Select AppPribtBrief, AppPribtTitle, AppPribtDescription, AppPribtDisplayOrder, AppPribtActive, 'Persistech\Data Conversion', GetDate() From ESMV2.dbo.AppPrimaryBusinessTypes

Insert Into ESMV2_DC.dbo.AppProfitDesignationTypes(AppProdtBrief, AppProdtTitle, AppProdtDescription, AppProdtDisplayOrder, AppProdtActive, AppProdtModBy, AppProdtModAt)
Select AppProdtBrief, AppProdtTitle, AppProdtDescription, AppProdtDisplayOrder, AppProdtActive, 'Persistech\Data Conversion', GetDate() From ESMV2.dbo.AppProfitDesignationTypes

Insert Into ESMV2_DC.dbo.AppStateTypes(AppStatBrief, AppStatTitle, AppStatDescription, AppStatDisplayOrder, AppStatActive, AppStatModBy, AppStatModAt)
Select AppStatBrief, AppStatTitle, AppStatDescription, AppStatDisplayOrder, AppStatActive, 'Persistech\Data Conversion', GetDate() From ESMV2.dbo.AppStateTypes

Insert Into ESMV2_DC.dbo.AppTraumaLevelTypes(AppTraltBrief, AppTraltTitle, AppTraltDescription, AppTraltDisplayOrder, AppTraltActive, AppTraltModBy, AppTraltModAt)
Select AppTraltBrief, AppTraltTitle, AppTraltDescription, AppTraltDisplayOrder, AppTraltActive, 'Persistech\Data Conversion', GetDate() From ESMV2.dbo.AppTraumaLevelTypes

Insert Into ESMV2_DC.dbo.HirGroupTypes(HirGrotBrief, HirGrotTitle, HirGrotDescription, HirHierarchy, HirGrotDisplayOrder, HirGrotActive, HirGrotModBy, HirGrotModAt)
Select HirGrotBrief, HirGrotTitle, HirGrotDescription, HirHierarchy, HirGrotDisplayOrder, HirGrotActive, 'Persistech\Data Conversion', GetDate() From ESMV2.dbo.HirGroupTypes

Insert Into ESMV2_DC.dbo.HirHierarchies(HirHieBrief, HirHieTitle, HirHieDescription, HirHieActive, HirHieHirLevelDepthToTrack, HirHieWarnDepthExceeded, HirHieErrorDepthExceeded, HirHieEditable, HirHieModBy, HirHieModAt)
Select HirHieBrief, HirHieTitle, HirHieDescription, HirHieActive, HirHieHirLevelDepthToTrack, HirHieWarnDepthExceeded, HirHieErrorDepthExceeded, HirHieEditable, 'Persistech\Data Conversion', GetDate() From ESMV2.dbo.HirHierarchies

SET IDENTITY_INSERT ESMV2_DC.dbo.HirLevels ON
Insert Into ESMV2_DC.dbo.HirLevels(HirLevel, HirHierarchy, HirLevelParent, HirLevBrief, HirLevTitle, HirLevDescription, HirLevDisplayOrder, HirLevActive, HirLevFullPath, HirLevSource, HirLevReference, HirLevModBy, HirLevModAt)
Select HirLevel, HirHierarchy, HirLevelParent, HirLevBrief, HirLevTitle, HirLevDescription, HirLevDisplayOrder, HirLevActive, HirLevFullPath, HirLevSource, HirLevReference, 'Persistech\Data Conversion', GetDate() From ESMV2.dbo.HirLevels
SET IDENTITY_INSERT ESMV2_DC.dbo.HirLevels OFF