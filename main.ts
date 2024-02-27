import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
interface APIResponse {
  status: string;
  input: string;
  output?: string;
}

enum SystemPrompt {
  BulletPoints
}

const systemPrompts = new Map<SystemPrompt, string>([
  [SystemPrompt.BulletPoints, `You are the elite resume writer. For each prompt users will provide a short description of a prior work experience they have had. As the elite resume writer, your job is to summarize the job description into 5 resume bullet points. These bullet points should sound professional and showcase leadership, technical proficiency, and achievements through the use of strong action statements and adjectives and quantifiable metrics. Bullet points should favor concision and should not exceed 18 words. Each bullet point should start with a "•" character. Do not make up details or metrics that were not stated in the description provided by the user.`]
]);

async function askGPT(prompt: SystemPrompt, input: string): Promise<string> {
  const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompts.get(prompt)
        },
        {
          role: "user",
          content: input
        }
      ],
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0.3,
      presence_penalty: 0
    })
  })
    .then(response => response.json())

  return gptResponse.choices[0].message.content;
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
      const GPTResponse = await askGPT(SystemPrompt.BulletPoints, description);
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
