import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { candidatesAPI, uploadAPI } from '../../lib/api';
import { getImageUrl } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Skeleton } from '../../components/ui/skeleton';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Crown,
  Upload,
  User,
  Menu,
  X
} from 'lucide-react';

export default function CandidatesPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState({ kings: [], queens: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: 'king', photoUrl: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await candidatesAPI.getAll();
      setCandidates({ kings: response.data.kings || [], queens: response.data.queens || [] });
    } catch (err) {
      setError('Failed to load candidates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setError('Photo must be less than 8MB');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      let photoUrl = formData.photoUrl;

      if (photoFile) {
        const uploadResponse = await uploadAPI.uploadPhoto(photoFile);
        photoUrl = uploadResponse.data.url;
      }

      const candidateData = {
        name: formData.name,
        category: formData.category,
        photoUrl: photoUrl,
      };

      if (editingCandidate) {
        await candidatesAPI.update(editingCandidate.id, candidateData);
      } else {
        await candidatesAPI.create(candidateData);
      }

      setShowModal(false);
      resetForm();
      fetchCandidates();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save candidate');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (candidate) => {
    setEditingCandidate(candidate);
    setFormData({
      name: candidate.name,
      category: candidate.category.toLowerCase(),
      photoUrl: candidate.photoUrl || '',
    });
    setPhotoPreview(candidate.photoUrl || '');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await candidatesAPI.delete(id);
      setDeleteConfirm(null);
      fetchCandidates();
    } catch (err) {
      setError('Failed to delete candidate');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', category: 'king', photoUrl: '' });
    setPhotoFile(null);
    setPhotoPreview('');
    setEditingCandidate(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
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
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                <span className="hidden sm:inline">Manage Candidates</span>
                <span className="sm:hidden">Candidates</span>
              </h1>
            </div>
            <Button onClick={openAddModal} size="sm" className="gap-1 sm:gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Candidate</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-6 sm:space-y-8">
            <CandidatesSectionSkeleton title="Kings" />
            <CandidatesSectionSkeleton title="Queens" />
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Kings Section */}
            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <Crown className="h-5 w-5 text-blue-600" />
                Kings ({candidates.kings.length})
              </h2>
              {candidates.kings.length === 0 ? (
                <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">No king candidates yet</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {candidates.kings.map((candidate) => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      onEdit={handleEdit}
                      onDelete={(id) => setDeleteConfirm(id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Queens Section */}
            <section>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <Crown className="h-5 w-5 text-pink-600" />
                Queens ({candidates.queens.length})
              </h2>
              {candidates.queens.length === 0 ? (
                <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">No queen candidates yet</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {candidates.queens.map((candidate) => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      onEdit={handleEdit}
                      onDelete={(id) => setDeleteConfirm(id)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="mx-4 sm:mx-auto max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {editingCandidate ? 'Edit Candidate' : 'Add New Candidate'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter candidate name"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-sm">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="king">King</option>
                <option value="queen">Queen</option>
              </select>
            </div>

            <div>
              <Label htmlFor="photo" className="text-sm">Photo</Label>
              <div className="mt-1 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {photoPreview && (
                  <img
                    src={photoPreview.startsWith('blob:') ? photoPreview : getImageUrl(photoPreview)}
                    alt="Preview"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                  />
                )}
                <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-sm">
                  <Upload className="h-4 w-4" />
                  <span className="truncate">Choose Photo</span>
                  <input
                    type="file"
                    id="photo"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">Max 8MB</p>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                {submitting ? 'Saving...' : editingCandidate ? 'Update' : 'Add Candidate'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="mx-4 sm:mx-auto max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg">Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-sm sm:text-base">Are you sure you want to delete this candidate? This action cannot be undone.</p>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteConfirm)} className="w-full sm:w-auto">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CandidateCard({ candidate, onEdit, onDelete }) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square relative bg-gray-100">
        {candidate.photoUrl ? (
          <img
            src={getImageUrl(candidate.photoUrl)}
            alt={candidate.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="h-16 w-16 sm:h-20 sm:w-20 text-gray-300" />
          </div>
        )}
      </div>
      <CardContent className="p-3 sm:p-4">
        <h3 className="font-semibold text-base sm:text-lg truncate">{candidate.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className={`text-xs sm:text-sm px-2 py-0.5 rounded ${
            candidate.category === 'king' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-pink-100 text-pink-700'
          }`}>
            {candidate.category.toUpperCase()}
          </span>
          <span className="text-xs sm:text-sm text-gray-500">{candidate.voteCount} votes</span>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(candidate)}
            className="flex-1 text-xs sm:text-sm"
          >
            <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(candidate.id)}
            className="flex-1 text-xs sm:text-sm"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CandidateCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-square" />
      <CardContent className="p-3 sm:p-4">
        <Skeleton className="h-5 sm:h-6 w-3/4 mb-2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex gap-2 mt-3">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}

function CandidatesSectionSkeleton({ title }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3].map((i) => (
          <CandidateCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}