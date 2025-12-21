import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resultsAPI } from '../../lib/api';
import { getImageUrl } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { 
  ArrowLeft, 
  RefreshCw, 
  Trophy,
  Crown,
  Users,
  User
} from 'lucide-react';

export default function ResultsPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState({ kings: [], queens: [] });
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchResults = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const [resultsRes, summaryRes] = await Promise.all([
        resultsAPI.getAll(),
        resultsAPI.getSummary(),
      ]);
      
      // API already returns { kings: [], queens: [], totalVotes, timestamp }
      const { kings, queens } = resultsRes.data;
      
      setResults({ kings: kings || [], queens: queens || [] });
      setSummary(summaryRes.data);
    } catch (err) {
      console.error('Failed to fetch results:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => fetchResults(true);

  const getTotalVotes = (candidates) => 
    candidates.reduce((sum, c) => sum + c.voteCount, 0);

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
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="hidden sm:inline">Voting Results</span>
                <span className="sm:hidden">Results</span>
              </h1>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={refreshing}
              className="gap-1 sm:gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-8">
          <Card>
            <CardContent className="p-3 sm:p-6 text-center">
              <Users className="h-5 w-5 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-primary" />
              <p className="text-lg sm:text-3xl font-bold">{summary?.totalVotes || 0}</p>
              <p className="text-xs sm:text-sm text-gray-500">Total Votes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-6 text-center">
              <Crown className="h-5 w-5 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-blue-600" />
              <p className="text-lg sm:text-3xl font-bold">{results.kings.length}</p>
              <p className="text-xs sm:text-sm text-gray-500">Kings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-6 text-center">
              <Crown className="h-5 w-5 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-pink-600" />
              <p className="text-lg sm:text-3xl font-bold">{results.queens.length}</p>
              <p className="text-xs sm:text-sm text-gray-500">Queens</p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="space-y-6 sm:space-y-8">
            <ResultsSectionSkeleton />
            <ResultsSectionSkeleton />
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Kings Results */}
            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <Crown className="h-5 w-5 text-blue-600" />
                King Results
              </h2>
              <div className="space-y-2 sm:space-y-3">
                {results.kings.map((candidate, index) => (
                  <ResultCard
                    key={candidate.id}
                    candidate={candidate}
                    rank={index + 1}
                    totalVotes={getTotalVotes(results.kings)}
                    isWinner={index === 0}
                  />
                ))}
              </div>
            </section>

            {/* Queens Results */}
            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <Crown className="h-5 w-5 text-pink-600" />
                Queen Results
              </h2>
              <div className="space-y-2 sm:space-y-3">
                {results.queens.map((candidate, index) => (
                  <ResultCard
                    key={candidate.id}
                    candidate={candidate}
                    rank={index + 1}
                    totalVotes={getTotalVotes(results.queens)}
                    isWinner={index === 0}
                  />
                ))}
              </div>
            </section>
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
    <Card className={`${isWinner ? 'border-2 border-primary bg-primary/5' : ''}`}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Rank */}
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isWinner ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-600'
          }`}>
            {isWinner ? <Trophy className="h-4 w-4 sm:h-5 sm:w-5" /> : <span className="font-bold text-sm sm:text-base">{rank}</span>}
          </div>

          {/* Photo */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            {photoUrl ? (
              <img src={photoUrl} alt={candidate.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-gray-300" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
              <h3 className="font-semibold text-sm sm:text-base truncate">{candidate.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-lg font-bold">{candidate.voteCount}</span>
                <span className="text-xs sm:text-sm text-gray-500">({percentage}%)</span>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mt-1 sm:mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultsSectionSkeleton() {
  return (
    <section>
      <Skeleton className="h-6 sm:h-7 w-32 mb-3 sm:mb-4" />
      <div className="space-y-2 sm:space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" />
                <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 sm:h-5 w-24 mb-2" />
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
