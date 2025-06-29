import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid"; // Import UUID to generate unique filenames

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(request: NextRequest) {
  const { fileType, contentType } = await request.json();

  // A more robust way to get the file extension
  const fileExtension = contentType.split("/")[1];
  const uniqueFileName = `${uuidv4()}.${fileExtension}`;

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `uploads/${uniqueFileName}`, // Generate a unique key with extension
    ContentType: contentType,
  };

  try {
    const url = await getSignedUrl(s3Client, new PutObjectCommand(params), {
      expiresIn: 3600, // URL expires in 1 hour
    });

    return NextResponse.json({
      url,
      key: params.Key,
    });
  } catch (error) {
    console.error("Error generating signed URL", error);
    return NextResponse.json(
      { error: "Error generating signed URL" },
      { status: 500 },
    );
  }
}
