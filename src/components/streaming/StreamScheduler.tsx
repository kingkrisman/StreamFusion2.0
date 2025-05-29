import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  Edit,
  Bell,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ScheduledStream {
  id: string;
  title: string;
  description: string;
  date: Date;
  platforms: string[];
  notifyFollowers: boolean;
  recurring: boolean;
}

interface StreamSchedulerProps {
  scheduledStreams: ScheduledStream[];
  onScheduleStream: (stream: Omit<ScheduledStream, "id">) => void;
  onDeleteStream: (id: string) => void;
  className?: string;
}

export const StreamScheduler: React.FC<StreamSchedulerProps> = ({
  scheduledStreams,
  onScheduleStream,
  onDeleteStream,
  className,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [notifyFollowers, setNotifyFollowers] = useState(true);
  const [recurring, setRecurring] = useState(false);

  const platforms = ["YouTube", "Twitch", "Facebook", "X"];

  const handleSchedule = () => {
    if (
      !title ||
      !selectedDate ||
      !selectedTime ||
      selectedPlatforms.length === 0
    )
      return;

    const [hours, minutes] = selectedTime.split(":").map(Number);
    const streamDate = new Date(selectedDate);
    streamDate.setHours(hours, minutes);

    onScheduleStream({
      title,
      description,
      date: streamDate,
      platforms: selectedPlatforms,
      notifyFollowers,
      recurring,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setSelectedDate(undefined);
    setSelectedTime("");
    setSelectedPlatforms([]);
    setNotifyFollowers(true);
    setRecurring(false);
    setDialogOpen(false);
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform],
    );
  };

  const isUpcoming = (date: Date) => date > new Date();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Scheduled Streams
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Schedule
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule New Stream</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="stream-title">Stream Title</Label>
                  <Input
                    id="stream-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter stream title"
                  />
                </div>

                <div>
                  <Label htmlFor="stream-description">Description</Label>
                  <Textarea
                    id="stream-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Stream description (optional)"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate
                            ? format(selectedDate, "MMM dd")
                            : "Pick date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="stream-time">Time</Label>
                    <Input
                      id="stream-time"
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Platforms</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {platforms.map((platform) => (
                      <Badge
                        key={platform}
                        variant={
                          selectedPlatforms.includes(platform)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => togglePlatform(platform)}
                      >
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-followers">Notify Followers</Label>
                    <Switch
                      id="notify-followers"
                      checked={notifyFollowers}
                      onCheckedChange={setNotifyFollowers}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="recurring">Recurring Stream</Label>
                    <Switch
                      id="recurring"
                      checked={recurring}
                      onCheckedChange={setRecurring}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSchedule}
                  disabled={
                    !title ||
                    !selectedDate ||
                    !selectedTime ||
                    selectedPlatforms.length === 0
                  }
                  className="w-full"
                >
                  Schedule Stream
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {scheduledStreams.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">
            <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No scheduled streams</p>
            <p className="text-sm">
              Schedule your next stream to build anticipation
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {scheduledStreams
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .map((stream) => (
                <div
                  key={stream.id}
                  className={cn(
                    "p-3 border rounded-lg",
                    isUpcoming(stream.date)
                      ? "border-blue-200 bg-blue-50"
                      : "border-gray-200",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{stream.title}</h4>
                      {stream.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {stream.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {format(stream.date, "MMM dd, yyyy")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(stream.date, "HH:mm")}
                        </div>
                        {stream.notifyFollowers && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <Bell className="w-3 h-3" />
                            <span className="text-xs">Notify</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {stream.platforms.map((platform) => (
                          <Badge
                            key={platform}
                            variant="secondary"
                            className="text-xs"
                          >
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onDeleteStream(stream.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
