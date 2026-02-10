import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
    private supabase: SupabaseClient;

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

        if (!supabaseUrl || !supabaseKey) {
            console.warn('Supabase credentials not found in env. Please provide SUPABASE_URL and SUPABASE_ANON_KEY.');
            return;
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    getClient(): SupabaseClient {
        return this.supabase;
    }
}
