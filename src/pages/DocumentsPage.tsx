import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserDocuments, deleteDocument, updateDocument, Document } from "@/services/documents";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  FileText, Trash2, Search, Filter, Eye, Edit2, Save, X, Download,
} from "lucide-react";
import { format, isPast } from "date-fns";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const DocumentsPage = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "expired">("all");
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [editFields, setEditFields] = useState({ product_name: "", purchase_date: "", warranty_duration: "" });

  useEffect(() => {
    if (!user) return;
    loadDocs();
  }, [user]);

  const loadDocs = async () => {
    if (!user) return;
    const docs = await getUserDocuments(user.id);
    setDocuments(docs);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      toast.success("Document deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleEdit = (doc: Document) => {
    setEditDoc(doc);
    setEditFields({
      product_name: doc.product_name || "",
      purchase_date: doc.purchase_date || "",
      warranty_duration: doc.warranty_duration?.toString() || "",
    });
  };

  const handleSave = async () => {
    if (!editDoc) return;
    try {
      const dur = editFields.warranty_duration ? parseInt(editFields.warranty_duration) : null;
      let expiry: string | null = null;
      if (editFields.purchase_date && dur) {
        const d = new Date(editFields.purchase_date);
        d.setMonth(d.getMonth() + dur);
        expiry = format(d, "yyyy-MM-dd");
      }
      await updateDocument(editDoc.id, {
        product_name: editFields.product_name || null,
        purchase_date: editFields.purchase_date || null,
        warranty_duration: dur,
        expiry_date: expiry,
      });
      toast.success("Document updated");
      setEditDoc(null);
      loadDocs();
    } catch {
      toast.error("Update failed");
    }
  };

  const filtered = documents.filter((doc) => {
    const matchesSearch = !search ||
      doc.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      doc.file_name.toLowerCase().includes(search.toLowerCase());

    if (filter === "active") return matchesSearch && doc.expiry_date && !isPast(new Date(doc.expiry_date));
    if (filter === "expired") return matchesSearch && doc.expiry_date && isPast(new Date(doc.expiry_date));
    return matchesSearch;
  });

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="animate-in-up">
        <h1 className="text-2xl font-bold">Documents</h1>
        <p className="text-muted-foreground mt-1">Manage your uploaded bills and warranties</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 animate-in-up-delay-1">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by product name..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No documents found</p>
        </Card>
      ) : (
        <div className="grid gap-3 animate-in-up-delay-2">
          {filtered.map((doc) => {
            const isExpired = doc.expiry_date && isPast(new Date(doc.expiry_date));
            return (
              <Card key={doc.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 rounded-lg bg-muted shrink-0">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{doc.product_name || doc.file_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{doc.file_type.split("/")[1]?.toUpperCase()}</span>
                        {doc.purchase_date && <span>• Purchased {format(new Date(doc.purchase_date), "MMM d, yyyy")}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {doc.expiry_date && (
                      <Badge variant={isExpired ? "destructive" : "secondary"} className="text-xs hidden sm:inline-flex">
                        {isExpired ? "Expired" : format(new Date(doc.expiry_date), "MMM d, yyyy")}
                      </Badge>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => setPreviewDoc(doc)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(doc)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)} className="hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{previewDoc?.product_name || previewDoc?.file_name}</DialogTitle>
          </DialogHeader>
          {previewDoc && (
            <div className="overflow-auto">
              {previewDoc.file_type === "application/pdf" ? (
                <iframe src={previewDoc.file_url} className="w-full h-[60vh] rounded-lg" title="PDF Preview" />
              ) : previewDoc.file_type.startsWith("image/") ? (
                <img src={previewDoc.file_url} alt={previewDoc.file_name} className="max-w-full rounded-lg" />
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">Preview not available for this file type</p>
                  <a href={previewDoc.file_url} target="_blank" rel="noopener noreferrer">
                    <Button>Download File</Button>
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editDoc} onOpenChange={() => setEditDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input value={editFields.product_name} onChange={(e) => setEditFields((p) => ({ ...p, product_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Purchase Date</Label>
              <Input type="date" value={editFields.purchase_date} onChange={(e) => setEditFields((p) => ({ ...p, purchase_date: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Warranty Duration (months)</Label>
              <Input type="number" value={editFields.warranty_duration} onChange={(e) => setEditFields((p) => ({ ...p, warranty_duration: e.target.value }))} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditDoc(null)}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" /> Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsPage;
