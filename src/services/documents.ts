import { supabase } from "@/lib/supabase";

export interface Document {
  id: string;
  user_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  product_name: string | null;
  purchase_date: string | null;
  expiry_date: string | null;
  warranty_duration: number | null;
  created_at: string;
}

export const uploadFile = async (file: File, userId: string) => {
  const ext = file.name.split(".").pop();
  const filePath = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from("documents")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};

export const createDocument = async (doc: Omit<Document, "id" | "created_at">) => {
  const { data, error } = await supabase
    .from("documents")
    .insert(doc)
    .select()
    .single();
  if (error) throw error;
  return data as Document;
};

export const getUserDocuments = async (userId: string) => {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Document[];
};

export const updateDocument = async (id: string, updates: Partial<Document>) => {
  const { data, error } = await supabase
    .from("documents")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Document;
};

export const deleteDocument = async (id: string) => {
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw error;
};

export const getAllDocuments = async () => {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Document[];
};
