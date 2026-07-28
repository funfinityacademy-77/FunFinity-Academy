import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, FileText, Search, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NotesEditor } from '@/components/notes/NotesEditor';
import { DNASetupModal } from '@/components/dna/DNASetupModal';
import { useDNAStatus } from '@/hooks/use-dna-status';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api-client';

interface Note {
  id: string;
  title: string;
  content: string;
  drawings: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
}

export function Notes() {
  const { user } = useAuth();
  const { dna_complete, loading: dnaLoading } = useDNAStatus();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDNASetup, setShowDNASetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Show DNA setup modal if not completed
  useEffect(() => {
    if (!dnaLoading && !dna_complete && user) {
      setShowDNASetup(true);
    }
  }, [dna_complete, dnaLoading, user]);

  // Fetch notes
  useEffect(() => {
    if (!user) return;

    const fetchNotes = async () => {
      try {
        const data = await apiClient.get<any[]>(`/api/users/${user.id}/notes`);
        setNotes(data || []);
      } catch (error) {
        console.error('Unable to load your notes. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [user]);

  // Save note
  const saveNote = async (content: string, drawings: string[]) => {
    if (!user) return;

    setSaving(true);
    try {
      if (selectedNote) {
        // Update existing note
        await apiClient.put(`/api/users/${user.id}/notes/${selectedNote.id}`, {
          content,
          drawings,
          updated_at: new Date().toISOString(),
        });

        setNotes(prev => prev.map(note =>
          note.id === selectedNote.id
            ? { ...note, content, drawings, updated_at: new Date().toISOString() }
            : note
        ));
      } else {
        // Create new note
        const data = await apiClient.post<any>(`/api/users/${user.id}/notes`, {
          title: `Note ${new Date().toLocaleDateString()}`,
          content,
          drawings,
          user_id: user.id,
        });
        setNotes(prev => [data, ...prev]);
        setSelectedNote(data);
      }
    } catch (error) {
      console.error('Unable to save your note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Delete note
  const deleteNote = async (noteId: string) => {
    if (!user) return;

    try {
      await apiClient.delete(`/api/notes/${noteId}`);

      setNotes(prev => prev.filter(note => note.id !== noteId));
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
    } catch (error) {
      console.error('Unable to delete your note. Please try again.');
    }
  };

  // Filter notes
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createNewNote = () => {
    setSelectedNote(null);
  };

  const handleDNAComplete = () => {
    setShowDNASetup(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* DNA Setup Modal */}
      <DNASetupModal
        isOpen={showDNASetup}
        onClose={() => setShowDNASetup(false)}
        onComplete={handleDNAComplete}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Notes</h1>
          <p className="text-muted-foreground">
            Create and manage your study notes with AI assistance
          </p>
        </div>
        <Button onClick={createNewNote} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Note
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notes List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                My Notes
                <Badge variant="secondary">{filteredNotes.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Search */}
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Notes List */}
              <div className="max-h-96 overflow-y-auto">
                {filteredNotes.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    {searchTerm ? 'No notes found' : 'No notes yet. Create your first note!'}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredNotes.map((note) => (
                      <div
                        key={note.id}
                        className={`p-4 cursor-pointer border-b hover:bg-muted/50 transition-colors ${selectedNote?.id === note.id ? 'bg-primary/10 border-primary' : ''
                          }`}
                        onClick={() => setSelectedNote(note)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{note.title}</h3>
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {note.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {new Date(note.updated_at).toLocaleDateString()}
                              </Badge>
                              {note.drawings.length > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {note.drawings.length} drawing(s)
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNote(note.id);
                            }}
                            className="opacity-0 hover:opacity-100 transition-opacity"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Note Editor */}
        <div className="lg:col-span-2">
          {selectedNote ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full"
            >
              <NotesEditor
                initialContent={selectedNote.content}
                title={selectedNote.title}
                onTitleChange={(title) => {
                  setNotes(prev => prev.map(note =>
                    note.id === selectedNote.id ? { ...note, title } : note
                  ));
                }}
                onSave={saveNote}
              />
            </motion.div>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Select a Note</h3>
                <p className="text-muted-foreground mb-4">
                  Choose an existing note or create a new one to get started
                </p>
                <Button onClick={createNewNote}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Note
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Auto-save indicator */}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          Saving...
        </div>
      )}
    </div>
  );
}
