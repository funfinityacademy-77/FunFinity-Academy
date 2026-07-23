import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, PlusCircle, FileText, Video, Download, Link as LinkIcon, Star, Eye, Users, Upload, X, FileImage, FileCode, Presentation, FileSpreadsheet, Loader2, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: "PDF" | "Video" | "Image" | "Template" | "Code" | "Presentation" | "Spreadsheet";
  subject: string;
  author: string;
  rating: number;
  downloads: number;
  views: number;
  size: string;
  url: string;
  tags: string[];
  uploadedAt: string;
}

const typeIcon: Record<string, typeof FileText> = { PDF: FileText, Video: Video, Image: FileImage, Template: FileText, Code: FileCode, Presentation: Presentation, Spreadsheet: FileSpreadsheet };
const typeColor: Record<string, string> = {
  PDF: "bg-destructive/10 text-destructive border-destructive/20", Video: "bg-cyan/10 text-cyan border-cyan/20",
  Image: "bg-magenta/10 text-magenta border-magenta/20", Template: "bg-accent/10 text-accent border-accent/20",
  Code: "bg-purple/10 text-purple border-purple/20", Presentation: "bg-orange/10 text-orange border-orange/20",
  Spreadsheet: "bg-emerald/10 text-emerald border-emerald/20"
};

const subjects = ["All", "Mathematics", "Statistics", "Biology", "History", "Coding", "Literature"];
const resourceTypes = ["PDF", "Video", "Image", "Template", "Code", "Presentation", "Spreadsheet"];

export default function TeacherResources() {
  const { toast } = useToast();
  const { data: resources, loading, refresh } = useSupabaseRealtime<Resource>('resources');
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All");
  const [type, setType] = useState("All");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    type: "PDF" as Resource["type"],
    subject: "Mathematics",
    tags: [] as string[],
    tagInput: ""
  });
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleAddTag = () => {
    if (uploadForm.tagInput.trim() && !uploadForm.tags.includes(uploadForm.tagInput.trim())) {
      setUploadForm({ ...uploadForm, tags: [...uploadForm.tags, uploadForm.tagInput.trim()], tagInput: "" });
    }
  };

  const handleRemoveTag = (tag: string) => {
    setUploadForm({ ...uploadForm, tags: uploadForm.tags.filter(t => t !== tag) });
  };

  const handleUpload = async () => {
    if (!uploadForm.title.trim() || !file) {
      toast({
        title: "Missing information",
        description: "Please provide a title and select a file.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `resources/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('resources').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('resources').getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('resources').insert({
        title: uploadForm.title,
        description: uploadForm.description,
        type: uploadForm.type,
        subject: uploadForm.subject,
        author: "Admin",
        rating: 0,
        downloads: 0,
        views: 0,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        url: publicUrl,
        tags: uploadForm.tags,
        uploaded_at: new Date().toISOString()
      });

      if (dbError) throw dbError;

      toast({
        title: "Resource uploaded",
        description: "Your resource has been successfully uploaded."
      });

      setIsUploadModalOpen(false);
      setUploadForm({ title: "", description: "", type: "PDF", subject: "Mathematics", tags: [], tagInput: "" });
      setFile(null);
      refresh();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your resource.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (resource: Resource) => {
    setSelectedResource(resource);
    setUploadForm({
      title: resource.title,
      description: resource.description,
      type: resource.type,
      subject: resource.subject,
      tags: resource.tags,
      tagInput: ""
    });
    setIsEditModalOpen(true);
    setMenuOpen(null);
  };

  const handleUpdate = async () => {
    if (!selectedResource || !uploadForm.title.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a title.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      let url = selectedResource.url;
      
      // If a new file is selected, upload it
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `resources/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('resources').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('resources').getPublicUrl(filePath);
        url = publicUrl;
      }

      const { error: dbError } = await supabase.from('resources').update({
        title: uploadForm.title,
        description: uploadForm.description,
        type: uploadForm.type,
        subject: uploadForm.subject,
        url: url,
        tags: uploadForm.tags,
        size: file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : selectedResource.size
      }).eq('id', selectedResource.id);

      if (dbError) throw dbError;

      toast({
        title: "Resource updated",
        description: "Your resource has been successfully updated."
      });

      setIsEditModalOpen(false);
      setSelectedResource(null);
      setUploadForm({ title: "", description: "", type: "PDF", subject: "Mathematics", tags: [], tagInput: "" });
      setFile(null);
      refresh();
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your resource.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (resource: Resource) => {
    setSelectedResource(resource);
    setIsDeleteConfirmOpen(true);
    setMenuOpen(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedResource) return;

    try {
      // Delete from storage if possible
      if (selectedResource.url) {
        const filePath = selectedResource.url.split('/').pop();
        if (filePath) {
          await supabase.storage.from('resources').remove([`resources/${filePath}`]);
        }
      }

      // Delete from database
      const { error } = await supabase.from('resources').delete().eq('id', selectedResource.id);
      if (error) throw error;

      toast({
        title: "Resource deleted",
        description: "Your resource has been successfully deleted."
      });

      setIsDeleteConfirmOpen(false);
      setSelectedResource(null);
      refresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting your resource.",
        variant: "destructive"
      });
    }
  };

  const filtered = (resources || []).filter(r =>
    (subject === "All" || r.subject === subject) &&
    (type === "All" || r.type === type) &&
    (r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Resource Library</h1>
            <p className="text-muted-foreground text-sm mt-1">Share and discover teaching resources with colleagues</p>
          </div>
          <Button variant="hero" size="default" onClick={() => setIsUploadModalOpen(true)}><PlusCircle className="w-4 h-4 mr-2" /> Upload Resource</Button>
        </div>

        {/* Filters */}
        <div className="platform-card p-4 flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/50 border border-border/30 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search resources..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {subjects.map(s => (
              <button key={s} onClick={() => setSubject(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${subject === s ? "bg-primary/10 text-primary border-primary/30" : "border-border/30 text-muted-foreground hover:bg-secondary/50"}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {resourceTypes.map(t => (
              <button key={t} onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${type === t ? "bg-primary/10 text-primary border-primary/30" : "border-border/30 text-muted-foreground hover:bg-secondary/50"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Resource Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full platform-card p-12 flex flex-col items-center justify-center text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">No resources available</p>
            </div>
          ) : (
            filtered.map((r, i) => {
              const Icon = typeIcon[r.type] || FileText;
              return (
                <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="platform-card p-4 hover:shadow-medium transition-shadow relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColor[r.type]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-accent fill-accent" />
                        <span className="text-xs font-bold text-foreground">{r.rating}</span>
                      </div>
                      <button
                        onClick={() => setMenuOpen(menuOpen === r.id ? null : r.id)}
                        className="p-1 rounded-lg hover:bg-secondary/50 text-muted-foreground transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">{r.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{r.subject} · by {r.author}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {r.downloads}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {r.views}</span>
                  </div>

                  {/* Action Menu */}
                  {menuOpen === r.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute top-12 right-4 z-10 platform-card p-2 shadow-xl min-w-[140px]"
                    >
                      <button
                        onClick={() => handleEdit(r)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl">Upload Resource</DialogTitle>
                  <Button variant="ghost" size="icon" onClick={() => setIsUploadModalOpen(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <div className="space-y-2">
                  <Label>Resource Title</Label>
                  <Input 
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    placeholder="Enter resource title..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    placeholder="Enter resource description..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Resource Type</Label>
                    <Select value={uploadForm.type} onValueChange={(value: any) => setUploadForm({ ...uploadForm, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {resourceTypes.map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select value={uploadForm.subject} onValueChange={(value) => setUploadForm({ ...uploadForm, subject: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.filter(s => s !== "All").map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>File</Label>
                  <div className="border-2 border-dashed border-border/30 rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                    <input 
                      type="file" 
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {file ? file.name : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, Video, Image, Code, Presentation, Spreadsheet
                      </p>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={uploadForm.tagInput}
                      onChange={(e) => setUploadForm({ ...uploadForm, tagInput: e.target.value })}
                      placeholder="Add a tag..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {uploadForm.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border/20">
                  <Button variant="outline" className="flex-1" onClick={() => setIsUploadModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="hero" className="flex-1" onClick={handleUpload} disabled={isUploading}>
                    {isUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4 mr-2" /> Upload</>}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl">Edit Resource</DialogTitle>
                  <Button variant="ghost" size="icon" onClick={() => setIsEditModalOpen(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <div className="space-y-2">
                  <Label>Resource Title</Label>
                  <Input 
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    placeholder="Enter resource title..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    placeholder="Enter resource description..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Resource Type</Label>
                    <Select value={uploadForm.type} onValueChange={(value: any) => setUploadForm({ ...uploadForm, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {resourceTypes.map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select value={uploadForm.subject} onValueChange={(value) => setUploadForm({ ...uploadForm, subject: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.filter(s => s !== "All").map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Replace File (Optional)</Label>
                  <div className="border-2 border-dashed border-border/30 rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                    <input 
                      type="file" 
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-edit"
                    />
                    <label htmlFor="file-edit" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {file ? file.name : "Click to upload new file (optional)"}
                      </p>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={uploadForm.tagInput}
                      onChange={(e) => setUploadForm({ ...uploadForm, tagInput: e.target.value })}
                      placeholder="Add a tag..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {uploadForm.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border/20">
                  <Button variant="outline" className="flex-1" onClick={() => setIsEditModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="hero" className="flex-1" onClick={handleUpdate} disabled={isUploading}>
                    {isUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</> : <><Edit className="w-4 h-4 mr-2" /> Update</>}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl">Delete Resource</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <p className="text-muted-foreground">
                  Are you sure you want to delete "{selectedResource?.title}"? This action cannot be undone.
                </p>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setIsDeleteConfirmOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={handleConfirmDelete}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}

