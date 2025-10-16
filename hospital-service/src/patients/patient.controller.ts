import { Controller, Get } from "@nestjs/common";
import { PatientsService } from "./patients.service";

@Controller("patients")
export class PatientController {
  constructor(private readonly patients: PatientsService) {}

  @Get()
  getPatients() {
    console.log("here");
    return this.patients.last10();
  }
}
