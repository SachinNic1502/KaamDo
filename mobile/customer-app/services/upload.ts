import * as SecureStore from "./storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export async function uploadImage(uri: string): Promise<string> {
  const token = await SecureStore.getItemAsync("token");

  const formData = new FormData();
  const filename = uri.split("/").pop() || "upload.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";

  formData.append("file", {
    uri,
    name: filename,
    type,
  } as any);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Upload failed");
  }

  return data.data?.url || data.url;
}

export async function uploadMultipleImages(uris: string[]): Promise<string[]> {
  const uploadPromises = uris.map((uri) => uploadImage(uri));
  return Promise.all(uploadPromises);
}
