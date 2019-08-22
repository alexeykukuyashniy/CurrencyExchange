from flask import Flask, render_template, request
from sqlalchemy import create_engine, select
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.sql import select
from sqlalchemy.sql import text
from datetime import datetime
import json
import constants
from typing import Dict

from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    get_jwt_identity
)

app = Flask(__name__)
#engine = create_engine('postgresql://postgres:1@localhost:5432/CurrencyExchange')
engine = create_engine('postgres://rmhakrfcehwgbt:f539dde57021225d1099a250471176d12a67aa8c10818795bbec9f4b79c66f72@ec2-184-72-221-140.compute-1.amazonaws.com:5432/d90qi8ks9tjo4u')
db_session = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=False,
                                         bind=engine))
conn = engine.connect()
app.config['SECRET_KEY'] = 'somesuperrandomsecretkeynoonecancrack'
jwt = JWTManager(app)

# returns cash rest amount for the given currency
@app.route("/cashamount")
@jwt_required
def getCashAmount():
    code: str = request.args.get("code")
    s = text("select to_char(c.amount,'999,999.99') amount "
             "from cash c "
             "join currency cur on c.currencyid = cur.currencyid "
             "where cur.code = :code"
            )
    data = conn.execute(s, code=code).fetchall()
    jsonData = json.dumps([dict(d) for d in data])
    return jsonData

# returns data for the page header: USD cash rest amount, rates last updated date, "minimal currency rest" setting value
@app.route("/headerdata")
@jwt_required
def headerdata():
    s = text("select cast(s.value as varchar) as value, "
             "to_char(c.amount,'999,999.99') amount, "
             "to_char(max(date),'yyyy-MM-dd HH24:mi:ss') date "
             "from setting s, rate r, cash c "
             "join currency cur on c.currencyid = cur.currencyid "
             "where cur.code = 'USD' and s.name=:name "
             "group by c.amount, s.value"
            )
    data = conn.execute(s, name=constants.MINIMAL_CURRENCY_REST).fetchall()
    jsonData = json.dumps([dict(d) for d in data])
    return jsonData

# returns currency exchange rates data
@app.route("/rates")
@jwt_required
def rates():
    s= text("select c.currencyid, c.code, rtrim(cast(r.buyrate as varchar), '0') buyrate, "
     " rtrim(cast(r.sellrate as varchar), '0') sellrate, cast(r.date as varchar) date "
     "from currency c "
     "left join rate r on r.currencyid = c.currencyid "
     "and r.date = (select max(date) date from rate r2 where r2.currencyid=r.currencyid) "
     "where c.code <> 'USD' order by c.code")
    rates = conn.execute(s).fetchall()
    jsonRates = json.dumps([dict(r) for r in rates])
    return jsonRates

# returns home page grid data
@app.route("/homerates")
@jwt_required
def homerates():
    s= text("select c.currencyid, c.code, c.name, rtrim(cast(r.buyrate as varchar), '0') buyrate, "
     " rtrim(cast(r.sellrate as varchar), '0') sellrate, cast(r.date as varchar) date, "
     "coalesce(cast(cs.amount as varchar), '0.00') amount "
     "from currency c "
     "left join rate r on r.currencyid = c.currencyid "
     "and r.date = (select max(date) date from rate r2 where r2.currencyid=r.currencyid) "
     "left join cash cs on cs.currencyid = c.currencyid "
     "where c.code <> 'USD' order by c.name")
    rates = conn.execute(s).fetchall()
    jsonRates = json.dumps([dict(r) for r in rates])
    return jsonRates

# provides response to the "/" and '/home' urls
@app.route("/")
@app.route("/home")
def home():
    return render_template("home.html")

# provides response to the "/trans" url
@app.route("/trans")
def trans():
    return render_template("home.html")

# saves new transaction data to the database
@app.route("/transaction", methods=['POST'])
@jwt_required
def transaction():
    data: str = json.loads(request.data)
    amount: str = data[constants.TR_AMOUNT]
    rate: str = data[constants.TR_RATE]
    transactiontype: str = data[constants.TR_TRANSACTION_TYPE]
    currencyid: str = data[constants.TR_CURRENCY_ID]
    commission: str = data[constants.TR_COMMISSION]
    note: str = data[constants.TR_NOTE]
    user: str = get_jwt_identity()
    s = text("insert into transactions(transactiontypeid, currencyid, amount, date, rate, commission, note, username)"
             "values(:transactiontype, :currencyid, :amount, now(), :rate, :commission, :note, :user)")
    conn.execute(s, amount=amount, rate=rate, transactiontype=transactiontype, currencyid=currencyid,
                 commission=commission, note=note, user=user)
    return 'OK'

# updates exchange rate data for the given currency
def updRate(currencyid, buyrate, sellrate, date):
     s = text("update rate set buyrate=:buyrate,sellrate=:sellrate,date=:date where currencyid=:currencyid")
     conn.execute(s, currencyid=currencyid, buyrate=buyrate, sellrate=sellrate, date=date)

# saves currencies exchange rates to the database
@app.route("/saverates", methods=['POST'])
@jwt_required
def saveRates():
    rates = json.loads(request.data)
    for rate in rates:
        updRate(rate["currencyid"], rate["buyrate"], rate["sellrate"], rate["date"])
    return 'OK'

#saves one updated setting to the database
def updSetting(name, value):
     s = text("update setting set value=:value where name=:name")
     conn.execute(s,name=name, value=value)

#saves updated settings to the database
@app.route("/savesettings", methods=['POST'])
@jwt_required
def saveSettings():
    data = json.loads(request.data)
    print(data)
    updSetting(constants.REFRESH_PERIOD, data[constants.REFRESH_PERIOD])
    updSetting(constants.COMMISSION, data[constants.COMMISSION])
    updSetting(constants.SURCHARGE, data[constants.SURCHARGE])
    updSetting(constants.MINIMAL_COMMISSION, data[constants.MINIMAL_COMMISSION])
    updSetting(constants.BUY_SELL_RATE_MARGIN, data[constants.BUY_SELL_RATE_MARGIN])
    return 'OK'

# provides response to the "/admin" url
@app.route("/admin", methods=['GET'])
def admin():
    return render_template("home.html")

#returns particular setting value
@app.route("/setting", methods=['GET'])
@jwt_required
def setting():
    name = request.args.get("name")
    s = text("""select cast(value as varchar) as value
                  from setting
                 where name=:name"""
            )
    settings = conn.execute(s, name=name).fetchall()
    jsonSetting = json.dumps([dict(s) for s in settings])
    return jsonSetting

# returns settings data
@app.route("/settings", methods=['GET'])
@jwt_required
def settings():
    s = text("""select name,
                       cast(case when name ='RefreshPeriod' then cast(value as int) else value end as varchar) as value 
                  from setting 
                 where name in ('Commission', 'RefreshPeriod', 'Surcharge', 'MinimalCommission', 'BuySellRateMargin')"""
            )
    settings = conn.execute(s).fetchall()
    jsonSettings = json.dumps([dict(s) for s in settings])
    return jsonSettings

# returns transactions data filtered according to the given filters.
@app.route("/transactions", methods=['GET'])
@jwt_required
def transactions():
    currencyid: str = request.args.get("currencyid")
    sDateFrom: str = request.args.get("dateFrom")
    sDateTo: str = request.args.get("dateTo")
    transactionTypeMode: str = request.args.get("transactionTypeMode")

    print("currency:", currencyid, sDateFrom, sDateTo, sDateFrom[:24].strip())

    if currencyid is None:
        currencyid = "0" # All

    dateFrom = '20010101'
    if not (sDateFrom is None or sDateFrom == 'undefined' or sDateFrom == ''):
        if (len(sDateFrom) < 20):
            dateFrom = datetime.strptime(sDateFrom, "%m/%d/%Y %H:%M")
        else:
            dateFrom = datetime.strptime(sDateFrom[:24].strip(), "%a %b %d %Y %H:%M:%S").replace(second=0).strftime("%Y%m%d %H:%M:%S")

    dateTo = '20991231'
    if not (sDateTo is None or sDateTo== 'undefined' or sDateTo== ''):
        if (len(sDateTo) < 20):
            dateTo = datetime.strptime(sDateTo, "%m/%d/%Y %H:%M")
        else:
            dateTo = datetime.strptime(sDateTo[:24].strip(), "%a %b %d %Y %H:%M:%S").replace(second=59).strftime("%Y%m%d %H:%M:%S")
    print(dateFrom, ' | ', dateTo)

    s = text("""select to_char(t.date,'yyyy-MM-dd HH24:mi:ss') date,
                       c.code,
                       cast(t.amount as varchar) amount,
                       case when t.transactiontypeid = 1 then 'buy'
                       when t.transactiontypeid = 2 then 'sell'
                       when t.transactiontypeid = 3 then 'send'
                       when t.transactiontypeid = 4 then 'receive' end transactiontype,
                       cast(t.commission as varchar) commission,
                       cast(t.rate as varchar) rate,
                       t.note,
                       t.username
                       from transactions t
                       join currency c on c.currencyid = t.currencyid
                       where (t.currencyid = :currencyid or :currencyid=0)
                       and t.date between :dateFrom and :dateTo
                       and (:transactionTypeMode = 0 /* All */
                            or :transactionTypeMode = 1 /* Buy/Sell */ and t.transactiontypeid in (1, 2)
                            or :transactionTypeMode = 2 /* Buy */ and t.transactiontypeid = 1
                            or :transactionTypeMode = 3 /* Sell */ and t.transactiontypeid = 2
                            or :transactionTypeMode = 4 /* Send/Receive */ and t.transactiontypeid in (3, 4)
                            or :transactionTypeMode = 5 /* Send */ and t.transactiontypeid = 3
                            or :transactionTypeMode = 6 /* Receive */ and t.transactiontypeid = 4
                            or :transactionTypeMode = 7 /* Debit */ and t.transactiontypeid in (2, 3) /*sell/send*/
                            or :transactionTypeMode = 8 /* Credit */ and t.transactiontypeid in  (1, 4) /*buy/receive*/
                       )
                       order by t.date desc"""
         )

    if transactionTypeMode == 'undefined' or transactionTypeMode == '':
        transactionTypeMode = 0 # All

    data = conn.execute(s, currencyid = currencyid,
                        dateFrom = dateFrom,
                        dateTo = dateTo,
                        transactionTypeMode = transactionTypeMode
                       ).fetchall()
    jsonData = json.dumps([dict(s) for s in data])
    return jsonData

# returns list of all currencies with addition of 'All' option
@app.route("/currencies", methods=['GET'])
@jwt_required
def currencies():
    s = text("""select t.currencyid,
                       t.code,
                       cast(t.amountRest as varchar) amountRest
                  from (
                        select t.currencyid,
                               t.code,
                               coalesce(c.amount, 0) amountRest
                          from currency t
                          left join cash c on c.currencyid = t.currencyid
                		 union all
                		select 0,
                	           'All',
                	           0
                	   ) t
                 order by case when t.code = 'All' then 0
                	           when t.code = 'USD' then 1
                			   else 2 end, t.code"""
         )
    data = conn.execute(s).fetchall()
    jsonData = json.dumps([dict(s) for s in data])
    return jsonData

# returns rest amount in the office cash for the given currency
@app.route("/cash", methods=['GET'])
@jwt_required
def cash():
    currencyid: int = request.args.get("currencyid")
    s = text("""select cast(t.amount as varchar) amount
                  from cash t
                 where t.currencyid = :currencyid"""
         )
    data = conn.execute(s, currencyid = currencyid).fetchall()
    jsonData = json.dumps([dict(s) for s in data])
    return jsonData

# provides response to the "/login" url
@app.route("/login", methods=['GET'])
def login():
    return render_template("home.html")

# check password, if correct returns jwt access token, otherwise returns error message
@app.route("/doLogin", methods=['POST'])
def doLogin():
    data = json.loads(request.data)
    user: str = data["user"]
    pwd: str = data["pwd"]

    if (pwd == "1"):
        payload: Dict[str, str] = { "user": user }
        token: str = create_access_token(identity = user)
        return token
    else:
        return "Incorrect password" # password hardcoded to 1, user name can be any

# catch all incorrect paths
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return 'No page at path: %s' % path

if __name__ == "__main__":
    app.run(debug=True)