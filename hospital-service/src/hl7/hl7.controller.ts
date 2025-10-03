import { Controller, Post, Req, Headers } from '@nestjs/common';
import { HL7Service } from './hl7.service';
@Controller('hl7')
export class HL7Controller {
    constructor(private readonly hl7Service: HL7Service) {}
    @Post()
    async receive(@Req() req, @Headers('x-iv') ivBase64: string) {
        const payload = req.body?.payload;
        if (!payload) return { ok: false, reason: 'no payload' };
        const iv = ivBase64 ? Buffer.from(ivBase64, 'base64') : null;
        const hl7obj = this.hl7Service.decryptPayload(payload, iv);
        console.log('Incoming HL7 (raw JSON):', JSON.stringify(hl7obj));
        const result = await this.hl7Service.processHL7(hl7obj);
        return result;
    }
}
