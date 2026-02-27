"""Email sending service with SMTP support."""

import os
import smtplib
import ssl
import time
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

logger = logging.getLogger(__name__)


class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.sender_email = os.getenv("SMTP_SENDER_EMAIL")
        self.sender_password = os.getenv("SMTP_SENDER_PASSWORD")
        self.context = ssl.create_default_context()

    def send_email(self, subject: str, body: str, recipient: str) -> bool:
        if not all([self.sender_email, self.sender_password]):
            logger.error("SMTP not configured: SMTP_SENDER_EMAIL or SMTP_SENDER_PASSWORD missing")
            return False

        message = MIMEMultipart()
        message["From"] = self.sender_email
        message["To"] = recipient
        message["Subject"] = subject
        message.attach(MIMEText(body, "plain", "utf-8"))

        connection_attempts = [(465, True), (587, False)]
        if self.smtp_port not in [465, 587]:
            connection_attempts.insert(0, (self.smtp_port, False))

        max_retries = 2
        for port, use_ssl in connection_attempts:
            for retry in range(max_retries):
                try:
                    if use_ssl:
                        with smtplib.SMTP_SSL(self.smtp_server, port, context=self.context, timeout=60) as server:
                            server.login(self.sender_email, self.sender_password)
                            server.send_message(message)
                    else:
                        with smtplib.SMTP(self.smtp_server, port, timeout=60) as server:
                            server.ehlo()
                            if server.has_extn("STARTTLS"):
                                server.starttls(context=self.context)
                                server.ehlo()
                            server.login(self.sender_email, self.sender_password)
                            server.send_message(message)
                    logger.info("Email sent to %s via SMTP port %s", recipient, port)
                    return True
                except Exception as e:
                    logger.warning("SMTP port %s attempt %s failed: %s", port, retry + 1, e)
                    if retry < max_retries - 1:
                        time.sleep(2)

        logger.error("All SMTP attempts to send email to %s failed", recipient)
        return False


email_service = EmailService()
