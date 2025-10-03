import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { PatientsService } from '../patients/patients.service';
import path from "path";
import dotenv from 'dotenv';
@Injectable()
export class HL7Service {
    private sharedKey: Buffer;
    constructor(private readonly patients: PatientsService) {

        const envPath = path.resolve(process.cwd(), '.env');
        const result = dotenv.config({ path: envPath });

        const keyBase64 = process.env.SHARED_AES_KEY || '';
        if (!keyBase64) throw new Error('SHARED_AES_KEY is required');
        this.sharedKey = Buffer.from(keyBase64, 'base64');
    }
    decryptPayload(payloadBase64: string, iv: Buffer | null) {
        const buf = Buffer.from(payloadBase64, 'base64');
        const tag = buf.slice(buf.length - 16);
        const encrypted = buf.slice(0, buf.length - 16);
        if (!iv) throw new Error('Missing IV');
        const decipher = crypto.createDecipheriv('aes-256-gcm', this.sharedKey,
            iv);
        decipher.setAuthTag(tag);
        const decrypted = Buffer.concat([decipher.update(encrypted),
            decipher.final()]);
        return JSON.parse(decrypted.toString('utf8'));
    }
    async processHL7(hl7obj: any) {
        const action = hl7obj?.PID?.action;
        if (action === 'CREATE') {
            console.log(hl7obj)
            const p = await this.patients.createFromHL7(hl7obj.PID);
            await this.patients.notifyLast10();
            return { ok: true, id: p.id };
        } else if (action === 'DELETE') {
            const id = hl7obj?.PID?.id;
            const ok = await this.patients.deleteById(id);
            await this.patients.notifyLast10();
            return { ok };
        }
        return { ok: false, reason: 'unknown action' };
    }
}