import { Injectable } from '@nestjs/common';
import { ConversationsService } from '../../conversations/conversations.service';

@Injectable()
export class WhatsappService {
  constructor(private conv: ConversationsService) {}
  async handleInbound(payload: any) { await this.conv.onWhatsAppInbound(payload); }
}
