import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './patient.entity';
import { v4 as uuidv4 } from 'uuid';
import { Last10Gateway } from '../ws/last10.gateway';
@Injectable()
export class PatientsService {
    constructor(
        @InjectRepository(Patient) private repo: Repository<Patient>,
        private readonly gateway: Last10Gateway,
    ) {}
    async createFromHL7(pid: any) {
        const id = pid.id || uuidv4();
        const p = this.repo.create({ id, firstName: pid.firstName, lastName:
            pid.lastName, birthDate: pid.birthDate });
        console.log(p);
        await this.repo.save(p);
        return p;
    }
    async deleteById(id: string) {
        const res = await this.repo.delete(id);
        return res.affected > 0;
    }
    async last10() {
        return this.repo.createQueryBuilder('p')
            .orderBy('p.createdAt', 'DESC')
            .limit(10)
            .getMany();
    }
    async notifyLast10() {
        const list = await this.last10();
        this.gateway.emitLast10(list);
    }
}
