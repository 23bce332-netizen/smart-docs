import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserDocuments, Document } from "@/services/documents";
import { getUserReminders, createReminder, deleteReminder } from "@/services/reminders";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Bell, Trash2, Plus, CalendarDays, CheckCircle2 } from "lucide-react";
import { format, isPast } from "date-fns";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const RemindersPage = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<any[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState("");
  const [reminderDate, setReminderDate] = useState("");

  useEffect(() => {
    if (!user) return;
    Promise.all([getUserReminders(user.id), getUserDocuments(user.id)]).then(([r, d]) => {
      setReminders(r);
      setDocuments(d);
      setLoading(false);
    });
  }, [user]);

  const handleCreate = async () => {
    if (!user || !selectedDoc || !reminderDate) return;
    try {
      await createReminder({ user_id: user.id, document_id: selectedDoc, reminder_date: reminderDate });
      toast.success("Reminder set!");
      setDialogOpen(false);
      setSelectedDoc("");
      setReminderDate("");
      const r = await getUserReminders(user.id);
      setReminders(r);
    } catch {
      toast.error("Failed to create reminder");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReminder(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
      toast.success("Reminder deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-in-up">
        <div>
          <h1 className="text-2xl font-bold">Reminders</h1>
          <p className="text-muted-foreground mt-1">Set reminders before your warranties expire</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> New Reminder</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Reminder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Document</Label>
                <Select value={selectedDoc} onValueChange={setSelectedDoc}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a document" />
                  </SelectTrigger>
                  <SelectContent>
                    {documents.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.product_name || d.file_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reminder Date</Label>
                <Input type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} />
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={!selectedDoc || !reminderDate}>
                Set Reminder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {reminders.length === 0 ? (
        <Card className="p-8 text-center border-dashed animate-in-up-delay-1">
          <Bell className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No reminders set. Create one to get notified!</p>
        </Card>
      ) : (
        <div className="grid gap-3 animate-in-up-delay-1">
          {reminders.map((r) => {
            const past = isPast(new Date(r.reminder_date));
            return (
              <Card key={r.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${r.triggered ? "bg-success/10" : past ? "bg-warning/10" : "bg-muted"}`}>
                    {r.triggered ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <CalendarDays className={`h-4 w-4 ${past ? "text-warning" : "text-muted-foreground"}`} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{r.documents?.product_name || r.documents?.file_name || "Document"}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(r.reminder_date), "MMM d, yyyy")}
                      {r.triggered && " • Sent"}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)} className="hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RemindersPage;
