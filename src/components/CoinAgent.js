'use client';
import { useEffect, useState } from 'react';
import { 
  Play, 
  TrendingUp, 
  FileText, 
  Bell, 
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Target,
  Eye,
  Trash2,
  Coins
} from 'lucide-react';
import Image from 'next/image';

export default function AgentFiPlatform() {
  const [activeTab, setActiveTab] = useState('overview');
  const [agent, setAgent] = useState(null);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingAgent, setCreatingAgent] = useState(false);
  const [agentConfig, setAgentConfig] = useState({
    name: '',
    specialization: 'text_parsing',
    sensitivity: 'medium',
    autoExecute: false
  });
  const [showAgentCreator, setShowAgentCreator] = useState(false);
  const [missionResults, setMissionResults] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [taskProgress, setTaskProgress] = useState({});
  const [popupData, setPopupData] = useState(null);

  // Available specializations
  const specializations = [
    { id: 'text_parsing', name: 'Text Parsing', desc: 'Analyze and extract data from text', icon: FileText },
    { id: 'content_summary', name: 'Content Summarization', desc: 'Create concise summaries', icon: BarChart3 },
    { id: 'price_monitoring', name: 'Price Monitoring', desc: 'Track and alert on price changes', icon: TrendingUp },
    { id: 'alert_system', name: 'Smart Alerts', desc: 'Intelligent notification system', icon: Bell }
  ];

  // Initialize with mock data
  useEffect(() => {
    const savedAgent = localStorage.getItem('agentfi_agent');
    const savedMissions = localStorage.getItem('agentfi_missions');
    
    if (savedAgent) {
      setAgent(JSON.parse(savedAgent));
    }
    if (savedMissions) {
      setMissions(JSON.parse(savedMissions));
    }
  }, []);

  const createAgent = async () => {
    if (!agentConfig.name.trim()) {
      alert('Please enter an agent name');
      return;
    }

    setCreatingAgent(true);
    
    try {
      // Use AI to create agent personality and capabilities
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { 
              role: "system", 
              content: `You are an AI Agent creator. Create a unique AI agent profile based on the following specifications:
              
              Name: ${agentConfig.name}
              Specialization: ${agentConfig.specialization}
              Sensitivity: ${agentConfig.sensitivity}
              Auto-execute: ${agentConfig.autoExecute}
              
              Return a JSON response with:
              - personality: Brief description of agent's work style
              - capabilities: Array of specific skills
              - initialMessage: Welcome message from the agent
              - specialtyDescription: Detailed explanation of what this agent excels at
              
              Make it feel personal and unique.` 
            },
            { 
              role: "user", 
              content: `Create my AI agent named "${agentConfig.name}" specialized in ${agentConfig.specialization}` 
            },
          ],
        }),
      });

      const data = await response.json();
      let aiProfile = {};
      
      try {
        // Try to parse AI response as JSON
        const aiResponse = data.reply || '{}';
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiProfile = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        // Fallback if AI doesn't return valid JSON
        aiProfile = {
          personality: "Efficient and reliable automation assistant",
          capabilities: ["Task automation", "Data processing", "Smart monitoring"],
          initialMessage: `Hello! I'm ${agentConfig.name}, your new AI assistant.`,
          specialtyDescription: `I specialize in ${agentConfig.specialization} and I'm ready to help automate your tasks.`
        };
      }
      
      const newAgent = {
        id: Date.now(),
        name: agentConfig.name,
        specialization: agentConfig.specialization,
        level: 1,
        experience: 0,
        nextLevelExp: 500,
        totalRewards: 0,
        tasksCompleted: 0,
        accuracy: 100,
        status: 'active',
        createdAt: new Date().toISOString(),
        config: agentConfig,
        aiProfile: aiProfile,
        lastActive: new Date().toISOString()
      };
      
      setAgent(newAgent);
      localStorage.setItem('agentfi_agent', JSON.stringify(newAgent));
      setShowAgentCreator(false);
      
      // Create welcome mission
      await createWelcomeMission(newAgent);
      
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Failed to create agent. Please try again.');
    } finally {
      setCreatingAgent(false);
    }
  };

  const createWelcomeMission = async (agent) => {
    const welcomeMission = {
      id: Date.now(),
      title: "Welcome Mission",
      description: `Get started with ${agent.name} - Complete your first automation task`,
      type: agent.specialization,
      status: "active",
      reward: 100,
      progress: 0,
      completedTasks: 0,
      totalTasks: 1,
      createdAt: new Date().toISOString(),
      priority: "high",
      autoGenerated: true
    };
    
    const newMissions = [welcomeMission];
    setMissions(newMissions);
    localStorage.setItem('agentfi_missions', JSON.stringify(newMissions));
  };

  const createMission = async (type, customData = {}) => {
    if (!agent) {
      alert('Please create an agent first');
      return;
    }

    setLoading(true);
    
    try {
      // Use AI to create detailed mission
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { 
              role: "system", 
              content: `You are a mission generator for AI automation agents. Create a detailed mission for a ${type} task.
              
              Agent Profile:
              - Name: ${agent.name}
              - Specialization: ${agent.specialization}
              - Level: ${agent.level}
              - Experience: ${agent.experience}
              
              Generate a JSON response with:
              - title: Mission name (creative and specific)
              - description: Detailed task description
              - steps: Array of 3-5 specific steps to complete
              - estimatedTime: Time to complete in minutes
              - difficulty: easy/medium/hard
              - reward: Points based on difficulty (50-300)
              - successCriteria: What defines success
              
              Make it challenging but achievable for this agent level.` 
            },
            { 
              role: "user", 
              content: `Create a ${type} mission for my agent. ${JSON.stringify(customData)}` 
            },
          ],
        }),
      });

      const data = await response.json();
      let missionData = {};
      
      try {
        const aiResponse = data.reply || '{}';
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          missionData = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        // Fallback mission data
        missionData = {
          title: `${type.replace('_', ' ')} Mission`,
          description: `Automated ${type} task generated for ${agent.name}`,
          steps: ["Initialize task", "Process data", "Generate results", "Complete mission"],
          estimatedTime: 30,
          difficulty: "medium",
          reward: 150,
          successCriteria: "Task completed successfully with 90% accuracy"
        };
      }
      
      const newMission = {
        id: Date.now(),
        ...missionData,
        type: type,
        status: "pending",
        progress: 0,
        completedTasks: 0,
        totalTasks: missionData.steps?.length || 4,
        createdAt: new Date().toISOString(),
        agentId: agent.id,
        aiGenerated: true
      };
      
      const updatedMissions = [...missions, newMission];
      setMissions(updatedMissions);
      localStorage.setItem('agentfi_missions', JSON.stringify(updatedMissions));
      
    } catch (error) {
      console.error('Error creating mission:', error);
      alert('Failed to create mission. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const executeMission = async (missionId) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission || !agent) return;

    setTaskProgress(prev => ({ ...prev, [missionId]: 0 }));
    
    try {
      // Update mission status
      const updatedMissions = missions.map(m => 
        m.id === missionId ? { ...m, status: 'active' } : m
      );
      setMissions(updatedMissions);
      
      // Simulate AI processing with real progress updates
      for (let i = 0; i <= mission.totalTasks; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const progress = (i / mission.totalTasks) * 100;
        setTaskProgress(prev => ({ ...prev, [missionId]: progress }));
        
        // Update mission progress
        const progressMissions = missions.map(m => 
          m.id === missionId ? { 
            ...m, 
            progress: progress, 
            completedTasks: i,
            status: i === mission.totalTasks ? 'completed' : 'active'
          } : m
        );
        setMissions(progressMissions);
        localStorage.setItem('agentfi_missions', JSON.stringify(progressMissions));
      }
      
      // Generate AI result
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { 
              role: "system", 
              content: `You are ${agent.name}, completing a ${mission.type} mission. Generate realistic results for this task:
              
              Mission: ${mission.title}
              Description: ${mission.description}
              
              Provide a JSON response with:
              - result: Main outcome/result of the task
              - insights: Key findings or observations
              - accuracy: Success percentage (85-100)
              - recommendations: Next steps or suggestions
              - executionTime: Actual time taken
              
              Make it feel like real AI work was performed.` 
            },
            { 
              role: "user", 
              content: `Complete the mission: ${mission.title}` 
            },
          ],
        }),
      });

      const data = await response.json();
      let result = {};
      
      try {
        const aiResponse = data.reply || '{}';
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        result = {
          result: `Successfully completed ${mission.title}`,
          insights: "Task executed with high precision",
          accuracy: 94,
          recommendations: "Continue with similar tasks to improve efficiency",
          executionTime: mission.estimatedTime || 30
        };
      }
      
      // Update agent stats
      const updatedAgent = {
        ...agent,
        experience: agent.experience + mission.reward,
        totalRewards: agent.totalRewards + mission.reward,
        tasksCompleted: agent.tasksCompleted + 1,
        accuracy: Math.round((agent.accuracy + (result.accuracy || 94)) / 2),
        lastActive: new Date().toISOString()
      };
      
      // Level up check
      if (updatedAgent.experience >= updatedAgent.nextLevelExp) {
        updatedAgent.level += 1;
        updatedAgent.nextLevelExp = updatedAgent.nextLevelExp * 1.5;
        
        // Create level up alert
        const levelUpAlert = {
          id: Date.now(),
          type: 'success',
          title: 'Level Up!',
          message: `${agent.name} reached level ${updatedAgent.level}!`,
          timestamp: new Date().toISOString()
        };
        setAlerts(prev => [levelUpAlert, ...prev]);
      }
      
      setAgent(updatedAgent);
      localStorage.setItem('agentfi_agent', JSON.stringify(updatedAgent));
      
      // Store mission result
      setMissionResults(prev => ({
        ...prev,
        [missionId]: {
          ...result,
          completedAt: new Date().toISOString(),
          reward: mission.reward
        }
      }));
      
      // Success alert
      const successAlert = {
        id: Date.now() + 1,
        type: 'success',
        title: 'Mission Completed!',
        message: `Earned ${mission.reward} points`,
        timestamp: new Date().toISOString()
      };
      setAlerts(prev => [successAlert, ...prev]);
      
    } catch (error) {
      console.error('Error executing mission:', error);
      
      // Update mission to failed
      const failedMissions = missions.map(m => 
        m.id === missionId ? { ...m, status: 'failed' } : m
      );
      setMissions(failedMissions);
      localStorage.setItem('agentfi_missions', JSON.stringify(failedMissions));
    }
  };

  const deleteMission = (missionId) => {
    setMissions(updatedMissions);
    localStorage.setItem('agentfi_missions', JSON.stringify(updatedMissions));
  };

  const resetAgent = () => {
    if (confirm('Are you sure you want to reset your agent? This will delete all progress.')) {
      setAgent(null);
      setMissions([]);
      setMissionResults({});
      setAlerts([]);
      localStorage.removeItem('agentfi_agent');
      localStorage.removeItem('agentfi_missions');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const renderAgentCreator = () => (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-4">Create Your AI Agent</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
            <input
              type="text"
              value={agentConfig.name}
              onChange={(e) => setAgentConfig({...agentConfig, name: e.target.value})}
              placeholder="Enter agent name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
            <div className="grid grid-cols-1 gap-2">
              {specializations.map((spec) => (
                <button
                  key={spec.id}
                  onClick={() => setAgentConfig({...agentConfig, specialization: spec.id})}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    agentConfig.specialization === spec.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <spec.icon className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">{spec.name}</div>
                      <div className="text-sm text-gray-600">{spec.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Settings</label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Auto-execute missions</span>
                <button
                  onClick={() => setAgentConfig({...agentConfig, autoExecute: !agentConfig.autoExecute})}
                  className={`w-10 h-6 rounded-full relative transition-colors ${
                    agentConfig.autoExecute ? 'bg-black' : 'bg-gray-400'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    agentConfig.autoExecute ? 'transform translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>        
        <div className="flex gap-2 mt-6">
          <button
            onClick={createAgent}
            disabled={creatingAgent || !agentConfig.name.trim()}
            className="flex-1 bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creatingAgent ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </span>
            ) : (
              'Create Agent'
            )}
          </button>
          <button
            onClick={() => setShowAgentCreator(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
      <div className='h-26'/>
    </div>
  );

  const renderOverview = () => {
    if (!agent) {
      return (
        <div className="space-y-4">
          <div className="text-center py-8">
            <Image src='/agent/agentlogo.png' alt='logo' width={100} height={100} className='size-14 rounded-full mx-auto'/>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to AgentFi</h3>
            <p className="text-gray-600 mb-6">Create your personal AI agent to start automating tasks</p>
            <button
              onClick={() => setShowAgentCreator(true)}
              className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Create AI Agent
            </button>
          </div>
          
          {showAgentCreator && renderAgentCreator()}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Agent Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Image src='/agent/agentlogo.png' alt='logo' width={100} height={100} className='size-14 rounded-full'/>
              <div>
                <h3 className="font-medium text-gray-900">{agent.name}</h3>
                <p className="text-sm text-gray-600">
                  {specializations.find(s => s.id === agent.specialization)?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`px-2 py-1 rounded-full text-xs ${
                agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {agent.status}
              </div>
              <button
                onClick={resetAgent}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Agent Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{agent.level}</div>
              <div className="text-xs text-gray-600">Level</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{agent.accuracy}%</div>
              <div className="text-xs text-gray-600">Accuracy</div>
            </div>
          </div>
          
          {/* Experience Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Experience</span>
              <span>{agent.experience}/{Math.floor(agent.nextLevelExp)}</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div 
                className="bg-black h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((agent.experience / agent.nextLevelExp) * 100, 100)}%` }}
              />
            </div>
          </div>
          
          {/* AI Profile */}
          {agent.aiProfile?.initialMessage && (
            <div className="bg-blue-50 border border-gray-400 rounded-lg p-3 mt-4">
              <p className="text-sm text-stone-800 italic">"{agent.aiProfile.initialMessage}"</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-stone-600" />
              <span className="text-xs text-gray-600">Missions</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">{agent.tasksCompleted}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Coins className="w-4 h-4 text-stone-600" />
              <span className="text-xs text-gray-600">Rewards</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">{agent.totalRewards}</div>
          </div>
        </div>

        {/* Recent Alerts */}
        {alerts.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-center gap-3 p-2 bg-gray-50 border border-gray-200 rounded">
                  <Image src='/assets/rewards-agent.svg' alt='logo' width={100} height={100} className='size-10'/>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{alert.title}</div>
                    <div className="text-xs text-gray-600">{alert.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMissions = () => (
    <div className="space-y-4">
      {/* Create Mission Buttons */}
      {agent && (
        <div className="grid grid-cols-2 gap-3">
          {specializations.map((spec) => (
            <button
              key={spec.id}
              onClick={() => createMission(spec.id)}
              disabled={loading}
              className="bg-white border border-gray-200 rounded-lg p-3 text-left hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <spec.icon className="w-5 h-5 text-blue-600 mb-2" />
              <div className="text-sm font-medium text-gray-900">{spec.name}</div>
              <div className="text-xs text-gray-600">{spec.desc}</div>
            </button>
          ))}
        </div>
      )}
  
      {/* Mission List */}
      <div className="space-y-3">
        {missions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p>No missions yet. Create your first mission above!</p>
          </div>
        ) : (
          missions.map((mission) => (
            <div key={mission.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{mission.title}</h4>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(mission.status)}`}>
                    {getStatusIcon(mission.status)}
                    {mission.status}
                  </div>
                  <button
                    onClick={() => deleteMission(mission.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
  
              <p className="text-sm text-gray-600 mb-3">{mission.description}</p>
  
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Progress: {mission.completedTasks}/{mission.totalTasks}</span>
                  <span className="flex items-center gap-1">
                    <Coins className="w-3 h-3" />
                    {mission.reward} points
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-black h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${taskProgress[mission.id] || mission.progress || 0}%` }}
                  />
                </div>
              </div>
  
              <div className="flex gap-2">
                {mission.status === 'pending' && (
                  <button
                    onClick={() => executeMission(mission.id)}
                    className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    <Play className="w-3 h-3 inline mr-1" />
                    Execute
                  </button>
                )}

                {mission.status === 'completed' && missionResults[mission.id] && (
                  <button
                    onClick={() => setPopupData(missionResults[mission.id])}
                    className="flex-1 bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    <Eye className="w-3 h-3 inline mr-1" />
                    View Results
                  </button>
                )}
              </div>

              {/* Mission Steps */}
              {popupData && (
                <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-96">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Mission Results</h3>
                    <pre className="text-sm text-gray-700 bg-gray-100 p-3 rounded-lg overflow-auto">
                      {JSON.stringify(popupData, null, 2)}
                    </pre>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => setPopupData(null)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {mission.steps && mission.status === 'active' && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <h5 className="text-sm font-medium text-blue-900 mb-2">Current Steps:</h5>
                  <div className="space-y-1">
                    {mission.steps.map((step, index) => (
                      <div key={index} className="flex items-center gap-2 text-[10px]">
                        <div className={`w-4 h-4 shrink-0 rounded-full flex items-center justify-center text-xs ${
                          index < mission.completedTasks 
                            ? 'bg-green-500 text-white' 
                            : index === mission.completedTasks 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-200 text-gray-600'
                        }`}>
                          {index < mission.completedTasks ? '✓' : index + 1}
                        </div>
                        <span className={`${
                          index < mission.completedTasks 
                            ? 'text-green-700 line-through' 
                            : index === mission.completedTasks 
                              ? 'text-blue-700 font-medium' 
                              : 'text-gray-600'
                        }`}>
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <div className='h-26'/>
    </div>
  );
  

  return (
  <div className="space-y-6">
    {/* Tabs */}
    <div className="flex gap-4 border-b border-gray-200">
    {['overview', 'missions'].map((tab) => (
      <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-medium ${
        activeTab === tab ? 'border-b-2 border-black text-black font-semibold' : 'text-gray-600'
      }`}
      >
      {tab.charAt(0).toUpperCase() + tab.slice(1)}
      </button>
    ))}
    </div>

    {/* Tab Content */}
    {activeTab === 'overview' && renderOverview()}
    {activeTab === 'missions' && renderMissions()}
  </div>
  );
}