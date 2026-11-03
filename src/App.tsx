import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { AlphaDisclaimer } from './components/AlphaDisclaimer';
import { SessionList } from './components/SessionList';
import { SessionDetail } from './components/SessionDetail';
import { NewTaskForm } from './components/NewTaskForm';
import { TaskTemplates } from './components/TaskTemplates';
import { SourcesList } from './components/SourcesList';
import { Session, Activity, Source, TaskTemplate } from './utils/julesTypes';
import { Footer } from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState<'sessions' | 'new-task' | 'templates' | 'sources' | 'detail'>('sessions');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Status & Mode state
  const [statusInfo, setStatusInfo] = useState<{ configured: boolean; mode: 'live' | 'demo'; apiKeyPresent: boolean }>({
    configured: false,
    mode: 'demo',
    apiKeyPresent: false
  });
  const [demoMode, setDemoMode] = useState<boolean>(false);

  // Data states
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(false);
  const [sourcesError, setSourcesError] = useState<{ status?: number; message?: string } | null>(null);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [sessionsError, setSessionsError] = useState<{ status?: number; message?: string } | null>(null);

  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [activitiesError, setActivitiesError] = useState<{ status?: number; message?: string } | null>(null);

  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [prefilledTemplate, setPrefilledTemplate] = useState<TaskTemplate | null>(null);

  // Custom fetch wrapper passing x-hollow-mode header if demoMode is enabled
  const apiFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };
    if (demoMode) {
      headers['x-hollow-mode'] = 'demo';
    }

    const res = await fetch(url, { ...options, headers });
    const text = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = { rawText: text };
    }

    if (!res.ok) {
      throw {
        status: res.status,
        message: data.error?.message || data.message || `HTTP ${res.status}`
      };
    }
    return data;
  }, [demoMode]);

  // Fetch API Status
  const fetchStatus = useCallback(async () => {
    try {
      const data = await apiFetch('/api/jules/status');
      setStatusInfo(data);
    } catch (err) {
      console.warn('Failed to fetch status:', err);
    }
  }, [apiFetch]);

  // Fetch Connected Repos (GET /sources)
  const fetchSources = useCallback(async () => {
    setIsLoadingSources(true);
    setSourcesError(null);
    try {
      const data = await apiFetch('/api/jules/sources');
      setSources(Array.isArray(data?.sources) ? data.sources : []);
    } catch (err: any) {
      setSourcesError(err);
    } finally {
      setIsLoadingSources(false);
    }
  }, [apiFetch]);

  // Fetch Sessions (GET /sessions)
  const fetchSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    setSessionsError(null);
    try {
      const data = await apiFetch('/api/jules/sessions');
      setSessions(Array.isArray(data?.sessions) ? data.sessions : []);
    } catch (err: any) {
      setSessionsError(err);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [apiFetch]);

  // Fetch Single Session & Activities Stream
  const fetchSessionDetails = useCallback(async (sessionId: string) => {
    setIsLoadingActivities(true);
    setActivitiesError(null);
    try {
      const [sessData, actData] = await Promise.all([
        apiFetch(`/api/jules/sessions/${sessionId}`),
        apiFetch(`/api/jules/sessions/${sessionId}/activities`)
      ]);
      setActiveSession(sessData);
      setActivities(Array.isArray(actData?.activities) ? actData.activities : []);
    } catch (err: any) {
      setActivitiesError(err);
    } finally {
      setIsLoadingActivities(false);
    }
  }, [apiFetch]);

  // Initial loads
  useEffect(() => {
    fetchStatus();
    fetchSources();
    fetchSessions();
  }, [fetchStatus, fetchSources, fetchSessions]);

  // Refresh active detail if selected
  useEffect(() => {
    if (selectedSessionId && activeTab === 'detail') {
      fetchSessionDetails(selectedSessionId);
    }
  }, [selectedSessionId, activeTab, fetchSessionDetails]);

  // Handlers
  const handleSelectSession = (id: string) => {
    setSelectedSessionId(id);
    setActiveTab('detail');
  };

  const handleSelectTemplate = (template: TaskTemplate) => {
    setPrefilledTemplate(template);
    setActiveTab('new-task');
  };

  const handleSelectRepoForNewTask = (repoSource: string) => {
    setPrefilledTemplate({
      id: 'custom',
      title: 'Custom Repo Task',
      description: '',
      prompt: '',
      suggestedRepo: repoSource,
      automationMode: 'AUTO_CREATE_PR',
      requirePlanApproval: true,
      category: 'refactor'
    });
    setActiveTab('new-task');
  };

  const handleCreateSession = async (taskData: {
    prompt: string;
    source: string;
    startingBranch: string;
    title: string;
    automationMode: 'AUTO_CREATE_PR' | 'AUTOMATION_MODE_UNSPECIFIED';
    requirePlanApproval: boolean;
  }) => {
    const created = await apiFetch('/api/jules/sessions', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });

    await fetchSessions();
    if (created && created.id) {
      setSelectedSessionId(created.id);
      setActiveTab('detail');
    } else {
      setActiveTab('sessions');
    }
  };

  const handleApprovePlan = async (sessionId: string) => {
    await apiFetch(`/api/jules/sessions/${sessionId}/approve-plan`, {
      method: 'POST'
    });
    await fetchSessionDetails(sessionId);
    await fetchSessions();
  };

  const handleSendMessage = async (sessionId: string, message: string) => {
    await apiFetch(`/api/jules/sessions/${sessionId}/send-message`, {
      method: 'POST',
      body: JSON.stringify({ prompt: message })
    });
    await fetchSessionDetails(sessionId);
  };

  const handleRefreshAll = () => {
    fetchStatus();
    fetchSources();
    fetchSessions();
    if (selectedSessionId && activeTab === 'detail') {
      fetchSessionDetails(selectedSessionId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0c] text-zinc-100 font-sans selection:bg-zinc-700/50 selection:text-zinc-100">
      {/* Alpha Disclaimer Notification */}
      <AlphaDisclaimer />

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedSessionId(null);
        }}
        statusInfo={statusInfo}
        onRefresh={handleRefreshAll}
        isRefreshing={isLoadingSessions || isLoadingSources}
        demoMode={demoMode}
        setDemoMode={setDemoMode}
      />

      {/* Main Content Body */}
      <main className="flex-1 px-4 lg:px-6 py-6 max-w-6xl mx-auto w-full">
        {activeTab === 'sessions' && (
          <SessionList
            sessions={sessions}
            isLoading={isLoadingSessions}
            error={sessionsError}
            onSelectSession={handleSelectSession}
            onNewTask={() => setActiveTab('new-task')}
            onRefresh={fetchSessions}
            autoRefreshEnabled={autoRefreshEnabled}
            setAutoRefreshEnabled={setAutoRefreshEnabled}
          />
        )}

        {activeTab === 'detail' && (
          <SessionDetail
            session={activeSession}
            activities={activities}
            isLoading={isLoadingActivities}
            error={activitiesError}
            onBack={() => {
              setActiveTab('sessions');
              setSelectedSessionId(null);
            }}
            onRefresh={() => selectedSessionId && fetchSessionDetails(selectedSessionId)}
            onApprovePlan={handleApprovePlan}
            onSendMessage={handleSendMessage}
          />
        )}

        {activeTab === 'new-task' && (
          <NewTaskForm
            sources={sources}
            isLoadingSources={isLoadingSources}
            onRefreshSources={fetchSources}
            onSubmitTask={handleCreateSession}
            prefilledTemplate={prefilledTemplate}
            onClearTemplatePrefill={() => setPrefilledTemplate(null)}
          />
        )}

        {activeTab === 'templates' && (
          <TaskTemplates
            onSelectTemplate={handleSelectTemplate}
          />
        )}

        {activeTab === 'sources' && (
          <SourcesList
            sources={sources}
            isLoading={isLoadingSources}
            error={sourcesError}
            onRefresh={fetchSources}
            onSelectRepoForNewTask={handleSelectRepoForNewTask}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
