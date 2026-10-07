import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-middleware";
import { handleApiError } from "@/lib/api-error";
import { z } from "zod";

const addressSchema = z.object({
  _id: z.string().optional(),
  label: z.string().optional().default("Home"),
  address: z.string().min(3, "Address is required"),
  city: z.string().optional().default("Noida"),
  state: z.string().optional().default("Uttar Pradesh"),
  pincode: z.string().min(6, "Valid 6-digit pincode is required"),
  isDefault: z.boolean().optional().default(false),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const user = await User.findById(authUser.userId).select("savedAddresses").lean();
    if (!user) return errorResponse("User not found", 404);

    return successResponse(user.savedAddresses || []);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const body = await request.json();
    const validated = addressSchema.parse(body);

    const user = await User.findById(authUser.userId);
    if (!user) return errorResponse("User not found", 404);

    if (!user.savedAddresses) {
      user.savedAddresses = [];
    }

    if (validated.isDefault) {
      user.savedAddresses.forEach((addr: any) => {
        addr.isDefault = false;
      });
    }

    // Check if an address with the same address string or _id already exists
    const existingIndex = user.savedAddresses.findIndex(
      (a: any) =>
        (validated._id && a._id?.toString() === validated._id) ||
        a.address.toLowerCase().trim() === validated.address.toLowerCase().trim()
    );

    if (existingIndex >= 0) {
      user.savedAddresses[existingIndex] = {
        ...user.savedAddresses[existingIndex],
        ...validated,
      };
    } else {
      user.savedAddresses.unshift(validated);
    }

    await user.save();

    return successResponse(user.savedAddresses, "Address saved successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get("addressId") || searchParams.get("id");
    const addressQuery = searchParams.get("address");

    let bodyData: any = {};
    if (!addressId && !addressQuery) {
      try {
        bodyData = await request.json();
      } catch {
        // ignore JSON parse error if body is empty
      }
    }

    const targetId = addressId || bodyData.addressId || bodyData.id;
    const targetAddress = addressQuery || bodyData.address;

    if (!targetId && !targetAddress) {
      return errorResponse("Address identifier or address string required", 400);
    }

    const user = await User.findById(authUser.userId);
    if (!user) return errorResponse("User not found", 404);

    if (!user.savedAddresses || user.savedAddresses.length === 0) {
      return successResponse([], "No saved addresses to delete");
    }

    user.savedAddresses = user.savedAddresses.filter((a: any) => {
      if (targetId && a._id && a._id.toString() === targetId) {
        return false;
      }
      if (targetAddress && a.address.toLowerCase().trim() === targetAddress.toLowerCase().trim()) {
        return false;
      }
      return true;
    });

    await user.save();

    return successResponse(user.savedAddresses, "Address deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
