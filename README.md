### Airport Currency Exchange

The application models the Airport Currency Exchange office work.
It has Login page and 3 main pages: Home (default), Transactions and Admin.

On application start user needs to enter user name and password on the Login page. User name can be any, password = "1".

Application Home/Transactions/Admin pages has header that contain last exchange rates received date and USD amount left in the office cash.

On the Home page grid is shown with currency rates and amounts remained in the ofice cash.

If amount for some currency is below "MinimalCurrencyRest" database setting then amount will be shown in red.

User can click on buy/sell rate and enter amount to buy/sell selected currency. 

Subtotal field (in USD) = amount * rate, where rate is USD-to-currency rate, i.e. for example for 1 EURO = 1.1363 USD.

The Commission amount calculated as commissionAmount = CEIL(MAX(amountUSD * commissionPct + surcharge, minCommission), 2),  
where commissionPct, surcharge, minCommission - db settings (see below).

For "buy" operation: total = subtotal - commission, for "sell": total = subtotal + commission, since commission is always payed by the client.
Commission will not affect cash rest amount - it considered as some federal tax on exchange operation, i.e. non-profit amount for the exchange office.

The user entered amount will be added/substracted to/from cash and the corresponding USD amount (amount in currency * rate) will be vice versa removed/added from/to cash.  
The buy/sell operation can be completed in 2 steps: 1st click on buy/sell button disables the Amount edit controls and the 2nd click complets the operation.  
If on the 1st step "rates update service" changed the rate - it will be refreshed on the page, on the 2nd state - it is frozen.  
Entered amount validated on submit:  
Min allowed amount = 10 otherwise "Amount should not be less than 10" message will be shown.  
Current currency cash rest checked for sell operation and USD for a buy one.  
"Amount should not be greater than <amount>." message will be shown in case of violation.  
In case of "buy" operation amount for the error message will be converted to the currency amount since USD amount rest is checked: amount = USD amount / rate.

Clicking on Amount in the grid will display Tranfer edit form where user can select currency, amount, to/from person and then click Send or Receive.  
The appropriate currency amount will be removed/added from/to cash.

Min allowed amount = 10 otherwise "Amount should not be less than 10" message will be shown.
For the "send" operation current currency cash rest amount checked and "Amount should not be greater than <amount>." message will be shown in case of violation.

After user submitted any transaction - grid on the home page along with USD amount rest in the header will be refreshed to reflect the updated rest amounts in the office cash.

On the Transactions page user can filter transactions data by currency/period/type of operation.  
If one currency selected in the data filter then totals will be shown in the grid footer.

The "Transaction Type" filter value "Debit" selects "sell" and "send" transactions, "Credit" - "buy" and "receive" ones.

On the Admin page user can manage settings:
- Refresh currency exchange rates period, sec;
- Commission;
- Surcharge;
- Minimal commisiion;
- Buy/Sell rate margin - defines difference beetwen sell and buy exchange rates in percent.

Allowed min/max values shown also for each setting. The Update button becomes enabled when all values fall within theirs limitations.

Also "MinimalCurrencyRest" setting exists which is not shown on the Admin page and set to 1000.

Rates updated service exists in the application that updates exchange rates on a reqular basis - defined in the "Refresh currency exchange rates period" setting. 
Buy/sell exchange rates calucalted as following:  
Buy rate = received rate * (100 - "Buy/Sell rate margin" / 2)  
Sell rate = received rate * (100 + "Buy/Sell rate margin" / 2)

If the setting is set to 0 then service will stop its work.

Date/time exchange rates last received by the service will be immediately updated on the Home/Transactions/Admin page header.

**Note: when user manually refreshes page in browser - application will redirect to the Login page since the front end stored authorization info will be lost.


#### Technical Info.

Database: PostgreSQL.  
Back End: base language - Python. Flask, SQLAlchemy, JWT authentication.  
Front End: base language TypeScript. React, Redux, Redux-Form.

Note. Hooks not used since they are applicable to the functional components only while class components used in the application.
