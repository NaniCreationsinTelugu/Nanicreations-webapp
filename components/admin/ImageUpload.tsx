"use client";

import { IKContext, IKUpload } from "imagekitio-react";
import { useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    folder?: string; // ImageKit folder path, defaults to /products
}

const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "public_skFkaeBcWHMrmmSPlx+BgvDDMy4=";
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/nanicreations";

export default function ImageUpload({ value, onChange, folder = "/products" }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");

    const onError = (err: any) => {
        console.error("Upload error:", err);
        setUploadError(err.message || "Upload failed");
        setUploading(false);
    };

    const onSuccess = (res: any) => {
        console.log("Upload success:", res);
        onChange(res.url);
        setUploading(false);
        setUploadError("");
    };

    const onUploadStart = () => {
        setUploading(true);
        setUploadError("");
    };

    const authenticator = async () => {
        try {
            const response = await fetch("/api/admin/imagekit-auth");

            if (!response.ok) {
                throw new Error("Failed to authenticate");
            }

            const data = await response.json();
            const { signature, expire, token } = data;
            return { signature, expire, token };
        } catch (error: any) {
            throw new Error(`Authentication request failed: ${error.message}`);
        }
    };

    const removeImage = () => {
        onChange("");
    };

    return (
        <div className="space-y-4">
            <IKContext
                publicKey={publicKey}
                urlEndpoint={urlEndpoint}
                authenticator={authenticator}
            >
                {value ? (
                    <div className="relative w-full h-64 border rounded-lg overflow-hidden">
                        <Image
                            src={value}
                            alt="Uploaded image"
                            fill
                            className="object-cover"
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={removeImage}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        {uploading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Uploading...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Upload an image</p>
                                    <p className="text-xs text-muted-foreground">
                                        Click to select a file
                                    </p>
                                </div>
                                <IKUpload
                                    fileName="image.jpg"
                                    onError={onError}
                                    onSuccess={onSuccess}
                                    onUploadStart={onUploadStart}
                                    className="opacity-0 absolute inset-0 cursor-pointer"
                                    folder={folder}
                                />
                            </div>
                        )}
                    </div>
                )}
            </IKContext>
            {uploadError && (
                <p className="text-sm text-destructive">{uploadError}</p>
            )}
        </div>
    );
}
