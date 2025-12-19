import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { resultsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Crown,
  ArrowLeft,
  Trophy,
  Users,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';

export default function ResultsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState({ kings: [], queens: [], totalVotes: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchResults();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchResults, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchResults = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);
      setError('');
      
      const response = await resultsAPI.getAll();
      setResults(response.data);
    } catch (err) {
      setError('Failed to fetch results');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchResults(true);
  };

  const getPercentage = (voteCount) => {
    if (results.totalVotes === 0) return 0;
    return ((voteCount / results.totalVotes) * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/admin/dashboard')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="p-2 bg-primary rounded-lg">
                <Trophy className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Voting Results</h1>
                <p className="text-sm text-muted-foreground">Live results & statistics</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Summary */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Votes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{results.totalVotes}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                King Candidates
              </CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{results.kings.length}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Queen Candidates
              </CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{results.queens.length}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="space-y-8">
            <ResultsSectionSkeleton title="King Results" />
            <ResultsSectionSkeleton title="Queen Results" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Kings Results */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Crown className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">King Results</h2>
              </div>
              <div className="space-y-3">
                {results.kings.map((candidate, index) => (
                  <ResultCard
                    key={candidate.id}
                    candidate={candidate}
                    rank={index + 1}
                    percentage={getPercentage(candidate.voteCount)}
                    isWinner={index === 0 && candidate.voteCount > 0}
                  />
                ))}
                {results.kings.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    No king candidates yet
                  </p>
                )}
              </div>
            </div>

            {/* Queens Results */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Crown className="h-5 w-5 text-accent-foreground" />
                <h2 className="text-2xl font-bold">Queen Results</h2>
              </div>
              <div className="space-y-3">
                {results.queens.map((candidate, index) => (
                  <ResultCard
                    key={candidate.id}
                    candidate={candidate}
                    rank={index + 1}
                    percentage={getPercentage(candidate.voteCount)}
                    isWinner={index === 0 && candidate.voteCount > 0}
                  />
                ))}
                {results.queens.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    No queen candidates yet
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ResultCard({ candidate, rank, percentage, isWinner }) {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const photoUrl = candidate.photoUrl
    ? `${API_BASE_URL}${candidate.photoUrl}`
    : null;

  return (
    <Card className={`overflow-hidden ${isWinner ? 'border-primary border-2' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Rank */}
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
            {isWinner ? (
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary-foreground" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-muted-foreground">
                  {rank}
                </span>
              </div>
            )}
          </div>

          {/* Photo */}
          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={candidate.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg truncate">
                {candidate.name}
              </h3>
              {isWinner && (
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
                  Leading
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="capitalize">{candidate.category}</span>
              <span>•</span>
              <span>{candidate.voteCount} votes</span>
            </div>
          </div>

          {/* Percentage & Progress */}
          <div className="flex-shrink-0 text-right">
            <div className="text-2xl font-bold text-primary mb-1">
              {percentage}%
            </div>
            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
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

function ResultsSectionSkeleton({ title }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <Skeleton className="w-16 h-16 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-2 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
