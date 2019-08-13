from flask import Flask, render_template, request 
from sqlalchemy import create_engine, select
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.sql.expression import join, and_
from sqlalchemy.sql import select
from sqlalchemy.sql import text
import constants
from datetime import datetime
import json
#from models import Rate, Setting, Cash, Currency

app = Flask(__name__)
engine = create_engine('postgresql://postgres:1@localhost:5432/CurrencyExchange')
db_session = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=False,
                                         bind=engine))
conn = engine.connect()

@app.route("/cashamount")
def getCashAmount():
    code = request.args.get("code")
    s = text("select to_char(c.amount,'999,999.99') amount "
             "from cash c "
             "join currency cur on c.currencyid = cur.currencyid "
             "where cur.code = :code"
            )
    data = conn.execute(s, code=code).fetchall()
    jsonData = json.dumps([dict(d) for d in data])
    return jsonData

@app.route("/headerdata")
def headerdata():
    s = text("select cast(s.value as varchar) as value, "
             "to_char(c.amount,'999,999.99') amount, "
             "to_char(max(date),'yyyy-MM-dd hh:mi:ss') date "
             "from setting s, rate r, cash c "
             "join currency cur on c.currencyid = cur.currencyid "
             "where cur.code = 'USD' and s.name=:name "
             "group by c.amount, s.value"
            )
    data = conn.execute(s, name=constants.MINIMAL_CURRENCY_REST).fetchall()
    jsonData = json.dumps([dict(d) for d in data])
    return jsonData

@app.route("/rates")
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

@app.route("/homerates")
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

@app.route("/")
def home():
    return render_template("home.html")

@app.route("/trans")
def trans():
    return render_template("home.html")

@app.route("/transaction", methods=['POST'])
def transaction():

    data = json.loads(request.data)
    amount = data[constants.TR_AMOUNT]
    rate = data[constants.TR_RATE]
    transactiontype = data[constants.TR_TRANSACTION_TYPE]
    currencyid = data[constants.TR_CURRENCY_ID]
    commission = data[constants.TR_COMMISSION]
    note = data[constants.TR_NOTE]
    user = "test user" # TODO
    s = text("insert into transactions(transactiontypeid, currencyid, amount, date, rate, commission, note, username)"
             "values(:transactiontype, :currencyid, :amount, now(), :rate, :commission, :note, :user)")
    conn.execute(s,amount=amount, rate=rate, transactiontype=transactiontype, currencyid=currencyid, commission=commission, note=note, user=user)
    return 'OK'

def updRate(currencyid, buyrate, sellrate, date):
     s = text("update rate set buyrate=:buyrate,sellrate=:sellrate,date=:date where currencyid=:currencyid")
     conn.execute(s, currencyid=currencyid, buyrate=buyrate, sellrate=sellrate, date=date)

@app.route("/saverates", methods=['POST'])
def saveRates():
    rates = json.loads(request.data)
    for rate in rates:
        updRate(rate["currencyid"], rate["buyrate"], rate["sellrate"], rate["date"])
    return 'OK'

def updSetting(name, value):
     s = text("update setting set value=:value where name=:name")
     conn.execute(s,name=name, value=value)

@app.route("/savesettings", methods=['POST'])
def saveSettings():
    data = json.loads(request.data)
    print(data)
    updSetting(constants.REFRESH_PERIOD, data[constants.REFRESH_PERIOD])
    updSetting(constants.COMMISSION, data[constants.COMMISSION])
    updSetting(constants.SURCHARGE, data[constants.SURCHARGE])
    updSetting(constants.MINIMAL_COMMISSION, data[constants.MINIMAL_COMMISSION])
    updSetting(constants.BUY_SELL_RATE_MARGIN, data[constants.BUY_SELL_RATE_MARGIN])
    return 'OK'

@app.route("/admin", methods=['GET'])
def admin():
    return render_template("home.html")

@app.route("/setting", methods=['GET'])
def setting():
    name = request.args.get("name")
    s = text("""select cast(value as varchar) as value
                  from setting
                 where name=:name"""
            )
    settings = conn.execute(s, name=name).fetchall()
    jsonSetting = json.dumps([dict(s) for s in settings])
    return jsonSetting

@app.route("/settings", methods=['GET'])
def settings():
    s = text("""select name, 
                       cast(case when name ='RefreshPeriod' then cast(value as int) else value end as varchar) as value 
                  from setting 
                 where name in ('Commission', 'RefreshPeriod', 'Surcharge', 'MinimalCommission', 'BuySellRateMargin')"""
            )
    settings = conn.execute(s).fetchall()
    jsonSettings = json.dumps([dict(s) for s in settings])
    return jsonSettings

@app.route("/transactions", methods=['GET'])
def transactions():
    currencyid = request.args.get("currencyid")
    sDateFrom = request.args.get("dateFrom")
    sDateTo = request.args.get("dateTo")
    transactionTypeMode = request.args.get("transactionTypeMode")

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
                            or :transactionTypeMode = 7 /* Debit */ and t.transactiontypeid in (2, 3) /* sell / send */
                            or :transactionTypeMode = 8 /* Credit */ and t.transactiontypeid in  (1, 4) /* buy/receive */
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

@app.route("/currencies", methods=['GET'])
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
                			   else 2 end"""
         )
    data = conn.execute(s).fetchall()
    jsonData = json.dumps([dict(s) for s in data])
    return jsonData

@app.route("/cash", methods=['GET'])
def cash():
    currencyid = request.args.get("currencyid")
    s = text("""select cast(t.amount as varchar) amount
                  from cash t
                 where t.currencyid = :currencyid"""
         )
    data = conn.execute(s, currencyid = currencyid).fetchall()
    jsonData = json.dumps([dict(s) for s in data])
    return jsonData

# catch all incorrect paths
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return 'No page at path: %s' % path

if __name__ == "__main__":
    app.run(debug=True)