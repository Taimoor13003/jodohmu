import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, city, email } = body ?? {};

    if (!name || !phone || !city) {
      return NextResponse.json({ error: "Name, phone, and city are required." }, { status: 400 });
    }

    // Save to Firestore first — lead is captured even if notification fails
    await addDoc(collection(db, "contact_form_entries"), {
      name,
      phone,
      city,
      email: email || null,
      createdAt: serverTimestamp(),
    });

    // Best-effort WhatsApp notification via Callmebot (free).
    // Requires one-time setup: WhatsApp "I allow callmebot to send me messages"
    // to +34 644 60 49 16, then add CALLMEBOT_PHONE + CALLMEBOT_APIKEY in Vercel.
    const phone_notify = process.env.CALLMEBOT_PHONE;
    const apikey = process.env.CALLMEBOT_APIKEY;
    if (phone_notify && apikey) {
      const text = encodeURIComponent(
        `New Jodohmu inquiry!\nName: ${name}\nPhone: ${phone}\nCity: ${city}${email ? `\nEmail: ${email}` : ""}`
      );
      fetch(`https://api.callmebot.com/whatsapp.php?phone=${phone_notify}&text=${text}&apikey=${apikey}`)
        .catch(() => {}); // fire-and-forget; lead already saved
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
