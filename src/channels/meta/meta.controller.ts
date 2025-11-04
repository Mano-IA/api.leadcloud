import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MetaWebhookSignatureGuard } from '../../common/guards/meta-webhook-signature.guard';
import { MetaService } from './meta.service';

@Controller('webhooks/meta')
export class MetaController {
  constructor(private config: ConfigService, private svc: MetaService) {}

  @Get()
  verify(@Query('hub.mode') mode: string, @Query('hub.verify_token') token: string, @Query('hub.challenge') challenge: string) {
    if (mode === 'subscribe' && token === this.config.get<string>('META_VERIFY_TOKEN')) return challenge;
    return 'error';
  }

  @Post()
  @UseGuards(MetaWebhookSignatureGuard)
  async receive(@Req() req: any) { await this.svc.handleInbound(req.body); return { ok: true }; }
}
