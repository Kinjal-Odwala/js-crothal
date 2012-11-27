
Set NoCount On

/*
Select * From [TeamFinv2_DC].[dbo].[PayPayCodeAccounts]
Truncate Table [TeamFinv2_DC].[dbo].[PayPayCodeAccounts]
*/

Declare @PayCode as varchar(20)
	, @AccountCode as varchar(10)
	, @JobCode as varchar(25)
	, @PayPayCode int
	, @FscAccount int
	, @JobCodeType int
	, @Id int
	, @MaxId int

Select @Id = Min(Id), @MaxId = Max(Id) From TeamFin.dbo.PayCodesToAcctCodes

While 1=1
Begin
	Select @PayCode = PayCode, @AccountCode = AcctCode, @JobCode = JobCode
	From TeamFin.dbo.PayCodesToAcctCodes Where Id = @Id
	
	If @@RowCount > 0
	Begin
		--Print @PayCode Print @AccountCode Print @JobCode

		Select @PayPayCode = PayPayCode From [TeamFinv2_DC].[dbo].PayPayCodes Where PayPayCBrief = @PayCode
		Select @FscAccount = FscAccount From [TeamFinv2_DC].[dbo].FscAccounts Where FscAccCode = @AccountCode
		Select @JobCodeType = EmpJobCodeType From [TeamFinv2_DC].[dbo].EmpJobCodeTypes Where EmpJobctBrief = @JobCode 

		Insert into [TeamFinV2_DC].[dbo].[PayPayCodeAccounts]
		   ( [PayPayCode]
		   , [FscAccount]
		   , [EmpJobCodeType]
		   )
		Values
		   ( @PayPayCode
		   , @FscAccount
		   , @JobCodeType
		   )
	End

	Set @Id = @Id + 1
	If @Id > @MaxId Break
	
End