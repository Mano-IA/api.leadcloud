import { Injectable } from '@nestjs/common';
import { ConversationsService } from '../../conversations/conversations.service';

@Injectable()
export class MetaService {
  constructor(private conv: ConversationsService) {}
  async handleInbound(payload: any) { await this.conv.onMetaInbound(payload); }
}
