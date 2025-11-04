import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyXHubSignature256 } from '../../utils/crypto';

@Injectable()
export class MetaWebhookSignatureGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: any = context.switchToHttp().getRequest();
    const buf: Buffer = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
    const header = req.headers['x-hub-signature-256'] as string | undefined;
    const secret = this.config.get<string>('META_APP_SECRET')!;
    const ok = verifyXHubSignature256(secret, buf, header);
    if (!ok) throw new UnauthorizedException('Invalid signature (Meta)');
    return true;
  }
}
