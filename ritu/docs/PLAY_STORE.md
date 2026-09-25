# Play Store: listing text and Data safety answers

## Store listing (English)

**App name:** Ritu: Period Tracker for Family

**Short description (80 chars max):**
Private period tracker for the whole family. Works offline. No account needed.

**Full description:**
Ritu is a period tracker made for Indian families. Mother, daughters and sisters can each have their own profile on one phone, every profile with its own bangle colour and an optional PIN.

Everything stays on your phone. There is no account, no login and no server. Ritu works without the internet, and nothing you enter is ever shared.

What you can do:
• Log periods with one tap: "Period started", "Period ended"
• See the next 3 periods with a clear range, and how sure the estimate is
• Track flow, symptoms, mood and pain, and see patterns by cycle day
• Get gentle reminders before a period or when it is late, even offline
• Discreet reminders that only say "Reminder – Tap to open"
• A PIN per profile: a locked profile shows only a name and a lock
• Profiles for a daughter, with fertile days hidden by default
• Trying to conceive mode with temperature and ovulation tests; pregnancy mode
• Charts and a doctor report (PDF) to take to your appointment
• Export as CSV/JSON, and a backup file to move to a new phone
• Fully in English and हिंदी, light and dark theme

Predictions are estimates, not medical advice and not birth control.

## Store listing (हिंदी)

**ऐप का नाम:** ऋतु: परिवार के लिए पीरियड ट्रैकर

**छोटा विवरण:**
पूरे परिवार के लिए प्राइवेट पीरियड ट्रैकर। बिना इंटरनेट, बिना अकाउंट।

**पूरा विवरण:**
ऋतु भारतीय परिवारों के लिए बना पीरियड ट्रैकर है। माँ, बेटियाँ और बहनें एक ही फ़ोन पर अपनी-अपनी प्रोफ़ाइल रख सकती हैं, हर प्रोफ़ाइल का अपना चूड़ी का रंग और चाहें तो अपना PIN।

सब कुछ आपके फ़ोन पर ही रहता है। न अकाउंट, न लॉगिन, न सर्वर। ऋतु बिना इंटरनेट के चलता है और आपकी कोई जानकारी कहीं शेयर नहीं होती।

आप क्या कर सकती हैं:
• एक टैप में पीरियड लॉग करें: "पीरियड शुरू हुआ", "पीरियड खत्म हुआ"
• अगले 3 पीरियड की तारीख और अनुमान कितना पक्का है, यह देखें
• फ़्लो, लक्षण, मूड और दर्द लिखें, और साइकिल के दिनों के हिसाब से पैटर्न देखें
• पीरियड से पहले और लेट होने पर रिमाइंडर, बिना इंटरनेट के भी
• छिपे हुए रिमाइंडर जो सिर्फ़ "रिमाइंडर – खोलने के लिए टैप करें" दिखाते हैं
• हर प्रोफ़ाइल का PIN: लॉक प्रोफ़ाइल में सिर्फ़ नाम और ताला दिखता है
• बेटी के लिए प्रोफ़ाइल, जिसमें फर्टाइल दिन पहले से छिपे रहते हैं
• बच्चे की कोशिश वाला मोड (तापमान और ओव्यूलेशन टेस्ट) और प्रेगनेंसी मोड
• चार्ट और डॉक्टर के लिए रिपोर्ट (PDF)
• CSV/JSON में एक्सपोर्ट, और नए फ़ोन में ले जाने के लिए बैकअप फ़ाइल
• पूरी तरह हिंदी और English में, लाइट और डार्क थीम

अनुमान सिर्फ़ अंदाज़ा हैं। यह डॉक्टर की सलाह नहीं है और गर्भनिरोध का तरीका भी नहीं है।

## Category and content

- **Category:** Health & Fitness (or Medical)
- **Content rating questionnaire:** no violence, no user interaction or sharing, no ads, and no purchases. Answer that the app is not designed primarily for children. Children's profiles are created and managed by a parent on the parent's phone.
- **Target audience:** 18+. If you choose to include 13–17 as well, read the Families policy first.
- **Ads:** No.

## Data safety form

Ritu stores everything only on the device, has no server, and sends nothing over the network. In Play's terms, data that never leaves the device is **not "collected"**.

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **No** |
| Is all of the user data collected by your app encrypted in transit? | Not applicable (nothing is transmitted) |
| Do you provide a way for users to request that their data is deleted? | Users delete data in the app (Profile settings → Delete profile), or by uninstalling |

If Play still asks per data type, the honest answer for **Health info**, **Personal info (name)** and **Files and docs** is "Not collected, not shared". The data is processed only on the device, and files are exported only when the user starts it.

**Permissions to explain in the listing / review notes:**
- `POST_NOTIFICATIONS`: period reminders, asked only after the app explains why.
- `SCHEDULE_EXACT_ALARM`, `RECEIVE_BOOT_COMPLETED`, `WAKE_LOCK`: so reminders fire on time and survive a restart.
- `INTERNET`: required by the Android WebView to load the app's bundled files. The app makes no network requests.

## Privacy policy URL

Play requires a public privacy policy URL. The same text is in the app (Settings → Privacy policy); host it on any static page, for example by publishing the web build (`npm run build`, then upload `dist/`) and linking to `/privacy`.

## Screenshots

Run `npm run preview` and `npm run e2e`. Phone-sized screenshots of every main screen, including Hindi and dark mode, are written to `e2e/out/shots/`.
