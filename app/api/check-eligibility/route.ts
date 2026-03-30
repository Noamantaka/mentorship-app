import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { message: "Email is required." },
        { status: 400 }
      );
    }

    const baseUrl = process.env.CONSULTATION_API_BASE_URL;
    const apiKey = process.env.CONSULTATION_API_KEY;

    if (!baseUrl || !apiKey) {
      return NextResponse.json(
        { message: "Server configuration is missing." },
        { status: 500 }
      );
    }

    const url = new URL("/api/v2/data/consultation-session", baseUrl);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("email", email);

    const response = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            data?.message ||
            data?.error ||
            "Failed to check eligibility.",
        },
        { status: response.status }
      );
    }

    if (data?.message && (!("isEligible" in data) || !("membershipType" in data))) {
      return NextResponse.json(
        { message: data.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      isEligible: data.isEligible,
      isBlocked: data.isBlocked,
      membershipType: data.membershipType,
    });
  } catch {
    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}