import { Module } from "@nestjs/common";
import { PatientsController } from "./patients/patients.controller";
import { HL7Service } from "./patients/hl7.service";

@Module({
  imports: [],
  controllers: [PatientsController],
  providers: [HL7Service],
})
export class AppModule {}
