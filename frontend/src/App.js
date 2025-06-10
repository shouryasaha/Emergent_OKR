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

  const ProgressBar = ({ progress, className = "" }) => (
    <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
      <div 
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
      ></div>
    </div>
  );

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
      <div className="bg-white p-6 rounded-lg shadow-lg border">
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
      <div className="bg-white p-6 rounded-lg shadow-lg border mt-4">
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
      status: initiative.status
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

  const Dashboard = () => {
    const [showObjectiveForm, setShowObjectiveForm] = useState(false);

    const handleCreateObjective = async (objectiveData) => {
      const result = await createObjective(objectiveData);
      if (result) {
        setShowObjectiveForm(false);
      }
    };

    if (loading && !dashboardData) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">OKR Dashboard</h2>
            <button
              onClick={() => setShowObjectiveForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              + New Objective
            </button>
          </div>
          
          {dashboardData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900">Total Objectives</h3>
                <p className="text-3xl font-bold text-blue-600">{dashboardData.total_objectives}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900">Average Progress</h3>
                <p className="text-3xl font-bold text-green-600">{dashboardData.avg_progress.toFixed(1)}%</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-900">Key Results</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {objectives.reduce((total, obj) => total + (obj.key_results_count || 0), 0)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Create Objective Form */}
        {showObjectiveForm && (
          <ObjectiveForm
            onSubmit={handleCreateObjective}
            onCancel={() => setShowObjectiveForm(false)}
          />
        )}

        {/* Objectives List */}
        <div className="space-y-4">
          {objectives.map((objective) => (
            <div key={objective.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{objective.title}</h3>
                  {objective.description && (
                    <p className="text-gray-600 mb-3">{objective.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {objective.owner && <span>Owner: {objective.owner}</span>}
                    {objective.deadline && <span>Due: {new Date(objective.deadline).toLocaleDateString()}</span>}
                    <span>{objective.key_results_count || 0} Key Results</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {objective.progress.toFixed(0)}%
                  </div>
                  <ProgressBar progress={objective.progress} className="w-32" />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    fetchObjectiveDetails(objective.id);
                    setActiveView('details');
                  }}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {objectives.length === 0 && !showObjectiveForm && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
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
        {/* Objective Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <button
            onClick={() => setActiveView('dashboard')}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Dashboard
          </button>
          
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedObjective.title}</h2>
              {selectedObjective.description && (
                <p className="text-gray-600 mb-3">{selectedObjective.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {selectedObjective.owner && <span>Owner: {selectedObjective.owner}</span>}
                {selectedObjective.deadline && <span>Due: {new Date(selectedObjective.deadline).toLocaleDateString()}</span>}
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
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
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

        {/* Key Results */}
        <div className="space-y-4">
          {selectedObjective.key_results?.map((keyResult) => (
            <div key={keyResult.id} className="bg-white rounded-lg shadow-sm border p-6">
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
          ))}
        </div>

        {(!selectedObjective.key_results || selectedObjective.key_results.length === 0) && (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm border">
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
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">OKR Tracker</h1>
            </div>
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeView === 'dashboard' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'dashboard' && <Dashboard />}
        {activeView === 'details' && <ObjectiveDetails />}
      </main>
    </div>
  );
};

export default App;