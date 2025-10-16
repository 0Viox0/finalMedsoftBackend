import { Injectable } from "@nestjs/common";
import { PatientsService } from "../patients/patients.service";
import path from "path";
import dotenv from "dotenv";

@Injectable()
export class HL7Service {
  constructor(private readonly patients: PatientsService) {
    const envPath = path.resolve(process.cwd(), ".env");
    dotenv.config({ path: envPath });
  }

  parseHL7Text(message: string) {
    if (!message || typeof message !== "string") return {};

    const lines = message
      .split(/\r?\n|\r/)
      .map((l) => l.trim())
      .filter(Boolean);
    const result: Record<string, any> = {};

    for (const line of lines) {
      const fields = line.split("|");
      const seg = fields[0];

      if (!seg) continue;

      const segObj = { raw: line, fields };

      if (seg === "MSH") {
        result.MSH = {
          ...segObj,
          fieldSeparator: line[3] || "|",
          encodingChars: fields[1] || "",
          sendingApp: fields[2] || "",
          sendingFacility: fields[3] || "",
          receivingApp: fields[4] || "",
          receivingFacility: fields[5] || "",
          timestamp: fields[6] || "",
          messageType: fields[8] || "",
          messageControlId: fields[9] || "",
          version: fields[11] || "",
        };
      } else if (seg === "PID") {
        const id = fields[3] || "";
        const nameField = fields[5] || "";
        let lastName = "",
          firstName = "";

        if (nameField.includes("^")) {
          const [family, given] = nameField.split("^");
          lastName = family || "";
          firstName = given || "";
        } else {
          lastName = nameField;
          firstName = fields[6] || "";
        }

        const action = (fields[fields.length - 1] || "CREATE").toUpperCase();

        result.PID = {
          ...segObj,
          id,
          lastName,
          firstName,
          birthDate: fields[7] || "",
          action,
        };
      } else {
        if (!result[seg]) result[seg] = [];
        result[seg].push(segObj);
      }
    }

    return result;
  }

  async processHL7(hl7objOrText: any) {
    let parsed = hl7objOrText;
    if (typeof hl7objOrText === "string") {
      parsed = this.parseHL7Text(hl7objOrText);
    }

    const pid = parsed?.PID;
    const action = pid?.action;

    if (!pid) {
      return { ok: false, reason: "PID segment not found" };
    }

    if (action === "CREATE") {
      const toCreate = {
        id: pid.id,
        firstName: pid.firstName,
        lastName: pid.lastName,
        birthDate: pid.birthDate,
        raw: pid.raw,
        fields: pid.fields,
      };

      const p = await this.patients.createFromHL7(toCreate);

      return { ok: true, id: p.id };
    } else if (action === "DELETE") {
      const id = pid.id;

      if (!id) return { ok: false, reason: "no id for DELETE" };

      const ok = await this.patients.deleteById(id);

      return { ok };
    } else if (action === "GET") {
      return this.patients.last10();
    }

    return { ok: false, reason: "unknown action" };
  }
}
