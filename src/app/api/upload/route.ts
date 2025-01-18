import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (
        pathname: string,
        clientPayload: string | null
      ) => {
        return {
          tokenPayload: JSON.stringify({}),
          validUntil: Date.now() + 3 * 60 * 1000,
        };
      },
      // async to match Vercel's function signature
      // eslint-disable-next-line @typescript-eslint/require-await
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // ⚠️ This will not work on `localhost`

        // TODO: implement auto-zipping for bulk download
        console.log("blob upload completed", blob, tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 } // The webhook will retry 5 times waiting for a 200
    );
  }
}
