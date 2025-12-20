import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { settingsAPI } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Crown,
  Vote,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Menu,
  X
} from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({ resultsAnnounced: false, votingOpen: true });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [togglingResults, setTogglingResults] = useState(false);
  const [togglingVoting, setTogglingVoting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.getAll();
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const toggleResultsAnnouncement = async () => {
    setTogglingResults(true);
    try {
      const newValue = !settings.resultsAnnounced;
      await settingsAPI.setResultsAnnounced(newValue);
      setSettings(prev => ({ ...prev, resultsAnnounced: newValue }));
    } catch (error) {
      console.error('Failed to toggle results announcement:', error);
    } finally {
      setTogglingResults(false);
    }
  };

  const toggleVoting = async () => {
    setTogglingVoting(true);
    try {
      const newValue = !settings.votingOpen;
      await settingsAPI.setVotingOpen(newValue);
      setSettings(prev => ({ ...prev, votingOpen: newValue }));
    } catch (error) {
      console.error('Failed to toggle voting:', error);
    } finally {
      setTogglingVoting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    {
      title: 'Manage Candidates',
      description: 'Add, edit, or remove candidates',
      icon: Users,
      onClick: () => navigate('/admin/candidates'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'View Results',
      description: 'See detailed voting results',
      icon: BarChart3,
      onClick: () => navigate('/admin/results'),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Quick Stats',
      description: 'Overview of voting statistics',
      icon: Crown,
      onClick: () => navigate('/admin/stats'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo/Title */}
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                <span className="hidden sm:inline">Admin Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{user?.name || user?.email}</span>
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="sm:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden py-3 border-t">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-gray-600 px-2">
                  Welcome, <span className="font-medium">{user?.name || user?.email}</span>
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout} className="justify-start">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Control Panel */}
        <Card className="mb-4 sm:mb-8">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Settings className="h-5 w-5" />
              Control Panel
            </CardTitle>
            <CardDescription className="text-sm">
              Manage voting status and results visibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Voting Toggle */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
                <div className="flex items-center gap-3">
                  {settings.votingOpen ? (
                    <Unlock className="h-5 w-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <Lock className="h-5 w-5 text-red-600 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-medium text-sm sm:text-base">Voting Status</p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {settings.votingOpen ? 'Voting is open' : 'Voting is closed'}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={settings.votingOpen ? 'destructive' : 'default'}
                  onClick={toggleVoting}
                  disabled={loadingSettings || togglingVoting}
                  className="w-full sm:w-auto"
                >
                  {togglingVoting ? 'Processing...' : settings.votingOpen ? 'Close Voting' : 'Open Voting'}
                </Button>
              </div>

              {/* Results Toggle */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
                <div className="flex items-center gap-3">
                  {settings.resultsAnnounced ? (
                    <Eye className="h-5 w-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-gray-600 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-medium text-sm sm:text-base">Results Visibility</p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {settings.resultsAnnounced ? 'Results are public' : 'Results are hidden'}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={settings.resultsAnnounced ? 'outline' : 'default'}
                  onClick={toggleResultsAnnouncement}
                  disabled={loadingSettings || togglingResults}
                  className="w-full sm:w-auto"
                >
                  {togglingResults ? 'Processing...' : settings.resultsAnnounced ? 'Hide Results' : 'Announce Results'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {menuItems.map((item) => (
            <Card
              key={item.title}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
              onClick={item.onClick}
            >
              <CardHeader className="pb-2 sm:pb-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${item.bgColor} flex items-center justify-center mb-2 sm:mb-3`}>
                  <item.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${item.color}`} />
                </div>
                <CardTitle className="text-base sm:text-lg">{item.title}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Quick Status */}
        <Card className="mt-4 sm:mt-8">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Vote className="h-5 w-5" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full mb-2 ${
                  settings.votingOpen ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {settings.votingOpen ? (
                    <Unlock className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  ) : (
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-600">Voting</p>
                <p className={`font-semibold text-sm sm:text-base ${settings.votingOpen ? 'text-green-600' : 'text-red-600'}`}>
                  {settings.votingOpen ? 'Open' : 'Closed'}
                </p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full mb-2 ${
                  settings.resultsAnnounced ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {settings.resultsAnnounced ? (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-600">Results</p>
                <p className={`font-semibold text-sm sm:text-base ${settings.resultsAnnounced ? 'text-green-600' : 'text-gray-600'}`}>
                  {settings.resultsAnnounced ? 'Public' : 'Hidden'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
