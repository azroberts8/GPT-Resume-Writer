interface GPTQueryParams {
  systemPrompt: string;
  userInput: string;
  settings?: {
    model?: string,
    temperature?: number,
    max_tokens?: number,
    top_p?: number,
    frequency_penalty?: number,
    presence_penalty?: number
  }
}

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const GPTQuery = async ({ systemPrompt, userInput, settings = {
  model: "gpt-3.5-turbo",
  temperature: 1,
  max_tokens: 256,
  top_p: 1,
  frequency_penalty: 0.3,
  presence_penalty: 0
} }: GPTQueryParams): Promise<string> => {
  const GPTResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      ...settings,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userInput }
      ]
    })
  }).then(res => res.json())
  return GPTResponse.choices[0].message.content;
}

export { GPTQuery }