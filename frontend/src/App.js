import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [objectives, setObjectives] = useState([]);
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

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
            <button className="text-sm font-medium text-gray-500 hover:text-gray-900">Team OKRs</button>
            <button className="text-sm font-medium text-gray-500 hover:text-gray-900">Company OKRs</button>
            <button className="text-sm font-medium text-gray-500 hover:text-gray-900">Reports</button>
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
            <span className="text-white font-bold text-sm">AC</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">OKR Tracker</span>
        </div>
        
        <nav className="space-y-2">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${
              activeView === 'dashboard' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
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
          
          <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Company OKRs</span>
          </button>
          
          <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <span>Teams</span>
          </button>
          
          <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>People</span>
          </button>
          
          <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Reports</span>
          </button>
          
          <button
            onClick={() => setActiveView('settings')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${
              activeView === 'settings' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
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

  // Progress Bar Component
  const ProgressBar = ({ progress, className = "" }) => (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
      ></div>
    </div>
  );

  // Form Components
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

  // Dashboard View
  const Dashboard = () => {
    if (loading && !dashboardData) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    const timeRemaining = "2 months";
    const avgObjectiveAchievement = dashboardData ? Math.round(dashboardData.avg_progress) : 0;
    const avgKeyResultAchievement = 60; // Mock data

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>

        {/* Overview Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Time Remaining</h3>
              <p className="text-3xl font-bold text-gray-900">{timeRemaining}</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Average Objective Achievement</h3>
              <p className="text-3xl font-bold text-gray-900">{avgObjectiveAchievement}%</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Average Key Result Achievement</h3>
              <p className="text-3xl font-bold text-gray-900">{avgKeyResultAchievement}%</p>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Objective Achievement</h3>
              <p className="text-3xl font-bold text-gray-900 mb-2">{avgObjectiveAchievement}%</p>
              <p className="text-sm text-gray-600 mb-4">Current Cycle</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sales</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div className="w-3/4 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Marketing</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div className="w-1/2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Product</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div className="w-5/6 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Engineering</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div className="w-2/3 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Result Achievement</h3>
              <p className="text-3xl font-bold text-gray-900 mb-2">{avgKeyResultAchievement}%</p>
              <p className="text-sm text-gray-600 mb-4">Current Cycle</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sales</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div className="w-4/5 h-2 bg-green-600 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Marketing</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div className="w-3/5 h-2 bg-green-600 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Product</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div className="w-1/2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Engineering</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div className="w-3/4 h-2 bg-green-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Objectives */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Objectives</h2>
          <div className="space-y-3">
            {objectives.slice(0, 3).map((objective) => (
              <div key={objective.id} className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{objective.title}</h3>
                  <p className="text-sm text-gray-600">{objective.owner}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{objective.progress.toFixed(0)}%</div>
                    <ProgressBar progress={objective.progress} className="w-20" />
                  </div>
                  <button
                    onClick={() => {
                      fetchObjectiveDetails(objective.id);
                      setActiveView('details');
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Objectives View
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
          <h1 className="text-2xl font-bold text-gray-900">Objectives</h1>
          <button
            onClick={() => setShowObjectiveForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            New objective
          </button>
        </div>

        <div className="flex space-x-8 border-b border-gray-200">
          <button className="pb-2 border-b-2 border-blue-600 text-blue-600 font-medium">All</button>
          <button className="pb-2 text-gray-500 hover:text-gray-700">My objectives</button>
          <button className="pb-2 text-gray-500 hover:text-gray-700">Team objectives</button>
        </div>

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

        {objectives.length === 0 && !showObjectiveForm && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Objectives Yet</h3>
            <p className="text-gray-600 mb-4">Create your first objective to start tracking your goals.</p>
            <button
              onClick={() => setShowObjectiveForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Your First Objective
            </button>
          </div>
        )}
      </div>
    );
  };

  // Objective Details View with Full Functionality
  const ObjectiveDetails = () => {
    const [showKeyResultForm, setShowKeyResultForm] = useState(false);
    const [showInitiativeForm, setShowInitiativeForm] = useState(null);
    const [editingProgress, setEditingProgress] = useState(null);
    const [editingInitiative, setEditingInitiative] = useState(null);
    const [progressValue, setProgressValue] = useState('');

    const handleCreateKeyResult = async (objectiveId, keyResultData) => {
      console.log('Creating key result:', keyResultData);
      const result = await createKeyResult(objectiveId, keyResultData);
      if (result) {
        setShowKeyResultForm(false);
        console.log('Key result created successfully');
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

    console.log('Selected Objective:', selectedObjective);
    console.log('Key Results:', selectedObjective.key_results);
    console.log('Number of Key Results:', selectedObjective.key_results?.length || 0);

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
            onClick={() => {
              console.log('Add Key Result button clicked');
              setShowKeyResultForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            + Add Key Result
          </button>
          
          {showKeyResultForm && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800">Key Result form should appear here</p>
            </div>
          )}
        </div>

        {/* Debug Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Debug Information:</h3>
          <div className="text-sm text-yellow-700">
            <p>Show Key Result Form: {showKeyResultForm ? 'true' : 'false'}</p>
            <p>Objective ID: {selectedObjective.id}</p>
            <p>Key Results Array: {selectedObjective.key_results ? 'exists' : 'null/undefined'}</p>
            <p>Key Results Length: {selectedObjective.key_results?.length || 0}</p>
            <p>Progress: {selectedObjective.progress}%</p>
          </div>
        </div>

        {/* Key Result Form */}
        {showKeyResultForm && (
          <KeyResultForm
            objectiveId={selectedObjective.id}
            onSubmit={handleCreateKeyResult}
            onCancel={() => {
              console.log('Canceling key result form');
              setShowKeyResultForm(false);
            }}
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

  // Settings View
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
            <input
              type="text"
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
      {activeView === 'dashboard' || activeView === 'objectives' || activeView === 'settings' ? (
        <>
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-auto p-6">
              {activeView === 'dashboard' && <Dashboard />}
              {activeView === 'objectives' && <ObjectivesView />}
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