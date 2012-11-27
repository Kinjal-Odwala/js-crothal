/*
	Select * From [TeamFinv2_DC].[dbo].[PayPayCodes]
	Truncate Table [TeamFinv2_DC].[dbo].[PayPayCodes]
*/

Declare @PayCode varchar(50)
Declare @Description varchar(50)
Declare @Amount decimal(12,2)
Declare @bMultiplyFactor bit
Declare @bAddToPayRate bit
Declare @bAddToTotal bit
Declare @bAltPayRate bit
Declare @bOneTimeCharge bit
Declare @bTimeAndHalf bit
Declare @bStatReg bit
Declare @bStatOT bit
Declare @bProductive bit
Declare @bDailyPayroll bit

Declare tmpCur Cursor for
Select [PayCode]
      , [Description]
      , [Amount]
      , [bMultiplyFactor]
      , [bAddToPayRate]
      , [bAddToTotal]
      , [bAltPayRate]
      , [bOneTimeCharge]
      , [bTimeAndHalf]
      , [bStatReg]
      , [bStatOT]
      , [bProductive]
      , [bDailyPayroll]
From [TeamFin].[dbo].[PayCodes]

Open tmpCur

While 1 =1 
Begin

	Fetch Next From tmpCur Into 
		@PayCode 
      , @Description 
      , @Amount 
      , @bMultiplyFactor 
      , @bAddToPayRate 
      , @bAddToTotal 
      , @bAltPayRate 
      , @bOneTimeCharge 
      , @bTimeAndHalf 
      , @bStatReg 
      , @bStatOT 
      , @bProductive 
      , @bDailyPayroll 

	If @@Fetch_Status <> 0 Break

	Insert Into [TeamFinv2_DC].[dbo].[PayPayCodes]
		( [PayPaycBrief]
		, [PayPaycTitle]
		, [PayPaycAmount]
		, [PayPaycMultiplyFactor]
		, [PayPaycAddToPayRate]
		, [PayPaycAddToTotal]
		, [PayPaycAlternatePayRate]
		, [PayPaycOneTimeCharge]
		, [PayPaycTimeAndHalf]
		, [PayPaycRegularPay]
		, [PayPaycOverTimePay]
		, [PayPaycProductive]
		, [PayPaycDailyPayroll]
		, [PayPaycDisplayOrder]
		, [PayPaycActive]
		, [PayPaycModBy]
		, [PayPaycModAt])
	Values
		( @PayCode 
		, @Description 
		, @Amount 
		, @bMultiplyFactor 
		, @bAddToPayRate 
		, @bAddToTotal 
		, @bAltPayRate 
		, @bOneTimeCharge 
		, @bTimeAndHalf 
		, @bStatReg 
		, @bStatOT 
		, @bProductive 
		, @bDailyPayroll 
		, 1
		, 1
		, 'Persistech\Data Conversion'
		, GetDate()	
		)

End
Close tmpCur 
Deallocate tmpCur 
