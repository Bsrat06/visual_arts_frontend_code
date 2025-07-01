import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../components/ui/card";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../../components/ui/tooltip";
import { Upload, Eye, EyeOff, Trash2, RotateCw, User, Check, X } from "lucide-react";
import { toast } from "sonner";
import Cropper from "react-easy-crop";
import { Slider } from "../../components/ui/slider";
import API from "../../lib/api";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";

type ProfileForm = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  bio: string;
  profile_picture: File | null;
};

type CroppedAreaPixels = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password: string) =>
  password === "" || /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(password);

const getInitials = (firstName?: string, lastName?: string) => {
  const first = firstName ? firstName.charAt(0) : '';
  const last = lastName ? lastName.charAt(0) : '';
  return `${first}${last}`.toUpperCase();
};

export default function MemberProfile() {
  const [form, setForm] = useState<ProfileForm>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    bio: "",
    profile_picture: null,
  });
  const [initialForm, setInitialForm] = useState<ProfileForm | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ProfileForm>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load current user profile
  useEffect(() => {
    setIsLoading(true);
    API.get("/auth/user/")
      .then((res) => {
        const { first_name, last_name, email, bio, profile_picture } = res.data;
        const profileData = { 
          first_name, 
          last_name, 
          email, 
          bio: bio || "", 
          profile_picture: null, 
          password: "" 
        };
        setForm(profileData);
        setInitialForm(profileData);
        setPreviewUrl(profile_picture || null);
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "profile_picture" && files && files[0]) {
      setForm({ ...form, profile_picture: files[0] });
      setPreviewUrl(URL.createObjectURL(files[0]));
      setShowCropper(true);
    } else {
      setForm({ ...form, [name]: value });
      setErrors((prev) => ({
        ...prev,
        [name]:
          name === "email"
            ? !validateEmail(value)
              ? "Invalid email format"
              : undefined
            : name === "password"
            ? !validatePassword(value)
              ? "Password must be at least 8 characters with uppercase, lowercase, and number"
              : undefined
            : name === "first_name" || name === "last_name"
            ? value.length > 50
              ? "Name must be 50 characters or less"
              : undefined
            : name === "bio"
            ? value.length > 500
              ? "Bio must be 500 characters or less"
              : undefined
            : undefined,
      }));
    }
  };

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
            resolve(new File([blob], "profile_picture.jpg", { type: "image/jpeg" }));
          }
        }, "image/jpeg");
      });
    },
    []
  );

  const onCropComplete = useCallback((_: any, croppedAreaPixels: CroppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const saveCroppedImage = async () => {
    if (previewUrl && croppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(previewUrl, croppedAreaPixels);
        setForm({ ...form, profile_picture: croppedImage });
        setShowCropper(false);
        toast.success("Image cropped successfully");
      } catch (err) {
        toast.error("Failed to process image");
      }
    }
  };

  const deleteProfilePicture = async () => {
    setIsLoading(true);
    try {
      await API.delete("/auth/profile/remove-picture/");
      setForm({ ...form, profile_picture: null });
      setPreviewUrl(null);
      setShowCropper(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Profile picture removed successfully");
    } catch (err) {
      toast.error("Failed to remove profile picture");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    if (initialForm) {
      setForm(initialForm);
      setPreviewUrl(initialForm.profile_picture || null);
      setErrors({});
      setShowCropper(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.info("Changes discarded");
    }
  };

  const handleSubmit = async () => {
    const newErrors: Partial<ProfileForm> = {
      first_name: form.first_name.length > 50 ? "First name must be 50 characters or less" : undefined,
      last_name: form.last_name.length > 50 ? "Last name must be 50 characters or less" : undefined,
      email: !validateEmail(form.email) ? "Invalid email format" : undefined,
      password: !validatePassword(form.password) ? "Password must be at least 8 characters with uppercase, lowercase, and number" : undefined,
      bio: form.bio.length > 500 ? "Bio must be 500 characters or less" : undefined,
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      toast.error("Please fix form errors before submitting");
      return;
    }

    setIsLoading(true);
    const data = new FormData();
    data.append("first_name", form.first_name);
    data.append("last_name", form.last_name);
    data.append("email", form.email);
    if (form.password) data.append("password", form.password);
    if (form.bio) data.append("bio", form.bio);
    if (form.profile_picture) data.append("profile_picture", form.profile_picture);

    try {
      await API.put("/auth/profile/update/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setInitialForm(form);
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = () => {
    if (!initialForm) return false;
    return (
      form.first_name !== initialForm.first_name ||
      form.last_name !== initialForm.last_name ||
      form.email !== initialForm.email ||
      form.password !== "" ||
      form.bio !== initialForm.bio ||
      form.profile_picture !== null
    );
  };

  return (
    <TooltipProvider>
      <div className="max-w-2xl mx-auto space-y-6 animate-[fadeIn_0.5s_ease-in]">
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Profile Settings
              </CardTitle>
              {hasChanges() && (
                <Badge variant="outline" className="text-xs">
                  Unsaved Changes
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your personal information and account settings
            </p>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex flex-col items-center sm:items-start gap-4">
                <div className="relative group">
                  <Avatar className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-md">
                    {previewUrl ? (
                      <AvatarImage 
                        src={previewUrl} 
                        alt={`${form.first_name} ${form.last_name}`}
                        className="object-cover"
                      />
                    ) : null}
                    <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-2xl font-medium">
                      {getInitials(form.first_name, form.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full w-10 h-10 p-0 bg-white dark:bg-gray-800 shadow-sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Upload new photo</TooltipContent>
                    </Tooltip>
                    {previewUrl && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full w-10 h-10 p-0 bg-white dark:bg-gray-800 shadow-sm"
                            onClick={deleteProfilePicture}
                            disabled={isLoading}
                          >
                            <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove photo</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <input
                    name="profile_picture"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                    ref={fileInputRef}
                  />
                </div>
                {showCropper && previewUrl && (
                  <div className="mt-4 w-full max-w-xs">
                    <div className="relative w-full h-64 rounded-lg overflow-hidden">
                      <Cropper
                        image={previewUrl}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                      />
                    </div>
                    <div className="mt-3">
                      <Label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">
                        Zoom: {zoom.toFixed(1)}
                      </Label>
                      <Slider
                        value={[zoom]}
                        min={1}
                        max={3}
                        step={0.1}
                        onValueChange={(value) => setZoom(value[0])}
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        onClick={saveCroppedImage}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Save Crop
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowCropper(false);
                          setForm({ ...form, profile_picture: null });
                          setPreviewUrl(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Personal Info Section */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      First Name
                    </Label>
                    <Input
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      className="mt-1"
                      aria-invalid={!!errors.first_name}
                    />
                    {errors.first_name && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                        {errors.first_name}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last Name
                    </Label>
                    <Input
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      className="mt-1"
                      aria-invalid={!!errors.last_name}
                    />
                    {errors.last_name && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                        {errors.last_name}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </Label>
                  <Input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="mt-1"
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    New Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      className="pr-10"
                      aria-invalid={!!errors.password}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                      {errors.password}
                    </p>
                  )}
                  {form.password && !errors.password && (
                    <Progress
                      value={
                        form.password.length >= 12
                          ? 100
                          : (form.password.length / 12) * 100
                      }
                      className="mt-2 h-1.5"
                      indicatorClassName={
                        form.password.length >= 8
                          ? "bg-green-500 dark:bg-green-400"
                          : "bg-yellow-500 dark:bg-yellow-400"
                      }
                    />
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {form.password.length > 0
                      ? "Password strength"
                      : "Leave blank to keep current password"}
                  </p>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                About You
              </Label>
              <Textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                className="mt-1"
                rows={4}
                maxLength={500}
                aria-invalid={!!errors.bio}
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {form.bio.length}/500 characters
                </p>
                {errors.bio && (
                  <p className="text-xs text-red-500 dark:text-red-400">
                    {errors.bio}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-gray-200 dark:border-gray-700 py-4 px-6 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
            <div className="flex justify-end gap-3 w-full">
              <Button
                variant="outline"
                onClick={resetForm}
                disabled={isLoading || !hasChanges()}
              >
                Discard
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !hasChanges()}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </TooltipProvider>
  );
}