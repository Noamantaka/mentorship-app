import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  const SECRET_KEY = process.env.API_SECRET_KEY;
  const API_ENDPOINT = "https://lifedao.io/api/v2/data/consultation-session";

  try {
    const targetUrl = new URL(API_ENDPOINT);
    targetUrl.searchParams.append("key", SECRET_KEY || "");
    targetUrl.searchParams.append("email", email);

    const response = await fetch(targetUrl.toString());
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ message: data.message || "External API Error" }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}