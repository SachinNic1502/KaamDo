import * as ImagePicker from "expo-image-picker";
import { api } from "../api/client";
import * as SecureStore from "expo-secure-store";

const CLOUDINARY_URL = process.env.EXPO_PUBLIC_CLOUDINARY_URL || "";
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "kaamdo";

export async function pickAndUploadImage(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) return null;

  const uri = result.assets[0].uri;
  return uploadToCloudinary(uri);
}

export async function uploadToCloudinary(uri: string): Promise<string> {
  if (!CLOUDINARY_URL) throw new Error("Image upload is not configured");

  const formData = new FormData();
  const filename = uri.split("/").pop() || "photo.jpg";
  const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
  formData.append("file", { uri, name: filename, type: `image/${ext}` } as any);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(CLOUDINARY_URL, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.secure_url;
}

export async function uploadMultipleImages(uris: string[]): Promise<string[]> {
  const results = await Promise.all(uris.map((uri) => uploadToCloudinary(uri)));
  return results;
}
