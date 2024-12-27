import { NextResponse, NextRequest } from "next/server";
import { adminSDK } from "@/config/admin";

// POST Request Handler
export async function POST(req: NextRequest) {
  try {
    // Parse incoming data from request
    const body = await req.json();

    const { code } = body;
    if (!code) {
      return NextResponse.json({
        success: false,
        error: "Missing pairing code",
      });
    }
    console.log('code', code);
    const codeDoc = await adminSDK
      .firestore()
      .collection("pairingCodes")
      .doc(code)
      .get();

    if (!codeDoc.exists) {
      return NextResponse.json({
        success: false,
        message: "Invalid pairing code",
      });
    }

    const codeData = codeDoc.data();
    const now = Date.now();

    if (codeData?.used) {
      throw new Error("Pairing code already used");
    }

    if (codeData?.expiresAt < now) 
        throw new Error("Pairing code expired");
  

    await adminSDK.firestore().collection("pairingCodes").doc(code).update({
      used: true,
      usedAt: now,
    });

    return NextResponse.json({
      success: true,
      code: codeData,
      userId: codeData?.userId,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json({
      success: false,
      error: error.message || "An error occurred",
    });
  }
}
