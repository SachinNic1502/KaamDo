import * as ImagePicker from "expo-image-picker";
import { api } from "./api";

export async function pickImage(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    return result.assets[0].uri;
  }
  return null;
}

export async function takePhoto(): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 0.8,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    return result.assets[0].uri;
  }
  return null;
}

export async function uploadImage(uri: string, folder = "general"): Promise<string> {
  const filename = uri.split("/").pop() || "upload.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image/jpeg`;

  const formData = new FormData();
  formData.append("file", {
    uri,
    name: filename,
    type,
  } as any);
  formData.append("folder", folder);

  const res = await api.upload<{ url: string; success: boolean }>("/api/upload", formData);
  return res.url;
}
