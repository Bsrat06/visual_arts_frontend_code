import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../../components/ui/tooltip";
import { Badge } from "../../components/ui/badge";
import { Upload, Trash2, Edit, RotateCw, Filter, Plus, Image as ImageIcon, X, Heart } from "lucide-react";
import { toast } from "sonner";
import Cropper from "react-easy-crop";
import API from "../../lib/api";
import "react-datepicker/dist/react-datepicker.css";

// Define the exact types for approval status
type ApprovalStatus = "approved" | "pending" | "rejected";

type Artwork = {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  approval_status: ApprovalStatus; // Changed to the specific union type
  submission_date: string;
  feedback?: string;
  likes_count: number;
};

type ArtworkForm = {
  id?: number;
  title: string;
  category: string;
  description: string;
  image: File | null;
};

type Errors = {
  title?: string;
  category?: string;
  description?: string;
  image?: string;
};

type CroppedAreaPixels = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const CATEGORIES = ["sketch", "canvas", "wallart", "digital", "photography"] as const;
const STATUS_VARIANTS = {
  approved: "default",
  pending: "secondary",
  rejected: "destructive",
} as const; // Added 'as const' here for stricter type inference

const validateForm = (form: ArtworkForm): Errors => ({
  title: form.title.length === 0 ? "Title is required" : form.title.length > 100 ? "Title must be 100 characters or less" : undefined,
  category: !form.category || form.category === "none" ? "Category is required" : undefined,
  description: form.description.length > 1000 ? "Description must be 1000 characters or less" : undefined,
  image: !form.id && !form.image ? "Image is required" : undefined,
});

export default function Portfolio() {
  const [form, setForm] = useState<ArtworkForm>({ title: "", category: "none", description: "", image: null });
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [editMode, setEditMode] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsPerPage = 8;

  // Fetch artworks
  useEffect(() => {
    fetchArtworks(page);
  }, [page, statusFilter, categoryFilter]);

  const fetchArtworks = async (pageNum: number) => {
    setIsLoading(true);
    try {
      let url = `/artwork/my_artworks/?page=${pageNum}&page_size=${itemsPerPage}`;
      if (statusFilter !== "all") url += `&approval_status=${statusFilter}`;
      if (categoryFilter !== "all") url += `&category=${categoryFilter}`;
      
      const res = await API.get(url);
      setArtworks(res.data.results || []);
      setHasNext(!!res.data.next);
      setHasPrev(!!res.data.previous);
      setTotalItems(res.data.count || 0);
    } catch {
      toast.error("Failed to fetch portfolio");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "image" && files && files[0]) {
      setForm({ ...form, image: files[0] });
      setPreview(URL.createObjectURL(files[0]));
      setShowCropper(true);
      setErrors((prev) => ({ ...prev, image: undefined }));
    } else {
      setForm({ ...form, [name]: value });
      setErrors((prev) => ({
        ...prev,
        [name]:
          name === "title"
            ? value.length === 0
              ? "Title is required"
              : value.length > 100
              ? "Title must be 100 characters or less"
              : undefined
            : name === "description"
            ? value.length > 1000
              ? "Description must be 1000 characters or less"
              : undefined
            : undefined,
      }));
    }
  };

  // Handle select change
  const handleCategoryChange = (value: string) => {
    setForm({ ...form, category: value });
    setErrors((prev) => ({ ...prev, category: value && value !== "none" ? undefined : "Category is required" }));
  };

  // Get cropped image
  const getCroppedImg = useCallback(
    async (imageSrc: string, pixelCrop: CroppedAreaPixels) => {
      const image = new Image();
      image.src = imageSrc;
      await new Promise((resolve) => (image.onload = resolve));
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      ctx?.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );
      return new Promise<File>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], "artwork.jpg", { type: "image/jpeg" }));
          }
        }, "image/jpeg");
      });
    },
    []
  );

  // Handle crop complete
  const onCropComplete = useCallback((_: any, croppedAreaPixels: CroppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Save cropped image
  const saveCroppedImage = async () => {
    if (preview && croppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(preview, croppedAreaPixels);
        setForm({ ...form, image: croppedImage });
        setShowCropper(false);
        setErrors((prev) => ({ ...prev, image: undefined }));
        toast.success("Image cropped successfully");
      } catch {
        toast.error("Failed to process image");
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setForm({ title: "", category: "none", description: "", image: null });
    setPreview(null);
    setShowCropper(false);
    setErrors({});
    setEditMode(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.info("Form reset");
  };

  // Handle upload or update
  const handleSubmit = async () => {
    const newErrors = validateForm(form);
    setErrors(newErrors);
    if (Object.values(newErrors).some((error) => error)) {
      toast.error("Please fix form errors before submitting");
      return;
    }

    setIsLoading(true);
    const data = new FormData();
    data.append("title", form.title);
    data.append("category", form.category);
    data.append("description", form.description);
    if (form.image) data.append("image", form.image);

    try {
      if (editMode && form.id) {
        await API.put(`/artwork/${form.id}/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Artwork updated successfully");
      } else {
        await API.post("/artwork/", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Artwork uploaded successfully");
      }
      resetForm();
      fetchArtworks(page);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || `Failed to ${editMode ? "update" : "upload"} artwork`);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit artwork
  const editArtwork = (artwork: Artwork) => {
    setForm({
      id: artwork.id,
      title: artwork.title,
      category: artwork.category,
      description: artwork.description,
      image: null,
    });
    setPreview(artwork.image);
    setEditMode(true);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete artwork
  const deleteArtwork = async () => {
    if (!deleteDialog.id) return;
    setIsLoading(true);
    try {
      await API.delete(`/artwork/${deleteDialog.id}/`);
      toast.success("Artwork deleted successfully");
      setDeleteDialog({ open: false, id: null });
      fetchArtworks(page);
    } catch {
      toast.error("Failed to delete artwork");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <TooltipProvider>
      <div className="space-y-8 animate-[fadeIn_0.5s_ease-in]">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Portfolio</h1>
            <p className="text-muted-foreground">
              Showcase and manage your creative work
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Artwork
            </Button>
          </div>
        </div>

        {/* Upload/Edit Form Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{editMode ? "Edit Artwork" : "Upload New Artwork"}</CardTitle>
                <CardDescription>
                  {editMode ? "Update your artwork details" : "Share your creative work with the community"}
                </CardDescription>
              </div>
              {editMode && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetForm}
                  className="text-muted-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Left Column - Image Upload */}
              <div className="space-y-4">
                <div>
                  <Label className="block mb-2 text-sm font-medium">Artwork Image</Label>
                  <div className="flex flex-col items-center justify-center gap-4">
                    {preview && !showCropper ? (
                      <div className="relative group">
                        <img
                          src={preview}
                          alt="Artwork preview"
                          className="w-full h-64 rounded-lg object-cover border border-muted shadow-sm transition-all group-hover:opacity-90"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowCropper(true);
                              setErrors((prev) => ({ ...prev, image: undefined }));
                            }}
                            className="backdrop-blur-sm bg-white/70 dark:bg-black/70"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Image
                          </Button>
                        </div>
                      </div>
                    ) : showCropper && preview ? (
                      <div className="space-y-4">
                        <div className="relative w-full h-64 rounded-lg overflow-hidden">
                          <Cropper
                            image={preview}
                            crop={crop}
                            zoom={zoom}
                            aspect={4 / 3}
                            showGrid={false}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                            classes={{
                              containerClassName: "rounded-lg",
                              mediaClassName: "rounded-lg",
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">Zoom</Label>
                            <input
                              type="range"
                              min="1"
                              max="3"
                              step="0.1"
                              value={zoom}
                              onChange={(e) => setZoom(Number(e.target.value))}
                              className="w-24"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setShowCropper(false);
                                if (!form.id) {
                                  setForm({ ...form, image: null });
                                  setPreview(null);
                                  if (fileInputRef.current) fileInputRef.current.value = "";
                                }
                                setErrors((prev) => ({ ...prev, image: undefined }));
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={saveCroppedImage}
                            >
                              Save Crop
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-64 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 transition-colors cursor-pointer">
                        <div 
                          className="flex flex-col items-center justify-center p-6 text-center"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <ImageIcon className="w-10 h-10 mb-3 text-muted-foreground" />
                          <p className="mb-1 text-sm text-muted-foreground">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, JPEG (Max. 5MB)
                          </p>
                        </div>
                        <Input
                          name="image"
                          type="file"
                          accept="image/*"
                          onChange={handleChange}
                          className="hidden"
                          ref={fileInputRef}
                          aria-label="Upload artwork image"
                        />
                      </div>
                    )}
                  </div>
                  {errors.image && (
                    <p className="mt-2 text-xs text-red-500">
                      {errors.image}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column - Form Fields */}
              <div className="space-y-4">
                <div>
                  <Label className="block mb-2 text-sm font-medium">Title</Label>
                  <Input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter artwork title"
                    className="text-sm"
                    aria-invalid={!!errors.title}
                    aria-describedby="title-error"
                  />
                  {errors.title && (
                    <p id="title-error" className="mt-2 text-xs text-red-500">
                      {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="block mb-2 text-sm font-medium">Category</Label>
                  <Select value={form.category} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select Category</SelectItem>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="mt-2 text-xs text-red-500">
                      {errors.category}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="block mb-2 text-sm font-medium">Description</Label>
                  <Textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Tell us about your artwork..."
                    className="text-sm min-h-[120px]"
                    rows={5}
                    maxLength={1000}
                    aria-invalid={!!errors.description}
                    aria-describedby="description-error"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {form.description.length}/1000 characters
                    </p>
                    {errors.description && (
                      <p id="description-error" className="text-xs text-red-500">
                        {errors.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    disabled={isLoading}
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    {isLoading ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : editMode ? (
                      <>
                        <Edit className="w-4 h-4" />
                        Update Artwork
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Submit Artwork
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gallery Section */}
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">My Uploads</h2>
              <p className="text-muted-foreground">
                {totalItems} artworks in your collection
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span>Status: {statusFilter === "all" ? "All" : statusFilter}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span>Category: {categoryFilter === "all" ? "All" : categoryFilter}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <RotateCw className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : artworks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64 gap-4">
                <ImageIcon className="w-12 h-12 text-muted-foreground" />
                <div className="text-center">
                  <h3 className="text-lg font-medium">No artworks found</h3>
                  <p className="text-muted-foreground">
                    {statusFilter !== "all" || categoryFilter !== "all" 
                      ? "Try adjusting your filters" 
                      : "Upload your first artwork to get started"}
                  </p>
                </div>
                <Button 
                  onClick={() => {
                    setStatusFilter("all");
                    setCategoryFilter("all");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  variant="outline"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Upload Artwork
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {artworks.map((art) => (
                  <Card key={art.id} className="group hover:shadow-md transition-shadow overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={art.image}
                          alt={art.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                          <div className="translate-y-4 group-hover:translate-y-0 transition-transform">
                            <h3 className="font-medium text-white line-clamp-1">{art.title}</h3>
                            <p className="text-xs text-white/80">
                              {formatDate(art.submission_date)}
                            </p>
                          </div>
                          <div className="flex gap-2 mt-3 translate-y-4 group-hover:translate-y-0 transition-transform">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/20"
                              onClick={() => editArtwork(art)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/20 hover:text-red-100 hover:border-red-300/30"
                              onClick={() => setDeleteDialog({ open: true, id: art.id })}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* This is the correct outer div for the content below the image */}
                      <div className="p-4 space-y-2">
                        {/* This div holds the category, approval status, and likes */}
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs capitalize">
                            {art.category}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Badge variant={STATUS_VARIANTS[art.approval_status]}> {/* No need for 'as keyof typeof' anymore */}
                              {art.approval_status}
                            </Badge>
                            {art.approval_status === 'approved' && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Heart className="w-4 h-4 mr-1" />
                                {art.likes_count}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Re-add the rejected feedback section here */}
                        {art.approval_status === "rejected" && art.feedback && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-xs text-red-500 line-clamp-1 cursor-help">
                                Feedback: {art.feedback}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[300px]">
                              <p className="text-sm">{art.feedback}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex flex-col items-center justify-between gap-4 pt-4 md:flex-row">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{(page - 1) * itemsPerPage + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(page * itemsPerPage, totalItems)}</span> of{" "}
                  <span className="font-medium">{totalItems}</span> artworks
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => prev - 1)}
                    disabled={!hasPrev || isLoading}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.ceil(totalItems / itemsPerPage) }, (_, i) => i + 1)
                      .slice(Math.max(0, page - 3), Math.min(Math.ceil(totalItems / itemsPerPage), page + 2))
                      .map((pageNum) => (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          disabled={isLoading}
                          className="w-10 h-10 p-0"
                        >
                          {pageNum}
                        </Button>
                      ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={!hasNext || isLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Delete Artwork</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                This action cannot be undone. Are you sure you want to permanently delete this artwork?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialog({ open: false, id: null })}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={deleteArtwork}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <RotateCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}