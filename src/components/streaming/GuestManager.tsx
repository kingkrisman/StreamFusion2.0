import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  UserPlus,
  Copy,
  Trash2,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  CheckCircle,
  AlertCircle,
  Link,
} from "lucide-react";
import { Guest } from "@/types/streaming";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface GuestManagerProps {
  guests: Guest[];
  onInviteGuest: (name: string, email: string) => void;
  onRemoveGuest: (guestId: string) => void;
  onToggleGuestAudio: (guestId: string) => void;
  onToggleGuestVideo: (guestId: string) => void;
  className?: string;
}

export const GuestManager: React.FC<GuestManagerProps> = ({
  guests,
  onInviteGuest,
  onRemoveGuest,
  onToggleGuestAudio,
  onToggleGuestVideo,
  className,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const { toast } = useToast();

  const handleInviteGuest = () => {
    if (!guestName.trim() || !guestEmail.trim()) return;

    onInviteGuest(guestName.trim(), guestEmail.trim());
    setGuestName("");
    setGuestEmail("");
    setDialogOpen(false);

    toast({
      title: "Guest invited",
      description: `Invitation sent to ${guestEmail}`,
    });
  };

  const generateGuestLink = (guestId: string) => {
    return `${window.location.origin}/join/${guestId}`;
  };

  const copyGuestLink = (guestId: string) => {
    const link = generateGuestLink(guestId);
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied",
      description: "Guest join link copied to clipboard",
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Guests
            <Badge variant="secondary">{guests.length}</Badge>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Guest
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Guest to Stream</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="guest-name">Guest Name</Label>
                  <Input
                    id="guest-name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Enter guest's name"
                  />
                </div>

                <div>
                  <Label htmlFor="guest-email">Email Address</Label>
                  <Input
                    id="guest-email"
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="guest@example.com"
                  />
                </div>

                <div className="bg-muted p-3 rounded-lg text-sm">
                  <p className="font-medium mb-1">What happens next:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Guest will receive an email invitation</li>
                    <li>
                      They can join via the link without downloading software
                    </li>
                    <li>You can control their audio/video once connected</li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleInviteGuest}
                    disabled={!guestName.trim() || !guestEmail.trim()}
                    className="flex-1"
                  >
                    Send Invitation
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {guests.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="mb-2">No guests in this stream</p>
            <p className="text-sm">Invite guests to join your live stream</p>
          </div>
        ) : (
          <div className="space-y-3">
            {guests.map((guest) => (
              <div
                key={guest.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full",
                      guest.isConnected ? "bg-green-500" : "bg-red-500",
                    )}
                  />

                  <div>
                    <div className="font-medium">{guest.name}</div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={guest.isConnected ? "default" : "secondary"}
                        className={cn(
                          "text-xs",
                          guest.isConnected && "bg-green-600",
                        )}
                      >
                        {guest.isConnected ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        )}
                        {guest.isConnected ? "Connected" : "Invited"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {guest.isConnected && (
                    <>
                      <Button
                        variant={guest.isMuted ? "destructive" : "outline"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onToggleGuestAudio(guest.id)}
                      >
                        {guest.isMuted ? (
                          <MicOff className="w-4 h-4" />
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                      </Button>

                      <Button
                        variant={guest.isVideoOff ? "destructive" : "outline"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onToggleGuestVideo(guest.id)}
                      >
                        {guest.isVideoOff ? (
                          <CameraOff className="w-4 h-4" />
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                      </Button>
                    </>
                  )}

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => copyGuestLink(guest.id)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700"
                    onClick={() => onRemoveGuest(guest.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
