import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { tool } from "@opencode-ai/plugin";

const DEFAULT_PROVIDER = "suxi";
const DEFAULT_MODEL = "sora-image";
const DEFAULT_SIZE = "512x512";
const SIZE_PRESETS = {
  gem: "512x512",
  item: "384x384",
  boss: "384x384",
  ui: "512x512",
};

async function readJSON(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function loadProviderConfig(providerID = DEFAULT_PROVIDER) {
  const configPath = path.join(os.homedir(), ".config", "opencode", "opencode.json");
  const config = await readJSON(configPath);
  const provider = config?.provider?.[providerID];
  if (!provider) throw new Error(`Provider '${providerID}' not found in ${configPath}`);

  const baseURL = provider?.options?.baseURL;
  let apiKey = provider?.options?.apiKey;
  if (typeof apiKey === "string") {
    const match = apiKey.match(/^\{env:([^}]+)\}$/);
    if (match) apiKey = process.env[match[1]];
  }
  if (!baseURL) throw new Error(`Provider '${providerID}' missing baseURL`);
  if (!apiKey) throw new Error(`Provider '${providerID}' missing apiKey`);
  return { baseURL, apiKey, providerID, configPath };
}

function parseImagePayload(payload) {
  if (!payload) throw new Error("Empty image payload");
  if (payload.startsWith("data:")) {
    const [, mime, content] = payload.match(/^data:([^;]+);base64,(.+)$/) || [];
    if (!content) throw new Error("Invalid data URL image payload");
    const ext = mime?.includes("webp") ? "webp" : mime?.includes("jpeg") || mime?.includes("jpg") ? "jpg" : "png";
    return { buffer: Buffer.from(content, "base64"), ext };
  }
  return { buffer: Buffer.from(payload, "base64"), ext: "png" };
}

async function fetchURLBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image URL: ${res.status} ${res.statusText}`);
  const contentType = res.headers.get("content-type") || "image/png";
  const ext = contentType.includes("webp") ? "webp" : contentType.includes("jpeg") || contentType.includes("jpg") ? "jpg" : "png";
  return { buffer: Buffer.from(await res.arrayBuffer()), ext };
}

export const ImageGenerationPlugin = async () => {
  return {
    tool: {
      generate_image: tool({
        description: "Generate an image through the suxi provider and save it locally",
        args: {
          prompt: tool.schema.string().describe("Image generation prompt"),
          size: tool.schema.string().optional().describe("Image size like 1024x1024"),
          kind: tool.schema.string().optional().describe("Asset kind preset: gem, item, boss, ui"),
          model: tool.schema.string().optional().describe("Model ID, defaults to sora-image"),
          provider: tool.schema.string().optional().describe("Provider ID, defaults to suxi"),
          output: tool.schema.string().optional().describe("Optional output file path"),
        },
        async execute(args) {
          const { baseURL, apiKey, providerID, configPath } = await loadProviderConfig(args.provider || DEFAULT_PROVIDER);
          const model = args.model || DEFAULT_MODEL;
          const size = args.size || SIZE_PRESETS[args.kind] || DEFAULT_SIZE;

          const response = await fetch(`${baseURL.replace(/\/$/, "")}/images/generations`, {
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              prompt: args.prompt,
              size,
              response_format: "b64_json",
            }),
          });

          const text = await response.text();
          let json;
          try {
            json = JSON.parse(text);
          } catch {
            throw new Error(`Image API returned non-JSON response: ${text.slice(0, 400)}`);
          }
          if (!response.ok) {
            throw new Error(`Image API error ${response.status}: ${JSON.stringify(json).slice(0, 600)}`);
          }

          const first = json?.data?.[0];
          if (!first) throw new Error(`Image API returned no data: ${JSON.stringify(json).slice(0, 600)}`);
          const fileData = first.b64_json ? parseImagePayload(first.b64_json) : first.url ? await fetchURLBuffer(first.url) : null;
          if (!fileData) throw new Error(`Unsupported image response shape: ${JSON.stringify(first).slice(0, 400)}`);

          const outputPath = args.output
            ? path.resolve(args.output)
            : path.resolve("assets", "generated", `image-${Date.now()}.${fileData.ext}`);
          await fs.mkdir(path.dirname(outputPath), { recursive: true });
          await fs.writeFile(outputPath, fileData.buffer);

          return JSON.stringify({
            ok: true,
            provider: providerID,
            model,
            size,
            outputPath,
            configPath,
          }, null, 2);
        },
      }),
    },
  };
};
