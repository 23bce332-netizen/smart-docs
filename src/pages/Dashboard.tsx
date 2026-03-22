import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserDocuments, Document } from "@/services/documents";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ShieldCheck, ShieldAlert, Upload, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { format, isPast, isBefore, addDays } from "date-fns";

const Dashboard = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserDocuments(user.id).then((docs) => {
      setDocuments(docs);
      setLoading(false);
    });
  }, [user]);

  const active = documents.filter((d) => d.expiry_date && !isPast(new Date(d.expiry_date)));
  const expired = documents.filter((d) => d.expiry_date && isPast(new Date(d.expiry_date)));
  const expiringSoon = documents.filter(
    (d) => d.expiry_date && !isPast(new Date(d.expiry_date)) && isBefore(new Date(d.expiry_date), addDays(new Date(), 30))
  );

  const stats = [
    { label: "Total Documents", value: documents.length, icon: FileText, color: "text-primary" },
    { label: "Active Warranties", value: active.length, icon: ShieldCheck, color: "text-success" },
    { label: "Expired", value: expired.length, icon: ShieldAlert, color: "text-destructive" },
    { label: "Expiring Soon", value: expiringSoon.length, icon: Clock, color: "text-warning" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between animate-in-up">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your documents and warranties</p>
        </div>
        <Button asChild>
          <Link to="/upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card
            key={s.label}
            className={`p-5 animate-in-up-delay-${i} border shadow-sm hover:shadow-md transition-shadow`}
          >
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

      {documents.length === 0 ? (
        <Card className="p-12 text-center border-dashed animate-in-up-delay-2">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
          <p className="text-muted-foreground mb-4">Upload your first bill or warranty to get started.</p>
          <Button asChild>
            <Link to="/upload">Upload Document</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4 animate-in-up-delay-2">
          <h2 className="text-lg font-semibold">Recent Documents</h2>
          <div className="grid gap-3">
            {documents.slice(0, 8).map((doc) => {
              const isExpired = doc.expiry_date && isPast(new Date(doc.expiry_date));
              return (
                <Card key={doc.id} className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-muted shrink-0">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{doc.product_name || doc.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.purchase_date ? format(new Date(doc.purchase_date), "MMM d, yyyy") : "No date"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {doc.expiry_date && (
                      <Badge variant={isExpired ? "destructive" : "default"} className="text-xs">
                        {isExpired ? "Expired" : `Expires ${format(new Date(doc.expiry_date), "MMM d, yyyy")}`}
                      </Badge>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
          {documents.length > 8 && (
            <Button variant="outline" asChild className="w-full">
              <Link to="/documents">View All Documents</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
