import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { candidatesAPI, voteAPI, settingsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Crown,
  Users,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Vote,
  Clock,
  Lock,
} from 'lucide-react';

export default function VotingPage() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState({ kings: [], queens: [] });
  const [loading, setLoading] = useState(true);
  const [selectedKing, setSelectedKing] = useState(null);
  const [selectedQueen, setSelectedQueen] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [error, setError] = useState('');
  const [votingOpen, setVotingOpen] = useState(true);
  const [checkingVotingStatus, setCheckingVotingStatus] = useState(true);

  useEffect(() => {
    checkVotingStatus();
    checkVoteStatus();
    fetchCandidates();
  }, []);

  const checkVotingStatus = async () => {
    try {
      const response = await settingsAPI.getVotingOpen();
      setVotingOpen(response.data.open);
    } catch (err) {
      console.error('Failed to check voting status:', err);
    } finally {
      setCheckingVotingStatus(false);
    }
  };

  const checkVoteStatus = async () => {
    try {
      const response = await voteAPI.check();
      setHasVoted(response.data.hasVoted);
    } catch (err) {
      console.error('Failed to check vote status:', err);
    }
  };

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await candidatesAPI.getAll();
      setCandidates(response.data);
    } catch (err) {
      setError('Failed to load candidates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoteClick = () => {
    if (!selectedKing || !selectedQueen) {
      setError('Please select both King and Queen candidates');
      return;
    }
    setError('');
    setShowConfirmDialog(true);
  };

  const handleConfirmVote = async () => {
    try {
      setSubmitting(true);
      setShowConfirmDialog(false);

      // Check if voting is still open before submitting
      const votingStatusResponse = await settingsAPI.getVotingOpen();
      if (!votingStatusResponse.data.open) {
        setVotingOpen(false);
        setSubmitting(false);
        return;
      }
      
      await voteAPI.submit(selectedKing, selectedQueen);
      
      setHasVoted(true);
      setShowSuccessDialog(true);
    } catch (err) {
      if (err.response?.data?.alreadyVoted) {
        setHasVoted(true);
        setError('You have already voted');
      } else {
        setError(err.response?.data?.error || 'Failed to submit vote');
      }
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewResults = () => {
    navigate('/results');
  };

  // Show loading while checking voting status
  if (checkingVotingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show "voting closed" message if voting is not open
  if (!votingOpen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-muted rounded-full">
                <Lock className="h-16 w-16 text-muted-foreground" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Voting is Closed</h2>
            <p className="text-muted-foreground mb-2">
              The voting period has ended or has not started yet.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
              <Clock className="h-4 w-4" />
              <span>Please check back later</span>
            </div>
            <Button onClick={handleViewResults} variant="outline" className="w-full">
              <Trophy className="h-4 w-4 mr-2" />
              View Results
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <CheckCircle2 className="h-16 w-16 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Thank You for Voting!</h2>
            <p className="text-muted-foreground mb-6">
              Your vote has been recorded successfully. You cannot vote again.
            </p>
            <Button onClick={handleViewResults} className="w-full">
              <Trophy className="h-4 w-4 mr-2" />
              View Results
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Crown className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">King & Queen Voting</h1>
                <p className="text-sm text-muted-foreground">CEIT Fresher Welcome 2025</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleViewResults}>
              <Trophy className="h-4 w-4 mr-2" />
              Results
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructions */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                <Vote className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">How to Vote</h2>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Select one candidate for King</li>
                  <li>Select one candidate for Queen</li>
                  <li>Click "Submit Vote" button</li>
                  <li>Confirm your selection</li>
                </ol>
                <p className="text-xs text-muted-foreground mt-2">
                  ⚠️ You can only vote once. Choose carefully!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center gap-2 p-4 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-8">
            <CandidatesSectionSkeleton title="Vote for King" />
            <CandidatesSectionSkeleton title="Vote for Queen" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* King Candidates */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Crown className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">Vote for King</h2>
                {selectedKing && (
                  <span className="ml-auto text-sm text-primary font-medium">
                    ✓ Selected
                  </span>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {candidates.kings.map((candidate) => (
                  <VoteCard
                    key={candidate.id}
                    candidate={candidate}
                    isSelected={selectedKing === candidate.id}
                    onSelect={() => setSelectedKing(selectedKing === candidate.id ? null : candidate.id)}
                  />
                ))}
              </div>
            </div>

            {/* Queen Candidates */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Crown className="h-5 w-5 text-accent-foreground" />
                <h2 className="text-2xl font-bold">Vote for Queen</h2>
                {selectedQueen && (
                  <span className="ml-auto text-sm text-primary font-medium">
                    ✓ Selected
                  </span>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {candidates.queens.map((candidate) => (
                  <VoteCard
                    key={candidate.id}
                    candidate={candidate}
                    isSelected={selectedQueen === candidate.id}
                    onSelect={() => setSelectedQueen(selectedQueen === candidate.id ? null : candidate.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {!loading && (
          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              onClick={handleVoteClick}
              disabled={!selectedKing || !selectedQueen || submitting}
              className="min-w-[200px]"
            >
              {submitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Submit Vote
                </>
              )}
            </Button>
          </div>
        )}
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Vote</DialogTitle>
            <DialogDescription>
              Please review your selections. You can only vote once.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm font-medium mb-2">Your King Vote:</p>
              <p className="text-lg font-bold text-primary">
                {candidates.kings.find(c => c.id === selectedKing)?.name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Your Queen Vote:</p>
              <p className="text-lg font-bold text-primary">
                {candidates.queens.find(c => c.id === selectedQueen)?.name}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleConfirmVote}
              disabled={submitting}
            >
              Confirm Vote
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-center">Vote Submitted!</DialogTitle>
            <DialogDescription className="text-center">
              Thank you for participating in the voting. Your vote has been recorded.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleViewResults} className="w-full">
            <Trophy className="h-4 w-4 mr-2" />
            View Results
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VoteCard({ candidate, isSelected, onSelect }) {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const photoUrl = candidate.photoUrl
    ? `${API_BASE_URL}${candidate.photoUrl}`
    : null;

  return (
    <Card
      className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary shadow-lg' : ''
      }`}
      onClick={onSelect}
    >
      <div className="aspect-square bg-muted relative">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={candidate.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Users className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        {isSelected && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
            <div className="p-2 bg-primary rounded-full">
              <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
        )}
      </div>
      <CardContent className="p-4 text-center">
        <h3 className="font-semibold text-lg">{candidate.name}</h3>
        <p className="text-sm text-muted-foreground capitalize mt-1">
          {candidate.category} Candidate
        </p>
      </CardContent>
    </Card>
  );
}

function CandidatesSectionSkeleton({ title }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <CardContent className="p-4 text-center">
              <Skeleton className="h-6 w-32 mx-auto mb-2" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
