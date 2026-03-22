import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getAllDocuments, deleteDocument, Document } from "@/services/documents";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, FileText, ShieldCheck, ShieldAlert, Trash2 } from "lucide-react";
import { format, isPast } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [docs] = await Promise.all([getAllDocuments()]);
    setDocuments(docs);

    // Get unique user ids from documents + roles
    const { data: roles } = await supabase.from("user_roles").select("*");
    setUsers(roles || []);
    setLoading(false);
  };

  const handleDeleteDoc = async (id: string) => {
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      toast.success("Document deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const active = documents.filter((d) => d.expiry_date && !isPast(new Date(d.expiry_date)));
  const expired = documents.filter((d) => d.expiry_date && isPast(new Date(d.expiry_date)));

  const stats = [
    { label: "Total Users", value: users.length, icon: Users, color: "text-primary" },
    { label: "Total Docs", value: documents.length, icon: FileText, color: "text-info" },
    { label: "Active", value: active.length, icon: ShieldCheck, color: "text-success" },
    { label: "Expired", value: expired.length, icon: ShieldAlert, color: "text-destructive" },
  ];

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="animate-in-up">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground mt-1">Manage users and documents across the platform</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in-up-delay-1">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-muted ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="documents" className="animate-in-up-delay-2">
        <TabsList>
          <TabsTrigger value="documents">All Documents</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="mt-4 space-y-3">
          {documents.map((doc) => {
            const isExpired = doc.expiry_date && isPast(new Date(doc.expiry_date));
            return (
              <Card key={doc.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{doc.product_name || doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      User: {doc.user_id.slice(0, 8)}... • {format(new Date(doc.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.expiry_date && (
                    <Badge variant={isExpired ? "destructive" : "secondary"} className="text-xs">
                      {isExpired ? "Expired" : "Active"}
                    </Badge>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteDoc(doc.id)} className="hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="users" className="mt-4 space-y-3">
          {users.map((u) => (
            <Card key={u.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{u.user_id.slice(0, 8)}...</p>
                  <p className="text-xs text-muted-foreground">Role: {u.role}</p>
                </div>
              </div>
              <Badge variant="secondary">{u.role}</Badge>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
