/** LaMa trên Replicate (allenhooo/lama). Input image + mask (URI), output URI ảnh PNG. */
export const LAMA_VERSION = "cdac78a1bec5b23c07fd29692fb70baa513ea403a39e643c48ec5edadb15fe72";

type Prediction = {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output?: string | string[] | null;
  error?: string | null;
  urls?: { get?: string };
};

export async function runLama(
  input: { image: string; mask: string },
  deps: { token: string; fetchFn?: typeof fetch; pollIntervalMs?: number; sleep?: (ms: number) => Promise<void> },
): Promise<string> {
  const fetchFn = deps.fetchFn ?? fetch;
  const sleep = deps.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const headers = { Authorization: `Bearer ${deps.token}`, "Content-Type": "application/json", Prefer: "wait=60" };

  const read = async (res: Response): Promise<Prediction> => {
    if (!res.ok) throw new Error(`Replicate ${res.status}: ${await res.text()}`);
    return (await res.json()) as Prediction;
  };

  let p = await read(await fetchFn("https://api.replicate.com/v1/predictions", {
    method: "POST", headers, body: JSON.stringify({ version: LAMA_VERSION, input }),
  }));
  while (p.status === "starting" || p.status === "processing") {
    if (!p.urls?.get) throw new Error("Replicate không trả urls.get");
    await sleep(deps.pollIntervalMs ?? 1000);
    p = await read(await fetchFn(p.urls.get, { headers: { Authorization: `Bearer ${deps.token}` } }));
  }
  if (p.status !== "succeeded") throw new Error(p.error ?? `Replicate ${p.status}`);
  const out = Array.isArray(p.output) ? p.output[0] : p.output;
  if (!out) throw new Error("Replicate không trả ảnh");
  return out;
}
