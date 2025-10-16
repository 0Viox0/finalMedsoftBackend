import { Controller, Post, Req, Body } from "@nestjs/common";
import { HL7Service } from "./hl7.service";

@Controller("hl7")
export class HL7Controller {
  constructor(private readonly hl7Service: HL7Service) {}

  @Post()
  async receive(@Req() req: any, @Body() body: any) {
    let hl7Text: string | null = null;

    if (typeof body === "string") {
      hl7Text = body;
    } else if (req && req.rawBody && typeof req.rawBody === "string") {
      hl7Text = req.rawBody;
    } else if (body && typeof body.payload === "string") {
      hl7Text = body.payload;
    } else if (body && Object.keys(body).length > 0) {
      hl7Text = JSON.stringify(body);
    }

    if (!hl7Text) {
      return { ok: false, reason: "no HL7 text found in request" };
    }

    console.log("Incoming HL7 (raw text):\n", hl7Text);

    try {
      const parsed = this.hl7Service.parseHL7Text(hl7Text);
      console.log("Parsed HL7 object:", parsed);

      const result = await this.hl7Service.processHL7(parsed);
      return result;
    } catch (err) {
      console.error("Error processing HL7:", err);
      return {
        ok: false,
        reason: "processing error",
        error: err?.message || String(err),
      };
    }
  }
}
