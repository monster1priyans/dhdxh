// "Stage by stage": the seven stages of the 28-day example, each explained in detail (English + Hindi).
import type { Field } from './content';

export interface Stage {
  id: string;
  /** days highlighted on the mini 28-day bar; `maybe` is shown lighter (e.g. "13/14") */
  from: number; to: number; maybe?: number;
  days: string;
  headline: string;
  fields: Field[];
}
export interface StagesContent { title: string; intro: string; dayLabel: string; items: Stage[] }

const en: StagesContent = {
  title: 'Stage by stage',
  intro: 'The seven stages below match the table above, each explained in detail. All days are approximate and use a 28-day cycle only as an example. Real cycles vary in length, and ovulation does not always happen on day 14.',
  dayLabel: 'Day',
  items: [
    {
      id: 'day1', from: 1, to: 1, days: 'Day 1',
      headline: 'Day 1: First day of full menstrual bleeding.',
      fields: [
        { label: 'What it means', text: 'The cycle is counted from this day. It is the first day of real flow, enough to need a pad, tampon, cup or period underwear. Light spotting in the day or two before does not count as Day 1.' },
        { label: 'Ovaries', text: 'A new group of follicles is starting to grow as the next follicular phase begins.' },
        { label: 'Uterus', text: 'The top layer of the uterine lining has started to shed, because progesterone and estrogen fell at the end of the last cycle.' },
        { label: 'Hormones', text: 'Estrogen and progesterone are low. FSH is starting to rise.' },
        { label: 'What you might notice', text: 'Bleeding starting, often with cramps, a lower back ache or tiredness. Some people have no symptoms.' },
        { label: 'Fertility', text: 'Low on this day. Day 1 is also the starting point for working out the rest of the cycle.' },
        { label: 'Keep in mind', text: 'Recording Day 1 accurately matters: if it is logged a day early or late, every estimate for that cycle moves by the same amount.' },
      ],
    },
    {
      id: 'menstrual', from: 1, to: 5, days: 'Days 1–5',
      headline: 'Days 1–5: Menstrual phase; this overlaps with the early follicular phase.',
      fields: [
        { label: 'What happens', text: 'The lining built up in the last cycle breaks down and leaves the body through the vagina. At the same time, in the ovaries, the next cycle is already starting.' },
        { label: 'Ovaries', text: 'Low hormone levels let FSH rise, and several follicles begin to grow. That is why the menstrual phase and the early follicular phase are the same days, seen in two different organs.' },
        { label: 'Uterus', text: 'Small blood vessels in the lining tighten, the tissue breaks away, and chemicals called prostaglandins make the uterus contract to push it out. Menstrual fluid is mostly shed lining, blood, mucus and other fluid. Flow is usually heaviest in the first one or two days and then eases.' },
        { label: 'Hormones', text: 'Estrogen and progesterone are low and FSH is rising. Towards the end of bleeding, estrogen from the growing follicles slowly starts to rise.' },
        { label: 'What you might notice', text: 'Cramps, lower back pain, tiredness, bloating, headaches or looser stools. Small clots can be normal. Large clots, or soaking a pad or tampon every 1–2 hours, are worth checking with a health professional.' },
        { label: 'Fertility', text: 'Usually low, but not zero. Sperm can survive for up to about 5 days, so in a short cycle, sex near the end of a period can lead to pregnancy.' },
        { label: 'Keep in mind', text: 'Bleeding commonly lasts 2–7 days. Five days is only the example.' },
      ],
    },
    {
      id: 'follicular', from: 1, to: 13, maybe: 14, days: 'Days 1–13/14',
      headline: 'Days 1–13/14: Follicular phase; follicles develop and estrogen rises.',
      fields: [
        { label: 'What happens', text: 'The ovary prepares an egg. This phase runs from Day 1 until ovulation, so it includes the period and the days after it.' },
        { label: 'Ovaries', text: 'FSH from the pituitary gland makes a group of follicles grow. Usually one becomes the dominant follicle while the others stop growing. The dominant follicle keeps growing, to about 2 cm, and fills with fluid as the egg inside matures.' },
        { label: 'Uterus', text: 'First the lining sheds (about days 1–5), then it rebuilds (about days 6–13).' },
        { label: 'Hormones', text: 'GnRH from the brain signals the pituitary to release FSH. Growing follicles make estrogen, mainly estradiol, which climbs through this phase. At first rising estradiol lowers FSH, which helps only one follicle keep growing. Once estradiol stays high for long enough, it switches to triggering the LH surge.' },
        { label: 'What you might notice', text: 'As estrogen rises, some people feel more energetic or notice clearer skin and wetter cervical mucus. Many notice little change.' },
        { label: 'Fertility', text: 'Rises towards the end of this phase as ovulation gets closer.' },
        { label: 'Keep in mind', text: 'This is the part of the cycle that changes most in length. A 35-day cycle usually has a follicular phase about a week longer than a 28-day cycle, while the luteal phase changes much less.' },
      ],
    },
    {
      id: 'proliferative', from: 6, to: 13, days: 'Days 6–13',
      headline: 'Days 6–13: Proliferative phase; the uterine lining rebuilds after bleeding.',
      fields: [
        { label: 'What happens', text: 'With bleeding over, the uterus rebuilds the lining it has just shed, ready for a possible pregnancy.' },
        { label: 'Uterus', text: 'Rising estradiol makes the cells, glands and blood vessels of the endometrium multiply, which is what “proliferative” means. The lining grows several times thicker than it was just after the period.' },
        { label: 'Ovaries', text: 'The dominant follicle keeps growing and making more estradiol.' },
        { label: 'Hormones', text: 'Estradiol rising steadily; FSH lower than at the start of the cycle.' },
        { label: 'Cervical mucus', text: 'Often changes from dry or sticky, to creamy, to clear, wet, stretchy and slippery, a bit like raw egg white, as ovulation nears. Patterns differ between people, and mucus alone cannot confirm ovulation.' },
        { label: 'What you might notice', text: 'More vaginal discharge, and for some people more energy. Many notice little.' },
        { label: 'Fertility', text: 'The fertile window can open during these days, about 5 days before ovulation, because sperm can survive that long.' },
        { label: 'Keep in mind', text: 'If bleeding lasts longer, this phase simply starts later: the lining starts rebuilding whenever bleeding stops.' },
      ],
    },
    {
      id: 'ovulation', from: 14, to: 14, days: 'Around Day 14',
      headline: 'Around Day 14: Ovulation; an egg is released from an ovary.',
      fields: [
        { label: 'What happens', text: 'The mature follicle opens and releases its egg. This is ovulation.' },
        { label: 'Ovaries', text: 'Usually one ovary releases one egg in a cycle. The egg is swept into the fallopian tube, where it can meet sperm. The empty follicle then turns into the corpus luteum.' },
        { label: 'Uterus', text: 'The lining is thick and ready for the progesterone-driven changes that come next.' },
        { label: 'Hormones', text: 'Estradiol that stays high triggers the LH surge from the pituitary. Ovulation usually follows about 24–36 hours after the surge begins. Estrogen dips briefly afterwards.' },
        { label: 'What you might notice', text: 'Clear, slippery mucus; a brief one-sided ache low in the belly (mittelschmerz); light spotting; or nothing at all. None of these signs can confirm that ovulation happened.' },
        { label: 'Fertility', text: 'Highest. The fertile window runs from about 5 days before ovulation through roughly a day after it. The egg lives about 12–24 hours; sperm can live up to about 5 days.' },
        { label: 'Keep in mind', text: 'Day 14 is only the example. Ovulation often happens earlier or later, can move from cycle to cycle, and sometimes does not happen at all. A home ovulation (LH) test shows that a surge happened, not that an egg was released.' },
      ],
    },
    {
      id: 'luteal', from: 15, to: 28, days: 'Days 15–28',
      headline: 'Days 15–28: Luteal phase and secretory phase; progesterone supports the uterine lining.',
      fields: [
        { label: 'What happens', text: 'After ovulation, the ovary and uterus work together to keep the lining ready in case an egg was fertilised. The ovarian name for this stage is the luteal phase; the uterine name is the secretory phase.' },
        { label: 'Ovaries', text: 'The corpus luteum makes progesterone and some estrogen. Progesterone is highest about a week after ovulation, around day 21 in the example.' },
        { label: 'Uterus', text: 'Progesterone makes the lining “secretory”: its glands release nutrients, and it becomes softer and full of blood vessels. It is most ready for an embryo to implant about a week after ovulation.' },
        { label: 'Hormones', text: 'Progesterone high, estrogen moderate, FSH and LH low.' },
        { label: 'Cervical mucus', text: 'Becomes thicker, stickier and less noticeable.' },
        { label: 'What you might notice', text: 'A small rise in resting (basal) body temperature of about 0.2–0.5 °C, which shows only after ovulation has already passed. Some people notice breast fullness, bloating, appetite changes or acne. Not everyone notices anything.' },
        { label: 'Fertility', text: 'Very low from about a day after ovulation.' },
        { label: 'Keep in mind', text: 'This phase usually lasts about 11–17 days and varies less than the follicular phase. If pregnancy begins, hCG keeps the corpus luteum making progesterone.' },
      ],
    },
    {
      id: 'late-luteal', from: 22, to: 28, days: 'Days 22–28',
      headline: 'Days 22–28: Late luteal phase; if pregnancy has not occurred, hormone levels fall and the next period begins.',
      fields: [
        { label: 'What happens', text: 'Without a pregnancy, the body winds down this cycle and starts the next one.' },
        { label: 'Ovaries', text: 'Without hCG, the corpus luteum shrinks, about 10–14 days after ovulation, and stops making hormones. FSH begins to rise again for the next cycle.' },
        { label: 'Uterus', text: 'As progesterone and estrogen fall, the lining loses its support: its blood vessels tighten and it starts to break down. When full bleeding begins, that day is Day 1 of the next cycle.' },
        { label: 'Hormones', text: 'Progesterone and estrogen fall; FSH starts to rise.' },
        { label: 'What you might notice', text: 'Premenstrual symptoms (PMS) such as mood changes, irritability, anxiety, tiredness, poor sleep, bloating, breast tenderness, acne, headaches or food cravings. They usually ease within a few days of bleeding starting. Severe mood symptoms may be PMDD, which can be treated.' },
        { label: 'Fertility', text: 'Low.' },
        { label: 'Keep in mind', text: 'If pregnancy has begun, hormone levels stay high and a period does not come. A late period can have many causes, including stress, illness, travel, weight change, PCOS, thyroid conditions, breastfeeding and perimenopause. A pregnancy test and a health professional can tell you more.' },
      ],
    },
  ],
};

const hi: StagesContent = {
  title: 'एक-एक चरण',
  intro: 'नीचे के सात चरण ऊपर की तालिका से मेल खाते हैं, और हर एक को विस्तार से समझाया गया है। सभी दिन अंदाज़न हैं और सिर्फ़ 28 दिन की साइकिल के उदाहरण के लिए हैं। असल साइकिल की लंबाई अलग होती है, और ओव्यूलेशन हमेशा 14वें दिन नहीं होता।',
  dayLabel: 'दिन',
  items: [
    {
      id: 'day1', from: 1, to: 1, days: 'दिन 1',
      headline: 'दिन 1: पूरा पीरियड (खून) शुरू होने का पहला दिन।',
      fields: [
        { label: 'इसका मतलब', text: 'साइकिल की गिनती इसी दिन से होती है। यह असली खून का पहला दिन है, इतना कि पैड, टैम्पॉन, कप या पीरियड अंडरवियर की ज़रूरत पड़े। इससे एक-दो दिन पहले के हल्के धब्बे दिन 1 नहीं गिने जाते।' },
        { label: 'ओवरी', text: 'अगला फ़ॉलिक्युलर फ़ेज़ शुरू होने के साथ फ़ॉलिकल का नया समूह बढ़ना शुरू करता है।' },
        { label: 'गर्भाशय', text: 'गर्भाशय की परत की ऊपरी तह निकलना शुरू हो गई है, क्योंकि पिछली साइकिल के आखिर में प्रोजेस्टेरोन और एस्ट्रोजन गिर गए थे।' },
        { label: 'हार्मोन', text: 'एस्ट्रोजन और प्रोजेस्टेरोन कम होते हैं। FSH बढ़ना शुरू होता है।' },
        { label: 'क्या महसूस हो सकता है', text: 'खून शुरू होना, अक्सर ऐंठन, कमर में दर्द या थकान के साथ। कुछ लोगों को कोई लक्षण नहीं होते।' },
        { label: 'प्रेगनेंसी की संभावना', text: 'इस दिन कम। दिन 1 से ही बाकी साइकिल का हिसाब लगाया जाता है।' },
        { label: 'ध्यान रखें', text: 'दिन 1 सही दर्ज करना ज़रूरी है: अगर यह एक दिन पहले या बाद में लिखा गया, तो उस साइकिल का हर अनुमान उतना ही खिसक जाता है।' },
      ],
    },
    {
      id: 'menstrual', from: 1, to: 5, days: 'दिन 1–5',
      headline: 'दिन 1–5: मेंस्ट्रुअल फ़ेज़; यह शुरुआती फ़ॉलिक्युलर फ़ेज़ के साथ-साथ चलता है।',
      fields: [
        { label: 'क्या होता है', text: 'पिछली साइकिल में बनी परत टूट कर योनि के रास्ते शरीर से बाहर निकलती है। उसी समय ओवरी में अगली साइकिल शुरू हो चुकी होती है।' },
        { label: 'ओवरी', text: 'हार्मोन कम होने से FSH बढ़ता है, और कई फ़ॉलिकल बढ़ने लगते हैं। इसीलिए मेंस्ट्रुअल फ़ेज़ और शुरुआती फ़ॉलिक्युलर फ़ेज़ एक ही दिन हैं, बस दो अलग अंगों में देखे गए।' },
        { label: 'गर्भाशय', text: 'परत की छोटी खून की नलियाँ सिकुड़ती हैं, परत टूट कर अलग होती है, और प्रोस्टाग्लैंडिन नाम के रसायन गर्भाशय को सिकोड़ कर उसे बाहर धकेलते हैं। पीरियड में ज़्यादातर निकली हुई परत, खून, म्यूकस और दूसरा तरल होता है। खून आम तौर पर पहले एक-दो दिन सबसे ज़्यादा होता है और फिर कम होता है।' },
        { label: 'हार्मोन', text: 'एस्ट्रोजन और प्रोजेस्टेरोन कम, FSH बढ़ता हुआ। खून के आखिरी दिनों में बढ़ते फ़ॉलिकल से एस्ट्रोजन धीरे-धीरे बढ़ना शुरू होता है।' },
        { label: 'क्या महसूस हो सकता है', text: 'ऐंठन, कमर दर्द, थकान, पेट फूलना, सिरदर्द या पतला मल। छोटे थक्के सामान्य हो सकते हैं। बड़े थक्के, या हर 1–2 घंटे में पैड या टैम्पॉन भर जाना, डॉक्टर को दिखाने लायक है।' },
        { label: 'प्रेगनेंसी की संभावना', text: 'आम तौर पर कम, पर शून्य नहीं। शुक्राणु लगभग 5 दिन तक ज़िंदा रह सकते हैं, इसलिए छोटी साइकिल में पीरियड के आखिर में सेक्स से प्रेगनेंसी हो सकती है।' },
        { label: 'ध्यान रखें', text: 'खून आम तौर पर 2–7 दिन आता है। पाँच दिन सिर्फ़ उदाहरण है।' },
      ],
    },
    {
      id: 'follicular', from: 1, to: 13, maybe: 14, days: 'दिन 1–13/14',
      headline: 'दिन 1–13/14: फ़ॉलिक्युलर फ़ेज़; फ़ॉलिकल बढ़ते हैं और एस्ट्रोजन बढ़ता है।',
      fields: [
        { label: 'क्या होता है', text: 'ओवरी एक अंडा तैयार करती है। यह फ़ेज़ दिन 1 से ओव्यूलेशन तक चलता है, इसलिए इसमें पीरियड और उसके बाद के दिन दोनों आते हैं।' },
        { label: 'ओवरी', text: 'पिट्यूटरी ग्रंथि का FSH कई फ़ॉलिकल को बढ़ाता है। आम तौर पर एक फ़ॉलिकल मुख्य बन जाता है और बाकी बढ़ना बंद कर देते हैं। मुख्य फ़ॉलिकल लगभग 2 सेंटीमीटर तक बढ़ता है और अंदर का अंडा पकने के साथ तरल से भर जाता है।' },
        { label: 'गर्भाशय', text: 'पहले परत निकलती है (लगभग दिन 1–5), फिर दोबारा बनती है (लगभग दिन 6–13)।' },
        { label: 'हार्मोन', text: 'दिमाग़ का GnRH पिट्यूटरी को FSH छोड़ने का संकेत देता है। बढ़ते फ़ॉलिकल एस्ट्रोजन, खास कर एस्ट्राडियोल, बनाते हैं, जो इस फ़ेज़ में बढ़ता जाता है। शुरू में बढ़ता एस्ट्राडियोल FSH को कम करता है, जिससे सिर्फ़ एक फ़ॉलिकल बढ़ता रहता है। जब एस्ट्राडियोल काफ़ी समय तक ऊँचा रहता है, तो वह LH सर्ज शुरू कर देता है।' },
        { label: 'क्या महसूस हो सकता है', text: 'एस्ट्रोजन बढ़ने पर कुछ लोगों को ज़्यादा ताकत लगती है, त्वचा साफ़ लगती है या सर्वाइकल म्यूकस गीला होता है। बहुत से लोगों को ज़्यादा फ़र्क नहीं लगता।' },
        { label: 'प्रेगनेंसी की संभावना', text: 'ओव्यूलेशन पास आने के साथ इस फ़ेज़ के आखिर में बढ़ती है।' },
        { label: 'ध्यान रखें', text: 'साइकिल का यही हिस्सा सबसे ज़्यादा घटता-बढ़ता है। 35 दिन की साइकिल में फ़ॉलिक्युलर फ़ेज़ आम तौर पर 28 दिन वाली से लगभग एक हफ़्ता लंबा होता है, जबकि ल्यूटियल फ़ेज़ बहुत कम बदलता है।' },
      ],
    },
    {
      id: 'proliferative', from: 6, to: 13, days: 'दिन 6–13',
      headline: 'दिन 6–13: प्रोलिफ़रेटिव फ़ेज़; खून रुकने के बाद गर्भाशय की परत फिर से बनती है।',
      fields: [
        { label: 'क्या होता है', text: 'खून रुकने के बाद गर्भाशय अभी-अभी निकली परत को फिर से बनाता है, ताकि संभावित प्रेगनेंसी के लिए तैयार रहे।' },
        { label: 'गर्भाशय', text: 'बढ़ता एस्ट्राडियोल एंडोमेट्रियम की कोशिकाओं, ग्रंथियों और खून की नलियों को बढ़ाता है; “प्रोलिफ़रेटिव” का यही मतलब है। पीरियड के ठीक बाद की तुलना में परत कई गुना मोटी हो जाती है।' },
        { label: 'ओवरी', text: 'मुख्य फ़ॉलिकल बढ़ता रहता है और ज़्यादा एस्ट्राडियोल बनाता है।' },
        { label: 'हार्मोन', text: 'एस्ट्राडियोल लगातार बढ़ता हुआ; FSH साइकिल की शुरुआत से कम।' },
        { label: 'सर्वाइकल म्यूकस', text: 'ओव्यूलेशन पास आने पर अक्सर सूखे या चिपचिपे से मलाई जैसा, और फिर साफ़, गीला, खिंचने वाला और चिकना हो जाता है, कुछ-कुछ कच्चे अंडे की सफ़ेदी जैसा। यह पैटर्न हर व्यक्ति में अलग होता है, और सिर्फ़ म्यूकस से ओव्यूलेशन पक्का नहीं किया जा सकता।' },
        { label: 'क्या महसूस हो सकता है', text: 'ज़्यादा सफ़ेद पानी, और कुछ लोगों को ज़्यादा ताकत। बहुत से लोगों को ज़्यादा फ़र्क नहीं लगता।' },
        { label: 'प्रेगनेंसी की संभावना', text: 'इन दिनों में फर्टाइल दिन शुरू हो सकते हैं, ओव्यूलेशन से लगभग 5 दिन पहले, क्योंकि शुक्राणु इतने दिन ज़िंदा रह सकते हैं।' },
        { label: 'ध्यान रखें', text: 'अगर खून ज़्यादा दिन चले, तो यह फ़ेज़ बस बाद में शुरू होता है: परत तभी बनना शुरू होती है जब खून रुकता है।' },
      ],
    },
    {
      id: 'ovulation', from: 14, to: 14, days: 'लगभग दिन 14',
      headline: 'लगभग दिन 14: ओव्यूलेशन; एक ओवरी से अंडा निकलता है।',
      fields: [
        { label: 'क्या होता है', text: 'पका हुआ फ़ॉलिकल खुलता है और अपना अंडा छोड़ता है। यही ओव्यूलेशन है।' },
        { label: 'ओवरी', text: 'आम तौर पर एक साइकिल में एक ओवरी एक अंडा छोड़ती है। अंडा फ़ैलोपियन ट्यूब में चला जाता है, जहाँ उसकी शुक्राणु से मुलाकात हो सकती है। खाली फ़ॉलिकल फिर कॉर्पस ल्यूटियम बन जाता है।' },
        { label: 'गर्भाशय', text: 'परत मोटी होती है और प्रोजेस्टेरोन से होने वाले अगले बदलावों के लिए तैयार होती है।' },
        { label: 'हार्मोन', text: 'लगातार ऊँचा एस्ट्राडियोल पिट्यूटरी से LH सर्ज शुरू करता है। सर्ज शुरू होने के लगभग 24–36 घंटे बाद आम तौर पर ओव्यूलेशन होता है। इसके बाद एस्ट्रोजन थोड़ी देर के लिए गिरता है।' },
        { label: 'क्या महसूस हो सकता है', text: 'साफ़, चिकना म्यूकस; पेट के निचले हिस्से में एक तरफ़ थोड़ी देर का दर्द (मिटलश्मर्ज़); हल्के धब्बे; या कुछ भी नहीं। इनमें से कोई भी संकेत ओव्यूलेशन पक्का नहीं करता।' },
        { label: 'प्रेगनेंसी की संभावना', text: 'सबसे ज़्यादा। फर्टाइल दिन ओव्यूलेशन से लगभग 5 दिन पहले से उसके लगभग एक दिन बाद तक होते हैं। अंडा लगभग 12–24 घंटे जीता है; शुक्राणु लगभग 5 दिन तक।' },
        { label: 'ध्यान रखें', text: 'दिन 14 सिर्फ़ उदाहरण है। ओव्यूलेशन अक्सर पहले या बाद में होता है, हर साइकिल में खिसक सकता है, और कभी-कभी होता ही नहीं। घर पर किया ओव्यूलेशन (LH) टेस्ट यह बताता है कि सर्ज हुआ, यह नहीं कि अंडा निकला।' },
      ],
    },
    {
      id: 'luteal', from: 15, to: 28, days: 'दिन 15–28',
      headline: 'दिन 15–28: ल्यूटियल फ़ेज़ और सिक्रेटरी फ़ेज़; प्रोजेस्टेरोन गर्भाशय की परत को सहारा देता है।',
      fields: [
        { label: 'क्या होता है', text: 'ओव्यूलेशन के बाद ओवरी और गर्भाशय मिल कर परत को तैयार रखते हैं, अगर अंडा निषेचित हुआ हो। ओवरी के हिसाब से इस चरण का नाम ल्यूटियल फ़ेज़ है; गर्भाशय के हिसाब से सिक्रेटरी फ़ेज़।' },
        { label: 'ओवरी', text: 'कॉर्पस ल्यूटियम प्रोजेस्टेरोन और थोड़ा एस्ट्रोजन बनाता है। प्रोजेस्टेरोन ओव्यूलेशन के लगभग एक हफ़्ते बाद, उदाहरण में लगभग दिन 21 के आस-पास, सबसे ज़्यादा होता है।' },
        { label: 'गर्भाशय', text: 'प्रोजेस्टेरोन परत को “सिक्रेटरी” बनाता है: उसकी ग्रंथियाँ पोषक तत्व छोड़ती हैं, और परत नरम और खून की नलियों से भरी हो जाती है। ओव्यूलेशन के लगभग एक हफ़्ते बाद यह भ्रूण के जुड़ने के लिए सबसे ज़्यादा तैयार होती है।' },
        { label: 'हार्मोन', text: 'प्रोजेस्टेरोन ज़्यादा, एस्ट्रोजन मध्यम, FSH और LH कम।' },
        { label: 'सर्वाइकल म्यूकस', text: 'गाढ़ा, चिपचिपा और कम दिखने वाला हो जाता है।' },
        { label: 'क्या महसूस हो सकता है', text: 'आराम के समय का (बेसल) शरीर का तापमान लगभग 0.2–0.5 °C बढ़ सकता है, जो ओव्यूलेशन हो जाने के बाद ही दिखता है। कुछ लोगों को स्तनों में भारीपन, पेट फूलना, भूख में बदलाव या मुँहासे होते हैं। हर किसी को कुछ महसूस नहीं होता।' },
        { label: 'प्रेगनेंसी की संभावना', text: 'ओव्यूलेशन के लगभग एक दिन बाद से बहुत कम।' },
        { label: 'ध्यान रखें', text: 'यह फ़ेज़ आम तौर पर लगभग 11–17 दिन का होता है और फ़ॉलिक्युलर फ़ेज़ से कम बदलता है। अगर प्रेगनेंसी शुरू होती है, तो hCG कॉर्पस ल्यूटियम से प्रोजेस्टेरोन बनवाता रहता है।' },
      ],
    },
    {
      id: 'late-luteal', from: 22, to: 28, days: 'दिन 22–28',
      headline: 'दिन 22–28: आखिरी ल्यूटियल फ़ेज़; अगर प्रेगनेंसी नहीं हुई, तो हार्मोन गिरते हैं और अगला पीरियड शुरू होता है।',
      fields: [
        { label: 'क्या होता है', text: 'प्रेगनेंसी न होने पर शरीर इस साइकिल को समेटता है और अगली शुरू करता है।' },
        { label: 'ओवरी', text: 'hCG न मिलने पर कॉर्पस ल्यूटियम ओव्यूलेशन के लगभग 10–14 दिन बाद सिकुड़ जाता है और हार्मोन बनाना बंद कर देता है। अगली साइकिल के लिए FSH फिर बढ़ने लगता है।' },
        { label: 'गर्भाशय', text: 'प्रोजेस्टेरोन और एस्ट्रोजन गिरने से परत का सहारा चला जाता है: उसकी खून की नलियाँ सिकुड़ती हैं और वह टूटने लगती है। जिस दिन पूरा खून शुरू होता है, वह अगली साइकिल का दिन 1 है।' },
        { label: 'हार्मोन', text: 'प्रोजेस्टेरोन और एस्ट्रोजन गिरते हैं; FSH बढ़ना शुरू होता है।' },
        { label: 'क्या महसूस हो सकता है', text: 'पीरियड से पहले के लक्षण (PMS), जैसे मूड में बदलाव, चिड़चिड़ापन, घबराहट, थकान, नींद कम आना, पेट फूलना, स्तनों में दर्द, मुँहासे, सिरदर्द या खाने की इच्छा। खून शुरू होने के कुछ दिनों में ये आम तौर पर कम हो जाते हैं। मूड के बहुत तेज़ लक्षण PMDD हो सकते हैं, जिसका इलाज होता है।' },
        { label: 'प्रेगनेंसी की संभावना', text: 'कम।' },
        { label: 'ध्यान रखें', text: 'अगर प्रेगनेंसी शुरू हुई है, तो हार्मोन ऊँचे रहते हैं और पीरियड नहीं आता। पीरियड लेट होने की कई वजहें हो सकती हैं, जैसे तनाव, बीमारी, सफ़र, वज़न में बदलाव, PCOS, थायरॉइड, स्तनपान और पेरिमेनोपॉज़। प्रेगनेंसी टेस्ट और डॉक्टर ज़्यादा बता सकते हैं।' },
      ],
    },
  ],
};

export const STAGES: Record<'en' | 'hi', StagesContent> = { en, hi };
