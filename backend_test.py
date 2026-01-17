import requests
import sys
import json
from datetime import datetime

class DiscordBotAPITester:
    def __init__(self, base_url="https://discordbot-panel-2.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text}")
                self.failed_tests.append({
                    "test": name,
                    "endpoint": endpoint,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text
                })

            return success, response.json() if success and response.text else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "endpoint": endpoint,
                "error": str(e)
            })
            return False, {}

    def test_login(self, username="vovo", password="2210DORRY90"):
        """Test login with correct credentials"""
        success, response = self.run_test(
            "Login with correct credentials",
            "POST",
            "api/auth/login",
            200,
            data={"username": username, "password": password}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_login_invalid(self):
        """Test login with invalid credentials"""
        success, response = self.run_test(
            "Login with invalid credentials",
            "POST", 
            "api/auth/login",
            401,
            data={"username": "invalid", "password": "wrong"}
        )
        return success

    def test_auth_verify(self):
        """Test token verification"""
        success, response = self.run_test(
            "Verify authentication token",
            "GET",
            "api/auth/verify",
            200
        )
        return success

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        success, response = self.run_test(
            "Get dashboard statistics",
            "GET",
            "api/dashboard/stats",
            200
        )
        if success:
            required_fields = ['vendas_totais', 'faturamento', 'tickets_criados', 'usuarios_total', 'status']
            for field in required_fields:
                if field not in response:
                    print(f"   ⚠️  Missing field: {field}")
        return success

    def test_ticket_config_get(self):
        """Test get ticket configuration"""
        success, response = self.run_test(
            "Get ticket configuration",
            "GET",
            "api/config/ticket",
            200
        )
        return success

    def test_ticket_config_update(self):
        """Test update ticket configuration"""
        config_data = {
            "categoria_id": "1442998689802092674",
            "logs_id": "1269514936619372616",
            "entrega_canal_id": "1456320855155015794"
        }
        success, response = self.run_test(
            "Update ticket configuration",
            "POST",
            "api/config/ticket",
            200,
            data=config_data
        )
        return success

    def test_cargo_config_get(self):
        """Test get cargo configuration"""
        success, response = self.run_test(
            "Get cargo configuration",
            "GET",
            "api/config/cargos",
            200
        )
        return success

    def test_cargo_config_update(self):
        """Test update cargo configuration"""
        config_data = {
            "cliente_id": "1234567890123456789",
            "membro_id": "9876543210987654321"
        }
        success, response = self.run_test(
            "Update cargo configuration",
            "POST",
            "api/config/cargos",
            200,
            data=config_data
        )
        return success

    def test_add_saldo(self):
        """Test adding balance to user"""
        saldo_data = {
            "user_id": "123456789012345678",
            "valor": 10.50,
            "descricao": "Teste automatizado"
        }
        success, response = self.run_test(
            "Add balance to user",
            "POST",
            "api/saldo/add",
            200,
            data=saldo_data
        )
        return success

    def test_get_entregas(self):
        """Test get delivery logs"""
        success, response = self.run_test(
            "Get delivery logs",
            "GET",
            "api/entregas",
            200
        )
        return success

    def test_payment_config_get(self):
        """Test get payment configuration"""
        success, response = self.run_test(
            "Get payment configuration",
            "GET",
            "api/config/payments",
            200
        )
        return success

    def test_payment_config_update(self):
        """Test update payment configuration"""
        config_data = {
            "mp_token": "TEST_MP_TOKEN_123",
            "sms_api_key": "TEST_SMS_KEY_456"
        }
        success, response = self.run_test(
            "Update payment configuration",
            "POST",
            "api/config/payments",
            200,
            data=config_data
        )
        return success

    def test_bot_logs(self):
        """Test get bot logs"""
        success, response = self.run_test(
            "Get bot logs",
            "GET",
            "api/logs/bot",
            200
        )
        return success

def main():
    print("🚀 Starting Discord Bot API Tests")
    print("=" * 50)
    
    tester = DiscordBotAPITester()
    
    # Test authentication first
    print("\n📋 AUTHENTICATION TESTS")
    print("-" * 30)
    
    if not tester.test_login():
        print("❌ Login failed, stopping tests")
        return 1
    
    tester.test_login_invalid()
    tester.test_auth_verify()
    
    # Test dashboard
    print("\n📊 DASHBOARD TESTS")
    print("-" * 30)
    tester.test_dashboard_stats()
    
    # Test configuration endpoints
    print("\n⚙️  CONFIGURATION TESTS")
    print("-" * 30)
    tester.test_ticket_config_get()
    tester.test_ticket_config_update()
    tester.test_cargo_config_get()
    tester.test_cargo_config_update()
    tester.test_payment_config_get()
    tester.test_payment_config_update()
    
    # Test saldo management
    print("\n💰 SALDO MANAGEMENT TESTS")
    print("-" * 30)
    tester.test_add_saldo()
    tester.test_get_entregas()
    
    # Test logs
    print("\n📝 LOGS TESTS")
    print("-" * 30)
    tester.test_bot_logs()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 FINAL RESULTS")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.failed_tests:
        print(f"\n❌ Failed tests ({len(tester.failed_tests)}):")
        for test in tester.failed_tests:
            print(f"  - {test['test']}: {test.get('error', f'Status {test.get(\"actual\", \"unknown\")}')}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())