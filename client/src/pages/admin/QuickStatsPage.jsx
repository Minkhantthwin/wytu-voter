import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resultsAPI } from '../../lib/api';
import { getImageUrl } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { 
  ArrowLeft, 
  Users,
  Crown,
  Award,
  TrendingUp,
  User,
  BarChart3
} from 'lucide-react';

export default function QuickStatsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [resultsRes, summaryRes] = await Promise.all([
        resultsAPI.getAll(),
        resultsAPI.getSummary(),
      ]);

      // API returns { kings: [], queens: [], totalVotes, timestamp }
      const { kings, queens } = resultsRes.data;

      setStats({
        totalVotes: summaryRes.data.totalVotes,
        totalCandidates: (kings?.length || 0) + (queens?.length || 0),
        kingsCount: kings?.length || 0,
        queensCount: queens?.length || 0,
        leadingKing: kings?.[0] || null,
        leadingQueen: queens?.[0] || null,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 sm:px-3"
              >
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="hidden sm:inline">Quick Statistics</span>
                <span className="sm:hidden">Stats</span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {loading ? (
          <QuickStatsSkeleton />
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
              <Card>
                <CardContent className="p-3 sm:p-6 text-center">
                  <Users className="h-6 w-6 sm:h-10 sm:w-10 mx-auto mb-1 sm:mb-2 text-primary" />
                  <p className="text-xl sm:text-4xl font-bold">{stats?.totalVotes || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Total Votes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-6 text-center">
                  <Award className="h-6 w-6 sm:h-10 sm:w-10 mx-auto mb-1 sm:mb-2 text-green-600" />
                  <p className="text-xl sm:text-4xl font-bold">{stats?.totalCandidates || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Candidates</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-6 text-center">
                  <Crown className="h-6 w-6 sm:h-10 sm:w-10 mx-auto mb-1 sm:mb-2 text-blue-600" />
                  <p className="text-xl sm:text-4xl font-bold">{stats?.kingsCount || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Kings</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-6 text-center">
                  <Crown className="h-6 w-6 sm:h-10 sm:w-10 mx-auto mb-1 sm:mb-2 text-pink-600" />
                  <p className="text-xl sm:text-4xl font-bold">{stats?.queensCount || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Queens</p>
                </CardContent>
              </Card>
            </div>

            {/* Current Leaders */}
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Current Leaders
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-8">
              {/* Leading King */}
              <Card>
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Crown className="h-5 w-5 text-blue-600" />
                    Leading King
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.leadingKing ? (
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        {getImageUrl(stats.leadingKing.photoUrl) ? (
                          <img src={getImageUrl(stats.leadingKing.photoUrl)} alt={stats.leadingKing.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-6 w-6 sm:h-8 sm:w-8 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm sm:text-base truncate">{stats.leadingKing.name}</p>
                        <p className="text-lg sm:text-2xl font-bold text-primary">{stats.leadingKing.voteCount} votes</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4 text-sm">No votes yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Leading Queen */}
              <Card>
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Crown className="h-5 w-5 text-pink-600" />
                    Leading Queen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.leadingQueen ? (
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        {getImageUrl(stats.leadingQueen.photoUrl) ? (
                          <img src={getImageUrl(stats.leadingQueen.photoUrl)} alt={stats.leadingQueen.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-6 w-6 sm:h-8 sm:w-8 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm sm:text-base truncate">{stats.leadingQueen.name}</p>
                        <p className="text-lg sm:text-2xl font-bold text-primary">{stats.leadingQueen.voteCount} votes</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4 text-sm">No votes yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-3 sm:py-4 justify-start"
                onClick={() => navigate('/admin/candidates')}
              >
                <Users className="h-5 w-5 mr-3 text-blue-600" />
                <div className="text-left">
                  <p className="font-semibold text-sm sm:text-base">Manage Candidates</p>
                  <p className="text-xs sm:text-sm text-gray-500">Add, edit, or remove</p>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-3 sm:py-4 justify-start"
                onClick={() => navigate('/admin/results')}
              >
                <BarChart3 className="h-5 w-5 mr-3 text-green-600" />
                <div className="text-left">
                  <p className="font-semibold text-sm sm:text-base">View Detailed Results</p>
                  <p className="text-xs sm:text-sm text-gray-500">Full breakdown</p>
                </div>
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function QuickStatsSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-3 sm:p-6 text-center">
              <Skeleton className="h-6 w-6 sm:h-10 sm:w-10 mx-auto mb-2 rounded" />
              <Skeleton className="h-6 sm:h-10 w-12 sm:w-16 mx-auto mb-1" />
              <Skeleton className="h-3 sm:h-4 w-16 sm:w-20 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-6 sm:h-7 w-32 mb-3 sm:mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2 sm:pb-4">
              <Skeleton className="h-5 sm:h-6 w-28" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 sm:gap-4">
                <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-full" />
                <div>
                  <Skeleton className="h-4 sm:h-5 w-24 mb-2" />
                  <Skeleton className="h-6 sm:h-8 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
