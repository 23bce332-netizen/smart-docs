import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { uploadFile, createDocument } from "@/services/documents";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload as UploadIcon, FileText, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { addMonths, format } from "date-fns";

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

const UploadPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [productName, setProductName] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [warrantyDuration, setWarrantyDuration] = useState("");

  const expiryDate = purchaseDate && warrantyDuration
    ? format(addMonths(new Date(purchaseDate), parseInt(warrantyDuration) || 0), "yyyy-MM-dd")
    : "";

  const handleFile = (f: File) => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      toast.error("Only PDF, JPG, PNG, and WebP files are accepted");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }
    setFile(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, []);

  const extractWithAI = async () => {
    if (!file) return;
    setExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke("extract-document", {
        body: { fileName: file.name, fileType: file.type },
      });
      if (error) throw error;
      if (data?.product_name) setProductName(data.product_name);
      if (data?.purchase_date) setPurchaseDate(data.purchase_date);
      if (data?.warranty_duration) setWarrantyDuration(String(data.warranty_duration));
      toast.success("AI extracted document details!");
    } catch {
      toast.error("AI extraction failed. Please fill in manually.");
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileUrl = await uploadFile(file, user.id);
      await createDocument({
        user_id: user.id,
        file_url: fileUrl,
        file_name: file.name,
        file_type: file.type,
        product_name: productName || null,
        purchase_date: purchaseDate || null,
        expiry_date: expiryDate || null,
        warranty_duration: warrantyDuration ? parseInt(warrantyDuration) : null,
      });
      toast.success("Document uploaded successfully!");
      navigate("/documents");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="animate-in-up">
        <h1 className="text-2xl font-bold">Upload Document</h1>
        <p className="text-muted-foreground mt-1">Upload a bill, receipt, or warranty document</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 animate-in-up-delay-1">
        {!file ? (
          <Card
            className={`p-12 border-2 border-dashed text-center cursor-pointer transition-colors ${
              dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <UploadIcon className="h-10 w-10 mx-auto text-muted-foreground/50 mb-4" />
            <p className="font-medium mb-1">Drag & drop your file here</p>
            <p className="text-sm text-muted-foreground">or click to browse • PDF, JPG, PNG (max 10MB)</p>
            <input
              id="file-input"
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </Card>
        ) : (
          <Card className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={extractWithAI} disabled={extracting}>
                {extracting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                {extracting ? "Extracting..." : "AI Extract"}
              </Button>
              <button type="button" onClick={() => setFile(null)} className="p-1 hover:bg-muted rounded">
                <X className="h-4 w-4" />
              </button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="productName">Product Name</Label>
            <Input
              id="productName"
              placeholder="e.g. MacBook Pro 16"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="purchaseDate">Purchase Date</Label>
            <Input
              id="purchaseDate"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="warranty">Warranty Duration (months)</Label>
            <Input
              id="warranty"
              type="number"
              placeholder="e.g. 12"
              min="0"
              value={warrantyDuration}
              onChange={(e) => setWarrantyDuration(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Expiry Date (auto-calculated)</Label>
            <Input value={expiryDate} readOnly className="bg-muted" />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={!file || uploading}>
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Uploading...
            </>
          ) : (
            "Upload Document"
          )}
        </Button>
      </form>
    </div>
  );
};

export default UploadPage;
