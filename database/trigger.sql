
CREATE OR REPLACE FUNCTION fn_tr_tansactions_iu()
  RETURNS trigger AS
$BODY$
BEGIN
       -- update currency Amount
       UPDATE cash
          SET Amount = Amount + CASE WHEN NEW.TransactionTypeID IN (1/*buy*/, 4/*receive*/) THEN 1 ELSE -1 END * NEW.Amount
        WHERE currencyid = NEW.currencyid;

        -- update USD Amount
        UPDATE cash c
          SET Amount = c.Amount + CASE WHEN NEW.TransactionTypeID IN (1/*buy*/) THEN -1 ELSE 1 END * ROUND(NEW.Amount * NEW.Rate, 2)
         FROM currency cur
        WHERE cur.CurrencyID = c.CurrencyID
          AND cur.code = 'USD'
          AND NEW.TransactionTypeID in (1 /*buy*/, 2 /*sell*/);

   RETURN NEW;
END;
$BODY$
LANGUAGE PLPGSQL;

CREATE TRIGGER tr_tansactions_iu
  BEFORE INSERT
  ON transactions
  FOR EACH ROW
  EXECUTE PROCEDURE fn_tr_tansactions_iu();
