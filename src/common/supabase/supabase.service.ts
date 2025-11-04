import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService {
  public client: SupabaseClient;
  constructor(private config: ConfigService) {
    const url = this.config.get<string>('SUPABASE_URL')!;
    const key = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY')!;
    this.client = createClient(url, key, { auth: { persistSession: false } });
  }
}
