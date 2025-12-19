import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { settingsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Users, BarChart3, LogOut, Megaphone, Vote, Power, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({ resultsAnnounced: false, votingOpen: true });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [togglingResults, setTogglingResults] = useState(false);
  const [togglingVoting, setTogglingVoting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.getAll();
      setSettings(response.data);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoadingSettings(false);
    }
  };

  const toggleResultsAnnouncement = async () => {
    try {
      setTogglingResults(true);
      const newValue = !settings.resultsAnnounced;
      await settingsAPI.setResultsAnnounced(newValue);
      setSettings(prev => ({ ...prev, resultsAnnounced: newValue }));
    } catch (err) {
      console.error('Failed to toggle results announcement:', err);
    } finally {
      setTogglingResults(false);
    }
  };

  const toggleVoting = async () => {
    try {
      setTogglingVoting(true);
      const newValue = !settings.votingOpen;
      await settingsAPI.setVotingOpen(newValue);
      setSettings(prev => ({ ...prev, votingOpen: newValue }));
    } catch (err) {
      console.error('Failed to toggle voting:', err);
    } finally {
      setTogglingVoting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Crown className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">WYTU Voting Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome, {user?.name || user?.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Control Panel */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Control Panel</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Voting Control */}
            <Card className={`border-2 ${settings.votingOpen ? 'border-green-500/50' : 'border-destructive/50'}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${settings.votingOpen ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
                      <Vote className={`h-6 w-6 ${settings.votingOpen ? 'text-green-500' : 'text-destructive'}`} />
                    </div>
                    <div>
                      <p className="font-medium">Voting Status</p>
                      <p className={`text-sm ${settings.votingOpen ? 'text-green-500' : 'text-destructive'}`}>
                        {settings.votingOpen ? 'Open' : 'Closed'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={settings.votingOpen ? 'destructive' : 'default'}
                    size="sm"
                    onClick={toggleVoting}
                    disabled={togglingVoting || loadingSettings}
                  >
                    {togglingVoting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <>
                        <Power className="h-4 w-4 mr-2" />
                        {settings.votingOpen ? 'Close Voting' : 'Open Voting'}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results Announcement Control */}
            <Card className={`border-2 ${settings.resultsAnnounced ? 'border-primary/50' : 'border-muted'}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${settings.resultsAnnounced ? 'bg-primary/10' : 'bg-muted'}`}>
                      <Megaphone className={`h-6 w-6 ${settings.resultsAnnounced ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className="font-medium">Results Announcement</p>
                      <p className={`text-sm ${settings.resultsAnnounced ? 'text-primary' : 'text-muted-foreground'}`}>
                        {settings.resultsAnnounced ? 'Public' : 'Hidden'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={settings.resultsAnnounced ? 'outline' : 'default'}
                    size="sm"
                    onClick={toggleResultsAnnouncement}
                    disabled={togglingResults || loadingSettings}
                  >
                    {togglingResults ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <>
                        {settings.resultsAnnounced ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Hide Results
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Announce Results
                          </>
                        )}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation Cards */}
        <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Candidates Card */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/candidates')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Manage Candidates
              </CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">Candidates</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add, edit, or remove candidates
              </p>
            </CardContent>
          </Card>

          {/* Results Card */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/results')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                View Results
              </CardTitle>
              <BarChart3 className="h-5 w-5 text-accent-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">Results</p>
              <p className="text-sm text-muted-foreground mt-1">
                View live voting results
              </p>
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/stats')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Quick Stats
              </CardTitle>
              <Crown className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">King & Queen</p>
              <p className="text-sm text-muted-foreground mt-1">
                Fresher Welcome 2025
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
