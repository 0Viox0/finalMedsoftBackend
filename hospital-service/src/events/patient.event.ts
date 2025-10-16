import { Patient } from "../patients/patient.entity";

export class PatientCreatedEvent {
  constructor(public readonly patient: Patient[]) {}
}

export class PatientsUpdatedEvent {
  constructor(public readonly patients: Patient[]) {}
}
