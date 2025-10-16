import { Controller, Post, Body, Delete, Get } from "@nestjs/common";
import { HL7Service } from "./hl7.service";
import axios from "axios";

@Controller("patients")
export class PatientsController {
  private hospitalUrl: string;

  constructor(private readonly hl7: HL7Service) {
    this.hospitalUrl = "https://localhost:3001/patients";
  }

  @Post()
  async create(
    @Body() body: { firstName: string; lastName: string; birthDate: string },
  ) {
    const hl7 = this.hl7.buildHL7v2({ ...body, action: "CREATE" });
    const res = await this.hl7.sendHL7(hl7);

    console.log("result in post: ", res);

    return res;
  }

  @Delete()
  async remove(@Body() body: { id: string }) {
    const hl7 = this.hl7.buildHL7v2({ id: body.id, action: "DELETE" });
    const res = await this.hl7.sendHL7(hl7);

    console.log("result in delete: ", res);

    return res;
  }

  @Get()
  async getPatients() {
    const hl7 = this.hl7.buildHL7v2({ action: "GET" });
    const res = await this.hl7.sendHL7(hl7);

    return res;
  }
}
