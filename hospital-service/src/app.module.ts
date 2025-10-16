import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HL7Controller } from "./hl7/hl7.controller";
import { HL7Service } from "./hl7/hl7.service";
import { PatientsService } from "./patients/patients.service";
import { Patient } from "./patients/patient.entity";
import { Last10Gateway } from "./ws/last10.gateway";
import { EventEmitterModule } from "@nestjs/event-emitter";

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: process.env.DATABASE_FILE || "./data.sqlite",
      entities: [Patient],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Patient]),
  ],
  controllers: [HL7Controller],
  providers: [HL7Service, PatientsService, Last10Gateway],
})
export class AppModule {}
