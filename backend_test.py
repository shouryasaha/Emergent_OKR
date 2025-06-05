
import requests
import sys
import json
from datetime import datetime, date
import time

class OKRAPITester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_objectives = []
        self.created_key_results = []
        self.created_initiatives = []

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.text else {}
                except json.JSONDecodeError:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test the health check endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "api/health",
            200
        )
        if success:
            print(f"Health check response: {response}")
        return success

    def test_get_dashboard(self):
        """Test the dashboard endpoint"""
        success, response = self.run_test(
            "Get Dashboard",
            "GET",
            "api/dashboard",
            200
        )
        if success:
            print(f"Dashboard data: Total objectives: {response.get('total_objectives')}, Avg progress: {response.get('avg_progress')}")
        return success

    def test_get_objectives(self):
        """Test getting all objectives"""
        success, response = self.run_test(
            "Get All Objectives",
            "GET",
            "api/objectives",
            200
        )
        if success:
            print(f"Retrieved {len(response)} objectives")
            for obj in response:
                print(f"  - {obj.get('title')} (Progress: {obj.get('progress')}%)")
        return success

    def test_create_objective(self, title, description="", owner="", deadline=None):
        """Test creating a new objective"""
        data = {
            "title": title,
            "description": description,
            "owner": owner,
            "deadline": deadline.isoformat() if deadline else None
        }
        
        success, response = self.run_test(
            f"Create Objective: {title}",
            "POST",
            "api/objectives",
            200,
            data=data
        )
        
        if success and response.get('id'):
            self.created_objectives.append(response)
            print(f"Created objective with ID: {response.get('id')}")
        
        return success, response

    def test_get_objective_details(self, objective_id):
        """Test getting objective details"""
        success, response = self.run_test(
            f"Get Objective Details: {objective_id}",
            "GET",
            f"api/objectives/{objective_id}",
            200
        )
        
        if success:
            print(f"Retrieved objective: {response.get('title')}")
            print(f"Progress: {response.get('progress')}%")
            print(f"Key Results: {len(response.get('key_results', []))}")
        
        return success, response

    def test_create_key_result(self, objective_id, title, kr_type="metric", start_value=0, target_value=100, current_value=0, unit="", owner=""):
        """Test creating a key result for an objective"""
        data = {
            "title": title,
            "type": kr_type,
            "start_value": start_value,
            "target_value": target_value,
            "current_value": current_value,
            "unit": unit,
            "owner": owner
        }
        
        success, response = self.run_test(
            f"Create Key Result: {title}",
            "POST",
            f"api/objectives/{objective_id}/key-results",
            200,
            data=data
        )
        
        if success and response.get('id'):
            self.created_key_results.append(response)
            print(f"Created key result with ID: {response.get('id')}")
        
        return success, response

    def test_update_key_result_progress(self, key_result_id, current_value):
        """Test updating key result progress"""
        data = {
            "current_value": current_value
        }
        
        success, response = self.run_test(
            f"Update Key Result Progress: {key_result_id}",
            "PUT",
            f"api/key-results/{key_result_id}/progress",
            200,
            data=data
        )
        
        if success:
            print(f"Updated progress to {response.get('current_value')} ({response.get('progress')}%)")
        
        return success, response

    def test_create_initiative(self, key_result_id, title, description="", owner="", status="not_started"):
        """Test creating an initiative for a key result"""
        data = {
            "title": title,
            "description": description,
            "owner": owner,
            "status": status
        }
        
        success, response = self.run_test(
            f"Create Initiative: {title}",
            "POST",
            f"api/key-results/{key_result_id}/initiatives",
            200,
            data=data
        )
        
        if success and response.get('id'):
            self.created_initiatives.append(response)
            print(f"Created initiative with ID: {response.get('id')}")
        
        return success, response

    def print_summary(self):
        """Print a summary of the test results"""
        print("\n" + "="*50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        print("="*50)
        
        if self.tests_passed == self.tests_run:
            print("✅ All tests passed!")
        else:
            print(f"❌ {self.tests_run - self.tests_passed} tests failed")
        
        return self.tests_passed == self.tests_run

def main():
    # Get the backend URL from the frontend .env file
    backend_url = "https://ddf3c65f-4a01-47bf-a246-2710b334b060.preview.emergentagent.com"
    
    print(f"Testing OKR API at: {backend_url}")
    tester = OKRAPITester(backend_url)
    
    # Basic API tests
    tester.test_health_check()
    tester.test_get_dashboard()
    tester.test_get_objectives()
    
    # Create a new objective
    success, objective = tester.test_create_objective(
        title="Test Objective",
        description="This is a test objective created by the API test script",
        owner="Test User",
        deadline=date.today()
    )
    
    if not success or not objective.get('id'):
        print("❌ Failed to create objective, stopping tests")
        return 1
    
    objective_id = objective.get('id')
    
    # Get objective details
    tester.test_get_objective_details(objective_id)
    
    # Create a metric key result
    success, key_result = tester.test_create_key_result(
        objective_id=objective_id,
        title="Test Metric Key Result",
        kr_type="metric",
        start_value=0,
        target_value=100,
        current_value=25,
        unit="%",
        owner="Test KR Owner"
    )
    
    if not success or not key_result.get('id'):
        print("❌ Failed to create key result, stopping tests")
        return 1
    
    key_result_id = key_result.get('id')
    
    # Create a binary key result
    success, binary_kr = tester.test_create_key_result(
        objective_id=objective_id,
        title="Test Binary Key Result",
        kr_type="binary",
        start_value=0,
        target_value=1,
        current_value=0,
        owner="Test Binary KR Owner"
    )
    
    # Update key result progress
    tester.test_update_key_result_progress(key_result_id, 50)
    
    # Create an initiative
    success, initiative = tester.test_create_initiative(
        key_result_id=key_result_id,
        title="Test Initiative",
        description="This is a test initiative",
        owner="Test Initiative Owner",
        status="in_progress"
    )
    
    # Get updated objective details to verify changes
    tester.test_get_objective_details(objective_id)
    
    # Print test summary
    success = tester.print_summary()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
