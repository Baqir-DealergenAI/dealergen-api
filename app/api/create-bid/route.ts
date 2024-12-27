import { NextResponse, NextRequest } from "next/server";
import { adminSDK } from "@/config/admin";

// POST Request Handler
export async function POST(req: NextRequest) {
  try {
    // Parse incoming data from request
    const body = await req.json();
        
    const  bidData = body;

    console.log('bidData', bidData);

    const bidRef = await adminSDK.firestore().collection('bids').add({
        ...bidData,
        status: 'active',
        timestamp:  adminSDK.firestore.FieldValue.serverTimestamp(),
        calculations: {
          delivery: bidData.calculations?.delivery || 0,
          mot: bidData.calculations?.mot || 0,
          service: bidData.calculations?.service || 0,
          cosmetic: bidData.calculations?.cosmetic || 0,
          warrantyAndValet: bidData.calculations?.warrantyAndValet || 0,
          vatAmount: bidData.calculations?.vatAmount || 0,
          desiredNetProfit: bidData.calculations?.desiredNetProfit || 0,
          actualGrossProfit: bidData.calculations?.actualGrossProfit || 0,
          actualNetProfit: bidData.calculations?.actualNetProfit || 0,
          bidPrice: bidData.calculations?.bidPrice || 0
        }
      });
      const batch = adminSDK.firestore().batch();
      const carChunksRef = adminSDK.firestore()
        .collection('qualifiedCars')
        .doc(bidData.userId)
        .collection('carChunks');
      
      const chunks = await carChunksRef.get();

      
      chunks.forEach(doc => {
        const cars = doc.data().cars || [];
        const updatedCars = cars.map((car: any) => {
          if (car.id === bidData.carId) {
            return {
              ...car,
              status: 'bid',
              bidAmount: bidData.calculations.bidPrice,

            };
          }
          return car;
        });
  
        batch.update(doc.ref, { 
          cars: updatedCars,
          updatedAt: adminSDK.firestore.FieldValue.serverTimestamp()
        });
      });
  
      await batch.commit();

    return NextResponse.json({
        success: true,
        // bidId: bidRef.id
    });
     
  }
  catch (error : any) {
    console.log(error);
    return NextResponse.json({
        success: false,
        error: error.message || 'An error occurred'
    });

  }

}