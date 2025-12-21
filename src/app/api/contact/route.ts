import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  CONTACT_FROM,
  CONTACT_TO,
} = process.env;

const REQUIRED_ENV_VARS: Record<string, string | undefined> = {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
};

function ensureEnv() {
  const missing = Object.entries(REQUIRED_ENV_VARS)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length) {
    throw new Error(`Missing SMTP configuration env vars: ${missing.join(", ")}`);
  }
}

export async function POST(request: Request) {
  try {
    ensureEnv();

    const body = await request.json();
    const { name, phone, city, email } = body ?? {};

    if (!name || !phone || !city) {
      return NextResponse.json({ error: "Name, phone, and city are required." }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const to = CONTACT_TO || "info@jodohmu.com";
    const from = CONTACT_FROM || SMTP_USER || "no-reply@jodohmu.com";

    await transporter.sendMail({
      from,
      to,
      subject: "New contact inquiry",
      text: `New contact submission:\nName: ${name}\nPhone: ${phone}\nCity: ${city}\nEmail: ${email || "Not provided"}`,
      html: `
        <h2>New contact submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>City:</strong> ${city}</p>
        <p><strong>Email:</strong> ${email || "Not provided"}</p>
      `,
    });

    await addDoc(collection(db, "contact_form_entries"), {
      name,
      phone,
      city,
      email: email || null,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending contact email", error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
