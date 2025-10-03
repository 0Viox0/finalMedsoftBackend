import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import path from "path";
import dotenv from "dotenv";
@Injectable()
export class HL7Service {
    private sharedKey: Buffer;
    private hospitalUrl: string;
    constructor() {

        const envPath = path.resolve(process.cwd(), '.env');
        const result = dotenv.config({ path: envPath });

        const keyBase64 = process.env.SHARED_AES_KEY || '';
        if (!keyBase64) throw new Error('SHARED_AES_KEY is required');
        this.sharedKey = Buffer.from(keyBase64, 'base64');
        this.hospitalUrl = process.env.HOSPITAL_URL || 'https://localhost:3001/hl7';
    }
    buildHL7Json(payload: { firstName?: string; lastName?: string; birthDate?:
            string; id?: string; action: 'CREATE'|'DELETE' }) {
        const messageControlId = uuidv4();
        const pidId = payload.id || uuidv4();
        const msgType = payload.action === 'CREATE' ? 'ADT^A01' : 'ADT^A08';
        const hl7 = {
            MSH: {
                SendingApp: 'Reception',
                MessageType: msgType,
                MessageControlId: messageControlId,
                Timestamp: new Date().toISOString(),
            },
            PID: {
                id: pidId,
                firstName: payload.firstName || '',
                lastName: payload.lastName || '',
                birthDate: payload.birthDate || '',
                action: payload.action,
            },
        };
        console.log(hl7)
        return hl7;
    }
    async encryptAndSend(hl7obj: any) {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv('aes-256-gcm', this.sharedKey, iv);
        const plaintext = Buffer.from(JSON.stringify(hl7obj), 'utf8');
        const encrypted = Buffer.concat([cipher.update(plaintext),
            cipher.final()]);
        const tag = cipher.getAuthTag();
        const body = Buffer.concat([encrypted, tag]).toString('base64');
        const https = require('https');
        const agent = new https.Agent({ rejectUnauthorized:
                process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0' });
        const res = await axios.post(this.hospitalUrl, { payload: body }, {
            headers: { 'x-iv': iv.toString('base64'), 'Content-Type': 'application/json' }, httpsAgent: agent,
            });
        return res.data;
    }
    }
