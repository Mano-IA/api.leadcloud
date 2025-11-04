import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../common/supabase';

@Injectable()
export class ConversationsService {
  private logger = new Logger('ConversationsService');
  constructor(private sb: SupabaseService) {}

  async findChannelByPhoneNumberId(phone_number_id: string) {
    const { data, error } = await this.sb.client
      .from('canal_integracion')
      .select('*')
      .eq('tipo', 'WhatsApp')
      .eq('phone_number_id', phone_number_id)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async findChannelByPageId(page_id: string) {
    const { data, error } = await this.sb.client
      .from('canal_integracion')
      .select('*')
      .eq('page_id', page_id)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async upsertContactByPhone(tenant_id: string, telefono: string, payload: any) {
    const { data: exists, error: e1 } = await this.sb.client
      .from('contactos')
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('telefono', telefono)
      .limit(1)
      .maybeSingle();
    if (e1) throw e1;
    if (exists) return exists;
    const { data, error } = await this.sb.client
      .from('contactos')
      .insert([{ tenant_id, telefono, ...payload }])
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async findOrCreateConversation(tenant_id: string, canal_id: string, contacto_id: string) {
    const { data: list, error: e1 } = await this.sb.client
      .from('conversaciones')
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('contacto_id', contacto_id)
      .eq('canal_id', canal_id)
      .eq('estado', 'Abierta')
      .limit(1)
      .maybeSingle();
    if (e1) throw e1;
    if (list) return list;
    const { data, error } = await this.sb.client
      .from('conversaciones')
      .insert([{ tenant_id, contacto_id, canal_id, estado: 'Abierta' }])
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async createMessage(tenant_id: string, conversacion_id: string, tipo: 'IN'|'OUT', texto: string, raw_json: any) {
    const { data, error } = await this.sb.client
      .from('mensajes')
      .insert([{ tenant_id, conversacion_id, tipo, texto, raw_json }])
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async ensureAutoOpportunity(tenant_id: string, contacto_id: string) {
    const { data: list, error: e1 } = await this.sb.client
      .from('oportunidades')
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('contacto_id', contacto_id)
      .eq('estado', 'Abierta')
      .limit(1)
      .maybeSingle();
    if (e1) throw e1;
    if (list) return list;
    const { data, error } = await this.sb.client
      .from('oportunidades')
      .insert([{
        tenant_id, contacto_id, titulo: 'Nuevo lead automático', pipeline: 'Ventas', etapa: 'Nueva', valor: 0, estado: 'Abierta'
      }])
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  // WhatsApp inbound handler
  async onWhatsAppInbound(payload: any) {
    const change = payload?.entry?.[0]?.changes?.[0];
    const value = change?.value;
    const messages = value?.messages;
    const phoneNumberId = value?.metadata?.phone_number_id;
    if (!messages || !phoneNumberId) return;

    const canal = await this.findChannelByPhoneNumberId(phoneNumberId);
    if (!canal) { this.logger.warn(`No canal for phone_number_id ${phoneNumberId}`); return; }
    const tenant_id = canal.tenant_id;

    for (const msg of messages) {
      const from = msg.from;
      const text = msg.text?.body || msg.button?.text || msg.interactive?.list_reply?.title || '[tipo no soportado]';
      const contacto = await this.upsertContactByPhone(tenant_id, from, {
        nombre: payload?.contacts?.[0]?.profile?.name,
        origen: 'whatsapp',
        auto_pipeline: 'auto_ventas',
      });
      const convo = await this.findOrCreateConversation(tenant_id, canal.id, contacto.id);
      await this.createMessage(tenant_id, convo.id, 'IN', text, msg);
      await this.ensureAutoOpportunity(tenant_id, contacto.id);
    }
  }

  // Meta inbound handler
  async onMetaInbound(payload: any) {
    const entry = payload?.entry?.[0];
    const pageId = entry?.id;
    const messaging = entry?.messaging?.[0];
    if (!pageId || !messaging) return;

    const canal = await this.findChannelByPageId(pageId);
    if (!canal) { this.logger.warn(`No canal for page_id ${pageId}`); return; }
    const tenant_id = canal.tenant_id;

    const senderId = messaging?.sender?.id;
    const text = messaging?.message?.text || messaging?.postback?.title || '[evento no soportado]';

    const { data: contacto, error: e1 } = await this.sb.client
      .from('contactos')
      .insert([{ tenant_id, nombre: 'Contacto Meta', origen: 'meta', psid: senderId }])
      .select('*')
      .single();
    if (e1) throw e1;

    const convo = await this.findOrCreateConversation(tenant_id, canal.id, contacto.id);
    await this.createMessage(tenant_id, convo.id, 'IN', text, messaging);
    await this.ensureAutoOpportunity(tenant_id, contacto.id);
  }
}
