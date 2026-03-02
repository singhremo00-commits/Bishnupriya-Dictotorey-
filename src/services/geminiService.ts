import { GoogleGenAI, Type } from "@google/genai";
import { type DictionaryEntry } from "../data/dictionary";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SYSTEM_PROMPT = `You are an expert Lexicographer and Linguist specializing in the Bishnupriya Manipuri (BPM) language. Your task is to act as the backend engine for a Dictionary App.

Primary Database:
| Roman | Bangla | English | Bangla Meaning |
| :--- | :--- | :--- | :--- |
| Á- | আ- | To be, to become | হওয়া |
| AICĀ | আইচা | Profit | লাভ |
| AICCĀ | আইচ্চা | Restless, fickle | চঞ্চল |
| AITHI-TĀMTHI | আইথি-তামথি | Mishap, accident | দুর্ঘটনা |
| ĀIBĀ-NĀIBĀ | আইবা-নাইবা | Positive or negative | ইতিবাচক বা নেতিবাচক |
| AKPĀ | অকপা | Efficient, befitting | দক্ষ |
| AKPĪ | অকপী | Efficient (Feminine) | দক্ষ |
| ÁKAR | আকর | To begin | শুরু করা |
| AKARAŃ-BAKARAŃ | অকরন-বকরন | Deformed | বিকৃত |
| AKĀRAṆE | অকারণে | Unnecessarily | অকারণে |
| AKULĀN | অকুলান | Deficiency | অভাব |
| AKKHĀK | অক্ষাক | Much, sufficient | প্রচুর |
| AKCĀK | অকচাক | Filth | নোংরা |
| AKCĀKTHAKPĀ | অকচাকথকপা | Filthy | নোংরা |
| AKNĀ | অকনা | Meeting | সাক্ষাৎ |
| AKLĀK | অকলাক | Wrapper for babies | শিশুর মোড়ক |
| AKLAU-KARE | অকলাউ-করে | Excessively | অত্যধিক |
| AGHUR | অঘুর | Terrific | ভয়ঙ্কর |
| AGHRĀN | অঘ্রান | An Indian month (Agrahayana) | অগ্রহায়ণ মাস |
| AŃ, AŃPĀ | অঙ, অঙপা | Cheap | সস্তা |
| AŃKUR | অঙ্কুর | Vanity | অহংকার |
| AŃTĀ | অন্তা | Nature, appearance | প্রকৃতি |
| AŃTHIL | অন্থিল | Filled, congested | ভর্তি |
| AŃNĀ-THEŃNI | অন্না-থেঙনি | Exchange | বিনিময় |
| AŃLĀK | অঙলাক | To bind | বাঁধা |
| AŃŚIDĀR | অংশীদার | Partner | অংশীদার |
| ACIN(Ā) | অচিন(আ) | Unknown | অচেনা |
| ÁJAM | আজম | Filled up, congested | ঠাসা |
| AJĀ | অজা | Teacher, sir | শিক্ষক |
| AJĀNA | অজানা | Unknown | অজানা |
| AJAREL | অজারেল | Great teacher | প্রধান শিক্ষক |
| AJUHĀT | অজুহাত | Plea | অজুহাত |
| AÑJULI | অঞ্জলি | Offering with folded palms | অঞ্জলি |
| AṬ | অট | Lip | ঠোঁট |
| AṬMURĀ | অটমুরা | Speechless | নির্বাক |
| AṬIYĀ | অটিয়া | One having a big lip | বড় ঠোঁটওয়ালা |
| ATĀ | অতা | Boundary | সীমানা |
| ATIT | অতিত | Guest | অতিথি |
| ATO | অতো | So much | এত |
| ÁTTI | াত্তি | Elephant, big | হাতি |
| ADAL-BADAL | অদল-বদল | Exchange, interchange | বিনিময় |
| ÁDD(H)A | আড্ড | Boundary, strength | সীমানা |
| ADYA | অদ্য | Now, today | আজ |
| ADYĀPI-O | অদ্যাপী-ও | Even now | এখনও |
| ANĀ- | অনা- | To melt | গলে যাওয়া |
| ÁNĀ | আনা | Happening, being | ঘটমান |
| ANĀCĀR | অনাচার | Dirty | নোংরা |
| ANĀHAK | অনাহক | Fruitless | বৃথা |
| ANTHAK, -PĀ | অন্থক, -পা | Queer, Strange | অদ্ভুত |
| ANDAR | অন্দর | Inner apartment | অন্দরমহল |
| ANDI | অন্দি | Temper, ill-humour | মেজাজ |
| ĀP | আপ | Mud | কাদা |
| ĀPAT | আপত | Muddy place | কাদাময় স্থান |
| APADASTA | অপদস্ত | Insulted, cursed | অপদস্ত |
| APARŪP | অপরূপ | Wonderful | অপূর্ব |
| APARBĪ | অপরবী | Guest | অতিথি |
| APŪRAṆ | অপূরণ | Incomplete | অসম্পূর্ণ |
| ÁPSARI | অপ্সরী | Nymph, Fairy | অপ্সরা |
| ABAYAB(A) | অবয়ব(আ) | Appearance, limb | চেহারা |
| ÁBALĀ | আবলা | Solemn | গম্ভীর স্বর |
| ABUJ | অবুঝ | Unreasonable, foolish | অবুঝ |
| ABHĀGĀ | অভাগা | Unfortunate | অভাগা |
| AM | অম | Detention | আটকে রাখা |
| AMABĀSI | অমাবাসি | Three days of Āṣāḍha for fast | অমাবস্যা |
| AMIL | অমিল | Discord, dissimilarity | অমিল |
| AMBIRTĀ | আম্বিৰ্তা | Nector | অমৃত |
| AYĀM, -PĀ | অয়াম, -পা | Restless | অস্থির |
| ÁR | আর | Mud | কাদা |
| ÁRAŃ-BARAŃ | অরন-বরন | Not tight, slack | আলগা |
| ARĀ | অরা | To rehearse, to think | অভ্যাস করা |
| ARĀNI | অরানি | Rehearsing, imagining | কল্পনা |
| ÁRIŃ | আরিঙ | Deer | হরিণ |
| ÁRIC | আরিচ | Piles | অৰ্শ রোগ |
| ARDHĀŃGA | অৰ্ধাঙ্গ | Paralysis | প্যারালাইসিস |
| ARDHEK | অৰ্ধেক | Half | অর্ধেক |
| AL | অল | Arum | ওল |
| ALDIYA | অলিদয়া | Yellowish | হলদেটে |
| ALMI | অলিমি | Jaundice | জন্ডিস |
| ASTI | অস্তি | Piece of bone | হাড়ের টুকরো |
| Ā- | আ- | To come | আসা |
| ĀI | আই | Great grand-mother | বড় ঠাকুরমা |
| AIŃ | আইন | Law, regulation | আইন |
| ĀIBA | আইবা | Coming, next | আগামী |
| AISA-BAISA | আইসা-বাইসা | Courtesy | শিষ্টাচার |
| AUKĀL | অকাল | Disturbance, trouble | অশান্তি |
| AUTA | অউতা | Area, confinement | সীমানা |
| A'UR | অউর | Lake | হ্রদ |
| ÁL | আল | Become, changed | পরিবর্তিত হওয়া |
| ĀKMUṚĀ | আকমুড়া | Attentive, attention | মনোযোগী |
| ĀKLĀ | আকলা | Bow-like cage | খাঁচা |
| ĀKŚAR | আকশর | Only lord, alone | একমাত্র প্রভু |
| ĀKSĀTE | আকসাতে | In a body, at one time | একসাথে |
| ĀKHAR | আখর | Letter | অক্ষর |
| ĀKHI | আখি | Eye | চোখ |
| ĀKHEIPĪ | আখেইপী | A measure of drum music | ঢোলের বাজনার মাপ |
| ĀG | আগ | Front, before | আগে |
| ĀGAM-NIGAM | আগম-নিগম | Courtesy, knowledge of Shastras | শিষ্টাচার |
| ĀGAR | আগর | Instrument for piercing wood | কাঠ ফুটো করার যন্ত্র |
| ĀGĀ | আগা | Top, tip | আগা |
| ĀGANI | আগনি | Evacuating bowels | মলত্যাগ |
| ĀGĀ-BALUNI | আগা-বালুনি | The last in a row of dancers | নাচিয়ের দলের শেষজন |
| ĀGARI | আাগরি | Remaining at the top or front | সামনে থাকা |
| ĀGILĀ | আজিলা | Advance | অগ্রিম |
| ĀGUN | আগুন | Fiery | আগুনের মতো |
| ĀGUWĀ | আগুয়া | To proceed, to lead | এগিয়ে চলা |
| ĀGUWĀN | আগুয়ান | Forward, ahead | সম্মুখে |
| ĀGURI | আগুুরি | Coming in advance | আগে আসা |
| ĀGE | আগে | Before, in front | আগে |
| ĀGLĀ | আগলা | Separate | আলাদা |
| ĀGHĀT | আঘাট | Unsuitable place | অঘাট |
| ĀGHRĀN | আঘ্রান | An Indian month | অগ্রহায়ণ মাস |
| ĀŃ | আঙ | Moving, opened, or a question | নড়াচড়া |
| ĀŃLĀK | আঙলাক | Inquiry | জিজ্ঞাসাবাদ |
| Ā'UK-PĀ | অউক-পা | To swallow | গিলে ফেলা |
| Ā'UT-KARE | অউট-করে | Suddenly | হঠাৎ করে |
| ĀK-PĀ | আক-পা | To draw, to paint | আঁকা |
| ĀKĀŚ | আকাশ | Sky | আকাশ |
| ĀKOT | আকোট | Obstinate, stubborn | একগুঁয়ে |
| ĀKHIL | আখিল | Wise, intelligent | বুদ্ধিমান |
| ĀKHUŚĪ | আখুশী | Unhappy, displeased | অখুশি |
| ĀG-PĀ | আগ-পা | To move forward | এগিয়ে যাওয়া |
| ĀG-BĀRĀ | আগ-বারা | To advance | অগ্রসর হওয়া |
| ĀGĀ | আগা | Top, tip | আগা |
| ĀGĀM | আগাম | Advance | অগ্রিম |
| ĀGU | আগু | Fire | আগুন |
| ĀGUMĀNI | আগুমনি | Feverish | জ্বর জ্বর ভাব |
| ĀGUL-PĀ | আগুল-পা | To prevent, to stop | আটকানো |
| ĀGOL | আগোল | Door-bolt | দরজার খিল |
| ĀŃAR | আঙর | Coal, Charcoal | কয়লা |
| ĀŃARĀ | আঙরা | Burning coal | জ্বলন্ত কয়লা |
| ĀŃUL | আঙুল | Finger | আঙুল |
| ĀŃULI | আঙুলি | Ring for finger | আঙটি |
| ĀCAK-PĀ | আচক-পা | To surprise | আশ্চর্য করা |
| ĀCAR | আচর | Conduct, behavior | আচরণ |
| ĀCĀR | আচার | Pickles | আচার |
| ĀCĀR-VICĀR | আচার-বিচার | Custom and justice | আচার-বিচার |
| ĀCHĀL | আছাল | Real, original | আসল |
| ĀJA | আজ | Today | আজ |
| ĀJĀD | আজাদ | Free, independent | স্বাধীন |
| ĀJUK-PĀ | আজুক-পা | To measure | মাপ করা |
| ĀJOL | আজোল | Net | জাল |

Functionality:
* You are a multilingual dictionary generator.
* Generate output in the following STRICT format:
  <WORD in uppercase> (<Bangla script>)
  PART OF SPEECH: <noun/verb/adjective/etc>
  EG : <Only English meanings. Do NOT include Bangla or Hindi inside brackets. No translation in brackets.>
  BG : <Only Bangla meaning. Write once. No repetition. No slash. No duplicate words.>

Rules:
- Do not show HI (Hindi).
- Do not repeat Bangla meaning.
- Do not copy Bangla inside EG section.
- Keep clean formatting.
- No extra explanation.
- If a word is not in your database, try to analyze its root based on BPM grammar rules or suggest the closest match.

Response Format (JSON for App UI):
Return the data in a structured format so the app UI can display it.`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    word_roman: { type: Type.STRING },
    word_bangla: { type: Type.STRING },
    category: { type: Type.STRING },
    meaning_english: { type: Type.STRING },
    meaning_bangla: { type: Type.STRING },
  },
  required: ["word_roman", "word_bangla", "category", "meaning_english", "meaning_bangla"],
};

export async function searchWord(query: string): Promise<DictionaryEntry | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for the word: "${query}"`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as DictionaryEntry;
    }
    return null;
  } catch (error) {
    console.error("Error searching word:", error);
    return null;
  }
}

export async function liveSearch(query: string): Promise<DictionaryEntry[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find all words matching or related to: "${query}". Search in Roman script, Bangla script, and English meanings.`,
      config: {
        systemInstruction: SYSTEM_PROMPT + "\nReturn a JSON array of objects matching the DictionaryEntry schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: responseSchema,
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as DictionaryEntry[];
    }
    return [];
  } catch (error) {
    console.error("Error in live search:", error);
    return [];
  }
}
