import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { cloudinary, ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_SIZE_BYTES } from "@/lib/uploads";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autenticato." }, { status: 401 });
  }

  const ip = getClientIp(req);
  if (!rateLimit(`upload:${session.user.id}:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "Troppe richieste. Riprova tra qualche minuto." }, { status: 429 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Nessun file ricevuto." }, { status: 400 });
  }

  if (!ALLOWED_UPLOAD_TYPES[file.type]) {
    return NextResponse.json({ error: "Formato immagine non supportato (usa JPG, PNG o WEBP)." }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return NextResponse.json({ error: "Il file supera i 5 MB." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "slabok", resource_type: "image" },
        (error, uploadResult) => {
          if (error || !uploadResult) return reject(error);
          resolve(uploadResult as { secure_url: string });
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({ url: result.secure_url }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Errore durante il caricamento della foto. Riprova." }, { status: 502 });
  }
}
