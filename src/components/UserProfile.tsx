import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import {
  User,
  Settings,
  Camera,
  Mail,
  Calendar,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  LogOut,
} from "lucide-react";

export const UserProfile: React.FC = () => {
  const { user, updateProfile, logout, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    username: user?.username || "",
    email: user?.email || "",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: user?.preferences.emailNotifications || false,
    streamNotifications: user?.preferences.streamNotifications || false,
    autoSaveRecordings: user?.preferences.autoSaveRecordings || false,
  });

  if (!user) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = (key: string, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        displayName: formData.displayName,
        username: formData.username,
        preferences: {
          ...user.preferences,
          ...preferences,
        },
      });
      setIsEditing(false);
      setUpdateMessage("Profile updated successfully!");
      setTimeout(() => setUpdateMessage(null), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleCancel = () => {
    setFormData({
      displayName: user.displayName,
      username: user.username,
      email: user.email,
    });
    setPreferences({
      emailNotifications: user.preferences.emailNotifications,
      streamNotifications: user.preferences.streamNotifications,
      autoSaveRecordings: user.preferences.autoSaveRecordings,
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await logout();
    setShowLogoutDialog(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {updateMessage && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{updateMessage}</AlertDescription>
        </Alert>
      )}

      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isLoading}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user.avatar} alt={user.displayName} />
                <AvatarFallback className="text-lg">
                  {getInitials(user.displayName)}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" disabled>
                <Camera className="w-4 h-4 mr-2" />
                Change Photo
              </Button>
            </div>

            {/* Profile Details */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled // Email changes not allowed for now
                    className="flex-1"
                  />
                  <Badge variant="secondary">Verified</Badge>
                </div>
              </div>

              {/* Account Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Last login {formatDate(user.lastLogin)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Platforms */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Platforms</CardTitle>
        </CardHeader>
        <CardContent>
          {user.streamingPlatforms.length > 0 ? (
            <div className="space-y-3">
              {user.streamingPlatforms.map((platform) => (
                <div
                  key={platform.platform}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-sm font-medium capitalize">
                        {platform.platform[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium capitalize">
                        {platform.platform}
                      </p>
                      <p className="text-sm text-gray-500">
                        @{platform.platformUsername}
                      </p>
                    </div>
                  </div>
                  <Badge variant={platform.connected ? "default" : "secondary"}>
                    {platform.connected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No platforms connected</p>
              <p className="text-sm">
                Connect your streaming accounts to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-500">
                Receive updates about your streams
              </p>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) =>
                handlePreferenceChange("emailNotifications", checked)
              }
              disabled={!isEditing}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Stream Notifications</p>
              <p className="text-sm text-gray-500">
                Get notified when you go live
              </p>
            </div>
            <Switch
              checked={preferences.streamNotifications}
              onCheckedChange={(checked) =>
                handlePreferenceChange("streamNotifications", checked)
              }
              disabled={!isEditing}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-save Recordings</p>
              <p className="text-sm text-gray-500">
                Automatically save stream recordings
              </p>
            </div>
            <Switch
              checked={preferences.autoSaveRecordings}
              onCheckedChange={(checked) =>
                handlePreferenceChange("autoSaveRecordings", checked)
              }
              disabled={!isEditing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sign Out</p>
              <p className="text-sm text-gray-500">Sign out of your account</p>
            </div>
            <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Sign Out</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p>Are you sure you want to sign out of your account?</p>
                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setShowLogoutDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleLogout}
                      disabled={isLoading}
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
