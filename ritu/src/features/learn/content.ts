// "How the cycle works": general menstrual-health education, in English and Hindi.
// General education only: no diagnosis, no pregnancy prediction, no claim that symptoms confirm ovulation.
// Both languages share one shape; learn.test.ts checks they stay in step.

export interface Field { label: string; text: string }
export interface PhaseSection { id: string; title: string; fields: Field[] }
export interface Segment { from: number; to: number; label: string; tone: 'period' | 'ovulation' | 'early' | 'late' }

export interface LearnContent {
  title: string;
  intro: string;
  contents: string;
  simplified: { title: string; text: string };
  diagram: { title: string; caption: string; dayLabel: string; ovarian: string; uterine: string; ovarianSegments: Segment[]; uterineSegments: Segment[] };
  overview: { title: string; paragraphs: string[] };
  timeline: { title: string; note: string; dayOne: string; swipe: string; columns: string[]; rows: string[][] };
  phasesTitle: string;
  phases: PhaseSection[];
  outcomes: { title: string; items: Field[] };
  hormones: { title: string; items: { name: string; full: string; text: string }[]; sequenceTitle: string; sequence: string[] };
  variation: { title: string; intro: string; items: Field[]; notesTitle: string; notes: string[] };
  care: { title: string; intro: string; items: string[]; outro: string };
  summary: { title: string; text: string };
  sources: { title: string; intro: string; items: string[] };
}

const en: LearnContent = {
  title: 'How the menstrual cycle works',
  intro: 'A plain-language guide for women and other people who menstruate. It explains what usually happens in the body during a cycle. It is general education only. It cannot diagnose a condition, tell you whether you are pregnant, or confirm when you ovulate.',
  contents: 'Contents',
  simplified: {
    title: '“Four phases” is a simplified model',
    text: 'The cycle is often taught as four phases. That is a simplified teaching model. In the body, two cycles run at the same time and overlap. The ovarian cycle is what happens in the ovaries: follicular phase → ovulation → luteal phase. The uterine cycle is what happens in the lining of the uterus: menstrual phase → proliferative phase → secretory phase.',
  },
  diagram: {
    title: 'Two cycles running together',
    caption: '28-day example only. Real cycles vary in length, and ovulation does not always happen on day 14.',
    dayLabel: 'Day',
    ovarian: 'Ovarian cycle (ovaries)',
    uterine: 'Uterine cycle (lining of the uterus)',
    ovarianSegments: [
      { from: 1, to: 13, label: 'Follicular', tone: 'early' },
      { from: 14, to: 14, label: 'Ovulation', tone: 'ovulation' },
      { from: 15, to: 28, label: 'Luteal', tone: 'late' },
    ],
    uterineSegments: [
      { from: 1, to: 5, label: 'Menstrual', tone: 'period' },
      { from: 6, to: 14, label: 'Proliferative', tone: 'early' },
      { from: 15, to: 28, label: 'Secretory', tone: 'late' },
    ],
  },
  overview: {
    title: '1. Simple overview',
    paragraphs: [
      'Each cycle, the body prepares for a possible pregnancy in two places at the same time.',
      'The ovaries are two small organs, one on each side of the uterus. In each cycle a follicle (a tiny fluid-filled sac that holds an egg) grows in an ovary, and usually one egg is released. This release is called ovulation.',
      'The uterus (womb) builds up its inner lining, called the endometrium, so that a fertilised egg could attach to it and grow.',
      'If pregnancy does not happen, hormone levels fall. The lining is no longer needed, so it is shed through the vagina as a period, and a new cycle begins.',
      'Adult cycles commonly last about 21 to 35 days, and bleeding usually lasts about 2 to 7 days. In the first few years after periods start, cycles are often longer and less regular.',
    ],
  },
  timeline: {
    title: '2. 28-day example timeline',
    note: 'All days are approximate and use a 28-day cycle only as an example. Cycle length and the day of ovulation vary from person to person and from cycle to cycle. Not everyone ovulates on day 14.',
    dayOne: 'Day 1 is the first day of full menstrual bleeding (not light spotting before it).',
    swipe: 'Swipe sideways to see all columns.',
    columns: ['Approximate days', 'Ovarian phase', 'Uterine phase', 'Main hormones', 'What happens in the ovaries', 'What happens in the uterus', 'Possible experiences', 'Fertility relevance'],
    rows: [
      ['Day 1', 'Follicular phase begins', 'Menstrual phase begins', 'Estrogen and progesterone are low; FSH starts to rise', 'A new group of follicles starts to grow', 'The lining begins to shed; full bleeding starts', 'Bleeding, cramps, tiredness for some', 'The reference point: counting of the cycle starts here'],
      ['Days 1–5', 'Early follicular', 'Menstrual', 'Low estrogen and progesterone; FSH rising', 'Several follicles grow', 'The endometrium sheds, with blood and fluid', 'Bleeding, cramps, lower back pain, bloating, tiredness, or few symptoms', 'Usually low, but in short cycles sex near the end of a period can lead to pregnancy'],
      ['Days 1–13/14', 'Follicular', 'Menstrual, then proliferative', 'FSH, then rising estrogen (estradiol)', 'One follicle becomes dominant and matures, making more estrogen', 'After bleeding stops, the lining rebuilds', 'Energy and mood may lift for some as estrogen rises', 'Rises towards the end of this phase; its length varies the most'],
      ['Days 6–13', 'Mid to late follicular', 'Proliferative', 'Rising estrogen', 'The dominant follicle grows towards maturity', 'The lining thickens; cervical mucus may become clearer and more slippery', 'More vaginal discharge for some', 'The fertile window can begin, about 5 days before ovulation'],
      ['Around day 14', 'Ovulation', 'End of proliferative', 'LH surge; estrogen peaks', 'The mature follicle releases an egg', 'The lining is thick; mucus is often at its most slippery', 'A brief one-sided twinge or light spotting for some; many notice nothing', 'Most fertile: the 1–2 days before ovulation and the day itself'],
      ['Days 15–28', 'Luteal', 'Secretory', 'Progesterone high, some estrogen', 'The empty follicle becomes the corpus luteum and makes progesterone', 'The lining becomes softer and richer, ready for a possible embryo; mucus thickens', 'Slightly higher resting temperature; breast tenderness or bloating for some', 'Falls quickly from about a day after ovulation'],
      ['Days 22–28', 'Late luteal', 'Late secretory', 'If not pregnant: progesterone and estrogen fall', 'The corpus luteum breaks down', 'The lining is no longer maintained; the next period begins', 'Possible premenstrual symptoms (PMS)', 'Low. If pregnancy has begun, hCG keeps progesterone high and no period comes'],
    ],
  },
  phasesTitle: '3. Every phase in detail',
  phases: [
    {
      id: 'menstrual', title: 'A. Menstrual phase: about days 1–5',
      fields: [
        { label: 'Timing (28-day example)', text: 'About days 1–5. Bleeding commonly lasts 2–7 days.' },
        { label: 'Overlaps with', text: 'The uterine menstrual phase is also the start of the ovarian follicular phase.' },
        { label: 'Hormones', text: 'Estrogen and progesterone are at their lowest, because they fell at the end of the previous cycle. These low levels allow FSH to start rising.' },
        { label: 'Ovaries', text: 'With hormones low, the brain signals the ovaries again and a new group of follicles begins to grow. That is why the period is also the first part of the follicular phase.' },
        { label: 'Uterus and lining', text: 'When progesterone falls, the small blood vessels in the lining tighten and the upper layer of the endometrium breaks away. Chemicals called prostaglandins make the uterus contract to push it out, which can cause cramps. Menstrual fluid is mainly this shed lining, plus blood, mucus and other fluid. An unfertilised egg does not simply come out in the period: it breaks down in the body, usually within about a day of ovulation.' },
        { label: 'Cervical mucus', text: 'Usually not noticeable because of the bleeding.' },
        { label: 'Possible experiences', text: 'Bleeding that is often heavier in the first days, cramps, lower back pain, tiredness, bloating, headaches or looser stools. Some people have few or no symptoms.' },
        { label: 'Fertility', text: 'Usually low. But sperm can survive in the body for up to about 5 days, so in a short cycle, sex towards the end of a period can lead to pregnancy.' },
        { label: 'Pregnancy or not', text: 'A period means the previous cycle did not lead to pregnancy. Some bleeding can happen in early pregnancy and is not a period; anyone who might be pregnant and is bleeding should check with a health professional.' },
      ],
    },
    {
      id: 'follicular', title: 'B. Follicular phase: about days 1–13/14',
      fields: [
        { label: 'Timing (28-day example)', text: 'From day 1 until ovulation, about day 13/14 in the example. This is the most variable part of the cycle: when cycles are longer or shorter, this phase is usually the one that changes.' },
        { label: 'Overlaps with', text: 'The uterine menstrual phase and then the proliferative phase.' },
        { label: 'Hormones', text: 'The hypothalamus (a control area in the brain) releases GnRH (gonadotropin-releasing hormone) in pulses. GnRH tells the pituitary gland, just below the brain, to release FSH (follicle-stimulating hormone) and some LH (luteinising hormone). Growing follicles make estrogen, mainly estradiol, which rises through this phase.' },
        { label: 'Ovaries', text: 'FSH helps several follicles grow. Usually one becomes the dominant follicle and keeps growing, while the others stop and are reabsorbed. The dominant follicle makes more and more estradiol.' },
        { label: 'Uterus and lining', text: 'After bleeding stops, the rising estrogen starts rebuilding the lining (see the proliferative phase).' },
        { label: 'Cervical mucus', text: 'Often little after the period, then gradually more and wetter as estrogen rises.' },
        { label: 'Possible experiences', text: 'Some people feel more energetic as estrogen rises, but this differs a lot between people and between cycles.' },
        { label: 'Fertility', text: 'Rises towards the end of this phase, because sperm from sex in the days before ovulation can still be alive when the egg is released.' },
        { label: 'Pregnancy or not', text: 'Nothing is decided in this phase; the body is preparing for ovulation.' },
      ],
    },
    {
      id: 'proliferative', title: 'C. Proliferative phase: about days 6–13',
      fields: [
        { label: 'Timing (28-day example)', text: 'About days 6–13, from the end of bleeding until ovulation.' },
        { label: 'Overlaps with', text: 'The middle and late ovarian follicular phase.' },
        { label: 'Hormones', text: 'Rising estrogen (estradiol).' },
        { label: 'Ovaries', text: 'The dominant follicle grows towards maturity.' },
        { label: 'Uterus and lining', text: '“Proliferative” means growing. Estrogen makes the cells and blood vessels of the endometrium multiply, so the lining becomes thicker, preparing for a possible pregnancy.' },
        { label: 'Cervical mucus', text: 'Cervical mucus is fluid made by the cervix, the narrow lower end of the uterus that opens into the vagina. As ovulation gets closer, many people notice it becoming clearer, wetter, stretchier and more slippery, a bit like raw egg white. This helps sperm travel. The amount and appearance differ between people, and mucus changes alone cannot confirm ovulation.' },
        { label: 'Possible experiences', text: 'More vaginal discharge for some; many people notice little change.' },
        { label: 'Fertility', text: 'The fertile window can begin during these days, about 5 days before ovulation.' },
        { label: 'Pregnancy or not', text: 'The lining is getting ready. What happens next depends on ovulation and whether an egg is fertilised.' },
      ],
    },
    {
      id: 'ovulation', title: 'D. Ovulation: around day 14 in a 28-day example',
      fields: [
        { label: 'Timing (28-day example)', text: 'Around day 14 in the example, but it often happens earlier or later, even in regular cycles, and it can move from one cycle to the next. In longer cycles it usually happens later. Stress, illness and other changes can delay it, and some cycles have no ovulation at all.' },
        { label: 'Overlaps with', text: 'The turning point between the ovarian follicular and luteal phases. The uterine lining is at the end of its proliferative phase.' },
        { label: 'Hormones', text: 'When estrogen from the dominant follicle stays high for long enough, it makes the pituitary release a large burst of LH, called the LH surge. Ovulation usually follows about 24 to 36 hours later.' },
        { label: 'Ovaries', text: 'The mature follicle opens and releases the egg. The egg is picked up by the fallopian tube, the tube between the ovary and the uterus, where fertilisation by a sperm can happen.' },
        { label: 'Uterus and lining', text: 'The lining is thick and ready for the changes that progesterone brings next.' },
        { label: 'Cervical mucus', text: 'Often at its clearest and most slippery around this time, though not for everyone.' },
        { label: 'Possible experiences', text: 'Some people feel a brief, one-sided pain low in the belly (called mittelschmerz) or notice light spotting. Many notice nothing. None of these signs confirms that ovulation has happened.' },
        { label: 'Fertility', text: 'The fertile window runs from about 5 days before ovulation through roughly a day after it. Sperm can survive in the body for up to about 5 days, while the egg lives only about 12 to 24 hours. Pregnancy is most likely from sex in the 1–2 days before ovulation and on the day itself.' },
        { label: 'Pregnancy or not', text: 'If a sperm fertilises the egg, the fertilised egg travels to the uterus over several days and may implant in the lining. If not, the egg breaks down in the body.' },
      ],
    },
    {
      id: 'luteal', title: 'E. Luteal phase: about days 15–28',
      fields: [
        { label: 'Timing (28-day example)', text: 'About days 15–28. For many people this phase lasts about 11 to 17 days and changes less than the follicular phase, but it is not the same for everyone.' },
        { label: 'Overlaps with', text: 'The uterine secretory phase.' },
        { label: 'Hormones', text: 'The corpus luteum makes progesterone, which rises and is highest about a week after ovulation. It also makes some estrogen.' },
        { label: 'Ovaries', text: 'After the egg is released, the empty follicle turns into the corpus luteum (Latin for “yellow body”), a temporary gland that makes hormones.' },
        { label: 'Uterus and lining', text: 'Progesterone changes the thickened lining: its glands release nutrients and it becomes softer and richer in blood vessels, ready to receive an embryo. This is called the secretory phase.' },
        { label: 'Cervical mucus', text: 'Usually becomes thicker, stickier and less noticeable, which makes it harder for sperm to pass.' },
        { label: 'Possible experiences', text: 'Progesterone can raise basal body temperature (your temperature at complete rest, measured first thing in the morning) by roughly 0.2–0.5 °C. The rise shows only after ovulation has already happened, so it cannot predict ovulation in the same cycle. Some people notice cramps, mood changes, acne, breast tenderness, energy changes or changes in libido (sex drive). These are possible but not universal, and none of them can confirm ovulation or pregnancy.' },
        { label: 'Fertility', text: 'Pregnancy becomes very unlikely from about a day after ovulation until the next cycle.' },
        { label: 'Pregnancy or not', text: 'If an embryo implants, it starts making hCG, which keeps the corpus luteum working. If not, the late luteal phase follows.' },
      ],
    },
    {
      id: 'late-luteal', title: 'F. Late luteal phase: about days 22–28',
      fields: [
        { label: 'Timing (28-day example)', text: 'About days 22–28 in the example.' },
        { label: 'Overlaps with', text: 'The late uterine secretory phase, leading into the next menstrual phase.' },
        { label: 'Hormones', text: 'Without hCG from a pregnancy, progesterone and estrogen fall.' },
        { label: 'Ovaries', text: 'The corpus luteum shrinks and stops making hormones. As hormones fall, FSH begins to rise again, starting the next follicular phase.' },
        { label: 'Uterus and lining', text: 'Without progesterone, the lining is no longer maintained. Its blood vessels tighten, the tissue breaks down, and the next period begins. That day becomes day 1 of the next cycle.' },
        { label: 'Cervical mucus', text: 'Often thick or dry; some people notice more wetness just before the period.' },
        { label: 'Possible experiences', text: 'Premenstrual symptoms (PMS) are most common in the days before a period: mood changes, irritability, anxiety, tiredness, poor sleep, bloating, breast tenderness, acne, headaches or food cravings. They usually ease once bleeding starts. PMDD (premenstrual dysphoric disorder) is a severe form with intense mood symptoms; it is a medical condition that can be treated.' },
        { label: 'Fertility', text: 'Low.' },
        { label: 'Pregnancy or not', text: 'If pregnancy has not occurred, menstruation begins. If it has, hCG keeps progesterone high and a period does not start. A late period has many possible causes; only a pregnancy test, and a health professional, can tell whether someone is pregnant.' },
      ],
    },
  ],
  outcomes: {
    title: '4. Pregnancy versus no pregnancy',
    items: [
      { label: 'If pregnancy does not occur', text: 'The corpus luteum breaks down, progesterone and estrogen fall, the lining is shed as a period, and a new cycle begins.' },
      { label: 'If pregnancy occurs', text: 'A fertilised egg usually implants in the lining about 6 to 12 days after ovulation. Cells that will form the placenta start making hCG (human chorionic gonadotropin). hCG keeps the corpus luteum making progesterone, so the lining is maintained and no period comes. Over the first weeks of pregnancy the placenta takes over most progesterone production, by around 10 weeks. hCG is the hormone that pregnancy tests detect.' },
    ],
  },
  hormones: {
    title: '5. Hormone guide',
    items: [
      { name: 'GnRH', full: 'Gonadotropin-releasing hormone', text: 'Made by the hypothalamus in the brain and released in pulses. It tells the pituitary gland to make FSH and LH.' },
      { name: 'FSH', full: 'Follicle-stimulating hormone', text: 'Made by the pituitary gland. It helps follicles in the ovaries grow and start making estrogen.' },
      { name: 'LH', full: 'Luteinising hormone', text: 'Made by the pituitary gland. A sudden LH surge triggers ovulation, and LH also supports the corpus luteum. Home ovulation tests detect this surge in urine; a positive test suggests ovulation may follow soon but does not prove it happened.' },
      { name: 'Estrogen / estradiol', full: 'Estradiol is the main estrogen during the reproductive years', text: 'Made mostly by growing follicles. It rebuilds the uterine lining, changes cervical mucus, and at high, sustained levels triggers the LH surge.' },
      { name: 'Progesterone', full: 'The main hormone of the luteal phase', text: 'Made mainly by the corpus luteum after ovulation, and later by the placenta in pregnancy. It prepares and maintains the uterine lining and can raise resting body temperature slightly. When it falls, the period starts.' },
      { name: 'hCG', full: 'Human chorionic gonadotropin', text: 'Made during pregnancy by cells that form the placenta. It keeps the corpus luteum making progesterone. Pregnancy tests detect it.' },
    ],
    sequenceTitle: 'The sequence in plain words',
    sequence: [
      'GnRH from the brain signals the pituitary gland.',
      'FSH helps follicles in the ovary develop.',
      'Growing follicles make estrogen, which rises.',
      'Estrogen that stays high triggers the LH surge.',
      'Ovulation: the mature follicle releases an egg.',
      'The corpus luteum makes progesterone to support the lining.',
      'If pregnancy does not occur, progesterone and estrogen fall and a period begins.',
    ],
  },
  variation: {
    title: '6. Normal variation and important notes',
    intro: 'Cycles are not the same every month. Length, flow and symptoms can change because of:',
    items: [
      { label: 'Puberty', text: 'In the first few years after periods start, cycles are often irregular and can be longer, sometimes up to about 45 days.' },
      { label: 'Stress, illness, travel, sleep changes or big weight changes', text: 'These can delay ovulation or skip it, which makes a period come late or not at all.' },
      { label: 'Pregnancy, after giving birth, and breastfeeding', text: 'Periods stop during pregnancy. After birth, and especially while breastfeeding, periods and ovulation can take months to return, and ovulation can come back before the first period.' },
      { label: 'Perimenopause', text: 'The years before menopause, often starting in the 40s. Cycles may become shorter, longer, heavier, lighter or skipped. Menopause is confirmed after 12 months in a row without a period.' },
      { label: 'PCOS, thyroid conditions and other health conditions', text: 'Polycystic ovary syndrome (PCOS), thyroid problems, high prolactin, very intense exercise, eating disorders and some medicines can cause irregular or missed periods.' },
      { label: 'Hormonal birth control', text: 'Pills, patches, rings, injections, implants and hormonal IUDs can change bleeding patterns, and many methods stop ovulation. The bleed in a pill-free week is a withdrawal bleed, not a true period.' },
    ],
    notesTitle: 'Important',
    notes: [
      'Calendar tracking and period apps, including Ritu, only estimate. On their own they are not a reliable way to prevent pregnancy. To avoid pregnancy, talk to a health professional about contraception.',
      'A predicted fertile window or ovulation day is an estimate based on past cycles, not a measurement of what your body is doing.',
    ],
  },
  care: {
    title: '7. When to seek medical care',
    intro: 'Most cycle changes are harmless, but some are worth checking. Contact a doctor, nurse or other health professional if you have:',
    items: [
      'Severe or worsening pelvic pain, or pain that stops you from doing everyday things',
      'Very heavy bleeding, such as soaking a pad or tampon every 1–2 hours for several hours or passing large clots, or bleeding that lasts more than 7 days',
      'Bleeding between periods',
      'Bleeding after sex',
      'Any bleeding after menopause',
      'A sudden, major change in your cycle, or no period for 3 months when you are not pregnant, breastfeeding or using contraception that stops periods',
      'Bleeding or pain when you might be pregnant (get urgent help for severe one-sided pain, dizziness or fainting)',
      'PMS or PMDD symptoms that are distressing or affect your relationships, work or studies',
    ],
    outro: 'If low mood ever includes thoughts of harming yourself, seek help straight away.',
  },
  summary: {
    title: 'Summary',
    text: 'The cycle starts on the first day of full bleeding. In the ovaries, a follicle grows (follicular phase), releases an egg (ovulation) and turns into the corpus luteum (luteal phase). In the uterus, the lining sheds (menstrual phase), rebuilds with estrogen (proliferative phase) and matures with progesterone (secretory phase). Without pregnancy, hormones fall and the next period begins; with pregnancy, hCG keeps progesterone high. The 28-day, day-14 pattern is only an example: every body, and every cycle, can differ.',
  },
  sources: {
    title: 'Sources',
    intro: 'This guide is consistent with patient information from:',
    items: [
      'American College of Obstetricians and Gynecologists (ACOG): patient information on menstruation, heavy menstrual bleeding and premenstrual syndrome',
      'NHS (UK): Periods; Premenstrual syndrome (PMS)',
      'U.S. Office on Women’s Health: Your menstrual cycle',
    ],
  },
};

const hi: LearnContent = {
  title: 'पीरियड की साइकिल कैसे चलती है',
  intro: 'यह महिलाओं और पीरियड होने वाले दूसरे सभी लोगों के लिए आसान भाषा में जानकारी है। इसमें बताया गया है कि साइकिल के दौरान शरीर में आम तौर पर क्या होता है। यह सिर्फ़ सामान्य जानकारी है। इससे किसी बीमारी का पता नहीं लगाया जा सकता, न यह बताया जा सकता है कि आप प्रेगनेंट हैं या नहीं, और न यह पक्का किया जा सकता है कि ओव्यूलेशन कब हुआ।',
  contents: 'इस पेज पर',
  simplified: {
    title: '“चार फ़ेज़” समझाने का आसान तरीका भर है',
    text: 'साइकिल को अक्सर चार फ़ेज़ में समझाया जाता है। यह समझाने का आसान तरीका है। असल में शरीर में दो साइकिल एक साथ चलती हैं और एक-दूसरे पर चढ़ी होती हैं। ओवरी की साइकिल (अंडाशय में क्या होता है): फ़ॉलिक्युलर फ़ेज़ → ओव्यूलेशन → ल्यूटियल फ़ेज़। गर्भाशय की साइकिल (गर्भाशय की अंदरूनी परत में क्या होता है): मेंस्ट्रुअल फ़ेज़ → प्रोलिफ़रेटिव फ़ेज़ → सिक्रेटरी फ़ेज़।',
  },
  diagram: {
    title: 'साथ-साथ चलने वाली दो साइकिल',
    caption: 'सिर्फ़ 28 दिन का उदाहरण। असल साइकिल की लंबाई अलग-अलग होती है, और ओव्यूलेशन हमेशा 14वें दिन नहीं होता।',
    dayLabel: 'दिन',
    ovarian: 'ओवरी की साइकिल (अंडाशय)',
    uterine: 'गर्भाशय की साइकिल (अंदरूनी परत)',
    ovarianSegments: [
      { from: 1, to: 13, label: 'फ़ॉलिक्युलर', tone: 'early' },
      { from: 14, to: 14, label: 'ओव्यूलेशन', tone: 'ovulation' },
      { from: 15, to: 28, label: 'ल्यूटियल', tone: 'late' },
    ],
    uterineSegments: [
      { from: 1, to: 5, label: 'मेंस्ट्रुअल', tone: 'period' },
      { from: 6, to: 14, label: 'प्रोलिफ़रेटिव', tone: 'early' },
      { from: 15, to: 28, label: 'सिक्रेटरी', tone: 'late' },
    ],
  },
  overview: {
    title: '1. आसान शब्दों में',
    paragraphs: [
      'हर साइकिल में शरीर एक साथ दो जगह पर संभावित प्रेगनेंसी की तैयारी करता है।',
      'ओवरी (अंडाशय) गर्भाशय के दोनों तरफ़ दो छोटे अंग होते हैं। हर साइकिल में ओवरी में एक फ़ॉलिकल (अंडे वाली पानी से भरी छोटी-सी थैली) बढ़ता है, और आम तौर पर एक अंडा बाहर निकलता है। अंडे के निकलने को ओव्यूलेशन कहते हैं।',
      'गर्भाशय (बच्चेदानी) अपनी अंदरूनी परत, जिसे एंडोमेट्रियम कहते हैं, मोटी करता है, ताकि निषेचित अंडा (फ़र्टिलाइज़ हुआ अंडा) उससे चिपक कर बढ़ सके।',
      'अगर प्रेगनेंसी नहीं होती, तो हार्मोन कम हो जाते हैं। परत की ज़रूरत नहीं रहती, इसलिए वह योनि के रास्ते पीरियड के रूप में निकल जाती है, और नई साइकिल शुरू होती है।',
      'बड़ों में साइकिल आम तौर पर लगभग 21 से 35 दिन की होती है, और खून लगभग 2 से 7 दिन आता है। पीरियड शुरू होने के शुरुआती कुछ सालों में साइकिल अक्सर लंबी और कम नियमित होती है।',
    ],
  },
  timeline: {
    title: '2. 28 दिन के उदाहरण की समय-सारणी',
    note: 'सभी दिन अंदाज़न हैं और सिर्फ़ 28 दिन की साइकिल के उदाहरण के लिए हैं। साइकिल की लंबाई और ओव्यूलेशन का दिन हर व्यक्ति में और हर साइकिल में अलग हो सकता है। हर किसी का ओव्यूलेशन 14वें दिन नहीं होता।',
    dayOne: 'दिन 1 वह दिन है जब पूरा पीरियड (खून) शुरू होता है, उससे पहले के हल्के धब्बे नहीं।',
    swipe: 'सभी कॉलम देखने के लिए बगल में स्वाइप करें।',
    columns: ['अंदाज़न दिन', 'ओवरी का फ़ेज़', 'गर्भाशय का फ़ेज़', 'मुख्य हार्मोन', 'ओवरी में क्या होता है', 'गर्भाशय में क्या होता है', 'क्या महसूस हो सकता है', 'प्रेगनेंसी की संभावना'],
    rows: [
      ['दिन 1', 'फ़ॉलिक्युलर फ़ेज़ शुरू', 'मेंस्ट्रुअल फ़ेज़ शुरू', 'एस्ट्रोजन और प्रोजेस्टेरोन कम; FSH बढ़ना शुरू', 'फ़ॉलिकल का नया समूह बढ़ना शुरू होता है', 'परत निकलना शुरू होती है; पूरा पीरियड शुरू', 'खून, ऐंठन, कुछ लोगों को थकान', 'गिनती यहीं से शुरू होती है'],
      ['दिन 1–5', 'शुरुआती फ़ॉलिक्युलर', 'मेंस्ट्रुअल', 'एस्ट्रोजन और प्रोजेस्टेरोन कम; FSH बढ़ता हुआ', 'कई फ़ॉलिकल बढ़ते हैं', 'एंडोमेट्रियम खून और तरल के साथ निकलता है', 'खून, ऐंठन, कमर दर्द, पेट फूलना, थकान, या बहुत कम लक्षण', 'आम तौर पर कम, पर छोटी साइकिल में पीरियड के आखिर में सेक्स से प्रेगनेंसी हो सकती है'],
      ['दिन 1–13/14', 'फ़ॉलिक्युलर', 'मेंस्ट्रुअल, फिर प्रोलिफ़रेटिव', 'FSH, फिर बढ़ता एस्ट्रोजन (एस्ट्राडियोल)', 'एक फ़ॉलिकल आगे निकल कर पकता है और ज़्यादा एस्ट्रोजन बनाता है', 'खून रुकने के बाद परत फिर से बनती है', 'एस्ट्रोजन बढ़ने से कुछ लोगों का मूड और ताकत बेहतर लग सकते हैं', 'इस फ़ेज़ के आखिर की ओर बढ़ती है; इसी फ़ेज़ की लंबाई सबसे ज़्यादा बदलती है'],
      ['दिन 6–13', 'बीच से आखिरी फ़ॉलिक्युलर', 'प्रोलिफ़रेटिव', 'बढ़ता एस्ट्रोजन', 'मुख्य फ़ॉलिकल पकने की ओर बढ़ता है', 'परत मोटी होती है; सर्वाइकल म्यूकस साफ़ और चिकना हो सकता है', 'कुछ लोगों को ज़्यादा सफ़ेद पानी', 'फर्टाइल दिन शुरू हो सकते हैं, ओव्यूलेशन से लगभग 5 दिन पहले'],
      ['लगभग दिन 14', 'ओव्यूलेशन', 'प्रोलिफ़रेटिव का आखिर', 'LH का अचानक बढ़ना; एस्ट्रोजन सबसे ज़्यादा', 'पका हुआ फ़ॉलिकल अंडा छोड़ता है', 'परत मोटी होती है; म्यूकस अक्सर सबसे चिकना', 'कुछ लोगों को एक तरफ़ हल्की चुभन या हल्के धब्बे; बहुत लोगों को कुछ पता नहीं चलता', 'सबसे ज़्यादा: ओव्यूलेशन से 1–2 दिन पहले और उसी दिन'],
      ['दिन 15–28', 'ल्यूटियल', 'सिक्रेटरी', 'प्रोजेस्टेरोन ज़्यादा, थोड़ा एस्ट्रोजन', 'खाली फ़ॉलिकल कॉर्पस ल्यूटियम बनकर प्रोजेस्टेरोन बनाता है', 'परत नरम और पोषण से भरी होती है; म्यूकस गाढ़ा होता है', 'आराम के समय का तापमान थोड़ा ज़्यादा; कुछ लोगों को स्तनों में दर्द या पेट फूलना', 'ओव्यूलेशन के लगभग एक दिन बाद से तेज़ी से कम'],
      ['दिन 22–28', 'आखिरी ल्यूटियल', 'आखिरी सिक्रेटरी', 'प्रेगनेंसी न हो तो प्रोजेस्टेरोन और एस्ट्रोजन गिरते हैं', 'कॉर्पस ल्यूटियम खत्म होने लगता है', 'परत को सहारा नहीं मिलता; अगला पीरियड शुरू होता है', 'पीरियड से पहले के लक्षण (PMS) हो सकते हैं', 'कम। अगर प्रेगनेंसी शुरू हुई है तो hCG प्रोजेस्टेरोन को ऊँचा रखता है और पीरियड नहीं आता'],
    ],
  },
  phasesTitle: '3. हर फ़ेज़ विस्तार से',
  phases: [
    {
      id: 'menstrual', title: 'A. मेंस्ट्रुअल फ़ेज़: लगभग दिन 1–5',
      fields: [
        { label: 'समय (28 दिन का उदाहरण)', text: 'लगभग दिन 1–5। खून आम तौर पर 2–7 दिन आता है।' },
        { label: 'किसके साथ चलता है', text: 'गर्भाशय का मेंस्ट्रुअल फ़ेज़ ही ओवरी के फ़ॉलिक्युलर फ़ेज़ की शुरुआत भी है।' },
        { label: 'हार्मोन', text: 'एस्ट्रोजन और प्रोजेस्टेरोन सबसे कम होते हैं, क्योंकि पिछली साइकिल के आखिर में ये गिर गए थे। इनके कम होने से FSH बढ़ना शुरू होता है।' },
        { label: 'ओवरी', text: 'हार्मोन कम होने पर दिमाग़ फिर से ओवरी को संकेत देता है और फ़ॉलिकल का नया समूह बढ़ना शुरू करता है। इसीलिए पीरियड फ़ॉलिक्युलर फ़ेज़ का पहला हिस्सा भी है।' },
        { label: 'गर्भाशय और उसकी परत', text: 'प्रोजेस्टेरोन गिरने पर परत की छोटी खून की नलियाँ सिकुड़ जाती हैं और एंडोमेट्रियम की ऊपरी परत टूट कर अलग हो जाती है। प्रोस्टाग्लैंडिन नाम के रसायन गर्भाशय को सिकोड़ कर परत को बाहर धकेलते हैं, जिससे ऐंठन हो सकती है। पीरियड में मुख्य रूप से यही परत होती है, साथ में खून, म्यूकस और दूसरा तरल। बिना निषेचन वाला अंडा पीरियड में यूँ ही बाहर नहीं आता: वह शरीर में ही, आम तौर पर ओव्यूलेशन के लगभग एक दिन के अंदर, घुल कर खत्म हो जाता है।' },
        { label: 'सर्वाइकल म्यूकस', text: 'खून की वजह से आम तौर पर पता नहीं चलता।' },
        { label: 'क्या महसूस हो सकता है', text: 'पहले दिनों में अक्सर ज़्यादा खून, ऐंठन, कमर दर्द, थकान, पेट फूलना, सिरदर्द या पतला मल। कुछ लोगों को बहुत कम या कोई लक्षण नहीं होते।' },
        { label: 'प्रेगनेंसी की संभावना', text: 'आम तौर पर कम। पर शुक्राणु शरीर में लगभग 5 दिन तक ज़िंदा रह सकते हैं, इसलिए छोटी साइकिल में पीरियड के आखिर में सेक्स से प्रेगनेंसी हो सकती है।' },
        { label: 'प्रेगनेंसी हो या न हो', text: 'पीरियड का मतलब है कि पिछली साइकिल में प्रेगनेंसी नहीं हुई। शुरुआती प्रेगनेंसी में भी कभी-कभी खून आ सकता है जो पीरियड नहीं होता; जिसे प्रेगनेंसी की संभावना हो और खून आ रहा हो, उसे डॉक्टर या नर्स से जाँच करवानी चाहिए।' },
      ],
    },
    {
      id: 'follicular', title: 'B. फ़ॉलिक्युलर फ़ेज़: लगभग दिन 1–13/14',
      fields: [
        { label: 'समय (28 दिन का उदाहरण)', text: 'दिन 1 से ओव्यूलेशन तक, उदाहरण में लगभग दिन 13/14। यह साइकिल का सबसे ज़्यादा बदलने वाला हिस्सा है: जब साइकिल लंबी या छोटी होती है, तो आम तौर पर यही फ़ेज़ बदलता है।' },
        { label: 'किसके साथ चलता है', text: 'गर्भाशय का मेंस्ट्रुअल फ़ेज़, और उसके बाद प्रोलिफ़रेटिव फ़ेज़।' },
        { label: 'हार्मोन', text: 'हाइपोथैलेमस (दिमाग़ का एक नियंत्रण वाला हिस्सा) रुक-रुक कर GnRH (गोनाडोट्रोपिन-रिलीज़िंग हार्मोन) छोड़ता है। GnRH दिमाग़ के ठीक नीचे की पिट्यूटरी ग्रंथि को FSH (फ़ॉलिकल-स्टिमुलेटिंग हार्मोन) और थोड़ा LH (ल्यूटिनाइज़िंग हार्मोन) छोड़ने को कहता है। बढ़ते फ़ॉलिकल एस्ट्रोजन बनाते हैं, खास तौर पर एस्ट्राडियोल, जो इस फ़ेज़ में बढ़ता जाता है।' },
        { label: 'ओवरी', text: 'FSH कई फ़ॉलिकल को बढ़ने में मदद करता है। आम तौर पर एक फ़ॉलिकल मुख्य (डॉमिनेंट) बन कर बढ़ता रहता है, और बाकी रुक कर शरीर में घुल जाते हैं। मुख्य फ़ॉलिकल ज़्यादा से ज़्यादा एस्ट्राडियोल बनाता है।' },
        { label: 'गर्भाशय और उसकी परत', text: 'खून रुकने के बाद बढ़ता एस्ट्रोजन परत को फिर से बनाना शुरू करता है (प्रोलिफ़रेटिव फ़ेज़ देखें)।' },
        { label: 'सर्वाइकल म्यूकस', text: 'पीरियड के बाद अक्सर कम, फिर एस्ट्रोजन बढ़ने के साथ धीरे-धीरे ज़्यादा और गीला।' },
        { label: 'क्या महसूस हो सकता है', text: 'एस्ट्रोजन बढ़ने पर कुछ लोगों को ज़्यादा ताकत महसूस होती है, पर यह हर व्यक्ति और हर साइकिल में बहुत अलग होता है।' },
        { label: 'प्रेगनेंसी की संभावना', text: 'इस फ़ेज़ के आखिर की ओर बढ़ती है, क्योंकि ओव्यूलेशन से पहले के दिनों में सेक्स से आए शुक्राणु अंडा निकलने तक ज़िंदा रह सकते हैं।' },
        { label: 'प्रेगनेंसी हो या न हो', text: 'इस फ़ेज़ में अभी कुछ तय नहीं होता; शरीर ओव्यूलेशन की तैयारी कर रहा होता है।' },
      ],
    },
    {
      id: 'proliferative', title: 'C. प्रोलिफ़रेटिव फ़ेज़: लगभग दिन 6–13',
      fields: [
        { label: 'समय (28 दिन का उदाहरण)', text: 'लगभग दिन 6–13, खून रुकने से ओव्यूलेशन तक।' },
        { label: 'किसके साथ चलता है', text: 'ओवरी के फ़ॉलिक्युलर फ़ेज़ का बीच और आखिरी हिस्सा।' },
        { label: 'हार्मोन', text: 'बढ़ता एस्ट्रोजन (एस्ट्राडियोल)।' },
        { label: 'ओवरी', text: 'मुख्य फ़ॉलिकल पकने की ओर बढ़ता है।' },
        { label: 'गर्भाशय और उसकी परत', text: '“प्रोलिफ़रेटिव” का मतलब है बढ़ना। एस्ट्रोजन एंडोमेट्रियम की कोशिकाओं और खून की नलियों को बढ़ाता है, जिससे परत मोटी होती है और संभावित प्रेगनेंसी के लिए तैयार होती है।' },
        { label: 'सर्वाइकल म्यूकस', text: 'सर्वाइकल म्यूकस वह तरल है जो सर्विक्स (गर्भाशय का निचला, पतला हिस्सा जो योनि में खुलता है) बनाता है। ओव्यूलेशन पास आने पर बहुत से लोगों को यह ज़्यादा साफ़, गीला, खिंचने वाला और चिकना लगता है, कुछ-कुछ कच्चे अंडे की सफ़ेदी जैसा। इससे शुक्राणु आसानी से आगे बढ़ते हैं। इसकी मात्रा और रूप हर व्यक्ति में अलग होते हैं, और सिर्फ़ म्यूकस देख कर ओव्यूलेशन पक्का नहीं किया जा सकता।' },
        { label: 'क्या महसूस हो सकता है', text: 'कुछ लोगों को ज़्यादा सफ़ेद पानी; बहुत से लोगों को ज़्यादा फ़र्क नहीं लगता।' },
        { label: 'प्रेगनेंसी की संभावना', text: 'इन दिनों में फर्टाइल दिन शुरू हो सकते हैं, ओव्यूलेशन से लगभग 5 दिन पहले।' },
        { label: 'प्रेगनेंसी हो या न हो', text: 'परत तैयार हो रही होती है। आगे क्या होगा यह ओव्यूलेशन पर और अंडे के निषेचन पर निर्भर करता है।' },
      ],
    },
    {
      id: 'ovulation', title: 'D. ओव्यूलेशन: 28 दिन के उदाहरण में लगभग दिन 14',
      fields: [
        { label: 'समय (28 दिन का उदाहरण)', text: 'उदाहरण में लगभग दिन 14, पर यह अक्सर पहले या बाद में होता है, नियमित साइकिल में भी, और हर साइकिल में बदल सकता है। लंबी साइकिल में यह आम तौर पर बाद में होता है। तनाव, बीमारी और दूसरे बदलाव इसे टाल सकते हैं, और कुछ साइकिल में ओव्यूलेशन होता ही नहीं।' },
        { label: 'किसके साथ चलता है', text: 'यह ओवरी के फ़ॉलिक्युलर और ल्यूटियल फ़ेज़ के बीच का मोड़ है। गर्भाशय की परत प्रोलिफ़रेटिव फ़ेज़ के आखिर में होती है।' },
        { label: 'हार्मोन', text: 'जब मुख्य फ़ॉलिकल का एस्ट्रोजन काफ़ी समय तक ऊँचा रहता है, तो पिट्यूटरी ग्रंथि अचानक बहुत सारा LH छोड़ती है, जिसे LH सर्ज कहते हैं। ओव्यूलेशन आम तौर पर इसके लगभग 24 से 36 घंटे बाद होता है।' },
        { label: 'ओवरी', text: 'पका हुआ फ़ॉलिकल खुलता है और अंडा छोड़ता है। अंडे को फ़ैलोपियन ट्यूब (ओवरी और गर्भाशय के बीच की नली) पकड़ लेती है, जहाँ शुक्राणु से निषेचन हो सकता है।' },
        { label: 'गर्भाशय और उसकी परत', text: 'परत मोटी होती है और प्रोजेस्टेरोन से होने वाले अगले बदलावों के लिए तैयार होती है।' },
        { label: 'सर्वाइकल म्यूकस', text: 'इस समय अक्सर सबसे साफ़ और चिकना होता है, पर हर किसी में नहीं।' },
        { label: 'क्या महसूस हो सकता है', text: 'कुछ लोगों को पेट के निचले हिस्से में एक तरफ़ थोड़ी देर का दर्द होता है (इसे मिटलश्मर्ज़ कहते हैं) या हल्के धब्बे दिखते हैं। बहुत से लोगों को कुछ पता नहीं चलता। इनमें से कोई भी संकेत यह पक्का नहीं करता कि ओव्यूलेशन हो गया है।' },
        { label: 'प्रेगनेंसी की संभावना', text: 'फर्टाइल दिन ओव्यूलेशन से लगभग 5 दिन पहले से लेकर उसके लगभग एक दिन बाद तक होते हैं। शुक्राणु शरीर में लगभग 5 दिन तक ज़िंदा रह सकते हैं, जबकि अंडा सिर्फ़ लगभग 12 से 24 घंटे जीता है। ओव्यूलेशन से 1–2 दिन पहले और उसी दिन सेक्स से प्रेगनेंसी की संभावना सबसे ज़्यादा होती है।' },
        { label: 'प्रेगनेंसी हो या न हो', text: 'अगर शुक्राणु अंडे को निषेचित कर देता है, तो निषेचित अंडा कई दिनों में गर्भाशय तक पहुँचता है और परत में जुड़ सकता है। अगर नहीं, तो अंडा शरीर में ही खत्म हो जाता है।' },
      ],
    },
    {
      id: 'luteal', title: 'E. ल्यूटियल फ़ेज़: लगभग दिन 15–28',
      fields: [
        { label: 'समय (28 दिन का उदाहरण)', text: 'लगभग दिन 15–28। बहुत से लोगों में यह फ़ेज़ लगभग 11 से 17 दिन का होता है और फ़ॉलिक्युलर फ़ेज़ से कम बदलता है, पर सबके लिए एक जैसा नहीं होता।' },
        { label: 'किसके साथ चलता है', text: 'गर्भाशय का सिक्रेटरी फ़ेज़।' },
        { label: 'हार्मोन', text: 'कॉर्पस ल्यूटियम प्रोजेस्टेरोन बनाता है, जो बढ़ता है और ओव्यूलेशन के लगभग एक हफ़्ते बाद सबसे ज़्यादा होता है। यह थोड़ा एस्ट्रोजन भी बनाता है।' },
        { label: 'ओवरी', text: 'अंडा निकलने के बाद खाली फ़ॉलिकल कॉर्पस ल्यूटियम (लैटिन में “पीला शरीर”) बन जाता है, जो कुछ समय के लिए हार्मोन बनाने वाली ग्रंथि है।' },
        { label: 'गर्भाशय और उसकी परत', text: 'प्रोजेस्टेरोन मोटी परत को बदलता है: उसकी ग्रंथियाँ पोषक तत्व छोड़ती हैं और परत नरम और खून की नलियों से भरी हो जाती है, ताकि भ्रूण उसमें जुड़ सके। इसे सिक्रेटरी फ़ेज़ कहते हैं।' },
        { label: 'सर्वाइकल म्यूकस', text: 'आम तौर पर गाढ़ा, चिपचिपा और कम हो जाता है, जिससे शुक्राणुओं का आगे जाना मुश्किल होता है।' },
        { label: 'क्या महसूस हो सकता है', text: 'प्रोजेस्टेरोन बेसल बॉडी टेम्परेचर (पूरे आराम में शरीर का तापमान, जो सुबह उठते ही नापा जाता है) को लगभग 0.2–0.5 °C बढ़ा सकता है। यह बढ़त ओव्यूलेशन हो जाने के बाद ही दिखती है, इसलिए इससे उसी साइकिल का ओव्यूलेशन पहले से नहीं बताया जा सकता। कुछ लोगों को ऐंठन, मूड में बदलाव, मुँहासे, स्तनों में दर्द, ताकत में बदलाव या सेक्स की इच्छा में बदलाव महसूस होते हैं। ये हो सकते हैं पर सबको नहीं होते, और इनसे ओव्यूलेशन या प्रेगनेंसी पक्की नहीं की जा सकती।' },
        { label: 'प्रेगनेंसी की संभावना', text: 'ओव्यूलेशन के लगभग एक दिन बाद से अगली साइकिल तक प्रेगनेंसी की संभावना बहुत कम हो जाती है।' },
        { label: 'प्रेगनेंसी हो या न हो', text: 'अगर भ्रूण परत में जुड़ जाता है, तो वह hCG बनाने लगता है, जो कॉर्पस ल्यूटियम को काम करता रखता है। अगर नहीं, तो आखिरी ल्यूटियल फ़ेज़ आता है।' },
      ],
    },
    {
      id: 'late-luteal', title: 'F. आखिरी ल्यूटियल फ़ेज़: लगभग दिन 22–28',
      fields: [
        { label: 'समय (28 दिन का उदाहरण)', text: 'उदाहरण में लगभग दिन 22–28।' },
        { label: 'किसके साथ चलता है', text: 'गर्भाशय का आखिरी सिक्रेटरी फ़ेज़, जो अगले मेंस्ट्रुअल फ़ेज़ की ओर ले जाता है।' },
        { label: 'हार्मोन', text: 'प्रेगनेंसी से hCG न मिलने पर प्रोजेस्टेरोन और एस्ट्रोजन गिर जाते हैं।' },
        { label: 'ओवरी', text: 'कॉर्पस ल्यूटियम सिकुड़ जाता है और हार्मोन बनाना बंद कर देता है। हार्मोन गिरने पर FSH फिर बढ़ने लगता है, और अगला फ़ॉलिक्युलर फ़ेज़ शुरू होता है।' },
        { label: 'गर्भाशय और उसकी परत', text: 'प्रोजेस्टेरोन के बिना परत को सहारा नहीं मिलता। उसकी खून की नलियाँ सिकुड़ती हैं, परत टूटती है, और अगला पीरियड शुरू होता है। वही दिन अगली साइकिल का दिन 1 बनता है।' },
        { label: 'सर्वाइकल म्यूकस', text: 'अक्सर गाढ़ा या सूखा; कुछ लोगों को पीरियड से ठीक पहले ज़्यादा गीलापन लगता है।' },
        { label: 'क्या महसूस हो सकता है', text: 'पीरियड से पहले के लक्षण (PMS) पीरियड से पहले के दिनों में सबसे आम होते हैं: मूड में बदलाव, चिड़चिड़ापन, घबराहट, थकान, नींद कम आना, पेट फूलना, स्तनों में दर्द, मुँहासे, सिरदर्द या खाने की इच्छा। खून शुरू होने पर ये आम तौर पर कम हो जाते हैं। PMDD (प्रीमेंस्ट्रुअल डिस्फ़ोरिक डिसऑर्डर) इसका गंभीर रूप है जिसमें मूड के लक्षण बहुत तेज़ होते हैं; यह एक बीमारी है जिसका इलाज होता है।' },
        { label: 'प्रेगनेंसी की संभावना', text: 'कम।' },
        { label: 'प्रेगनेंसी हो या न हो', text: 'अगर प्रेगनेंसी नहीं हुई, तो पीरियड शुरू होता है। अगर हुई है, तो hCG प्रोजेस्टेरोन को ऊँचा रखता है और पीरियड शुरू नहीं होता। पीरियड लेट होने की कई वजहें हो सकती हैं; प्रेगनेंसी है या नहीं, यह सिर्फ़ प्रेगनेंसी टेस्ट और डॉक्टर ही बता सकते हैं।' },
      ],
    },
  ],
  outcomes: {
    title: '4. प्रेगनेंसी हो या न हो',
    items: [
      { label: 'अगर प्रेगनेंसी नहीं होती', text: 'कॉर्पस ल्यूटियम खत्म हो जाता है, प्रोजेस्टेरोन और एस्ट्रोजन गिरते हैं, परत पीरियड के रूप में निकल जाती है, और नई साइकिल शुरू होती है।' },
      { label: 'अगर प्रेगनेंसी होती है', text: 'निषेचित अंडा आम तौर पर ओव्यूलेशन के लगभग 6 से 12 दिन बाद परत में जुड़ता है। जो कोशिकाएँ आगे चल कर प्लेसेंटा (आँवल) बनती हैं, वे hCG (ह्यूमन कोरियोनिक गोनाडोट्रोपिन) बनाने लगती हैं। hCG कॉर्पस ल्यूटियम से प्रोजेस्टेरोन बनवाता रहता है, इसलिए परत बनी रहती है और पीरियड नहीं आता। प्रेगनेंसी के पहले हफ़्तों में, लगभग 10वें हफ़्ते तक, प्रोजेस्टेरोन बनाने का ज़्यादातर काम प्लेसेंटा ले लेता है। प्रेगनेंसी टेस्ट इसी hCG को पहचानता है।' },
    ],
  },
  hormones: {
    title: '5. हार्मोन की जानकारी',
    items: [
      { name: 'GnRH', full: 'गोनाडोट्रोपिन-रिलीज़िंग हार्मोन', text: 'दिमाग़ का हाइपोथैलेमस इसे बनाता है और रुक-रुक कर छोड़ता है। यह पिट्यूटरी ग्रंथि को FSH और LH बनाने को कहता है।' },
      { name: 'FSH', full: 'फ़ॉलिकल-स्टिमुलेटिंग हार्मोन', text: 'पिट्यूटरी ग्रंथि बनाती है। यह ओवरी के फ़ॉलिकल को बढ़ने और एस्ट्रोजन बनाने में मदद करता है।' },
      { name: 'LH', full: 'ल्यूटिनाइज़िंग हार्मोन', text: 'पिट्यूटरी ग्रंथि बनाती है। LH का अचानक बढ़ना ओव्यूलेशन शुरू करता है, और LH कॉर्पस ल्यूटियम को भी सहारा देता है। घर पर किए जाने वाले ओव्यूलेशन टेस्ट पेशाब में इसी बढ़त को पहचानते हैं; पॉज़िटिव टेस्ट बताता है कि ओव्यूलेशन जल्दी हो सकता है, पर यह साबित नहीं करता कि ओव्यूलेशन हुआ।' },
      { name: 'एस्ट्रोजन / एस्ट्राडियोल', full: 'एस्ट्राडियोल प्रजनन के सालों का मुख्य एस्ट्रोजन है', text: 'ज़्यादातर बढ़ते फ़ॉलिकल बनाते हैं। यह गर्भाशय की परत दोबारा बनाता है, सर्वाइकल म्यूकस को बदलता है, और लंबे समय तक ऊँचा रहने पर LH सर्ज शुरू करता है।' },
      { name: 'प्रोजेस्टेरोन', full: 'ल्यूटियल फ़ेज़ का मुख्य हार्मोन', text: 'ओव्यूलेशन के बाद ज़्यादातर कॉर्पस ल्यूटियम बनाता है, और प्रेगनेंसी में बाद में प्लेसेंटा। यह गर्भाशय की परत को तैयार करता और बनाए रखता है, और आराम के समय का तापमान थोड़ा बढ़ा सकता है। इसके गिरने पर पीरियड शुरू होता है।' },
      { name: 'hCG', full: 'ह्यूमन कोरियोनिक गोनाडोट्रोपिन', text: 'प्रेगनेंसी में प्लेसेंटा बनाने वाली कोशिकाएँ बनाती हैं। यह कॉर्पस ल्यूटियम से प्रोजेस्टेरोन बनवाता रहता है। प्रेगनेंसी टेस्ट इसे पहचानता है।' },
    ],
    sequenceTitle: 'आसान शब्दों में क्रम',
    sequence: [
      'दिमाग़ से GnRH पिट्यूटरी ग्रंथि को संकेत देता है।',
      'FSH ओवरी के फ़ॉलिकल को बढ़ने में मदद करता है।',
      'बढ़ते फ़ॉलिकल एस्ट्रोजन बनाते हैं, जो बढ़ता जाता है।',
      'लगातार ऊँचा एस्ट्रोजन LH सर्ज शुरू करता है।',
      'ओव्यूलेशन: पका हुआ फ़ॉलिकल अंडा छोड़ता है।',
      'कॉर्पस ल्यूटियम परत को सहारा देने के लिए प्रोजेस्टेरोन बनाता है।',
      'प्रेगनेंसी न हो तो प्रोजेस्टेरोन और एस्ट्रोजन गिरते हैं और पीरियड शुरू होता है।',
    ],
  },
  variation: {
    title: '6. सामान्य बदलाव और ज़रूरी बातें',
    intro: 'साइकिल हर महीने एक जैसी नहीं होती। लंबाई, खून की मात्रा और लक्षण इन वजहों से बदल सकते हैं:',
    items: [
      { label: 'किशोरावस्था (प्यूबर्टी)', text: 'पीरियड शुरू होने के शुरुआती कुछ सालों में साइकिल अक्सर अनियमित होती है और लंबी हो सकती है, कभी-कभी लगभग 45 दिन तक।' },
      { label: 'तनाव, बीमारी, सफ़र, नींद में बदलाव या वज़न में बड़ा बदलाव', text: 'इनसे ओव्यूलेशन टल सकता है या छूट सकता है, जिससे पीरियड लेट आता है या नहीं आता।' },
      { label: 'प्रेगनेंसी, डिलीवरी के बाद, और स्तनपान', text: 'प्रेगनेंसी में पीरियड रुक जाते हैं। डिलीवरी के बाद, खास कर स्तनपान के दौरान, पीरियड और ओव्यूलेशन लौटने में महीने लग सकते हैं, और ओव्यूलेशन पहले पीरियड से पहले ही लौट सकता है।' },
      { label: 'पेरिमेनोपॉज़', text: 'मेनोपॉज़ से पहले के साल, जो अक्सर 40 की उम्र के बाद शुरू होते हैं। साइकिल छोटी, लंबी, ज़्यादा, कम या छूट सकती है। लगातार 12 महीने पीरियड न आने पर मेनोपॉज़ माना जाता है।' },
      { label: 'PCOS, थायरॉइड और दूसरी बीमारियाँ', text: 'पॉलीसिस्टिक ओवरी सिंड्रोम (PCOS), थायरॉइड की समस्या, प्रोलैक्टिन ज़्यादा होना, बहुत ज़्यादा कसरत, खाने से जुड़ी बीमारियाँ और कुछ दवाइयाँ पीरियड को अनियमित कर सकती हैं या रोक सकती हैं।' },
      { label: 'हार्मोन वाले गर्भनिरोधक', text: 'गोलियाँ, पैच, रिंग, इंजेक्शन, इम्प्लांट और हार्मोन वाला IUD खून के पैटर्न को बदल सकते हैं, और बहुत से तरीके ओव्यूलेशन रोक देते हैं। गोली न लेने वाले हफ़्ते का खून असली पीरियड नहीं, बल्कि विदड्रॉल ब्लीड होता है।' },
    ],
    notesTitle: 'ज़रूरी',
    notes: [
      'कैलेंडर से गिनती और पीरियड ऐप, ऋतु समेत, सिर्फ़ अंदाज़ा लगाते हैं। अकेले इन पर भरोसा करके प्रेगनेंसी रोकना सुरक्षित नहीं है। प्रेगनेंसी से बचना हो तो गर्भनिरोध के बारे में डॉक्टर या नर्स से बात करें।',
      'फर्टाइल दिन या ओव्यूलेशन के दिन का अनुमान पिछली साइकिल पर आधारित अंदाज़ा है, शरीर में जो हो रहा है उसकी नाप नहीं।',
    ],
  },
  care: {
    title: '7. डॉक्टर को कब दिखाएँ',
    intro: 'साइकिल के ज़्यादातर बदलाव नुकसानदेह नहीं होते, पर कुछ की जाँच करवाना ठीक है। अगर ये हों तो डॉक्टर, नर्स या किसी स्वास्थ्य कर्मी से संपर्क करें:',
    items: [
      'पेट के निचले हिस्से में तेज़ या बढ़ता दर्द, या ऐसा दर्द जो रोज़ के काम रोक दे',
      'बहुत ज़्यादा खून, जैसे कई घंटों तक हर 1–2 घंटे में पैड या टैम्पॉन भर जाना या बड़े थक्के आना, या 7 दिन से ज़्यादा खून आना',
      'दो पीरियड के बीच खून आना',
      'सेक्स के बाद खून आना',
      'मेनोपॉज़ के बाद कभी भी खून आना',
      'साइकिल में अचानक बड़ा बदलाव, या 3 महीने तक पीरियड न आना जब आप प्रेगनेंट न हों, स्तनपान न करा रही हों, या ऐसा गर्भनिरोध न ले रही हों जो पीरियड रोकता है',
      'प्रेगनेंसी की संभावना के साथ खून या दर्द (एक तरफ़ तेज़ दर्द, चक्कर या बेहोशी हो तो तुरंत मदद लें)',
      'PMS या PMDD के लक्षण जो परेशान करें या रिश्तों, काम या पढ़ाई पर असर डालें',
    ],
    outro: 'अगर उदासी में कभी खुद को नुकसान पहुँचाने के ख़याल आएँ, तो तुरंत मदद लें।',
  },
  summary: {
    title: 'सारांश',
    text: 'साइकिल पूरा खून शुरू होने के पहले दिन से शुरू होती है। ओवरी में एक फ़ॉलिकल बढ़ता है (फ़ॉलिक्युलर फ़ेज़), अंडा छोड़ता है (ओव्यूलेशन) और कॉर्पस ल्यूटियम बन जाता है (ल्यूटियल फ़ेज़)। गर्भाशय में परत निकलती है (मेंस्ट्रुअल फ़ेज़), एस्ट्रोजन से दोबारा बनती है (प्रोलिफ़रेटिव फ़ेज़) और प्रोजेस्टेरोन से तैयार होती है (सिक्रेटरी फ़ेज़)। प्रेगनेंसी न हो तो हार्मोन गिरते हैं और अगला पीरियड आता है; प्रेगनेंसी हो तो hCG प्रोजेस्टेरोन को ऊँचा रखता है। 28 दिन और 14वें दिन वाला पैटर्न सिर्फ़ एक उदाहरण है: हर शरीर और हर साइकिल अलग हो सकती है।',
  },
  sources: {
    title: 'स्रोत',
    intro: 'यह जानकारी इन संस्थाओं की मरीज़ों के लिए दी गई जानकारी से मेल खाती है:',
    items: [
      'American College of Obstetricians and Gynecologists (ACOG): पीरियड, बहुत ज़्यादा खून आने और PMS पर मरीज़ों के लिए जानकारी',
      'NHS (UK): Periods; Premenstrual syndrome (PMS)',
      'U.S. Office on Women’s Health: Your menstrual cycle',
    ],
  },
};

export const LEARN: Record<'en' | 'hi', LearnContent> = { en, hi };
