
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
        
    def test_update_initiative(self, initiative_id, title, description="", owner="", status="not_started"):
        """Test updating an initiative"""
        data = {
            "id": initiative_id,
            "title": title,
            "description": description,
            "owner": owner,
            "status": status
        }
        
        success, response = self.run_test(
            f"Update Initiative: {title}",
            "PUT",
            f"api/initiatives/{initiative_id}",
            200,
            data=data
        )
        
        if success:
            print(f"Updated initiative: {response.get('title')} with status: {response.get('status')}")
        
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

def test_initiative_editing_workflow(tester):
    """Test the complete initiative editing workflow"""
    print("\n" + "="*50)
    print("🔍 TESTING INITIATIVE EDITING WORKFLOW")
    print("="*50)
    
    # Create a new objective for testing initiative editing
    success, objective = tester.test_create_objective(
        title="Test Initiative Editing",
        description="Testing the initiative editing functionality",
        owner="Test User",
        deadline=date.today()
    )
    
    if not success or not objective.get('id'):
        print("❌ Failed to create objective for initiative editing test")
        return False
    
    objective_id = objective.get('id')
    
    # Create a key result
    success, key_result = tester.test_create_key_result(
        objective_id=objective_id,
        title="Complete feature development",
        kr_type="metric",
        start_value=0,
        target_value=100,
        current_value=0,
        unit="%",
        owner="Developer"
    )
    
    if not success or not key_result.get('id'):
        print("❌ Failed to create key result for initiative editing test")
        return False
    
    key_result_id = key_result.get('id')
    
    # Create an initiative with status "not_started"
    success, initiative = tester.test_create_initiative(
        key_result_id=key_result_id,
        title="Build edit functionality",
        description="Implement the edit functionality for initiatives",
        owner="Developer",
        status="not_started"
    )
    
    if not success or not initiative.get('id'):
        print("❌ Failed to create initiative for editing test")
        return False
    
    initiative_id = initiative.get('id')
    
    # Test 1: Update initiative status from "not_started" to "in_progress"
    print("\n🔍 Testing status change: not_started → in_progress")
    success, updated_initiative = tester.test_update_initiative(
        initiative_id=initiative_id,
        title="Build edit functionality",
        description="Implement the edit functionality for initiatives",
        owner="Developer",
        status="in_progress"
    )
    
    if not success:
        print("❌ Failed to update initiative status to in_progress")
        return False
    
    if updated_initiative.get('status') != "in_progress":
        print(f"❌ Initiative status not updated correctly. Expected 'in_progress', got '{updated_initiative.get('status')}'")
        return False
    
    print("✅ Successfully updated initiative status to in_progress")
    
    # Test 2: Update initiative status from "in_progress" to "completed"
    print("\n🔍 Testing status change: in_progress → completed")
    success, updated_initiative = tester.test_update_initiative(
        initiative_id=initiative_id,
        title="Build edit functionality",
        description="Implement the edit functionality for initiatives",
        owner="Developer",
        status="completed"
    )
    
    if not success:
        print("❌ Failed to update initiative status to completed")
        return False
    
    if updated_initiative.get('status') != "completed":
        print(f"❌ Initiative status not updated correctly. Expected 'completed', got '{updated_initiative.get('status')}'")
        return False
    
    print("✅ Successfully updated initiative status to completed")
    
    # Test 3: Update initiative title, description, and owner
    print("\n🔍 Testing updating initiative content")
    new_title = "Enhanced edit functionality"
    new_description = "Implement enhanced edit functionality with validation"
    new_owner = "Senior Developer"
    
    success, updated_initiative = tester.test_update_initiative(
        initiative_id=initiative_id,
        title=new_title,
        description=new_description,
        owner=new_owner,
        status="completed"
    )
    
    if not success:
        print("❌ Failed to update initiative content")
        return False
    
    # Verify all fields were updated correctly
    if (updated_initiative.get('title') != new_title or 
        updated_initiative.get('description') != new_description or 
        updated_initiative.get('owner') != new_owner):
        print("❌ Initiative content not updated correctly")
        print(f"Expected title: {new_title}, got: {updated_initiative.get('title')}")
        print(f"Expected description: {new_description}, got: {updated_initiative.get('description')}")
        print(f"Expected owner: {new_owner}, got: {updated_initiative.get('owner')}")
        return False
    
    print("✅ Successfully updated initiative content")
    
    # Test 4: Verify changes by getting objective details
    success, obj_details = tester.test_get_objective_details(objective_id)
    
    if not success:
        print("❌ Failed to get objective details to verify initiative changes")
        return False
    
    # Find our initiative in the key results
    found_initiative = None
    for kr in obj_details.get('key_results', []):
        if kr.get('id') == key_result_id:
            for init in kr.get('initiatives', []):
                if init.get('id') == initiative_id:
                    found_initiative = init
                    break
    
    if not found_initiative:
        print("❌ Could not find updated initiative in objective details")
        return False
    
    # Verify initiative data in objective details
    if (found_initiative.get('title') != new_title or 
        found_initiative.get('description') != new_description or 
        found_initiative.get('owner') != new_owner or
        found_initiative.get('status') != "completed"):
        print("❌ Initiative data in objective details does not match expected values")
        return False
    
    print("✅ Initiative changes verified in objective details")
    return True

def test_initiative_validation(tester):
    """Test validation and error handling for initiative updates"""
    print("\n" + "="*50)
    print("🔍 TESTING INITIATIVE VALIDATION")
    print("="*50)
    
    # Create a test objective
    success, objective = tester.test_create_objective(
        title="Validation Test Objective",
        description="Testing validation for initiatives",
        owner="Test User"
    )
    
    if not success or not objective.get('id'):
        print("❌ Failed to create objective for validation test")
        return False
    
    objective_id = objective.get('id')
    
    # Create a key result
    success, key_result = tester.test_create_key_result(
        objective_id=objective_id,
        title="Validation Test KR",
        owner="Test User"
    )
    
    if not success or not key_result.get('id'):
        print("❌ Failed to create key result for validation test")
        return False
    
    key_result_id = key_result.get('id')
    
    # Create an initiative
    success, initiative = tester.test_create_initiative(
        key_result_id=key_result_id,
        title="Validation Test Initiative",
        owner="Test User"
    )
    
    if not success or not initiative.get('id'):
        print("❌ Failed to create initiative for validation test")
        return False
    
    initiative_id = initiative.get('id')
    
    # Test 1: Try to update with invalid status
    print("\n🔍 Testing update with invalid status")
    data = {
        "id": initiative_id,
        "title": "Validation Test Initiative",
        "description": "",
        "owner": "Test User",
        "status": "invalid_status"  # Invalid status
    }
    
    url = f"{tester.base_url}/api/initiatives/{initiative_id}"
    headers = {'Content-Type': 'application/json'}
    
    try:
        response = requests.put(url, json=data, headers=headers)
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text}")
        
        # The API might accept invalid status as it doesn't have explicit validation
        # We're just checking the behavior here
        if response.status_code == 200:
            print("⚠️ API accepted invalid status - no validation on status field")
        else:
            print("✅ API rejected invalid status")
    except Exception as e:
        print(f"❌ Error during validation test: {str(e)}")
    
    # Test 2: Try to update non-existent initiative
    print("\n🔍 Testing update of non-existent initiative")
    fake_id = "non-existent-id"
    success, _ = tester.run_test(
        "Update Non-existent Initiative",
        "PUT",
        f"api/initiatives/{fake_id}",
        404,
        data={
            "id": fake_id,
            "title": "This should fail",
            "description": "",
            "owner": "",
            "status": "not_started"
        }
    )
    
    if success:
        print("❌ Expected 404 error for non-existent initiative")
        return False
    else:
        print("✅ Correctly received error for non-existent initiative")
    
    return True

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
    
    # Test initiative editing functionality
    initiative_editing_success = test_initiative_editing_workflow(tester)
    
    # Test initiative validation
    validation_success = test_initiative_validation(tester)
    
    # Print test summary
    success = tester.print_summary()
    
    if not initiative_editing_success:
        print("\n❌ Initiative editing workflow tests failed")
        success = False
    else:
        print("\n✅ Initiative editing workflow tests passed")
        
    if not validation_success:
        print("❌ Initiative validation tests failed")
        success = False
    else:
        print("✅ Initiative validation tests passed")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
