
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
  movementId?: string;
}

export async function uploadDocument(
  processId: string,
  file: File,
  title: string,
  description: string,
  movementId?: string
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
      movement_id: movementId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (dbError) {
    throw new Error(`Error creating document record: ${dbError.message}`);
  }

  return {
    id: document.id,
    processId: document.process_id,
    title: document.title,
    description: document.description,
    fileName: document.file_name,
    fileUrl: document.file_url,
    fileType: document.file_type,
    createdAt: document.created_at,
    updatedAt: document.updated_at,
    movementId: document.movement_id
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

  return {
    id: document.id,
    processId: document.process_id,
    title: document.title,
    description: document.description,
    fileName: document.file_name,
    fileUrl: document.file_url,
    fileType: document.file_type,
    createdAt: document.created_at,
    updatedAt: document.updated_at,
    movementId: document.movement_id
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
    .remove([document.file_name]);

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

export async function getProcessDocuments(processId: string, movementId?: string): Promise<Document[]> {
  let query = supabase
    .from('documents')
    .select()
    .eq('process_id', processId)
    .order('created_at', { ascending: false });

  // If movement ID is provided, filter by it
  if (movementId) {
    query = query.eq('movement_id', movementId);
  } else {
    // If no movement ID, only get documents not associated with a movement
    query = query.is('movement_id', null);
  }

  const { data: documents, error } = await query;

  if (error) {
    throw new Error(`Error fetching documents: ${error.message}`);
  }

  return documents.map(doc => ({
    id: doc.id,
    processId: doc.process_id,
    title: doc.title,
    description: doc.description,
    fileName: doc.file_name,
    fileUrl: doc.file_url,
    fileType: doc.file_type,
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
    movementId: doc.movement_id
  }));
}

export async function deleteProcessDocuments(processId: string): Promise<void> {
  // Get all documents for this process
  const { data: documents, error: fetchError } = await supabase
    .from('documents')
    .select('file_name')
    .eq('process_id', processId);

  if (fetchError) {
    throw new Error(`Error fetching documents: ${fetchError.message}`);
  }

  // If there are documents, delete them from storage
  if (documents && documents.length > 0) {
    const filePaths = documents.map(doc => doc.file_name);
    
    // Delete files from storage in batches (Supabase has a limit)
    const BATCH_SIZE = 100;
    for (let i = 0; i < filePaths.length; i += BATCH_SIZE) {
      const batch = filePaths.slice(i, i + BATCH_SIZE);
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove(batch);

      if (storageError) {
        console.error(`Error deleting files from storage: ${storageError.message}`);
        // Continue with other batches even if one fails
      }
    }
  }

  // Delete all document records for this process
  const { error: dbError } = await supabase
    .from('documents')
    .delete()
    .eq('process_id', processId);

  if (dbError) {
    throw new Error(`Error deleting document records: ${dbError.message}`);
  }
}
