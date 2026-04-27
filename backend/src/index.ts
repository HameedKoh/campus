import { env } from "./config/env";
import { createApp } from "./app";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Campus SmartCare API listening on port ${env.PORT}`);
});
