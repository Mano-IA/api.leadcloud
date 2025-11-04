import { Module } from '@nestjs/common';
import { SupabaseService } from '../common/supabase';
import { ConversationsService } from './conversations.service';

@Module({ providers: [SupabaseService, ConversationsService], exports: [ConversationsService] })
export class ConversationsModule {}
