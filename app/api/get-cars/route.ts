import { NextResponse, NextRequest } from "next/server";
import { adminSDK } from "@/config/admin";

// POST Request Handler
export async function POST(req: NextRequest) {
  try {
    // Parse incoming data from request
    const body = await req.json();
    console.log('body', body);

    const { userId } = body;
    // Fetch all cars for user
    const carsRef = adminSDK
      .firestore()
      .collection("qualifiedCars")
      .doc(userId)
      .collection("carChunks");
    const cars = await carsRef.get();

    const carsData = cars.docs.map((doc) => doc.data().cars).flat();

    return NextResponse.json({
      success: true,
      cars: carsData || [],
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json({
      success: false,
      error: error.message || "An error occurred",
    });
  }
}
