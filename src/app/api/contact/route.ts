import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { sendAdminEmail } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, city, email, gender, age } = body ?? {};

    if (!name || !phone || !city) {
      return NextResponse.json({ error: "Name, phone, and city are required." }, { status: 400 });
    }

    // Save to Firestore first — lead is captured even if email fails
    await adminDb().collection("contact_form_entries").add({
      name,
      phone,
      city,
      email: email || null,
      gender: gender || null,
      age: age ?? null,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Best-effort email notification via Gmail SMTP
    await sendAdminEmail(
      `New Jodohmu inquiry — ${name} (${city})`,
      `
        <h2>New contact submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>City:</strong> ${city}</p>
        <p><strong>Email:</strong> ${email || "Not provided"}</p>
        <p><strong>Gender:</strong> ${gender || "Not provided"}</p>
        <p><strong>Age:</strong> ${age ?? "Not provided"}</p>
      `
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
