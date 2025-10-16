import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Patient } from "./patient.entity";
import { v4 as uuidv4 } from "uuid";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient) private repo: Repository<Patient>,
    private eventEmitter: EventEmitter2,
  ) {}

  async last10() {
    return this.repo
      .createQueryBuilder("p")
      .orderBy("p.createdAt", "DESC")
      .limit(10)
      .getMany();
  }

  async createFromHL7(pid: any) {
    const id = pid.id || uuidv4();

    const p = this.repo.create({
      id,
      firstName: pid.firstName,
      lastName: pid.lastName,
      birthDate: pid.birthDate,
    });

    console.log(p);
    await this.repo.save(p);

    this.eventEmitter.emit("patients.updated", this.last10());

    return p;
  }

  async deleteById(id: string) {
    const res = await this.repo.delete(id);

    this.eventEmitter.emit("patients.updated", this.last10());

    return res.affected > 0;
  }
}
