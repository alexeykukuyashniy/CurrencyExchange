import unittest
import json

from manage import app

class CETestCases(unittest.TestCase):

  url = "http://127.0.0.1:5000"
  tester = app.test_client()
  token = ""

  def setUp(self):
    params = {"user": "user1", "pwd": "1"}
    resp = self.tester.post(self.url+'/doLogin', data=json.dumps(params), headers={'Content-Type': 'application/json'})
    self.token = resp.get_data(as_text=True)

  def makeRequest(self, endpoint):
    url = self.url+'/' + endpoint
    return self.tester.get(url, headers={'Authorization': 'Bearer ' + self.token})

  def test_Login(self):
    params = {"user": "user1", "pwd": "1"}
    resp = self.tester.post(self.url+'/doLogin', data=json.dumps(params), headers={'Content-Type': 'application/json'})
    data = resp.get_data(as_text=True)
    self.assertEqual(resp.status_code, 200)
    self.assertNotEqual(data, 'Incorrect password')

  def test_Login_incorrect_password(self):
    params = {"user": "user1", "pwd": "2"}
    resp = self.tester.post(self.url+'/doLogin', data=json.dumps(params), headers={'Content-Type': 'application/json'})
    data = resp.get_data(as_text=True)
    self.assertEqual(data, 'Incorrect password')

  def test_get_currency(self):
    resp = self.makeRequest('currencies')
    self.assertEqual(resp.status_code, 200)

  def test_get_cashAmount(self):
    resp = self.makeRequest('cashamount?code=USD')
    self.assertEqual(resp.status_code, 200)

  def test_get_headerdata(self):
    resp = self.makeRequest('headerdata')
    self.assertEqual(resp.status_code, 200)
        
  def test_get_rates(self):
    resp = self.makeRequest('rates')
    self.assertEqual(resp.status_code, 200)

  def test_get_homerates(self):
    resp = self.makeRequest('homerates')
    self.assertEqual(resp.status_code, 200)

  def test_home(self):
    resp = self.makeRequest('home')
    self.assertEqual(resp.status_code, 200)

  def test_get_setting(self):
    resp = self.makeRequest('setting?name=RefreshPeriod')
    self.assertEqual(resp.status_code, 200)

  def test_get_settings(self):
    resp = self.makeRequest('settings')
    self.assertEqual(resp.status_code, 200)

  def test_get_transactions(self):
    resp = self.makeRequest('transactions?currencyid=0&dateFrom=&dateTo=&transactionTypeMode=')
    self.assertEqual(resp.status_code, 200)

  def test_get_cash(self):
    resp = self.makeRequest('cash')
    self.assertEqual(resp.status_code, 200)

if __name__ == '__main__':
    unittest.main()