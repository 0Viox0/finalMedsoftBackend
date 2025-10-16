import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import * as fs from "fs";
import * as bodyParser from "body-parser";

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync(join(__dirname, "..", "..", "certs", "server.key")),
    cert: fs.readFileSync(join(__dirname, "..", "..", "certs", "server.crt")),
  };

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions,
  });

  app.use(
    bodyParser.text({
      type: ["text/*", "application/hl7-v2", "application/text"],
    }),
  );
  app.use(bodyParser.json());

  app.enableCors({
    origin: true,
  });

  app.useStaticAssets(join(__dirname, "..", "public"));

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(
    `Reception service (HTTPS) listening on https://localhost:${port}`,
  );
}

bootstrap();
