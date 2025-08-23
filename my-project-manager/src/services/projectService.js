import { supabase } from '../supabaseClient';

// Create Project
export async function createProject(project) {
  const { data, error } = await supabase
    .from('projects')
    .insert([project]);
  if (error) console.error(error);
  return data;
}

// Get Projects
export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*');
  if (error) console.error(error);
  return data;
}

// Update Project
export async function updateProject(id, updates) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id);
  if (error) console.error(error);
  return data;
}

// Delete Project
export async function deleteProject(id) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);
  if (error) console.error(error);
  return true;
}
