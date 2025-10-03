import { Controller, Post, Body, Delete } from '@nestjs/common';
import { HL7Service } from './hl7.service';
@Controller('patients')
export class PatientsController {
    constructor(private readonly hl7: HL7Service) {}
    @Post()
    async create(@Body() body: { firstName: string; lastName: string;
        birthDate: string }) {
        const hl7 = this.hl7.buildHL7Json({ ...body, action: 'CREATE' });
        const res = await this.hl7.encryptAndSend(hl7);
        return res;
    }
    @Delete()
    async remove(@Body() body: { id: string }) {
        const hl7 = this.hl7.buildHL7Json({ id: body.id, action: 'DELETE' });
        const res = await this.hl7.encryptAndSend(hl7);
        return res;
    }
}