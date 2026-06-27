# app/utils/email.py
# Gmail SMTP email utility for sending OTP password reset emails.
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

def send_otp_email(to_email: str, otp: str) -> None:
    """Send a password reset OTP to the given email via Gmail SMTP.
    
    If GMAIL credentials are not configured, prints the OTP to the console
    for local development instead of raising an error.
    """
    from dotenv import load_dotenv
    load_dotenv(override=True)
    gmail_user = os.getenv("GMAIL_USER", "")
    gmail_app_password = os.getenv("GMAIL_APP_PASSWORD", "")

    if not gmail_user or not gmail_app_password or gmail_app_password == "your_16_char_app_password_here":
        print("\n" + "="*80)
        print("[LOCAL DEV] GMAIL SMTP NOT CONFIGURED - OTP SIMULATION")
        print(f"To: {to_email}")
        print(f"Your Syncro password reset OTP code is: {otp}")
        print("To send real emails, generate an App Password at myaccount.google.com")
        print("and set GMAIL_USER and GMAIL_APP_PASSWORD in backend/.env")
        print("="*80 + "\n")
        return

    subject = "Your Syncro Password Reset Code"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="520" cellpadding="0" cellspacing="0"
                   style="background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);
                          border-radius:16px;border:1px solid #334155;overflow:hidden;">
              <!-- Header -->
              <tr>
                <td style="padding:32px 40px 24px;text-align:center;
                           background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);">
                  <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">
                    syn<span style="opacity:0.7;">cro</span>
                  </h1>
                  <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">
                    Password Reset
                  </p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:36px 40px;">
                  <p style="margin:0 0 20px;color:#cbd5e1;font-size:15px;line-height:1.6;">
                    Hi there,<br><br>
                    We received a request to reset the password for your Syncro account
                    associated with <strong style="color:#e2e8f0;">{to_email}</strong>.
                    Use the code below to complete your reset. It expires in <strong style="color:#e2e8f0;">10&nbsp;minutes</strong>.
                  </p>

                  <!-- OTP box -->
                  <div style="background:#1e293b;border:2px dashed #6366f1;border-radius:12px;
                              padding:28px;text-align:center;margin:24px 0;">
                    <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;
                               letter-spacing:2px;text-transform:uppercase;">Your OTP code</p>
                    <p style="margin:0;color:#fff;font-size:42px;font-weight:800;
                               letter-spacing:12px;font-variant-numeric:tabular-nums;">
                      {otp}
                    </p>
                  </div>

                  <p style="margin:20px 0 0;color:#64748b;font-size:13px;line-height:1.6;">
                    If you didn't request a password reset, you can safely ignore this email.
                    Your password will not change.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding:20px 40px;border-top:1px solid #1e293b;
                           text-align:center;color:#475569;font-size:12px;">
                  © 2024 Syncro Marketplace · This is an automated email, please do not reply.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """

    text_body = (
        f"Your Syncro password reset code is: {otp}\n\n"
        f"This code expires in 10 minutes.\n\n"
        f"If you didn't request this, ignore this email."
    )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Syncro Marketplace <{gmail_user}>"
    msg["To"] = to_email

    msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(gmail_user, gmail_app_password)
        server.sendmail(gmail_user, to_email, msg.as_string())

    print(f"OTP email sent to {to_email}")
