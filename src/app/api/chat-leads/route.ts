import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { sendAdminEmail } from "@/lib/mailer";

const clean = (value: unknown, limit: number) =>
  typeof value === "string" ? value.trim().slice(0, limit) : "";

const escapeHtml = (value: string) =>
  value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character] ?? character);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = clean(body.name, 100);
    const phone = clean(body.phone, 40);
    const city = clean(body.city, 100);
    const interest = clean(body.interest, 100);
    const timeline = clean(body.timeline, 100);
    const preferredCallTime = clean(body.preferredCallTime, 100);

    if (!name || !phone || !city || !interest || !timeline || !preferredCallTime) {
      return NextResponse.json({ error: "Please complete every question." }, { status: 400 });
    }

    await adminDb().collection("chat_leads").add({
      name,
      phone,
      city,
      interest,
      timeline,
      preferredCallTime,
      source: "website_chatbot",
      status: "new_lead",
      createdAt: FieldValue.serverTimestamp(),
    });

    try {
      await sendAdminEmail(
        `New chatbot lead - ${name} (${city})`,
        `<h2>New chatbot lead</h2>
         <p><strong>Name:</strong> ${escapeHtml(name)}</p>
         <p><strong>WhatsApp:</strong> ${escapeHtml(phone)}</p>
         <p><strong>City:</strong> ${escapeHtml(city)}</p>
         <p><strong>Interested in:</strong> ${escapeHtml(interest)}</p>
         <p><strong>Marriage timeline:</strong> ${escapeHtml(timeline)}</p>
         <p><strong>Preferred call time:</strong> ${escapeHtml(preferredCallTime)}</p>`
      );
    } catch (emailError) {
      console.error("Chat lead email notification failed:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Chat lead error:", error);
    return NextResponse.json({ error: "We could not save your details." }, { status: 500 });
  }
}
