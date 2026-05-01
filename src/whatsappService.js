export const sendWhatsAppAlert = async (alert, userPhoneNumber, userLanguage) => {
  // Make sure the phone number is formatted correctly for WhatsApp (needs country code, no + or spaces)
  const formattedPhone = userPhoneNumber.replace(/[^0-9]/g, '');
  
  if (!formattedPhone) {
    console.error('Invalid phone number for WhatsApp');
    return null;
  }

  // TODO: Replace these with your actual Meta Developer credentials
  const API_VERSION = 'v17.0';
  const WHATSAPP_BUSINESS_PHONE_NUMBER_ID = 'YOUR_PHONE_NUMBER_ID_HERE';
  const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN_HERE';

  // Format the message
  const englishText = `🚨 *AAPDA DISASTER ALERT* 🚨\n\n*${alert.title}*\n\n${alert.description}\n\n*Location:* ${alert.location}\n*Severity:* ${alert.severity.toUpperCase()}`;
  
  // For production, you would pass this through a translation API (like Google Translate or Gemini)
  // For the demo, we are appending a placeholder or you can hardcode specific translations
  const translatedText = `[ ${userLanguage} Translation ]\n${englishText}`;
  
  const bodyText = `${englishText}\n\n---\n\n${translatedText}`;

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: formattedPhone,
    type: "interactive",
    interactive: {
      type: "button",
      header: {
        type: "text",
        text: "CRITICAL ALERT"
      },
      body: {
        text: bodyText
      },
      footer: {
        text: "AAPDA Safety System"
      },
      action: {
        buttons: [
          {
            type: "reply",
            reply: {
              id: "safe_btn",
              title: "I am safe"
            }
          },
          {
            type: "reply",
            reply: {
              id: "help_btn",
              title: "I need help"
            }
          }
        ]
      }
    }
  };

  try {
    const response = await fetch(`https://graph.facebook.com/${API_VERSION}/${WHATSAPP_BUSINESS_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("WhatsApp API Response:", data);
    return data;
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error);
    return null;
  }
};
