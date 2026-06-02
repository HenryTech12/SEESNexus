import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from ..config import settings

def send_verification_email(email: str, code: str):
    """
    Sends a verification code using Brevo (formerly Sendinblue) API via SDK
    """
    if not settings.BREVO_API_KEY:
        print(f"BREVO_API_KEY not set. Verification code for {email}: {code}")
        return True

    # Configure API key authorization: api-key
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = settings.BREVO_API_KEY

    # create an instance of the API class
    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
    
    sender = {"name": settings.BREVO_SENDER_NAME, "email": settings.BREVO_SENDER_EMAIL}
    to = [{"email": email}]
    subject = "SEES Nexus Verification Code"
    html_content = f"""
        <html>
            <body style="font-family: sans-serif; background-color: #0d1117; color: #ffffff; padding: 20px;">
                <h1 style="color: #00ffc3;">{settings.BREVO_SENDER_NAME}</h1>
                <p>Your verification code for registration is:</p>
                <div style="background-color: #161b22; border: 1px solid #00ffc3; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; color: #00ffc3;">
                    {code}
                </div>
                <p style="font-size: 12px; color: #8b949e; margin-top: 20px;">
                    If you did not request this code, please ignore this email. This code expires in 10 minutes.
                </p>
            </body>
        </html>
    """
    
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=to,
        sender=sender,
        subject=subject,
        html_content=html_content
    )

    try:
        api_instance.send_transac_email(send_smtp_email)
        return True
    except ApiException as e:
        print(f"Exception when calling TransactionalEmailsApi->send_transac_email: {e}")
        return False
