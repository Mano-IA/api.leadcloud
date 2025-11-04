import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { SupabaseService } from '../common/supabase';

@Controller('api/channels')
export class ChannelsController {
  constructor(private sb: SupabaseService) {}

  @Get('connect-whatsapp')
  async connectWhatsapp(@Query('canalId') canalId?: string) {
    if (!canalId) throw new BadRequestException('canalId requerido');

    const { data: canal, error: e1 } = await this.sb.client
      .from('canal_integracion')
      .select('*')
      .eq('id', canalId)
      .maybeSingle();
    if (e1) throw e1;
    if (!canal) throw new BadRequestException('Canal no encontrado');
    if (canal.tipo !== 'WhatsApp') throw new BadRequestException('El canal no es WhatsApp');
    if (!canal.token_whatsapp) throw new BadRequestException('Falta token_whatsapp en el canal');

    const url = `https://graph.facebook.com/v19.0/me?fields=id,name,phone_numbers&access_token=${encodeURIComponent(canal.token_whatsapp)}`;
    const resp = await axios.get(url).then(r => r.data);
    const business_account_id = resp?.id;
    const phone_number_id = resp?.phone_numbers?.[0]?.id;
    if (!phone_number_id) throw new BadRequestException('Meta no devolvió phone_number_id');

    const { data: updated, error: e2 } = await this.sb.client
      .from('canal_integracion')
      .update({ business_account_id, phone_number_id })
      .eq('id', canalId)
      .select('*')
      .single();
    if (e2) throw e2;

    return { ok: true, channel: updated };
  }
}
