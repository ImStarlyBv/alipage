/* ───────────────────────────────────────────────────────────────────────────
 * Push ORIGINAL SEO titles + descriptions to Kitty Control (sphynx cat clothes).
 *
 * WHY: the imported titles mirror the AliExpress listings (duplicated across
 * every dropshipper) and the descriptions are raw AliExpress junk HTML. Both
 * hurt SEO. This rewrites each to original, keyword-targeted, de-duplicated copy.
 *
 * NOTE: there is no slug DB column — slugs are derived from the title, so a
 * rename CHANGES the product URL. Do this BEFORE the pages get indexed; the
 * sitemap regenerates automatically from the new titles.
 *
 * HOW TO RUN (no credentials needed):
 *   1. Log into https://kittycontrol.shop with your ADMIN account.
 *   2. Open any /admin page, then DevTools → Console.
 *   3. Paste this entire file and press Enter.
 *
 * It PATCHes /rename and /description for each product using your logged-in
 * session cookie. Re-runnable and idempotent.
 * ─────────────────────────────────────────────────────────────────────────── */

const PRODUCTS = {
  // costume sweater
  "cmqcwweaq000r26moyodkrtfk": {
    title: "Festive Knit Sphynx Cat Costume Sweater",
    description: `<p>Keep your hairless cat warm <strong>and</strong> adorable with this festive knit sphynx cat costume sweater. The soft, stretchy knit traps the body heat that bare-skinned cats lose so quickly — while the playful costume styling makes it a standout for holidays and photos.</p><ul><li><strong>Real warmth:</strong> thick knit for cold homes, drafts and winter days</li><li><strong>Snug, seamless fit:</strong> stretches over the chest without rubbing delicate skin</li><li><strong>Festive look:</strong> costume detailing built for a sphynx's slim frame</li></ul><p>Check the size chart against your cat's neck, chest and back length. Machine-wash gentle and rotate with a clean set so the fabric stays fresh.</p>`,
  },
  // cherry print tee
  "cmqcww817000q26mo6r606bok": {
    title: "Cherry Blossom Sphynx Cat Cotton Tee",
    description: `<p>This cherry-print cotton tee pairs everyday comfort with a sweet retro look. The soft cotton knit sits close to the skin, absorbing the natural oils a hairless cat produces and keeping your furniture cleaner between baths.</p><ul><li><strong>Breathable cotton:</strong> light enough for spring, summer and indoor lounging</li><li><strong>Oil-absorbing:</strong> soaks up sebum so your sphynx's skin stays balanced</li><li><strong>Stretch fit:</strong> four-way stretch for a slim chest and full freedom to move</li></ul><p>Measure your cat and size up if between sizes. Wash with a mild, baby-grade detergent and keep a few in rotation.</p>`,
  },
  // cotton kitten pajamas, four-leg vest
  "cmqcww1a7000p26mopkrzi7af": {
    title: "Cotton Four-Leg Sphynx Kitten Pajamas",
    description: `<p>Soft cotton pajamas designed for kittens and small hairless cats. The four-leg vest cut covers more skin for extra warmth and oil control, while the gentle cotton feels kind against sensitive, fur-free bodies.</p><ul><li><strong>Full coverage:</strong> four-leg design warms the body and limbs</li><li><strong>Breathable cotton:</strong> absorbs skin oils and resists irritation</li><li><strong>Kitten-friendly fit:</strong> stretchy and seamless for tiny, growing frames</li></ul><p>Ideal for sleep, cool rooms and post-bath warmth. Confirm sizing on the chart, wash gently, and rotate 3–5 sets so there's always a clean one.</p>`,
  },
  // fleece pajama pullover
  "cmqcwvuqv000o26mo0hjm6mcq": {
    title: "Nightfall Fleece Sphynx Cat Pajama Pullover",
    description: `<p>A warm fleece pajama pullover for hairless cats who feel every chill. The brushed fleece interior locks in body heat, making it perfect for cold nights and air-conditioned homes.</p><ul><li><strong>Fleece-lined warmth:</strong> insulating without heavy bulk</li><li><strong>Cozy for sleep:</strong> smooth, seamless inside for all-night comfort</li><li><strong>Easy on/off:</strong> stretchy pullover style slips on in seconds</li></ul><p>Match your cat's measurements to the size chart and size up if unsure. Machine-wash gentle and keep a spare ready in your sphynx's wardrobe.</p>`,
  },
  // cosplay costume outfit
  "cmqcwg7p3000k26mod4fbet90": {
    title: "Cosplay Sphynx Cat Costume Outfit",
    description: `<p>Turn heads with this cosplay sphynx cat costume — a full outfit made for slim, athletic feline bodies. It blends a fun, dress-up look with genuine coverage that keeps your bare-skinned cat warm while it struts.</p><ul><li><strong>Head-to-tail style:</strong> outfit cut to fit a sphynx's lean frame</li><li><strong>Comfort first:</strong> soft, stretchy fabric with flat seams</li><li><strong>Warmth + flair:</strong> covers the body for cool-weather costume days</li></ul><p>Great for parties, holidays and photoshoots. Check the size chart before ordering, introduce it gradually, and wash with gentle detergent.</p>`,
  },
  // turtleneck fleece pocket jumpsuit
  "cmqcwfi84000i26moul1ml32w": {
    title: "Pocket Fleece Sphynx Cat Turtleneck Jumpsuit",
    description: `<p>This fleece turtleneck jumpsuit wraps your hairless cat from neck to body, with a cute front pocket detail. The high turtleneck adds extra warmth around the neck and chest where heat escapes fastest.</p><ul><li><strong>Full-body fleece:</strong> jumpsuit coverage for maximum winter warmth</li><li><strong>Turtleneck collar:</strong> shields the neck and chest from drafts</li><li><strong>Soft &amp; seamless:</strong> gentle on bare, oil-prone skin</li></ul><p>Because it covers more skin, change and wash it regularly with mild detergent. Confirm the fit on the size chart and size up for easy movement.</p>`,
  },
  // brushed fleece turtleneck pullover
  "cmqcwfd8y000h26mon3kx4hd8": {
    title: "Brushed Fleece Sphynx Turtleneck Pullover",
    description: `<p>A brushed fleece turtleneck pullover that's the everyday workhorse of a sphynx wardrobe. Soft fleece holds in body heat, while the pull-on turtleneck keeps your hairless cat's neck and shoulders cozy indoors.</p><ul><li><strong>Brushed fleece:</strong> lightweight warmth for autumn and winter</li><li><strong>Pull-on ease:</strong> stretchy collar slips on without fuss</li><li><strong>Skin-friendly:</strong> flat seams that won't chafe</li></ul><p>Pair it with a few cotton tees for daily rotation. Measure neck, chest and back length against the chart, and wash gentle with baby-grade detergent.</p>`,
  },
  // value fleece turtleneck
  "cmqcwfac8000g26mom9nijgyo": {
    title: "Everyday Fleece Sphynx Cat Turtleneck",
    description: `<p>Our best-value fleece turtleneck, made for everyday autumn and winter wear. It gives hairless cats reliable warmth at a price that makes stocking a full wardrobe easy.</p><ul><li><strong>Cozy fleece knit:</strong> insulates against cold floors and drafts</li><li><strong>High turtleneck:</strong> extra coverage for the neck and chest</li><li><strong>Stretch fit:</strong> moves with your sphynx's slim, active body</li></ul><p>An ideal staple to keep several of, so there's always a clean one in rotation. Confirm sizing on the chart, size up if between sizes, and machine-wash on gentle.</p>`,
  },
  // four-leg fleece hoodie
  "cmqcwewfb000f26moi2tkigfn": {
    title: "Four-Leg Fleece Sphynx Cat Hoodie",
    description: `<p>A four-leg fleece hoodie that covers your hairless cat from neck to legs. The soft hood and full-leg design trap maximum body heat for the coldest days, while staying stretchy enough for play.</p><ul><li><strong>Four-leg coverage:</strong> warms the body and limbs together</li><li><strong>Snug hood:</strong> extra heat for the head and neck when needed</li><li><strong>Fleece interior:</strong> smooth and gentle on bare skin</li></ul><p>Because it covers so much, rotate and wash it often with mild detergent. Match your cat's measurements to the size chart and size up for comfort.</p>`,
  },
  // snug winter four-leg hoodie
  "cmqcwet0j000e26mo1q37izuy": {
    title: "Snug Winter Sphynx Cat Four-Leg Hoodie",
    description: `<p>This snug four-leg hoodie is a warm winter pullover built for hairless cats. Full-leg sleeves and a cozy hood keep body heat in, so your sphynx stays comfortable through chilly mornings and cold rooms.</p><ul><li><strong>Warm pullover:</strong> soft, insulating knit for winter</li><li><strong>Four-leg fit:</strong> covers limbs for head-to-paw warmth</li><li><strong>Easy wear:</strong> stretchy and seamless for quick dressing</li></ul><p>Great for active cats who still need warmth. Check the size chart, size up if unsure, and wash gently with a baby-grade detergent.</p>`,
  },
  // fleece-lined jacket hoodie
  "cmqcweohu000d26mot31sm0rq": {
    title: "Arctic Fleece-Lined Sphynx Cat Hoodie Jacket",
    description: `<p>A fleece-lined hoodie jacket that works as a proper winter coat for your sphynx. The plush lining delivers serious warmth for the coldest weather, while the jacket cut layers easily over a thin cotton base.</p><ul><li><strong>Fleece lining:</strong> heavyweight warmth for deep winter</li><li><strong>Hooded jacket:</strong> coat-style coverage for the body and neck</li><li><strong>Comfort fit:</strong> stretchy and soft against hairless skin</li></ul><p>Perfect as the warmest piece in your cat's wardrobe. Confirm the fit on the size chart, size up for layering, and machine-wash on gentle.</p>`,
  },
  // cozy four-leg sweatshirt hoodie
  "cmqcwel5t000c26movb8vyx0b": {
    title: "Lounge Four-Leg Sphynx Cat Sweatshirt Hoodie",
    description: `<p>A four-leg sweatshirt hoodie that's all about soft, everyday warmth. The brushed interior keeps your hairless cat toasty, and the relaxed sweatshirt feel makes it a daily favorite for lounging.</p><ul><li><strong>Soft sweatshirt knit:</strong> comfy warmth for lounging and naps</li><li><strong>Four-leg design:</strong> covers the body and legs evenly</li><li><strong>Gentle seams:</strong> flat, smooth finish for sensitive skin</li></ul><p>Keep a couple on hand for daily rotation. Measure your cat against the size chart, size up if between sizes, and wash with mild detergent.</p>`,
  },
  // hooded fleece pajama jumpsuit (costume)
  "cmqcweaca000b26mollkz6dk4": {
    title: "Hooded Fleece Sphynx Cat Pajama Jumpsuit",
    description: `<p>Warm hooded fleece pajamas in a fun jumpsuit style. This full-body piece keeps your hairless cat snug from head to tail while adding a playful, dressed-up look for cozy nights in.</p><ul><li><strong>Hooded jumpsuit:</strong> full coverage for maximum warmth</li><li><strong>Fleece-soft:</strong> brushed interior that's gentle on bare skin</li><li><strong>Playful charm:</strong> cute styling cut for a slim sphynx body</li></ul><p>Because it covers the whole body, wash and rotate it often. Check the size chart, size up for easy movement, and use a baby-grade detergent.</p>`,
  },
  // hooded onesie
  "cmqcwe6yj000a26mo1sz73alb": {
    title: "Dreamtime Hooded Sphynx Cat Onesie",
    description: `<p>A warm hooded onesie that wraps your hairless cat in head-to-tail comfort. The onesie cut is ideal for sleeping, cold snaps and post-bath warmth.</p><ul><li><strong>Full-body onesie:</strong> covers body and legs to lock in heat</li><li><strong>Cozy hood:</strong> extra warmth for the head and neck</li><li><strong>Sleep-soft:</strong> seamless inside for all-night comfort</li></ul><p>A wardrobe staple for chilly homes. Match measurements to the size chart, size up if unsure, and machine-wash gentle with mild detergent.</p>`,
  },
  // cotton cartoon onesie
  "cmqcwe29l000926moixrlvs6y": {
    title: "Cartoon Cotton Sphynx Cat Onesie",
    description: `<p>A cotton onesie with a cozy cartoon print — equal parts cute and practical. Breathable cotton absorbs your hairless cat's skin oils while the full-body jumpsuit keeps it gently warm.</p><ul><li><strong>Breathable cotton:</strong> soaks up sebum and resists irritation</li><li><strong>Full coverage:</strong> jumpsuit cut for warmth and oil control</li><li><strong>Cute cartoon print:</strong> playful style on a slim, stretchy fit</li></ul><p>Great for daily wear and sleep. Confirm sizing on the chart, keep several in rotation, and wash with a gentle, baby-grade detergent.</p>`,
  },
  // recovery suit
  "cmqcwdz12000826moud3v2k2z": {
    title: "Cotton Recovery Suit for Sphynx Cats",
    description: `<p>A breathable cotton recovery suit that protects wounds, stitches and skin while keeping your sphynx covered and calm. This onesie is a vet-friendly alternative to a cone, and a soft everyday layer for sensitive hairless skin.</p><ul><li><strong>Post-surgery protection:</strong> shields incisions and stops licking</li><li><strong>Breathable cotton:</strong> gentle, oil-absorbing and skin-safe</li><li><strong>Secure onesie fit:</strong> full coverage that stays put</li></ul><p>Always follow your vet's guidance on wound care. Measure your cat against the size chart, choose a snug-but-comfortable fit, and wash gently between wears.</p>`,
  },
  // striped vest tee
  "cmqcwdo7z000726mo991e96tk": {
    title: "Breton Stripe Sphynx Cat Cotton Vest Tee",
    description: `<p>A classic Breton-stripe vest tee in soft cotton — the perfect lightweight top for hairless cats. It sits close to the skin to absorb natural oils and gives your sphynx an effortlessly cool, nautical look.</p><ul><li><strong>Soft cotton tee:</strong> breathable for spring, summer and indoors</li><li><strong>Oil-absorbing:</strong> keeps skin balanced and furniture clean</li><li><strong>Stretch vest fit:</strong> snug over the chest with full movement</li></ul><p>An easy everyday staple to keep several of. Check the size chart, size up if between sizes, and wash with mild, baby-grade detergent.</p>`,
  },
  // short-sleeve cotton tee
  "cmqcwdjqu000626mo8bz7d6jz": {
    title: "Soft Cotton Short-Sleeve Sphynx Cat Tee",
    description: `<p>A soft cotton short-sleeve tee that's the easygoing basic every sphynx wardrobe needs. The pullover cut goes on fast, and the breathable cotton handles skin oils for clean, comfortable daily wear.</p><ul><li><strong>Breathable cotton:</strong> light and cool for warmer days</li><li><strong>Sebum control:</strong> absorbs oils to protect skin and sofas</li><li><strong>Pullover fit:</strong> stretchy and seamless for quick dressing</li></ul><p>Buy a few for everyday rotation. Match your cat's neck, chest and back length to the size chart, and wash gentle with baby-grade detergent.</p>`,
  },
  // graphic print tee
  "cmqcwdgel000526mou3gy5vd6": {
    title: "Graphic Print Sphynx Cat Cotton Tee",
    description: `<p>A graphic-print cotton tee that brings personality to your hairless cat's everyday look. Lightweight and soft, it absorbs skin oils while keeping your sphynx comfortable indoors and out.</p><ul><li><strong>Bold print:</strong> eye-catching design on a soft cotton tee</li><li><strong>Breathable &amp; light:</strong> ideal for spring, summer and lounging</li><li><strong>Oil-absorbing fit:</strong> snug, stretchy cut that protects skin</li></ul><p>Pair with sweaters for cooler days. Confirm sizing on the chart, size up if unsure, and wash with a mild, baby-grade detergent.</p>`,
  },
  // dress shirt + tie
  "cmqcwd71u000426moqa63iwlp": {
    title: "Gentleman Sphynx Cat Dress Shirt & Tie",
    description: `<p>Dress your sphynx to impress with this gentleman-style dress shirt and tie. It blends a dapper look with a soft, breathable build that keeps your hairless cat comfortable while it shows off.</p><ul><li><strong>Smart styling:</strong> faux dress shirt with a charming tie detail</li><li><strong>Soft &amp; breathable:</strong> gentle fabric that's kind to bare skin</li><li><strong>Slim fit:</strong> tailored for a sphynx's lean frame</li></ul><p>Perfect for events, holidays and photos. Check the size chart before ordering, let your cat adjust to it gradually, and wash on gentle.</p>`,
  },
  // elegant turtleneck fleece coat
  "cmqcwbjul000226moorfbdxvg": {
    title: "Heritage Fleece Sphynx Cat Turtleneck Coat",
    description: `<p>An elegant turtleneck that doubles as a fleece winter coat. Refined styling meets real warmth, giving your hairless cat a polished look while the fleece traps body heat through the coldest months.</p><ul><li><strong>Fleece warmth:</strong> coat-level insulation for deep winter</li><li><strong>Elegant turtleneck:</strong> high collar that shields the neck and chest</li><li><strong>Soft seams:</strong> smooth, flat finish for sensitive skin</li></ul><p>A standout warm piece for your sphynx's wardrobe. Measure against the size chart, size up for layering, and machine-wash on a gentle cycle.</p>`,
  },
  // basic knit winter pullover
  "cmqcwan1n000026mo3s145qkt": {
    title: "Classic Knit Sphynx Cat Sweater",
    description: `<p>A classic knitted winter sweater that's the essential first layer for any hairless cat. The soft, stretchy knit holds in the body heat sphynx cats lose so fast, making it a go-to for cool homes and cold days.</p><ul><li><strong>Cozy knit:</strong> classic warmth for autumn and winter</li><li><strong>Stretch pullover:</strong> easy on/off over a slim chest</li><li><strong>Skin-friendly:</strong> seamless feel that won't irritate</li></ul><p>An affordable staple worth keeping several of for rotation. Confirm the fit on the size chart, size up if between sizes, and wash gentle with mild detergent.</p>`,
  },
};

(async () => {
  const ids = Object.keys(PRODUCTS);
  console.log(`Updating ${ids.length} products (title + description)…`);
  let ok = 0, fail = 0;
  for (const id of ids) {
    const { title, description } = PRODUCTS[id];
    try {
      const r1 = await fetch(`/api/admin/products/${id}/rename`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title }),
      });
      const r2 = await fetch(`/api/admin/products/${id}/description`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ description }),
      });
      if (r1.ok && r2.ok) {
        ok++;
        console.log(`✓ ${title}`);
      } else {
        fail++;
        console.error(`✗ ${id} → rename ${r1.status}, description ${r2.status}`);
      }
    } catch (e) {
      fail++;
      console.error(`✗ ${id} → ${e}`);
    }
  }
  console.log(`Done. ${ok} updated, ${fail} failed. (Slugs changed — sitemap will rebuild.)`);
})();
