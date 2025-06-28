import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [objectives, setObjectives] = useState([]);
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  // Mock data for demonstration
  const mockTeams = [
    { id: 1, name: 'Engineering', members: 24, lead: 'Sarah Chen', objectives: 8, avgProgress: 78 },
    { id: 2, name: 'Product', members: 12, lead: 'Marcus Kim', objectives: 6, avgProgress: 85 },
    { id: 3, name: 'Sales', members: 18, lead: 'Jennifer Lopez', objectives: 10, avgProgress: 92 },
    { id: 4, name: 'Marketing', members: 15, lead: 'David Wilson', objectives: 7, avgProgress: 68 },
    { id: 5, name: 'Customer Success', members: 10, lead: 'Lisa Wang', objectives: 5, avgProgress: 88 },
    { id: 6, name: 'Operations', members: 8, lead: 'Michael Brown', objectives: 4, avgProgress: 75 }
  ];

  const mockPeople = [
    { id: 1, name: 'Sarah Chen', role: 'VP Engineering', team: 'Engineering', objectives: 3, avgProgress: 82, email: 'sarah.chen@company.com' },
    { id: 2, name: 'Marcus Kim', role: 'Head of Product', team: 'Product', objectives: 4, avgProgress: 89, email: 'marcus.kim@company.com' },
    { id: 3, name: 'Jennifer Lopez', role: 'Sales Director', team: 'Sales', objectives: 5, avgProgress: 94, email: 'jennifer.lopez@company.com' },
    { id: 4, name: 'David Wilson', role: 'Marketing Manager', team: 'Marketing', objectives: 3, avgProgress: 71, email: 'david.wilson@company.com' },
    { id: 5, name: 'Lisa Wang', role: 'Customer Success Lead', team: 'Customer Success', objectives: 2, avgProgress: 87, email: 'lisa.wang@company.com' },
    { id: 6, name: 'Michael Brown', role: 'Operations Manager', team: 'Operations', objectives: 2, avgProgress: 79, email: 'michael.brown@company.com' },
    { id: 7, name: 'Alex Thompson', role: 'Senior Engineer', team: 'Engineering', objectives: 2, avgProgress: 75, email: 'alex.thompson@company.com' },
    { id: 8, name: 'Emma Davis', role: 'Product Manager', team: 'Product', objectives: 3, avgProgress: 83, email: 'emma.davis@company.com' },
    { id: 9, name: 'James Miller', role: 'Account Executive', team: 'Sales', objectives: 4, avgProgress: 91, email: 'james.miller@company.com' },
    { id: 10, name: 'Sophie Garcia', role: 'Content Manager', team: 'Marketing', objectives: 2, avgProgress: 65, email: 'sophie.garcia@company.com' }
  ];

  const mockCompanyOKRs = [
    {
      id: 'comp-1',
      title: 'Achieve Market Leadership Position',
      description: 'Become the #1 solution in our market segment',
      owner: 'Executive Team',
      deadline: '2025-12-31',
      progress: 72,
      keyResults: [
        { title: 'Reach $50M ARR', progress: 68, current: '34M', target: '50M', unit: '$' },
        { title: 'Capture 25% market share', progress: 75, current: '18.7%', target: '25%', unit: '%' },
        { title: 'Achieve NPS score of 70+', progress: 80, current: '66', target: '70', unit: '' }
      ]
    },
    {
      id: 'comp-2', 
      title: 'Build World-Class Team',
      description: 'Scale our team with top talent while maintaining culture',
      owner: 'CEO & People Team',
      deadline: '2025-12-31',
      progress: 65,
      keyResults: [
        { title: 'Grow team to 200 people', progress: 63, current: '147', target: '200', unit: 'people' },
        { title: 'Maintain 95%+ employee satisfaction', progress: 70, current: '92%', target: '95%', unit: '%' },
        { title: 'Achieve 90%+ retention rate', progress: 85, current: '88%', target: '90%', unit: '%' }
      ]
    },
    {
      id: 'comp-3',
      title: 'Accelerate Innovation',
      description: 'Lead the market with cutting-edge product innovations',
      owner: 'CTO & Product Team',
      deadline: '2025-12-31', 
      progress: 78,
      keyResults: [
        { title: 'Launch 3 major product features', progress: 67, current: '2', target: '3', unit: 'features' },
        { title: 'Reduce time-to-market by 40%', progress: 85, current: '32%', target: '40%', unit: '%' },
        { title: 'File 5 patent applications', progress: 80, current: '4', target: '5', unit: 'patents' }
      ]
    }
  ];

  const mockTeamOKRs = [
    {
      id: 'team-eng-1',
      title: 'Deliver High-Performance Platform',
      description: 'Build scalable, reliable infrastructure for 10x growth',
      team: 'Engineering',
      owner: 'Sarah Chen',
      deadline: '2025-09-30',
      progress: 82,
      keyResults: [
        { title: 'Achieve 99.9% uptime', progress: 85, current: '99.7%', target: '99.9%', unit: '%' },
        { title: 'Reduce API response time to <100ms', progress: 78, current: '142ms', target: '100ms', unit: 'ms' },
        { title: 'Complete security audit with 0 critical issues', progress: 90, current: '1', target: '0', unit: 'issues' }
      ]
    },
    {
      id: 'team-sales-1',
      title: 'Accelerate Revenue Growth',
      description: 'Drive aggressive sales growth through new channels',
      team: 'Sales',
      owner: 'Jennifer Lopez',
      deadline: '2025-09-30',
      progress: 94,
      keyResults: [
        { title: 'Close $12M in new business', progress: 96, current: '11.5M', target: '12M', unit: '$' },
        { title: 'Achieve 120% of quota attainment', progress: 92, current: '115%', target: '120%', unit: '%' },
        { title: 'Onboard 50 new enterprise clients', progress: 94, current: '47', target: '50', unit: 'clients' }
      ]
    },
    {
      id: 'team-product-1',
      title: 'Enhance User Experience',
      description: 'Create delightful product experiences that drive adoption',
      team: 'Product',
      owner: 'Marcus Kim',
      deadline: '2025-09-30',
      progress: 76,
      keyResults: [
        { title: 'Improve user onboarding completion to 85%', progress: 73, current: '78%', target: '85%', unit: '%' },
        { title: 'Increase feature adoption by 50%', progress: 80, current: '42%', target: '50%', unit: '%' },
        { title: 'Achieve 4.8+ app store rating', progress: 75, current: '4.6', target: '4.8', unit: '/5' }
      ]
    },
    {
      id: 'team-marketing-1', 
      title: 'Drive Brand Awareness',
      description: 'Establish strong market presence and thought leadership',
      team: 'Marketing',
      owner: 'David Wilson', 
      deadline: '2025-09-30',
      progress: 68,
      keyResults: [
        { title: 'Generate 10k qualified leads', progress: 65, current: '6.5k', target: '10k', unit: 'leads' },
        { title: 'Achieve 50% brand awareness in target market', progress: 70, current: '35%', target: '50%', unit: '%' },
        { title: 'Grow social media following to 100k', progress: 72, current: '72k', target: '100k', unit: 'followers' }
      ]
    }
  ];

  // Fetch dashboard data
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/dashboard`);
      const data = await response.json();
      setDashboardData(data);
      setObjectives(data.objectives);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single objective with details
  const fetchObjectiveDetails = async (objectiveId) => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/objectives/${objectiveId}`);
      const data = await response.json();
      setSelectedObjective(data);
    } catch (error) {
      console.error('Error fetching objective details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create new objective
  const createObjective = async (objectiveData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/objectives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(objectiveData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating objective:', errorData);
        alert('Failed to create objective. Please check the form data.');
        return null;
      }
      
      const newObjective = await response.json();
      await fetchDashboard();
      return newObjective;
    } catch (error) {
      console.error('Error creating objective:', error);
      alert('Network error while creating objective.');
      return null;
    }
  };

  // Create new key result
  const createKeyResult = async (objectiveId, keyResultData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/objectives/${objectiveId}/key-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(keyResultData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating key result:', errorData);
        alert('Failed to create key result. Please check the form data.');
        return null;
      }
      
      const newKeyResult = await response.json();
      await fetchObjectiveDetails(objectiveId);
      return newKeyResult;
    } catch (error) {
      console.error('Error creating key result:', error);
      alert('Network error while creating key result.');
      return null;
    }
  };

  // Update key result progress
  const updateKeyResultProgress = async (keyResultId, currentValue) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/key-results/${keyResultId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ current_value: currentValue }),
      });
      const updatedKeyResult = await response.json();
      if (selectedObjective) {
        await fetchObjectiveDetails(selectedObjective.id);
      }
      await fetchDashboard();
      return updatedKeyResult;
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // Create new initiative
  const createInitiative = async (keyResultId, initiativeData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/key-results/${keyResultId}/initiatives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(initiativeData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating initiative:', errorData);
        alert('Failed to create initiative. Please check the form data.');
        return null;
      }
      
      const newInitiative = await response.json();
      if (selectedObjective) {
        await fetchObjectiveDetails(selectedObjective.id);
      }
      return newInitiative;
    } catch (error) {
      console.error('Error creating initiative:', error);
      alert('Network error while creating initiative.');
      return null;
    }
  };

  // Update initiative
  const updateInitiative = async (initiativeId, initiativeData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/initiatives/${initiativeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(initiativeData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error updating initiative:', errorData);
        alert('Failed to update initiative. Please check the form data.');
        return null;
      }
      
      const updatedInitiative = await response.json();
      if (selectedObjective) {
        await fetchObjectiveDetails(selectedObjective.id);
      }
      return updatedInitiative;
    } catch (error) {
      console.error('Error updating initiative:', error);
      alert('Network error while updating initiative.');
      return null;
    }
  };

  // Generate OKRs with AI
  const generateOKRsWithAI = async (contextData) => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/generate-okrs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contextData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error generating OKRs:', errorData);
        alert('Failed to generate OKRs. Please try again.');
        return null;
      }
      
      const result = await response.json();
      return result.generated_okrs;
    } catch (error) {
      console.error('Error generating OKRs:', error);
      alert('Network error while generating OKRs.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Generate and create OKRs with AI
  const generateAndCreateOKRs = async (contextData) => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/generate-and-create-okrs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contextData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error generating and creating OKRs:', errorData);
        alert('Failed to generate and create OKRs. Please try again.');
        return null;
      }
      
      const result = await response.json();
      await fetchDashboard(); // Refresh data
      return result.created_objectives;
    } catch (error) {
      console.error('Error generating and creating OKRs:', error);
      alert('Network error while generating OKRs.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Header Component
  const Header = () => (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">★</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">OKR Tracker</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`text-sm font-medium ${activeView === 'dashboard' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveView('objectives')}
              className={`text-sm font-medium ${activeView === 'objectives' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              My OKRs
            </button>
            <button
              onClick={() => setActiveView('team-okrs')}
              className={`text-sm font-medium ${activeView === 'team-okrs' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Team OKRs
            </button>
            <button
              onClick={() => setActiveView('company-okrs')}
              className={`text-sm font-medium ${activeView === 'company-okrs' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Company OKRs
            </button>
            <button
              onClick={() => setActiveView('reports')}
              className={`text-sm font-medium ${activeView === 'reports' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Reports
            </button>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
            </svg>
          </button>
          <div className="w-8 h-8 bg-orange-400 rounded-full"></div>
        </div>
      </div>
    </header>
  );

  // Sidebar Component
  const Sidebar = () => (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">AT</span>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">Alex Torres</div>
            <div className="text-sm text-gray-500">Product Manager</div>
          </div>
        </div>
        
        <nav className="space-y-2">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${
              activeView === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            </svg>
            <span>Dashboard</span>
          </button>
          
          <button
            onClick={() => setActiveView('objectives')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${
              activeView === 'objectives' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>My OKRs</span>
          </button>
          
          <button
            onClick={() => setActiveView('company-okrs')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${
              activeView === 'company-okrs' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h1a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>Company OKRs</span>
          </button>
          
          <button
            onClick={() => setActiveView('team-okrs')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${
              activeView === 'team-okrs' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Teams</span>
          </button>
          
          <button
            onClick={() => setActiveView('people')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${
              activeView === 'people' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>People</span>
          </button>
          
          <button
            onClick={() => setActiveView('reports')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${
              activeView === 'reports' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Reports</span>
          </button>
          
          <button
            onClick={() => setActiveView('settings')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${
              activeView === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Settings</span>
          </button>
        </nav>
      </div>
    </div>
  );

  // AI OKR Generator Component
  const AIObjectiveGenerator = ({ onGenerate, onCancel }) => {
    const [formData, setFormData] = useState({
      context: '',
      company_size: 'SMB',
      industry: '',
      time_period: 'quarterly'
    });
    const [generationMode, setGenerationMode] = useState('preview'); // 'preview' or 'create'
    const [generatedOKRs, setGeneratedOKRs] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async (mode = 'preview') => {
      if (!formData.context.trim()) {
        alert('Please provide some context about your business goals.');
        return;
      }

      setIsGenerating(true);
      
      let result;
      if (mode === 'create') {
        result = await generateAndCreateOKRs(formData);
        if (result) {
          alert(`Successfully created ${result.length} objectives with AI-generated content!`);
          onGenerate();
        }
      } else {
        result = await generateOKRsWithAI(formData);
        if (result) {
          setGeneratedOKRs(result);
        }
      }
      setIsGenerating(false);
    };

    const handleCreateSelected = async () => {
      // Create objectives manually from generated ones
      const promises = generatedOKRs.map(async (okr) => {
        const objectiveData = {
          title: okr.title,
          description: okr.description,
          owner: okr.owner,
          deadline: ''
        };
        const createdObjective = await createObjective(objectiveData);
        
        if (createdObjective) {
          // Create key results for this objective
          for (const kr of okr.key_results) {
            await createKeyResult(createdObjective.id, {
              title: kr.title,
              description: kr.description || '',
              type: kr.type || 'metric',
              start_value: kr.start_value || 0,
              target_value: kr.target_value || 100,
              current_value: kr.current_value || 0,
              unit: kr.unit || '',
              owner: okr.owner
            });
          }
        }
        return createdObjective;
      });

      await Promise.all(promises);
      alert(`Successfully created ${generatedOKRs.length} objectives!`);
      onGenerate();
    };

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">AI-Powered OKR Generator</h3>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>How it works:</strong> Describe your business goals, challenges, or aspirations in plain language. 
            Our AI will generate structured OKRs (Objectives and Key Results) tailored to your context.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Context & Goals <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.context}
              onChange={(e) => setFormData({...formData, context: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Example: We're a SaaS startup looking to increase our customer base, improve product quality, and scale our team. We want to reach 100k users and reduce churn rate while building a strong engineering culture..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Be specific about your goals, challenges, and desired outcomes for best results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
              <select
                value={formData.company_size}
                onChange={(e) => setFormData({...formData, company_size: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Startup">Startup (1-10 people)</option>
                <option value="SMB">Small Business (11-50 people)</option>
                <option value="Mid-size">Mid-size (51-200 people)</option>
                <option value="Enterprise">Enterprise (200+ people)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry (Optional)</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({...formData, industry: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., SaaS, E-commerce, Healthcare"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
              <select
                value={formData.time_period}
                onChange={(e) => setFormData({...formData, time_period: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="quarterly">Quarterly (3 months)</option>
                <option value="half-yearly">Half-yearly (6 months)</option>
                <option value="yearly">Yearly (12 months)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Generated OKRs Preview */}
        {generatedOKRs.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-900">Generated OKRs Preview</h4>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {generatedOKRs.map((okr, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="font-semibold text-gray-900">{okr.title}</h5>
                      <p className="text-sm text-gray-600 mt-1">{okr.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Owner: {okr.owner}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h6 className="text-sm font-medium text-gray-700">Key Results:</h6>
                    {okr.key_results.map((kr, krIndex) => (
                      <div key={krIndex} className="bg-white p-2 rounded border">
                        <p className="text-sm font-medium text-gray-800">{kr.title}</p>
                        <p className="text-xs text-gray-600">
                          Target: {kr.start_value || 0}{kr.unit} → {kr.target_value}{kr.unit}
                          {kr.description && ` (${kr.description})`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          {generatedOKRs.length === 0 ? (
            <>
              <button
                onClick={() => handleGenerate('preview')}
                disabled={isGenerating || !formData.context.trim()}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>Generate OKRs</span>
                  </>
                )}
              </button>
              <button
                onClick={() => handleGenerate('create')}
                disabled={isGenerating || !formData.context.trim()}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Generate & Create</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCreateSelected}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Create These OKRs
              </button>
              <button
                onClick={() => setGeneratedOKRs([])}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                Generate New OKRs
              </button>
            </>
          )}
          <button
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  // Progress Bar Component
  const ProgressBar = ({ progress, className = "" }) => (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
      ></div>
    </div>
  );

  // Form Components (keeping existing functionality)
  const ObjectiveForm = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      owner: '',
      deadline: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
      setFormData({ title: '', description: '', owner: '', deadline: '' });
    };

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Objective</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter objective title..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Describe your objective..."
            ></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
              <input
                type="text"
                value={formData.owner}
                onChange={(e) => setFormData({...formData, owner: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Assign owner..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Objective
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  const KeyResultForm = ({ objectiveId, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      type: 'metric',
      start_value: 0,
      target_value: 100,
      current_value: 0,
      unit: '',
      owner: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(objectiveId, formData);
      setFormData({
        title: '',
        description: '',
        type: 'metric',
        start_value: 0,
        target_value: 100,
        current_value: 0,
        unit: '',
        owner: ''
      });
    };

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 mt-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Key Result</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter key result title..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="metric">Metric (with values)</option>
              <option value="binary">Binary (done/not done)</option>
            </select>
          </div>
          {formData.type === 'metric' && (
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                <input
                  type="number"
                  value={formData.start_value}
                  onChange={(e) => setFormData({...formData, start_value: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                <input
                  type="number"
                  value={formData.target_value}
                  onChange={(e) => setFormData({...formData, target_value: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current</label>
                <input
                  type="number"
                  value={formData.current_value}
                  onChange={(e) => setFormData({...formData, current_value: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="%, $, users..."
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
            <input
              type="text"
              value={formData.owner}
              onChange={(e) => setFormData({...formData, owner: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Assign owner..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Add Key Result
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  const InitiativeForm = ({ keyResultId, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      owner: '',
      status: 'not_started'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(keyResultId, formData);
      setFormData({ title: '', description: '', owner: '', status: 'not_started' });
    };

    return (
      <div className="bg-gray-50 p-4 rounded-lg border mt-3">
        <h4 className="text-md font-medium text-gray-900 mb-3">Add Initiative</h4>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Initiative title..."
            />
          </div>
          <div>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
              placeholder="Description..."
            ></textarea>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={formData.owner}
              onChange={(e) => setFormData({...formData, owner: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Owner..."
            />
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
            >
              Add
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  const EditInitiativeForm = ({ initiative, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      title: initiative.title,
      description: initiative.description || '',
      owner: initiative.owner || '',
      status: initiative.status,
      key_result_id: initiative.key_result_id
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(initiative.id, formData);
    };

    return (
      <div className="bg-blue-50 p-4 rounded-lg border mt-3">
        <h4 className="text-md font-medium text-gray-900 mb-3">Edit Initiative</h4>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Initiative title..."
            />
          </div>
          <div>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
              placeholder="Description..."
            ></textarea>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={formData.owner}
              onChange={(e) => setFormData({...formData, owner: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Owner..."
            />
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Update
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Dashboard View with Enhanced Metrics
  const Dashboard = () => {
    if (loading && !dashboardData) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    const timeRemaining = "3 months, 15 days";
    const avgObjectiveAchievement = dashboardData ? Math.round(dashboardData.avg_progress) : 78;
    const avgKeyResultAchievement = 74;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setActiveView('objectives');
                setShowAIGenerator(true);
              }}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>Generate OKRs with AI</span>
            </button>
            <div className="text-sm text-gray-500">Q4 2024 Cycle</div>
          </div>
        </div>

        {/* Overview Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-600">Time Remaining</h3>
                  <p className="text-2xl font-bold text-gray-900">{timeRemaining}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-600">Objective Progress</h3>
                  <p className="text-2xl font-bold text-gray-900">{avgObjectiveAchievement}%</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-600">Key Result Progress</h3>
                  <p className="text-2xl font-bold text-gray-900">{avgKeyResultAchievement}%</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-600">Total Teams</h3>
                  <p className="text-2xl font-bold text-gray-900">{mockTeams.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-4">
              {mockTeams.map((team) => (
                <div key={team.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      team.avgProgress >= 90 ? 'bg-green-100 text-green-600' :
                      team.avgProgress >= 70 ? 'bg-blue-100 text-blue-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      <span className="font-semibold text-sm">{team.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{team.name}</h3>
                      <p className="text-sm text-gray-500">{team.members} members • {team.objectives} objectives</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{team.avgProgress}%</div>
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div 
                          className={`h-2 rounded-full ${
                            team.avgProgress >= 90 ? 'bg-green-500' :
                            team.avgProgress >= 70 ? 'bg-blue-500' :
                            'bg-orange-500'
                          }`}
                          style={{ width: `${team.avgProgress}%` }}
                        ></div>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveView('team-okrs')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View OKRs
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900"><strong>Jennifer Lopez</strong> updated "Close $12M in new business" to 96%</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900"><strong>Sarah Chen</strong> completed initiative "Deploy monitoring system"</p>
                    <p className="text-xs text-gray-500">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900"><strong>Marcus Kim</strong> created new objective "Enhance User Experience"</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900"><strong>Alex Thompson</strong> added key result "Reduce API response time"</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Company OKRs View
  const CompanyOKRsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Company OKRs</h1>
        <div className="text-sm text-gray-500">Q4 2024 Cycle</div>
      </div>

      <div className="space-y-6">
        {mockCompanyOKRs.map((okr) => (
          <div key={okr.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">COMPANY</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{okr.title}</h2>
                <p className="text-gray-600 mb-4">{okr.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Owner: {okr.owner}</span>
                  <span>Due: {new Date(okr.deadline).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600 mb-2">{okr.progress}%</div>
                <ProgressBar progress={okr.progress} className="w-32" />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 mb-3">Key Results</h3>
              {okr.keyResults.map((kr, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{kr.title}</h4>
                    <p className="text-sm text-gray-600">{kr.current}{kr.unit} / {kr.target}{kr.unit}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-blue-600 rounded-full"
                        style={{ width: `${kr.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">{kr.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Team OKRs View  
  const TeamOKRsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Team OKRs</h1>
        <div className="text-sm text-gray-500">Q4 2024 Cycle</div>
      </div>

      <div className="space-y-6">
        {mockTeamOKRs.map((okr) => (
          <div key={okr.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">{okr.team.toUpperCase()}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{okr.title}</h2>
                <p className="text-gray-600 mb-4">{okr.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Owner: {okr.owner}</span>
                  <span>Due: {new Date(okr.deadline).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600 mb-2">{okr.progress}%</div>
                <ProgressBar progress={okr.progress} className="w-32" />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 mb-3">Key Results</h3>
              {okr.keyResults.map((kr, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{kr.title}</h4>
                    <p className="text-sm text-gray-600">{kr.current}{kr.unit} / {kr.target}{kr.unit}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-green-600 rounded-full"
                        style={{ width: `${kr.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">{kr.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // People View
  const PeopleView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">People</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Add Person
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex space-x-8">
            <button className="pb-2 border-b-2 border-blue-600 text-blue-600 font-medium text-sm">All People</button>
            <button className="pb-2 text-gray-500 hover:text-gray-700 text-sm">By Team</button>
            <button className="pb-2 text-gray-500 hover:text-gray-700 text-sm">By Performance</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Person</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objectives</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockPeople.map((person) => (
                <tr key={person.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {person.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{person.name}</div>
                        <div className="text-sm text-gray-500">{person.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">{person.team}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {person.objectives}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            person.avgProgress >= 90 ? 'bg-green-500' :
                            person.avgProgress >= 70 ? 'bg-blue-500' :
                            'bg-orange-500'
                          }`}
                          style={{ width: `${person.avgProgress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{person.avgProgress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">View OKRs</button>
                    <button className="text-gray-600 hover:text-gray-900">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Reports View
  const ReportsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Objective Completion Rate</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">78%</div>
            <p className="text-sm text-gray-600">Objectives on track</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">6/6</div>
            <p className="text-sm text-gray-600">Teams meeting targets</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Individual Progress</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">81%</div>
            <p className="text-sm text-gray-600">Average individual progress</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">OKR Progress by Quarter</h2>
        <div className="space-y-4">
          {['Q4 2024', 'Q3 2024', 'Q2 2024', 'Q1 2024'].map((quarter, index) => (
            <div key={quarter} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">{quarter}</h3>
                <p className="text-sm text-gray-600">
                  {index === 0 ? 'Current cycle (in progress)' : 'Completed cycle'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {index === 0 ? '78%' : index === 1 ? '92%' : index === 2 ? '85%' : '88%'}
                  </div>
                  <div className="w-32 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-blue-600 rounded-full"
                      style={{ width: `${index === 0 ? 78 : index === 1 ? 92 : index === 2 ? 85 : 88}%` }}
                    ></div>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Objectives View (keeping existing functionality)
  const ObjectivesView = () => {
    const [showObjectiveForm, setShowObjectiveForm] = useState(false);

    const handleCreateObjective = async (objectiveData) => {
      const result = await createObjective(objectiveData);
      if (result) {
        setShowObjectiveForm(false);
      }
    };

    // Group objectives by quarters
    const currentYear = new Date().getFullYear();
    const quarters = {
      [`Q4 ${currentYear}`]: [],
      [`Q3 ${currentYear}`]: [],
      [`Q2 ${currentYear}`]: [],
      [`Q1 ${currentYear}`]: []
    };

    objectives.forEach(obj => {
      // Simple quarter assignment based on creation date
      const quarter = `Q4 ${currentYear}`;
      if (quarters[quarter]) {
        quarters[quarter].push(obj);
      }
    });

    const iconColors = ['bg-teal-400', 'bg-green-400', 'bg-orange-300'];

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My OKRs</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAIGenerator(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>AI Generate OKRs</span>
            </button>
            <button
              onClick={() => setShowObjectiveForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              New objective
            </button>
          </div>
        </div>

        <div className="flex space-x-8 border-b border-gray-200">
          <button className="pb-2 border-b-2 border-blue-600 text-blue-600 font-medium">All</button>
          <button className="pb-2 text-gray-500 hover:text-gray-700">My objectives</button>
          <button className="pb-2 text-gray-500 hover:text-gray-700">Team objectives</button>
        </div>

        {showAIGenerator && (
          <AIObjectiveGenerator
            onGenerate={() => {
              setShowAIGenerator(false);
              fetchDashboard();
            }}
            onCancel={() => setShowAIGenerator(false)}
          />
        )}

        {showObjectiveForm && (
          <ObjectiveForm
            onSubmit={handleCreateObjective}
            onCancel={() => setShowObjectiveForm(false)}
          />
        )}

        {Object.entries(quarters).map(([quarter, quarterObjectives]) => (
          <div key={quarter} className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">{quarter}</h2>
            <div className="space-y-4">
              {quarterObjectives.map((objective, index) => (
                <div key={objective.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm text-gray-500">Objective</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{objective.title}</h3>
                      <p className="text-gray-600 mb-4">{objective.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {objective.owner && <span>Owner: {objective.owner}</span>}
                        {objective.deadline && <span>Due: {new Date(objective.deadline).toLocaleDateString()}</span>}
                        <span>{objective.key_results_count || 0} Key Results</span>
                      </div>
                    </div>
                    <div className={`w-24 h-24 ${iconColors[index % iconColors.length]} rounded-lg flex items-center justify-center ml-6`}>
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <ProgressBar progress={objective.progress} />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{objective.progress.toFixed(0)}%</span>
                    <button
                      onClick={() => {
                        fetchObjectiveDetails(objective.id);
                        setActiveView('details');
                      }}
                      className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {objectives.length === 0 && !showObjectiveForm && !showAIGenerator && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Objectives Yet</h3>
            <p className="text-gray-600 mb-4">Create your first objective to start tracking your goals.</p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setShowAIGenerator(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>Generate with AI</span>
              </button>
              <button
                onClick={() => setShowObjectiveForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Manually
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Objective Details View (keeping existing functionality)
  const ObjectiveDetails = () => {
    const [showKeyResultForm, setShowKeyResultForm] = useState(false);
    const [showInitiativeForm, setShowInitiativeForm] = useState(null);
    const [editingProgress, setEditingProgress] = useState(null);
    const [editingInitiative, setEditingInitiative] = useState(null);
    const [progressValue, setProgressValue] = useState('');

    const handleCreateKeyResult = async (objectiveId, keyResultData) => {
      const result = await createKeyResult(objectiveId, keyResultData);
      if (result) {
        setShowKeyResultForm(false);
      }
    };

    const handleCreateInitiative = async (keyResultId, initiativeData) => {
      const result = await createInitiative(keyResultId, initiativeData);
      if (result) {
        setShowInitiativeForm(null);
      }
    };

    const handleUpdateInitiative = async (initiativeId, initiativeData) => {
      const result = await updateInitiative(initiativeId, initiativeData);
      if (result) {
        setEditingInitiative(null);
      }
    };

    const handleProgressUpdate = async (keyResultId) => {
      await updateKeyResultProgress(keyResultId, parseFloat(progressValue));
      setEditingProgress(null);
      setProgressValue('');
    };

    const startEditingProgress = (keyResult) => {
      setEditingProgress(keyResult.id);
      setProgressValue(keyResult.current_value.toString());
    };

    const startEditingInitiative = (initiative) => {
      setEditingInitiative(initiative.id);
    };

    if (!selectedObjective) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600">No objective selected</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => setActiveView('objectives')}
            className="text-blue-600 hover:text-blue-800 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Objectives</span>
          </button>
        </div>

        {/* Objective Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedObjective.title}</h1>
              {selectedObjective.description && (
                <p className="text-gray-600 mb-4">{selectedObjective.description}</p>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {selectedObjective.owner && <span>Owner: {selectedObjective.owner}</span>}
                {selectedObjective.deadline && <span>Due: {new Date(selectedObjective.deadline).toLocaleDateString()}</span>}
                <span>Key Results: {selectedObjective.key_results?.length || 0}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {selectedObjective.progress.toFixed(0)}%
              </div>
              <ProgressBar progress={selectedObjective.progress} className="w-40" />
            </div>
          </div>
          
          <button
            onClick={() => setShowKeyResultForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            + Add Key Result
          </button>
        </div>

        {/* Key Result Form */}
        {showKeyResultForm && (
          <KeyResultForm
            objectiveId={selectedObjective.id}
            onSubmit={handleCreateKeyResult}
            onCancel={() => setShowKeyResultForm(false)}
          />
        )}

        {/* Key Results Display */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            Key Results ({selectedObjective.key_results?.length || 0})
          </h2>
          
          {selectedObjective.key_results && selectedObjective.key_results.length > 0 ? (
            selectedObjective.key_results.map((keyResult) => (
              <div key={keyResult.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{keyResult.title}</h3>
                    {keyResult.description && (
                      <p className="text-gray-600 mb-3">{keyResult.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      {keyResult.owner && <span>Owner: {keyResult.owner}</span>}
                      <span>Type: {keyResult.type === 'metric' ? 'Metric' : 'Binary'}</span>
                      {keyResult.type === 'metric' && (
                        <span>
                          {keyResult.current_value} / {keyResult.target_value} {keyResult.unit}
                        </span>
                      )}
                    </div>
                    
                    {/* Progress Update */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1">
                        <ProgressBar progress={keyResult.progress} />
                      </div>
                      <span className="text-lg font-semibold text-gray-900">
                        {keyResult.progress.toFixed(0)}%
                      </span>
                      {editingProgress === keyResult.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={progressValue}
                            onChange={(e) => setProgressValue(e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            step="0.1"
                          />
                          <button
                            onClick={() => handleProgressUpdate(keyResult.id)}
                            className="bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingProgress(null)}
                            className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-sm hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditingProgress(keyResult)}
                          className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
                        >
                          Update
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Initiatives */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-md font-medium text-gray-900">
                      Initiatives ({keyResult.initiatives?.length || 0})
                    </h4>
                    <button
                      onClick={() => setShowInitiativeForm(keyResult.id)}
                      className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm hover:bg-purple-200 transition-colors"
                    >
                      + Add Initiative
                    </button>
                  </div>

                  {showInitiativeForm === keyResult.id && (
                    <InitiativeForm
                      keyResultId={keyResult.id}
                      onSubmit={handleCreateInitiative}
                      onCancel={() => setShowInitiativeForm(null)}
                    />
                  )}

                  <div className="space-y-2">
                    {keyResult.initiatives?.map((initiative) => (
                      <div key={initiative.id}>
                        {editingInitiative === initiative.id ? (
                          <EditInitiativeForm
                            initiative={initiative}
                            onSubmit={handleUpdateInitiative}
                            onCancel={() => setEditingInitiative(null)}
                          />
                        ) : (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{initiative.title}</h5>
                              {initiative.description && (
                                <p className="text-sm text-gray-600">{initiative.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              {initiative.owner && (
                                <span className="text-sm text-gray-500">{initiative.owner}</span>
                              )}
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                initiative.status === 'completed' ? 'bg-green-100 text-green-700' :
                                initiative.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {initiative.status.replace('_', ' ')}
                              </span>
                              <button
                                onClick={() => startEditingInitiative(initiative)}
                                className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 transition-colors"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {(!keyResult.initiatives || keyResult.initiatives.length === 0) && (
                    <p className="text-gray-500 text-sm">No initiatives yet. Add one to break down this key result into actionable steps.</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Key Results Yet</h3>
              <p className="text-gray-600 mb-4">Add key results to make this objective measurable.</p>
              <button
                onClick={() => setShowKeyResultForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Add Your First Key Result
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Settings View (keeping existing)
  const SettingsView = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              defaultValue="Alex Torres"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              defaultValue="alex.torres@company.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
            <input
              type="text"
              defaultValue="Product Manager"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your job title"
            />
          </div>
          
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Update
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Notifications</h2>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="ml-2 text-sm text-gray-700">OKR Updates</span>
          </label>
          
          <label className="flex items-center">
            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="ml-2 text-sm text-gray-700">Team Activity</span>
          </label>
          
          <label className="flex items-center">
            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="ml-2 text-sm text-gray-700">System Alerts</span>
          </label>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">App Settings</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Help & Support</h2>
        
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded">
            <span>Help Center</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <button className="w-full flex items-center justify-between px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded">
            <span>FAQs</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <button className="w-full flex items-center justify-between px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded">
            <span>Contact Support</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {activeView === 'dashboard' || activeView === 'objectives' || activeView === 'settings' || 
       activeView === 'company-okrs' || activeView === 'team-okrs' || activeView === 'people' || activeView === 'reports' ? (
        <>
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-auto p-6">
              {activeView === 'dashboard' && <Dashboard />}
              {activeView === 'objectives' && <ObjectivesView />}
              {activeView === 'company-okrs' && <CompanyOKRsView />}
              {activeView === 'team-okrs' && <TeamOKRsView />}
              {activeView === 'people' && <PeopleView />}
              {activeView === 'reports' && <ReportsView />}
              {activeView === 'settings' && <SettingsView />}
            </main>
          </div>
        </>
      ) : (
        // Full-screen views like objective details
        <div className="flex flex-col h-full">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-auto p-6">
              {activeView === 'details' && <ObjectiveDetails />}
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;