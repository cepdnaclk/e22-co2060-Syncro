# app/utils/email.py
# Gmail SMTP email utility for sending OTP emails.
import os
import smtplib
import sys
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


def send_otp_email(to_email: str, otp: str, purpose: str = "verification") -> None:
    """Send a registration or password reset OTP to the given email via Gmail SMTP.

    When EMAIL_MODE=development, simulate the email locally. When EMAIL_MODE=smtp,
    use real Gmail SMTP and never print the OTP in the terminal.
    """
    from dotenv import load_dotenv

    load_dotenv(override=True)
    gmail_user = os.getenv("GMAIL_USER", "")
    gmail_app_password = os.getenv("GMAIL_APP_PASSWORD", "")
    email_mode = os.getenv("EMAIL_MODE", "smtp").lower()

    if not gmail_user or not gmail_app_password or gmail_app_password == "your_16_character_app_password":
        if email_mode == "development":
            print("\n" + "=" * 80)
            print("[LOCAL DEV] GMAIL SMTP NOT CONFIGURED - OTP SIMULATION")
            print(f"To: {to_email}")
            print("To send real emails, generate an App Password at myaccount.google.com")
            print("and set GMAIL_USER and GMAIL_APP_PASSWORD in backend/.env")
            print("=" * 80 + "\n")
            return
        raise RuntimeError("Email service not configured. GMAIL_USER and GMAIL_APP_PASSWORD are required when EMAIL_MODE=smtp.")

    if purpose == "password_reset":
        title = "Reset Your Password"
        intro = "We received a request to reset your Syncro account password."
        closing = "If you did not request this password reset, you can safely ignore this email."
    else:
        title = "Verify Your Email Address"
        intro = "Thank you for creating an account."
        closing = "If you did not create this account, you can safely ignore this email."

    subject = f"{title}"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#ffffff;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:20px;">
        <p>Hello,</p>
        <p>{intro}</p>
        <p>Your verification code is:</p>
        <h2 style="font-size:32px;letter-spacing:4px;color:#333333;margin:20px 0;">{otp}</h2>
        <p>This code will expire in 5 minutes.</p>
        <p>{closing}</p>
        <p>Regards,<br>Syncro Team</p>
      </div>
    </body>
    </html>
    """

    text_body = (
        f"Hello,\n\n"
        f"{intro}\n\n"
        f"Your verification code is:\n\n"
        f"{otp}\n\n"
        f"This code will expire in 5 minutes.\n\n"
        f"{closing}\n\n"
        f"Regards,\nSyncro Team"
    )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Syncro Team <{gmail_user}>"
    msg["To"] = to_email

    msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(gmail_user, gmail_app_password)
            server.sendmail(gmail_user, to_email, msg.as_string())
        if email_mode == "development":
            print(f"[DEV] OTP email queued successfully for {to_email}")
    except smtplib.SMTPAuthenticationError as exc:
        print("SMTP authentication failed while sending OTP email.", file=sys.stderr)
        raise RuntimeError("SMTP authentication failed. Please check GMAIL_USER and GMAIL_APP_PASSWORD.") from exc
    except Exception as exc:
        print("SMTP sending failed while sending OTP email.", file=sys.stderr)
        raise RuntimeError("Unable to send the verification email. Please try again later.") from exc
