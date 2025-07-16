import { SupabaseClient } from "@supabase/supabase-js";
import { Project, ProjectWithStatus } from "./schema"

export class ProjectService {
    private supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    // Get active projects (not archived or deleted)
    async getActiveProjects(userId: string): Promise<ProjectWithStatus[]> {
      const { data, error } = await this.supabase
        .from('projects')
        .select(`
          *,
          status:project_statuses(name)
        `)
        .eq('user_id', userId)
        .is('archived_at', null)
        .is('deleted_at', null)
        .order('is_favorite', { ascending: false })
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    }
}