import { Module } from '@nestjs/common';
import { AppConfigModule } from './common/config';
import { ConversationsModule } from './conversations/conversations.module';
import { WhatsappController } from './channels/whatsapp/whatsapp.controller';
import { WhatsappService } from './channels/whatsapp/whatsapp.service';
import { MetaController } from './channels/meta/meta.controller';
import { MetaService } from './channels/meta/meta.service';
import { ChannelsController } from './channels/channels.controller';
import { SupabaseService } from './common/supabase';

@Module({
  imports: [AppConfigModule, ConversationsModule],
  controllers: [WhatsappController, MetaController, ChannelsController],
  providers: [SupabaseService, WhatsappService, MetaService],
})
export class AppModule {}
