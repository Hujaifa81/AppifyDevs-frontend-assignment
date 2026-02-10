"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInitials } from "@/lib/formatters";
import { UserInfo } from "@/types";
import { Camera, Loader2, Save, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector, store } from '@/redux/store';
import { setUser, setUpdating, setError } from '@/redux/slices/profile-slice';

import { Skeleton } from "@/components/ui/skeleton";

interface MyProfileProps {
  userInfo: UserInfo;
}

const MyProfile = ({ userInfo }: MyProfileProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);

  const profilePhoto: string | null = userInfo.avatar || null;
  const profileData = { name: userInfo.name };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImageError(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const dispatch = useAppDispatch();
  const profileState = useAppSelector((s) => s.profile);
  const isPending = profileState.updating;

  useEffect(() => {
    if (!profileState.user) dispatch(setUser(userInfo));
  }, [userInfo, dispatch, profileState.user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (selectedFile) fd.set('avatar', selectedFile);

    const optimisticPayload: { name?: string; avatar?: string } = { name: fd.get('name')?.toString() || undefined };
    if (previewImage) optimisticPayload.avatar = previewImage;

    const prev = store.getState().profile.user;
    dispatch(setUser(prev ? { ...prev, ...optimisticPayload } : null));
    dispatch(setUpdating(true));
    setUploadProgress(0);

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/profiles/update');
        xhr.withCredentials = true;
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
          }
        };
        xhr.onload = () => {
          try {
            const res = JSON.parse(xhr.responseText);
            if (res?.success) {
              dispatch(setUser(res.data));
              dispatch(setUpdating(false));
              setUploadProgress(null);
              resolve();
            } else {
              dispatch(setUser(prev));
              dispatch(setError(res?.message || 'Update failed'));
              dispatch(setUpdating(false));
              setUploadProgress(null);
              reject(new Error(res?.message || 'Update failed'));
            }
          } catch (err) {
            dispatch(setUser(prev));
            dispatch(setUpdating(false));
            setUploadProgress(null);
            reject(err);
          }
        };
        xhr.onerror = () => {
          dispatch(setUser(prev));
          dispatch(setUpdating(false));
          setUploadProgress(null);
          reject(new Error('Network error'));
        };
        xhr.send(fd);
      });

      toast.success('Profile updated successfully');
      setPreviewImage(null);
      setSelectedFile(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  if (!profileState.user) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        <div className="relative overflow-hidden rounded-3xl bg-muted/20 p-8 shadow-sm">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-6 w-72" />
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-1 rounded-3xl border-none shadow-sm bg-card/50">
            <CardHeader className="border-b border-border/50 bg-muted/10 pb-6">
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6 pt-10">
              <Skeleton className="h-40 w-40 rounded-full" />
              <div className="space-y-2 w-full flex flex-col items-center">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2 rounded-3xl border-none shadow-sm bg-card/50">
            <CardHeader className="border-b border-border/50 bg-muted/10 pb-6">
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              </div>
              <Skeleton className="h-24 w-full rounded-2xl" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-10">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-blue-600 to-indigo-600 p-8 text-white shadow-xl shadow-primary/20">
        <div className="relative z-10">
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">My Profile</h1>
          <p className="mt-2 text-lg font-medium opacity-90 italic">Manage your digital identity and preferences.</p>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl" />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Card */}
          <Card className="lg:col-span-1 border-none shadow-sm bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden rounded-3xl">
            <CardHeader className="border-b border-border/50 bg-muted/20 pb-6">
              <CardTitle className="text-xl font-bold">Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6 pt-10">
              <div className="relative group">
                <Avatar className="h-40 w-40 border-4 border-background shadow-2xl transition-transform duration-500 group-hover:scale-105">
                  {previewImage || profilePhoto ? (
                    <AvatarImage
                      src={previewImage || (profilePhoto as string)}
                      alt={userInfo.name}
                      onError={() => setImageError(true)}
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback className="text-4xl font-black bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                      {userInfo.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                  {imageError && (
                    <AvatarFallback className="text-4xl font-black bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                      {userInfo.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <label
                  htmlFor="file"
                  className="absolute bottom-1 right-1 bg-primary text-primary-foreground rounded-2xl p-3 cursor-pointer hover:bg-primary/90 transition-all shadow-lg hover:scale-110 active:scale-95 z-20"
                >
                  <Camera className="h-5 w-5" />
                  <Input
                    type="file"
                    id="file"
                    name="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={isPending}
                  />
                </label>
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500" />
              </div>

              <div className="text-center space-y-1">
                <p className="font-black text-2xl tracking-tight">{userInfo.name}</p>
                <p className="text-sm text-muted-foreground font-medium">
                  {userInfo.email}
                </p>
                <div className="pt-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
                    {userInfo.role.replace("_", " ")}
                  </span>
                </div>
              </div>

              {uploadProgress !== null && (
                <div className="w-full space-y-2 px-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <span>Uploading</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Information Card */}
          <Card className="lg:col-span-2 border-none shadow-sm bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden rounded-3xl">
            <CardHeader className="border-b border-border/50 bg-muted/20 pb-6">
              <CardTitle className="text-xl font-bold">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={userInfo.name}
                    required
                    disabled={isPending}
                    className="rounded-xl border-dashed focus:border-solid h-12 font-bold px-4 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userInfo.email}
                    disabled
                    className="rounded-xl bg-muted/50 border-none h-12 font-bold px-4 cursor-not-allowed opacity-70"
                  />
                </div>

                <div className="space-y-4 md:col-span-2 p-6 rounded-2xl bg-muted/20 border border-dashed border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Settings size={18} />
                    </div>
                    <p className="text-sm font-bold">Account Settings</p>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    Additional identity fields and security preferences will be available in the next version of the platform.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-border/50">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl h-12 px-8 bg-gradient-to-r from-primary to-blue-600 hover:shadow-lg hover:shadow-primary/30 transition-all font-black"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Updating Profile...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default MyProfile;