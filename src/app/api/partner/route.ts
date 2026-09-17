import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { sendAdminEmail } from "@/lib/mailer";

const PARTNER_TYPES = ["faith", "elder", "wedding", "organization", "professional", "individual"] as const;
const ROLES = ["refer", "seminar", "speaker", "venue", "psychology", "background", "spread"] as const;

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

const clean = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = clean(body?.name, 120);
    const phone = clean(body?.phone, 30);
    const city = clean(body?.city, 80);
    const partnerType = clean(body?.partnerType, 30);
    const organization = clean(body?.organization, 160);
    const network = clean(body?.network, 1500);
    const roles = Array.isArray(body?.roles) ? ROLES.filter((role) => body.roles.includes(role)) : [];

    if (!name || !phone || !city || !roles.length || !PARTNER_TYPES.includes(partnerType as (typeof PARTNER_TYPES)[number])) {
      return NextResponse.json({ error: "Name, phone, city, partner type, and at least one way to help are required." }, { status: 400 });
    }
    if (body?.agreed !== true) {
      return NextResponse.json({ error: "Please agree to the partner code of conduct." }, { status: 400 });
    }

    // Save to Firestore first — application is captured even if email fails
    await adminDb().collection("partner_applications").add({
      name,
      phone,
      city,
      partnerType,
      roles,
      organization: organization || null,
      network: network || null,
      status: "new",
      createdAt: FieldValue.serverTimestamp(),
    });

    // Email is best-effort: the application is already saved, so a mail failure must not fail the request
    try {
      await sendAdminEmail(
        `New Jodohmu Mitra application — ${name} (${city})`,
        `
          <h2>New partner (mitra) application</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Phone / WhatsApp:</strong> ${escapeHtml(phone)}</p>
          <p><strong>City:</strong> ${escapeHtml(city)}</p>
          <p><strong>Partner type:</strong> ${escapeHtml(partnerType)}</p>
          <p><strong>Wants to help with:</strong> ${roles.join(", ")}</p>
          <p><strong>Organization:</strong> ${escapeHtml(organization || "Not provided")}</p>
          <p><strong>Network / how they would refer:</strong><br/>${escapeHtml(network || "Not provided").replace(/\n/g, "<br/>")}</p>
        `
      );
    } catch (mailError) {
      console.error("Partner email notification failed:", mailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Partner form error:", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
