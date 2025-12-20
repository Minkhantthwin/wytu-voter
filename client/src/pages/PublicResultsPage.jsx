import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resultsAPI, settingsAPI } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Crown,
  Users,
  Trophy,
  Home,
  TrendingUp,
  RefreshCw,
  Clock,
  Lock,
} from 'lucide-react';

export default function PublicResultsPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState({ kings: [], queens: [] });
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [announced, setAnnounced] = useState(false);
  const [checkingAnnouncement, setCheckingAnnouncement] = useState(true);

  useEffect(() => {
    checkAnnouncement();
    // Check announcement status every 10 seconds
    const announcementInterval = setInterval(checkAnnouncement, 10000);
    return () => clearInterval(announcementInterval);
  }, []);

  useEffect(() => {
    if (announced) {
      fetchResults();
      // Auto refresh results every 30 seconds when announced
      const interval = setInterval(() => fetchResults(false), 30000);
      return () => clearInterval(interval);
    }
  }, [announced]);

  const checkAnnouncement = async () => {
    try {
      const response = await settingsAPI.getResultsAnnounced();
      setAnnounced(response.data.announced);
    } catch (err) {
      console.error('Failed to check announcement status:', err);
    } finally {
      setCheckingAnnouncement(false);
    }
  };

  const fetchResults = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [resultsResponse, summaryResponse] = await Promise.all([
        resultsAPI.getAll(),
        resultsAPI.getSummary(),
      ]);

      setResults(resultsResponse.data);
      setSummary(summaryResponse.data);
    } catch (err) {
      console.error('Failed to fetch results:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchResults(true);
  };

  const handleBackToVote = () => {
    navigate('/');
  };

  // Show loading while checking announcement
  if (checkingAnnouncement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show "not announced" message if results haven't been announced
  if (!announced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-muted rounded-full">
                <Lock className="h-16 w-16 text-muted-foreground" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Results Not Yet Announced</h2>
            <p className="text-muted-foreground mb-2">
              The voting results will be revealed once the admin announces them.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
              <Clock className="h-4 w-4" />
              <span>Please check back later</span>
            </div>
            <Button onClick={handleBackToVote} variant="outline" className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Back to Voting
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-muted">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm shadow-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-primary rounded-lg">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-foreground">Live Results</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">King & Queen Voting</p>
              </div>
            </div>
            <div className="flex gap-1.5 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-2 sm:px-3 text-xs sm:text-sm"
              >
                <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleBackToVote} className="px-2 sm:px-3 text-xs sm:text-sm">
                <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Summary Stats */}
        {loading ? (
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-4 sm:pt-6 pb-4">
                  <Skeleton className="h-8 sm:h-12 w-full mb-1 sm:mb-2" />
                  <Skeleton className="h-3 sm:h-4 w-16 sm:w-24 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-8">
            <Card>
              <CardContent className="pt-4 sm:pt-6 pb-4 text-center">
                <div className="text-xl sm:text-3xl font-bold text-primary mb-0.5 sm:mb-1">
                  {summary?.totalVotes || 0}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Total Votes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 sm:pt-6 pb-4 text-center">
                <div className="text-xl sm:text-3xl font-bold text-primary mb-0.5 sm:mb-1">
                  {results.kings.length}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Kings</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 sm:pt-6 pb-4 text-center">
                <div className="text-xl sm:text-3xl font-bold text-primary mb-0.5 sm:mb-1">
                  {results.queens.length}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Queens</div>
              </CardContent>
            </Card>
          </div>
        )}

        {loading ? (
          <div className="space-y-6 sm:space-y-8">
            <ResultsSectionSkeleton />
            <ResultsSectionSkeleton />
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* King Results */}
            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <h2 className="text-lg sm:text-2xl font-bold">King Candidates</h2>
              </div>
              <div className="space-y-2 sm:space-y-4">
                {results.kings.map((candidate, index) => (
                  <ResultCard
                    key={candidate.id}
                    candidate={candidate}
                    rank={index + 1}
                    totalVotes={summary?.totalVotes || 0}
                    isWinner={index === 0}
                  />
                ))}
              </div>
            </div>

            {/* Queen Results */}
            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-accent-foreground" />
                <h2 className="text-lg sm:text-2xl font-bold">Queen Candidates</h2>
              </div>
              <div className="space-y-2 sm:space-y-4">
                {results.queens.map((candidate, index) => (
                  <ResultCard
                    key={candidate.id}
                    candidate={candidate}
                    rank={index + 1}
                    totalVotes={summary?.totalVotes || 0}
                    isWinner={index === 0}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Auto-refresh notice */}
        {!loading && (
          <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-muted-foreground">
            Results auto-refresh every 30 seconds
          </div>
        )}
      </main>
    </div>
  );
}

function ResultCard({ candidate, rank, totalVotes, isWinner }) {
  const photoUrl = candidate.photoUrl ? getImageUrl(candidate.photoUrl) : null;

  const percentage = totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(1) : 0;

  return (
    <Card className={`overflow-hidden ${isWinner ? 'ring-2 ring-primary shadow-lg' : ''}`}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Rank Badge */}
          <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center">
            {isWinner ? (
              <div className="p-1 sm:p-2 bg-primary/20 rounded-full">
                <Trophy className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
              </div>
            ) : (
              <div className="text-lg sm:text-2xl font-bold text-muted-foreground">
                #{rank}
              </div>
            )}
          </div>

          {/* Photo */}
          <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-muted">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={candidate.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
              <h3 className="font-semibold text-sm sm:text-lg truncate">{candidate.name}</h3>
              {isWinner && (
                <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium bg-primary/20 text-primary rounded-full flex-shrink-0">
                  Leading
                </span>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-1.5 sm:h-2 mb-1 sm:mb-2">
              <div
                className="bg-primary h-1.5 sm:h-2 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="font-medium">{candidate.voteCount} votes</span>
                <span className="text-muted-foreground hidden sm:inline">{percentage}%</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span className="text-xs">{percentage}%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultsSectionSkeleton() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Skeleton className="h-5 w-5 sm:h-6 sm:w-6" />
        <Skeleton className="h-6 sm:h-8 w-32 sm:w-48" />
      </div>
      <div className="space-y-2 sm:space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-4">
                <Skeleton className="w-8 h-8 sm:w-12 sm:h-12 rounded-full" />
                <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg" />
                <div className="flex-1 space-y-1 sm:space-y-2">
                  <Skeleton className="h-4 sm:h-6 w-24 sm:w-32" />
                  <Skeleton className="h-1.5 sm:h-2 w-full" />
                  <Skeleton className="h-3 sm:h-4 w-16 sm:w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
