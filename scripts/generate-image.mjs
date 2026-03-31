import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const DEFAULT_PROVIDER = "suxi";
const DEFAULT_MODEL = "grok-4.1-image";
const DEFAULT_SIZE = "512x512";
const SIZE_PRESETS = {
  gem: "512x512",
  item: "384x384",
  boss: "384x384",
  ui: "512x512",
};

function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      result[key] = true;
      continue;
    }
    result[key] = next;
    i += 1;
  }
  return result;
}

async function readJSON(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

function getGlobalConfigPath() {
  return path.join(os.homedir(), ".config", "opencode", "opencode.json");
}

async function loadProviderConfig(providerID = DEFAULT_PROVIDER) {
  const config = await readJSON(getGlobalConfigPath());
  const provider = config?.provider?.[providerID];
  if (!provider) throw new Error(`Provider '${providerID}' not found in global opencode.json`);

  const baseURL = provider?.options?.baseURL;
  let apiKey = provider?.options?.apiKey;
  if (typeof apiKey === "string") {
    const match = apiKey.match(/^\{env:([^}]+)\}$/);
    if (match) apiKey = process.env[match[1]];
  }

  if (!baseURL) throw new Error(`Provider '${providerID}' missing baseURL`);
  if (!apiKey) throw new Error(`Provider '${providerID}' missing apiKey`);

  return { providerID, baseURL, apiKey };
}

function ensureDataBuffer(payload) {
  if (!payload) throw new Error("Empty image payload");
  if (payload.startsWith("data:")) {
    const [, meta, content] = payload.match(/^data:([^;]+);base64,(.+)$/) || [];
    if (!content) throw new Error("Invalid data URL image payload");
    const ext = meta?.includes("webp") ? "webp" : meta?.includes("jpeg") || meta?.includes("jpg") ? "jpg" : "png";
    return { buffer: Buffer.from(content, "base64"), ext };
  }
  return { buffer: Buffer.from(payload, "base64"), ext: "png" };
}

async function fetchToBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image URL: ${res.status} ${res.statusText}`);
  const contentType = res.headers.get("content-type") || "image/png";
  const ext = contentType.includes("webp") ? "webp" : contentType.includes("jpeg") || contentType.includes("jpg") ? "jpg" : "png";
  return { buffer: Buffer.from(await res.arrayBuffer()), ext };
}

async function generateImage({ prompt, size = DEFAULT_SIZE, model = DEFAULT_MODEL, provider = DEFAULT_PROVIDER, output }) {
  if (!prompt) throw new Error("Missing --prompt");
  const { baseURL, apiKey, providerID } = await loadProviderConfig(provider);
  const response = await fetch(`${baseURL.replace(/\/$/, "")}/images/generations`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt,
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

  let fileData;
  if (first.b64_json) fileData = ensureDataBuffer(first.b64_json);
  else if (first.url) fileData = await fetchToBuffer(first.url);
  else throw new Error(`Unsupported image response shape: ${JSON.stringify(first).slice(0, 400)}`);

  const outputPath = output
    ? path.resolve(output)
    : path.resolve("assets", "generated", `image-${Date.now()}.${fileData.ext}`);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, fileData.buffer);

  return {
    ok: true,
    provider: providerID,
    model,
    size,
    outputPath,
  };
}

function resolveSize(args) {
  if (args.size) return args.size;
  if (args.kind && SIZE_PRESETS[args.kind]) return SIZE_PRESETS[args.kind];
  return DEFAULT_SIZE;
}

const args = parseArgs(process.argv.slice(2));

generateImage({
  prompt: args.prompt,
  size: resolveSize(args),
  model: args.model,
  provider: args.provider,
  output: args.output,
})
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
  })
  .catch((error) => {
    console.error(JSON.stringify({ ok: false, error: String(error?.message || error) }, null, 2));
    process.exit(1);
  });
