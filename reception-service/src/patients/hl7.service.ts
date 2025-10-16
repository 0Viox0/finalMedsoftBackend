import { Injectable } from "@nestjs/common";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import dotenv from "dotenv";

@Injectable()
export class HL7Service {
  private hospitalUrl: string;

  constructor() {
    const envPath = path.resolve(process.cwd(), ".env");
    dotenv.config({ path: envPath });

    this.hospitalUrl = process.env.HOSPITAL_URL || "https://localhost:3001/hl7";
  }

  buildHL7v2(payload: {
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    id?: string;
    action: "CREATE" | "DELETE" | "GET";
  }): string {
    const messageControlId = uuidv4();
    const pidId = payload.id || uuidv4();
    const msgType = payload.action === "CREATE" ? "ADT^A01" : "ADT^A08";
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 14);

    const mshSegment = [
      "MSH",
      "^~\\&",
      "Reception",
      "FrontDesk",
      "HospitalSystem",
      "Main",
      timestamp,
      "",
      msgType,
      messageControlId,
      "P",
      "2.3",
    ].join("|");

    const pidSegment = [
      "PID",
      "1",
      "",
      pidId,
      "",
      payload.lastName || "",
      payload.firstName || "",
      payload.birthDate || "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      payload.action,
    ].join("|");

    const hl7Message = `${mshSegment}\r${pidSegment}\r`;
    console.log("HL7v2 message to send:\n", hl7Message);
    return hl7Message;
  }

  async sendHL7(hl7Message: string) {
    const https = require("https");
    const agent = new https.Agent({
      rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "0",
    });

    const res = await axios.post(this.hospitalUrl, hl7Message, {
      headers: { "Content-Type": "text/plain" },
      httpsAgent: agent,
    });

    return res.data;
  }
}
