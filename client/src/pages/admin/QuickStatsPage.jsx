import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { resultsAPI, candidatesAPI, voteAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Crown,
  ArrowLeft,
  Users,
  TrendingUp,
  Activity,
  Award,
  BarChart3,
} from 'lucide-react';

export default function QuickStatsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalVotes: 0,
    totalCandidates: 0,
    kingsCount: 0,
    queensCount: 0,
    leadingKing: null,
    leadingQueen: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [resultsResponse, candidatesResponse] = await Promise.all([
        resultsAPI.getAll(),
        candidatesAPI.getAll(),
      ]);

      const results = resultsResponse.data;
      const candidates = candidatesResponse.data;

      setStats({
        totalVotes: results.totalVotes,
        totalCandidates: results.kings.length + results.queens.length,
        kingsCount: results.kings.length,
        queensCount: results.queens.length,
        leadingKing: results.kings[0] || null,
        leadingQueen: results.queens[0] || null,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
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
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Quick Statistics</h1>
                <p className="text-sm text-muted-foreground">Overview & insights</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            icon={<Users className="h-5 w-5" />}
            title="Total Votes"
            value={loading ? <Skeleton className="h-10 w-20" /> : stats.totalVotes}
            description="Votes cast"
            color="primary"
          />
          <StatCard
            icon={<Award className="h-5 w-5" />}
            title="Total Candidates"
            value={loading ? <Skeleton className="h-10 w-20" /> : stats.totalCandidates}
            description="Running for King & Queen"
            color="accent"
          />
          <StatCard
            icon={<Crown className="h-5 w-5" />}
            title="King Candidates"
            value={loading ? <Skeleton className="h-10 w-20" /> : stats.kingsCount}
            description="Male contestants"
            color="primary"
          />
          <StatCard
            icon={<Crown className="h-5 w-5" />}
            title="Queen Candidates"
            value={loading ? <Skeleton className="h-10 w-20" /> : stats.queensCount}
            description="Female contestants"
            color="secondary"
          />
        </div>

        {/* Current Leaders */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Leading King */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                <CardTitle>Leading King</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <LeaderCardSkeleton />
              ) : stats.leadingKing ? (
                <LeaderCard candidate={stats.leadingKing} />
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No votes yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Leading Queen */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-accent-foreground" />
                <CardTitle>Leading Queen</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <LeaderCardSkeleton />
              ) : stats.leadingQueen ? (
                <LeaderCard candidate={stats.leadingQueen} />
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No votes yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Event Info */}
        <Card>
          <CardHeader>
            <CardTitle>Event Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <InfoRow label="Event Name" value="King & Queen Voting" />
              <InfoRow label="Purpose" value="Fresher Welcome 2025" />
              <InfoRow label="Expected Participants" value="~200 students" />
              <InfoRow label="Voting Method" value="One vote per person (IP-based)" />
              <InfoRow label="Categories" value="King & Queen" />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate('/admin/candidates')}
          >
            <Users className="h-4 w-4 mr-2" />
            Manage Candidates
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/admin/results')}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            View Detailed Results
          </Button>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, title, value, description, color = 'primary' }) {
  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent-foreground',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={colorClasses[color]}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

function LeaderCard({ candidate }) {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const photoUrl = candidate.photoUrl
    ? `${API_BASE_URL}${candidate.photoUrl}`
    : null;

  return (
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={candidate.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-bold mb-1">{candidate.name}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span className="capitalize">{candidate.category}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {candidate.voteCount} votes
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
}

function LeaderCardSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="w-20 h-20 rounded-lg" />
      <div className="flex-1">
        <Skeleton className="h-7 w-32 mb-2" />
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-2 w-full" />
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
