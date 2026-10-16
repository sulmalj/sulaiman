/* تصحيح فقرة الطالب بالذكاء الاصطناعي (Netlify Edge Function) — ملف مولّد من tools/arab100/site/edge-correct.js
   يشتغل فقط إذا انضاف المفتاح في إعدادات Netlify:  Site configuration → Environment variables
     ANTHROPIC_API_KEY = مفتاح API من console.anthropic.com
     ANTHROPIC_MODEL   = (اختياري) الافتراضي claude-opus-5-5 — أرخص: claude-sonnet-5-5 أو claude-haiku-5-5
   بدون المفتاح يرجع 503 والموقع يصحح بالفحص الآلي حق المتصفح.
   الرد يُمرَّر للمتصفح كبث (stream) مباشرة عشان ما يوقف بسبب مهلة Netlify. */

const BOOK = __BOOK__;

const SYSTEM = `أنت مصحّح لمادة «عرب 100 — مهارات الكتابة» (الكتاب الجامعي الجديد). تصحح فقرة يكتبها طالب جامعي، **حسب شروط الكتاب وطريقته بالضبط**، وتشرح له كل خطأ بالعربي الفصيح المبسّط.

مرجعك الوحيد في الحكم على الفقرة هو نص الكتاب التالي (درس كتابة الفقرة، ودرس علامات الترقيم، ودرس الأخطاء الشائعة). وفي الإملاء والنحو التزم بقواعد العربية الفصحى المعتمدة.

<book>
${BOOK}
</book>

طريقة التصحيح:
1) البناء الداخلي (من الكتاب): الجملة المفتاحية (الفكرة الرئيسة) تقدّم موضوع الفقرة تقديمًا واضحًا وغالبًا في بدايتها، ثم الجمل الداعمة تشرح الفكرة وتدعمها بالأدلة أو المعلومات أو الأمثلة، ثم الجملة الختامية تلخّص الفكرة أو تؤكدها.
   - في key_sentence و closing انقل الجملة من نص الطالب حرفيًا (أو "" إذا ما هي موجودة).
   - في supporting: كل جملة داعمة حرفيًا من نص الطالب، و role = وش تضيف للفكرة باختصار، و connector = أداة الربط اللي بدأت بها أو "" إذا ما فيه.
2) شروط الفقرة الجيدة (من الكتاب): وحدة الفقرة، الترابط والتماسك (أدوات الربط)، التسلسل المنطقي. وأضف: الارتباط بعنوان الموضوع.
3) الشكل الخارجي: الفقرة تنتهي بنقطة بعد الجملة الأخيرة (المسافة البادئة والهوامش ما تنقاس في مربع الكتابة فلا تحاسب عليها).
4) الأخطاء: كل خطأ إملائي (الهمزات، التاء المربوطة والهاء، الألف اللينة، الحذف والزيادة...) أو نحوي أو صرفي أو معجمي/دلالي أو ترقيم أو أسلوبي (تكرار، ركاكة، تركيب دخيل من الأخطاء الشائعة).
   - wrong: الجزء الخطأ **منقول حرفيًا كما كتبه الطالب** (أقصر جزء يوضح الخطأ، بدون تغيير حرف ولا مسافة) عشان نظلّله في نصه.
   - right: الصواب. reason: ليش هو خطأ — القاعدة باختصار، ولو الخطأ من جداول الأخطاء الشائعة في الكتاب اذكر سبب الكتاب.
   - lesson: اسم الدرس اللي يرجع له الخطأ (همزتا الوصل والقطع / الهمزة المتوسطة والهمزة آخر الكلمة / الحذف والزيادة في الرسم / الألف اللينة والتاء والهاء / علامات الترقيم / الأخطاء الشائعة / كتابة الفقرة).
   - لا تعدّ الشيء خطأ إذا كان صحيحًا فصيحًا وله وجه مقبول. ولا تحاسب على ترك التشكيل.
5) corrected: الفقرة كاملة بعد تصحيح الأخطاء فقط، مع المحافظة على كلام الطالب وأفكاره قدر الإمكان.
6) score من 10: البناء الداخلي (4)، شروط الفقرة الجيدة (3)، السلامة اللغوية والإملائية والترقيم (3). كن عادلًا ودقيقًا مثل أستاذ المادة.
7) tips: نصائح قصيرة عملية لتحسين الفقرة (2–4)، وابدأ بمدح شيء أحسن فيه إذا وُجد.
8) summary: سطرين يلخصون مستوى الفقرة، واذكر فيها هل عدد الجمل مطابق للعدد اللي طلبه الدكتور.
9) sentence_count: عدد الجمل في فقرة الطالب (الجملة تنتهي بنقطة أو علامة استفهام أو تعجب). إذا اختلف عن العدد المطلوب انقص من الدرجة ونبّه عليه في tips.

اكتب كل النصوص بالعربي. إذا كان النص المرسل ليس فقرة عربية (فاضي أو كلام عشوائي أو بلغة أخرى) فأعطه score صفر ووضّح ذلك في summary.`;

const check = { type: 'object', additionalProperties: false, required: ['ok', 'note'], properties: { ok: { type: 'boolean' }, note: { type: 'string' } } };
const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['score', 'summary', 'sentence_count', 'key_sentence', 'supporting', 'supporting_note', 'closing', 'conditions', 'ends_with_period', 'errors', 'corrected', 'tips'],
  properties: {
    score: { type: 'integer' },
    summary: { type: 'string' },
    sentence_count: { type: 'integer' },
    key_sentence: { type: 'object', additionalProperties: false, required: ['text', 'ok', 'note'], properties: { text: { type: 'string' }, ok: { type: 'boolean' }, note: { type: 'string' } } },
    supporting: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['text', 'role', 'connector'], properties: { text: { type: 'string' }, role: { type: 'string' }, connector: { type: 'string' } } } },
    supporting_note: { type: 'string' },
    closing: { type: 'object', additionalProperties: false, required: ['text', 'ok', 'note'], properties: { text: { type: 'string' }, ok: { type: 'boolean' }, note: { type: 'string' } } },
    conditions: { type: 'object', additionalProperties: false, required: ['unity', 'cohesion', 'sequence', 'relevance'], properties: { unity: check, cohesion: check, sequence: check, relevance: check } },
    ends_with_period: check,
    errors: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['wrong', 'right', 'type', 'reason', 'lesson'], properties: { wrong: { type: 'string' }, right: { type: 'string' }, type: { type: 'string', enum: ['إملائي', 'نحوي', 'صرفي', 'معجمي ودلالي', 'ترقيم', 'أسلوبي'] }, reason: { type: 'string' }, lesson: { type: 'string' } } } },
    corrected: { type: 'string' },
    tips: { type: 'array', items: { type: 'string' } }
  }
};

const MAX_CHARS = 2500, MAX_TOPIC = 120;
const json = (status, obj) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

export default async (request) => {
  if (request.method !== 'POST') return json(405, { error: 'method' });
  const key = Netlify.env.get('ANTHROPIC_API_KEY');
  if (!key) return json(503, { error: 'no-key' });

  // الطلب لازم يجي من صفحات الموقع نفسه
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return json(403, { error: 'origin' });

  let body;
  try { body = await request.json(); } catch { return json(400, { error: 'body' }); }
  const text = String(body.text || '').trim();
  const topic = String(body.topic || '').trim().slice(0, MAX_TOPIC);
  const need = Math.max(0, Math.min(20, parseInt(body.sentences, 10) || 0));
  if (text.length < 20) return json(400, { error: 'short' });
  if (text.length > MAX_CHARS) return json(400, { error: 'long' });

  const model = Netlify.env.get('ANTHROPIC_MODEL') || 'claude-opus-5-5';
  const req = {
    model,
    max_tokens: 16000,
    stream: true,
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: SCHEMA } },
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: `عنوان الموضوع: ${topic || '(بدون عنوان)'}\nعدد الجمل اللي طلبه الدكتور: ${need || 'غير محدد'}\n\nفقرة الطالب:\n<paragraph>\n${text}\n</paragraph>` }]
  };
  const headers = { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' };
  // إذا رفض النموذج الطلب، يعيده الخادم تلقائيًا على نموذج بديل (للنماذج اللي تدعم هذا)
  if (/^claude-(opus-5|sonnet-5-5|fable-5)/.test(model)) { req.fallbacks = 'default'; headers['anthropic-beta'] = 'server-side-fallback-2026-07-01'; }

  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers, body: JSON.stringify(req) });
  if (!res.ok || !res.body) {
    console.log('anthropic error', res.status, await res.text().catch(() => ''));
    return json(502, { error: 'upstream', status: res.status });
  }
  return new Response(res.body, { headers: { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-store' } });
};

export const config = { path: '/api/correct' };
