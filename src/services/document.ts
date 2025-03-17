
import { supabase } from '@/lib/supabase';

export interface Document {
  id: string;
  processId: string;
  title: string;
  description: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  createdAt: string;
  updatedAt: string;
}

export async function uploadDocument(
  processId: string,
  file: File,
  title: string,
  description: string
): Promise<Document> {
  // Generate a unique file name
  const fileName = `${processId}/${Date.now()}-${file.name}`;
  
  // Upload file to Supabase Storage
  const { data: fileData, error: uploadError } = await supabase.storage
    .from('documents')
    .upload(fileName, file);

  if (uploadError) {
    throw new Error(`Error uploading file: ${uploadError.message}`);
  }

  // Get the public URL for the uploaded file
  const { data: { publicUrl } } = supabase.storage
    .from('documents')
    .getPublicUrl(fileName);

  // Create document record in the database
  const { data: document, error: dbError } = await supabase
    .from('documents')
    .insert({
      process_id: processId,
      title,
      description,
      file_name: fileName,
      file_url: publicUrl,
      file_type: file.type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (dbError) {
    throw new Error(`Error creating document record: ${dbError.message}`);
  }

  // Convert the database response to the Document interface
  return {
    id: String(document.id),
    processId: String(document.process_id),
    title: String(document.title),
    description: String(document.description),
    fileName: String(document.file_name),
    fileUrl: String(document.file_url),
    fileType: String(document.file_type),
    createdAt: String(document.created_at),
    updatedAt: String(document.updated_at)
  };
}

export async function updateDocument(
  documentId: string,
  updates: Partial<Pick<Document, 'title' | 'description'>>
): Promise<Document> {
  const { data: document, error } = await supabase
    .from('documents')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', documentId)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating document: ${error.message}`);
  }

  // Convert the database response to the Document interface
  return {
    id: String(document.id),
    processId: String(document.process_id),
    title: String(document.title),
    description: String(document.description),
    fileName: String(document.file_name),
    fileUrl: String(document.file_url),
    fileType: String(document.file_type),
    createdAt: String(document.created_at),
    updatedAt: String(document.updated_at)
  };
}

export async function deleteDocument(documentId: string): Promise<void> {
  // Get document details first to delete the file
  const { data: document, error: fetchError } = await supabase
    .from('documents')
    .select()
    .eq('id', documentId)
    .single();

  if (fetchError) {
    throw new Error(`Error fetching document: ${fetchError.message}`);
  }

  // Delete file from storage
  const { error: storageError } = await supabase.storage
    .from('documents')
    .remove([String(document.file_name)]);

  if (storageError) {
    throw new Error(`Error deleting file: ${storageError.message}`);
  }

  // Delete document record
  const { error: dbError } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId);

  if (dbError) {
    throw new Error(`Error deleting document record: ${dbError.message}`);
  }
}

export async function getProcessDocuments(processId: string): Promise<Document[]> {
  const { data: documents, error } = await supabase
    .from('documents')
    .select()
    .eq('process_id', processId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching documents: ${error.message}`);
  }

  // Convert the database response to an array of Document interfaces
  return documents.map(doc => ({
    id: String(doc.id),
    processId: String(doc.process_id),
    title: String(doc.title),
    description: String(doc.description),
    fileName: String(doc.file_name),
    fileUrl: String(doc.file_url),
    fileType: String(doc.file_type),
    createdAt: String(doc.created_at),
    updatedAt: String(doc.updated_at)
  }));
}
