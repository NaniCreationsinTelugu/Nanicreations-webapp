import { NextResponse } from "next/server";

// ImageKit authentication endpoint for client-side uploads
export async function GET() {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "private_0gefDE/Q6Q726sF9d/+L3Koexsk=";

    if (!privateKey) {
        return NextResponse.json(
            { error: "ImageKit private key not configured" },
            { status: 500 }
        );
    }

    // Generate authentication parameters for ImageKit upload
    const token = Buffer.from(Math.random().toString()).toString("base64").substring(0, 20);
    const expire = Math.floor(Date.now() / 1000) + 2400; // 40 minutes

    // Create signature using HMAC-SHA1
    const crypto = require("crypto");
    const signature = crypto
        .createHmac("sha1", privateKey)
        .update(token + expire)
        .digest("hex");

    return NextResponse.json({
        token,
        expire,
        signature,
    });
}
