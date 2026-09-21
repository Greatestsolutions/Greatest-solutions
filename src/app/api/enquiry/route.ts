import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

/**
 * Enquiry send endpoint — what `EnquiryForm.tsx` posts to.
 *
 * Sends through Gmail SMTP using the account's own address (`GMAIL_USER`) and
 * an App Password (`GMAIL_APP_PASSWORD`, not the account password — Gmail
 * requires this for any SMTP client since it doesn't support a plain
 * password there). Both are read from environment variables only; neither
 * is ever logged, and nothing about their value appears in this file.
 *
 * Gmail's SMTP servers reject (or silently rewrite) a `From` that isn't the
 * authenticated account, so the visitor's own name goes in the display name
 * and their email goes in `Reply-To` instead — replying to the delivered
 * mail goes straight to them, not back to this inbox.
 */
export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Strips CR/LF so a submitted value can never inject an extra header line
 *  (e.g. a `name` of `"Jordan\nBcc: attacker@evil.com"`). Only applied to
 *  fields that end up inside a header — `message` is body text and keeps
 *  its own line breaks. */
const sanitizeHeaderValue = (value: string) => value.replace(/[\r\n]+/g, " ").trim();

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const get = (key: string) => (typeof body[key] === "string" ? (body[key] as string).trim() : "");

  // Honeypot: a field real visitors never see or fill. A bot that fills
  // every input on the page will fill this too — reply 200 without sending,
  // so the bot has no signal that it was caught rather than that it worked.
  if (get("website") !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = get("name");
  const email = get("email");
  const company = get("company");
  const service = get("service");
  const message = get("message");

  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, error: "Name, email and project details are required." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "That email address doesn't look valid." }, { status: 400 });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailPass) {
    console.error("GMAIL_USER / GMAIL_APP_PASSWORD not configured");
    return NextResponse.json({ ok: false, error: "Email sending isn't configured." }, { status: 500 });
  }

  const safeName = sanitizeHeaderValue(name);
  const safeEmail = sanitizeHeaderValue(email);

  const bodyLines = [
    `Name: ${safeName}`,
    `Email: ${safeEmail}`,
    company && `Company: ${sanitizeHeaderValue(company)}`,
    `Service: ${service || "Not specified"}`,
    "",
    "Project details:",
    message,
  ].filter((line): line is string => Boolean(line));

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailPass },
  });

  try {
    await transporter.sendMail({
      from: `"${safeName} via Greatest Solutions" <${gmailUser}>`,
      to: gmailUser,
      replyTo: `"${safeName}" <${safeEmail}>`,
      subject: `Project enquiry — ${safeName}`,
      text: bodyLines.join("\n"),
    });
  } catch (error) {
    console.error("Failed to send enquiry email:", error);
    return NextResponse.json({ ok: false, error: "Couldn't send the message. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
