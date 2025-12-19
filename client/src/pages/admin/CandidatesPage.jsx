import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { candidatesAPI, uploadAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  Plus,
  Edit2,
  Trash2,
  Upload,
  X,
  Loader2,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { PageSpinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';

export default function CandidatesPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState({ kings: [], queens: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentCandidate, setCurrentCandidate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'king',
    photoUrl: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await candidatesAPI.getAll();
      setCandidates(response.data);
    } catch (err) {
      setError('Failed to fetch candidates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setCurrentCandidate(null);
    setFormData({ name: '', category: 'king', photoUrl: '' });
    setPhotoFile(null);
    setShowModal(true);
  };

  const handleEdit = (candidate) => {
    setModalMode('edit');
    setCurrentCandidate(candidate);
    setFormData({
      name: candidate.name,
      category: candidate.category,
      photoUrl: candidate.photoUrl || '',
    });
    setPhotoFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) {
      return;
    }

    try {
      await candidatesAPI.delete(id);
      await fetchCandidates();
    } catch (err) {
      alert('Failed to delete candidate');
      console.error(err);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('File size must be less than 8MB');
        return;
      }
      setPhotoFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      let photoUrl = formData.photoUrl;

      // Upload photo if selected
      if (photoFile) {
        setUploading(true);
        const uploadResponse = await uploadAPI.uploadPhoto(photoFile);
        photoUrl = uploadResponse.data.url;
        setUploading(false);
      }

      const submitData = {
        name: formData.name,
        category: formData.category,
        photoUrl,
      };

      if (modalMode === 'create') {
        await candidatesAPI.create(submitData);
      } else {
        await candidatesAPI.update(currentCandidate.id, submitData);
      }

      await fetchCandidates();
      setShowModal(false);
      setFormData({ name: '', category: 'king', photoUrl: '' });
      setPhotoFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save candidate');
      console.error(err);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: '', category: 'king', photoUrl: '' });
    setPhotoFile(null);
    setError('');
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
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Manage Candidates</h1>
                <p className="text-sm text-muted-foreground">Add, edit, or remove candidates</p>
              </div>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Candidate
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="space-y-8">
            <CandidatesSectionSkeleton title="King Candidates" count={3} />
            <CandidatesSectionSkeleton title="Queen Candidates" count={3} />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Kings Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Crown className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">King Candidates</h2>
                <span className="text-sm text-muted-foreground">({candidates.kings.length})</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {candidates.kings.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
                {candidates.kings.length === 0 && (
                  <p className="text-muted-foreground col-span-full text-center py-8">
                    No king candidates yet
                  </p>
                )}
              </div>
            </div>

            {/* Queens Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Crown className="h-5 w-5 text-accent-foreground" />
                <h2 className="text-2xl font-bold">Queen Candidates</h2>
                <span className="text-sm text-muted-foreground">({candidates.queens.length})</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {candidates.queens.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
                {candidates.queens.length === 0 && (
                  <p className="text-muted-foreground col-span-full text-center py-8">
                    No queen candidates yet
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <Card className="w-full border-0 shadow-none">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <DialogTitle>
                    {modalMode === 'create' ? 'Add New Candidate' : 'Edit Candidate'}
                  </DialogTitle>
                  <DialogDescription>
                    {modalMode === 'create'
                      ? 'Create a new candidate for voting'
                      : 'Update candidate information'}
                  </DialogDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={closeModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="Enter candidate name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  >
                    <option value="king">King</option>
                    <option value="queen">Queen</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo">Photo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="flex-1"
                    />
                    {uploading && <Loader2 className="h-5 w-5 animate-spin" />}
                  </div>
                  {photoFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {photoFile.name}
                    </p>
                  )}
                  {formData.photoUrl && !photoFile && (
                    <p className="text-sm text-muted-foreground">
                      Current: {formData.photoUrl.split('/').pop()}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Max file size: 8MB. Supported formats: JPG, PNG, GIF
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={closeModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={submitting || uploading}
                  >
                    {submitting || uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {uploading ? 'Uploading...' : 'Saving...'}
                      </>
                    ) : modalMode === 'create' ? (
                      'Create'
                    ) : (
                      'Update'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CandidateCard({ candidate, onEdit, onDelete }) {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const photoUrl = candidate.photoUrl
    ? `${API_BASE_URL}${candidate.photoUrl}`
    : null;

  return (
    <Card className="overflow-hidden">
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
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-lg">{candidate.name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Crown className="h-3 w-3" />
              <span className="capitalize">{candidate.category}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-sm font-medium">
            {candidate.voteCount || 0} votes
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(candidate)}
          >
            <Edit2 className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(candidate.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CandidateCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="flex gap-2 mt-3">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9" />
        </div>
      </CardContent>
    </Card>
  );
}

function CandidatesSectionSkeleton({ title, count = 3 }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <CandidateCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
