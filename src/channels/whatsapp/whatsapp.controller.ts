import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebhookSignatureGuard } from '../../common/guards/webhook-signature.guard';
import { WhatsappService } from './whatsapp.service';

@Controller('webhooks/whatsapp')
export class WhatsappController {
  constructor(private config: ConfigService, private svc: WhatsappService) {}

  @Get()
  verify(@Query('hub.mode') mode: string, @Query('hub.verify_token') token: string, @Query('hub.challenge') challenge: string) {
    if (mode === 'subscribe' && token === this.config.get<string>('META_VERIFY_TOKEN')) return challenge;
    return 'error';
  }

  @Post()
  @UseGuards(WebhookSignatureGuard)
  async receive(@Req() req: any) { await this.svc.handleInbound(req.body); return { ok: true }; }
}
