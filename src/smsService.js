export const sendSMSAlert = async (alert, userPhoneNumber, userLanguage) => {
  // Format the phone number (needs country code, e.g., +91 for India)
  const formattedPhone = userPhoneNumber.startsWith('+') ? userPhoneNumber : `+91${userPhoneNumber.replace(/[^0-9]/g, '')}`;

  if (!formattedPhone || formattedPhone.length < 10) {
    console.error('Invalid phone number for SMS');
    return null;
  }

  // TODO: Replace these with your actual Twilio credentials
  const TWILIO_ACCOUNT_SID = 'YOUR_TWILIO_ACCOUNT_SID';
  const TWILIO_AUTH_TOKEN = 'YOUR_TWILIO_AUTH_TOKEN';
  const TWILIO_PHONE_NUMBER = 'YOUR_TWILIO_PHONE_NUMBER'; // e.g. +1234567890

  // Format the message
  // SMS has a 160 character limit per segment, so keep it concise
  const englishText = `AAPDA ALERT: ${alert.title}. ${alert.description.substring(0, 100)}... Loc: ${alert.location}. Severity: ${alert.severity.toUpperCase()}. Stay safe.`;
  
  const translatedText = `[${userLanguage}]: ${englishText}`;
  const bodyText = `${englishText}\n---\n${translatedText}`;

  // Twilio requires URL encoded form data, not JSON
  const formData = new URLSearchParams();
  formData.append('To', formattedPhone);
  formData.append('From', TWILIO_PHONE_NUMBER);
  formData.append('Body', bodyText);

  try {
    // Basic Auth string using btoa (Base64 encoding)
    const authString = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authString}`
      },
      body: formData.toString()
    });

    const data = await response.json();
    console.log("Twilio SMS API Response:", data);
    return data;
  } catch (error) {
    console.error("Failed to send SMS message:", error);
    return null;
  }
};
