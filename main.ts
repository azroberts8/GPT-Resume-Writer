import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { GPTQuery } from "./core.ts";

interface APIResponse {
  status: string;
  input: string;
  output?: string;
}

const router = new Router();
router
  .post("/job", async (ctx) => {
    const { description } = await ctx.request.body({ type: 'json' }).value;

    const response: APIResponse = {
      status: "pending",
      input: description
    };

    if(typeof description === 'string') {
      const GPTResponse = await GPTQuery({
        systemPrompt: `You are the elite resume writer. For each prompt users will provide a short description of a prior work experience they have had. As the elite resume writer, your job is to summarize the job description into 5 resume bullet points. These bullet points should sound professional and showcase leadership, technical proficiency, and achievements through the use of strong action statements and adjectives and quantifiable metrics. Bullet points should favor concision and should not exceed 18 words. Each bullet point should start with a "•" character. Do not make up details or metrics that were not stated in the description provided by the user.`,
        userInput: description
      });
      response.status = "success";
      response.output = GPTResponse;
    } else {
      response.status = "failed";
      response.output = "'description' property missing or incorrect datatype";
    }

    ctx.response.body = JSON.stringify(response);
  })

const app = new Application();
app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
