import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { PatientsService } from "../patients/patients.service";
import { Patient } from "../patients/patient.entity";
import { OnEvent } from "@nestjs/event-emitter";

@WebSocketGateway({ cors: { origin: "*" }, namespace: "/" })
export class Last10Gateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly patientsService: PatientsService) {}

  @SubscribeMessage("requestAllPatients")
  async handleRequestAllPatients() {
    this.emitLast10(await this.patientsService.last10());
  }

  @OnEvent("patients.updated")
  async handlePatientsUpdated(patients: Patient[]) {
    this.emitLast10(await this.patientsService.last10());
  }

  emitLast10(list: Patient[]) {
    this.server.emit("last10", list);
  }
}

