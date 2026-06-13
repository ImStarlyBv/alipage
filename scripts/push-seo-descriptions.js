/* ───────────────────────────────────────────────────────────────────────────
 * Push ORIGINAL titles + semantic-SEO descriptions to Kitty Control.
 *
 * STRATEGY: the niche ("sphynx cat clothes") is already established by the
 * photos, breadcrumb, category, page copy and meta — so product TITLES drop the
 * repeated "Sphynx" head term to avoid keyword stuffing, and instead vary with
 * material / garment / style ("hairless cat" used only as an occasional synonym).
 * DESCRIPTIONS carry the topical weight through SEMANTIC / LSI terms (hairless
 * breeds, body heat, sebum/skin oils, Devon & Cornish Rex, breathable fabric,
 * four-way stretch, flat-seam) rather than repeating the keyword.
 *
 * NOTE: no slug DB column — slugs derive from the title, so renaming CHANGES the
 * URL. Do this before pages are indexed; the sitemap rebuilds from new titles.
 *
 * HOW TO RUN (no credentials needed):
 *   1. Log into https://kittycontrol.shop as ADMIN.
 *   2. Any /admin page → DevTools → Console → paste this whole file → Enter.
 * ─────────────────────────────────────────────────────────────────────────── */

const PRODUCTS = {
  // costume sweater
  "cmqcwweaq000r26moyodkrtfk": {
    title: "Festive Knit Cat Costume Sweater",
    description: `<p>A festive knit costume sweater that keeps a bare-skinned cat warm while it steals the show. The dense, stretchy knit traps the body heat hairless breeds shed so fast, so your companion stays cozy through cold rooms and holiday photos alike.</p><ul><li><strong>Cold-weather warmth:</strong> thick knit for drafty homes and winter days</li><li><strong>Seamless stretch:</strong> expands over a broad chest without pressing on delicate skin</li><li><strong>Photo-ready styling:</strong> costume detailing tailored to a lean, slender build</li></ul><p>Compare neck, chest and back length to the size chart before ordering. Wash gentle and rotate with a spare so the fabric stays fresh against the skin.</p>`,
  },
  // cherry print tee
  "cmqcww817000q26mo6r606bok": {
    title: "Cherry Blossom Cotton Cat Tee",
    description: `<p>Everyday comfort meets a sweet retro print in this cherry-blossom cotton tee. The soft knit hugs the body to soak up the sebum hairless skin produces, sparing your sofa and bedding the usual oily marks between baths.</p><ul><li><strong>Breathable cotton:</strong> light enough for spring, summer and indoor lounging</li><li><strong>Oil control:</strong> draws away skin oils to keep the coat-free body balanced</li><li><strong>Four-way stretch:</strong> moves with a narrow frame and active play</li></ul><p>Size up if your cat falls between measurements. Launder with a mild, baby-grade detergent and keep a few on rotation.</p>`,
  },
  // cotton kitten pajamas, four-leg vest
  "cmqcww1a7000p26mopkrzi7af": {
    title: "Cotton Four-Leg Kitten Pajamas",
    description: `<p>Gentle cotton pajamas sized for kittens and petite hairless cats. The four-leg cut covers more surface area for extra warmth and oil management, while the soft weave stays kind to thin, fur-free skin.</p><ul><li><strong>Extended coverage:</strong> four-leg design warms the torso and limbs</li><li><strong>Breathable weave:</strong> absorbs skin oils and resists chafing</li><li><strong>Growing-frame fit:</strong> stretchy and flat-seamed for tiny bodies</li></ul><p>Perfect for naps, cool rooms and post-bath warmth. Confirm sizing, wash gently, and keep three to five sets cycling so a clean one is always ready.</p>`,
  },
  // fleece pajama pullover
  "cmqcwvuqv000o26mo0hjm6mcq": {
    title: "Nightfall Fleece Cat Pajama Pullover",
    description: `<p>A brushed-fleece pajama pullover for cats that feel every drop in temperature. The napped lining holds body heat close, making it a go-to for chilly nights and over-cooled, air-conditioned homes.</p><ul><li><strong>Insulating fleece:</strong> real warmth with none of the bulk</li><li><strong>Sleep-soft inside:</strong> smooth, seamless against bare skin</li><li><strong>Quick dressing:</strong> stretchy pull-on shape slips on in seconds</li></ul><p>Match measurements to the chart and size up when unsure. Machine-wash gentle and stash a spare in the rotation.</p>`,
  },
  // cosplay costume outfit
  "cmqcwg7p3000k26mod4fbet90": {
    title: "Cosplay Cat Costume Outfit",
    description: `<p>A full cosplay costume outfit cut for slim, athletic feline bodies. It pairs a playful dress-up look with genuine coverage, so a hairless companion stays warm while it parades around the house.</p><ul><li><strong>Head-to-tail styling:</strong> shaped to a lean, narrow build</li><li><strong>Comfort-first build:</strong> soft, stretchy fabric with flat seams</li><li><strong>Warm and fun:</strong> covers the body for cool-weather costume days</li></ul><p>Made for parties, holidays and photoshoots. Check the size chart, introduce it gradually so your cat acclimates, and wash on a gentle cycle.</p>`,
  },
  // turtleneck fleece pocket jumpsuit
  "cmqcwfi84000i26moul1ml32w": {
    title: "Pocket Fleece Turtleneck Cat Jumpsuit",
    description: `<p>This fleece turtleneck jumpsuit wraps the body from neck to hips, finished with a cute front-pocket detail. The high collar guards the neck and chest — the spots where a coat-free cat loses warmth fastest.</p><ul><li><strong>Full-body fleece:</strong> jumpsuit coverage for deep-winter warmth</li><li><strong>Turtleneck collar:</strong> blocks drafts at the neck and shoulders</li><li><strong>Skin-kind finish:</strong> soft, seamless interior</li></ul><p>Since it covers so much, change and wash it often with mild detergent. Verify the fit on the chart and size up for free movement.</p>`,
  },
  // brushed fleece turtleneck pullover
  "cmqcwfd8y000h26mon3kx4hd8": {
    title: "Brushed Fleece Turtleneck Cat Pullover",
    description: `<p>The everyday workhorse of a hairless-cat wardrobe: a brushed-fleece turtleneck pullover. Soft napped fabric keeps body heat in, and the pull-on collar keeps the neck and shoulders cozy indoors.</p><ul><li><strong>Brushed fleece:</strong> lightweight warmth for autumn and winter</li><li><strong>Easy pull-on:</strong> stretchy collar with no fuss</li><li><strong>Flat-seam comfort:</strong> nothing to rub against bare skin</li></ul><p>Rotate it with a couple of cotton tees through the week. Measure neck, chest and back length against the chart and wash gentle with a baby-grade detergent.</p>`,
  },
  // value fleece turtleneck
  "cmqcwfac8000g26mom9nijgyo": {
    title: "Everyday Fleece Cat Turtleneck",
    description: `<p>Our best-value fleece turtleneck, built for daily autumn and winter wear. It delivers dependable warmth at a price that makes keeping a full wardrobe effortless for breeds like the Sphynx, Devon Rex and Cornish Rex.</p><ul><li><strong>Cozy fleece knit:</strong> insulates against cold floors and drafts</li><li><strong>High collar:</strong> added coverage for the neck and chest</li><li><strong>Active stretch:</strong> moves with a slim, lively body</li></ul><p>An ideal staple to stock in multiples so a clean one is always on hand. Confirm sizing, size up between measurements, and machine-wash gentle.</p>`,
  },
  // four-leg fleece hoodie
  "cmqcwewfb000f26moi2tkigfn": {
    title: "Four-Leg Fleece Cat Hoodie",
    description: `<p>A four-leg fleece hoodie that covers a hairless cat from neck to legs. The soft hood and full-length sleeves trap maximum body heat for the coldest stretches, while the fabric stays stretchy enough for play.</p><ul><li><strong>Four-leg coverage:</strong> warms torso and limbs together</li><li><strong>Snug hood:</strong> extra heat for the head and neck on demand</li><li><strong>Fleece interior:</strong> smooth and gentle on exposed skin</li></ul><p>With this much coverage, rotate and wash it often with mild detergent. Match measurements to the chart and size up for comfort.</p>`,
  },
  // snug winter four-leg hoodie
  "cmqcwet0j000e26mo1q37izuy": {
    title: "Snug Winter Four-Leg Cat Hoodie",
    description: `<p>A snug four-leg hoodie that works as a warm winter pullover. Full-length sleeves and a cozy hood lock heat in, keeping a coat-free cat comfortable through frosty mornings and cold rooms.</p><ul><li><strong>Warm pullover knit:</strong> soft and insulating for winter</li><li><strong>Four-leg fit:</strong> head-to-paw coverage</li><li><strong>Effortless wear:</strong> stretchy and seamless for quick dressing</li></ul><p>Great for busy cats that still need warmth. Check the chart, size up when unsure, and wash gently with a baby-grade detergent.</p>`,
  },
  // fleece-lined jacket hoodie
  "cmqcweohu000d26mot31sm0rq": {
    title: "Arctic Fleece-Lined Cat Hoodie Jacket",
    description: `<p>A fleece-lined hoodie jacket that doubles as a true winter coat. The plush lining brings serious warmth for the harshest weather, and the jacket cut layers neatly over a thin cotton base for hairless breeds.</p><ul><li><strong>Plush lining:</strong> heavyweight insulation for deep winter</li><li><strong>Coat-style hood:</strong> full body-and-neck coverage</li><li><strong>Soft fit:</strong> stretchy and gentle against bare skin</li></ul><p>The warmest layer in the wardrobe. Confirm the fit, size up to layer, and machine-wash on gentle.</p>`,
  },
  // cozy four-leg sweatshirt hoodie
  "cmqcwel5t000c26movb8vyx0b": {
    title: "Lounge Four-Leg Cat Sweatshirt Hoodie",
    description: `<p>A four-leg sweatshirt hoodie built around soft, all-day warmth. The brushed interior keeps a fur-free cat toasty, and the relaxed sweatshirt feel makes it an instant lounging favorite.</p><ul><li><strong>Soft sweatshirt knit:</strong> easy warmth for naps and downtime</li><li><strong>Four-leg design:</strong> even coverage across body and legs</li><li><strong>Gentle seams:</strong> flat, smooth finish for sensitive skin</li></ul><p>Keep a couple for daily rotation. Measure against the chart, size up between sizes, and wash with mild detergent.</p>`,
  },
  // hooded fleece pajama jumpsuit (costume)
  "cmqcweaca000b26mollkz6dk4": {
    title: "Hooded Fleece Cat Pajama Jumpsuit",
    description: `<p>Warm hooded fleece pajamas in a playful jumpsuit shape. The full-body piece keeps a hairless cat snug from head to tail while adding a charming dressed-up look for cozy nights in.</p><ul><li><strong>Hooded jumpsuit:</strong> head-to-tail coverage for maximum warmth</li><li><strong>Brushed softness:</strong> fleece interior that's gentle on bare skin</li><li><strong>Playful charm:</strong> cute styling shaped to a slim body</li></ul><p>Full coverage means it needs frequent washing and rotation. Check the chart, size up for easy movement, and use a baby-grade detergent.</p>`,
  },
  // hooded onesie
  "cmqcwe6yj000a26mo1sz73alb": {
    title: "Dreamtime Hooded Cat Onesie",
    description: `<p>A warm hooded onesie that wraps a coat-free cat in head-to-tail comfort. The onesie cut is ideal for sleeping, sudden cold snaps and the shivery hour after a bath.</p><ul><li><strong>Full-body onesie:</strong> covers torso and legs to hold heat in</li><li><strong>Cozy hood:</strong> added warmth for head and neck</li><li><strong>Sleep-soft:</strong> seamless inside for all-night comfort</li></ul><p>A staple for chilly homes. Match measurements to the chart, size up if unsure, and machine-wash gentle with mild detergent.</p>`,
  },
  // cotton cartoon onesie
  "cmqcwe29l000926moixrlvs6y": {
    title: "Cartoon Cotton Cat Onesie",
    description: `<p>A cotton onesie with a cozy cartoon print — equal parts cute and practical. Breathable cotton wicks away the skin oils hairless breeds produce while the full-body cut keeps things gently warm.</p><ul><li><strong>Breathable cotton:</strong> absorbs sebum and resists irritation</li><li><strong>Full coverage:</strong> onesie cut for warmth and oil control</li><li><strong>Cartoon print:</strong> playful style on a slim, stretchy fit</li></ul><p>Great for everyday wear and sleep. Confirm sizing, keep several cycling, and wash with a gentle, baby-grade detergent.</p>`,
  },
  // recovery suit
  "cmqcwdz12000826moud3v2k2z": {
    title: "Cotton Recovery Suit for Hairless Cats",
    description: `<p>A breathable cotton recovery suit that shields wounds, stitches and skin while keeping your cat calm and covered. This onesie is a vet-friendly alternative to a cone, and a soft daily layer for sensitive, fur-free bodies.</p><ul><li><strong>Post-surgery protection:</strong> guards incisions and stops licking</li><li><strong>Breathable cotton:</strong> gentle, oil-absorbing and skin-safe</li><li><strong>Secure fit:</strong> full coverage that stays in place</li></ul><p>Always follow your vet's wound-care guidance. Measure against the chart, pick a snug-but-comfortable fit, and wash gently between wears.</p>`,
  },
  // striped vest tee
  "cmqcwdo7z000726mo991e96tk": {
    title: "Breton Stripe Cotton Cat Vest Tee",
    description: `<p>A classic Breton-stripe vest tee in soft cotton — the perfect lightweight top for warm days. It sits close to the skin to absorb natural oils and gives a hairless cat an effortlessly cool, nautical look.</p><ul><li><strong>Soft cotton:</strong> breathable for spring, summer and indoors</li><li><strong>Oil control:</strong> keeps skin balanced and furniture clean</li><li><strong>Stretch vest fit:</strong> snug over the chest with full movement</li></ul><p>An easy everyday staple to keep in multiples. Check the chart, size up between sizes, and wash with mild, baby-grade detergent.</p>`,
  },
  // short-sleeve cotton tee
  "cmqcwdjqu000626mo8bz7d6jz": {
    title: "Soft Cotton Short-Sleeve Cat Tee",
    description: `<p>A soft cotton short-sleeve tee — the easygoing basic every wardrobe needs. The pull-on cut goes on fast and the breathable weave manages skin oils for clean, comfortable daily wear.</p><ul><li><strong>Breathable cotton:</strong> light and cool for warmer days</li><li><strong>Sebum control:</strong> absorbs oils to protect skin and sofas</li><li><strong>Pull-on fit:</strong> stretchy and seamless for quick dressing</li></ul><p>Grab a few for everyday rotation. Match neck, chest and back length to the chart and wash gentle with baby-grade detergent.</p>`,
  },
  // graphic print tee
  "cmqcwdgel000526mou3gy5vd6": {
    title: "Graphic Print Cotton Cat Tee",
    description: `<p>A graphic-print cotton tee that adds personality to any look. Lightweight and soft, it draws away skin oils while keeping a coat-free cat comfortable indoors and out.</p><ul><li><strong>Bold print:</strong> eye-catching design on soft cotton</li><li><strong>Light and breathable:</strong> ideal for spring, summer and lounging</li><li><strong>Oil-absorbing fit:</strong> snug, stretchy cut that protects skin</li></ul><p>Layer it under sweaters on cooler days. Confirm sizing, size up if unsure, and wash with a mild, baby-grade detergent.</p>`,
  },
  // dress shirt + tie
  "cmqcwd71u000426moqa63iwlp": {
    title: "Gentleman Cat Dress Shirt & Tie",
    description: `<p>Dress your cat to impress with this gentleman-style shirt and tie. It blends a dapper look with a soft, breathable build that keeps a hairless companion comfortable while it shows off.</p><ul><li><strong>Smart styling:</strong> faux dress shirt with a charming tie detail</li><li><strong>Soft & breathable:</strong> gentle fabric that's kind to bare skin</li><li><strong>Slim tailoring:</strong> shaped to a lean frame</li></ul><p>Perfect for events, holidays and photos. Check the chart, let your cat adjust gradually, and wash on gentle.</p>`,
  },
  // elegant turtleneck fleece coat
  "cmqcwbjul000226moorfbdxvg": {
    title: "Heritage Fleece Turtleneck Cat Coat",
    description: `<p>An elegant turtleneck that doubles as a fleece winter coat. Refined styling meets real warmth, giving a hairless cat a polished look while the fleece holds body heat through the coldest months.</p><ul><li><strong>Coat-level fleece:</strong> heavyweight insulation for deep winter</li><li><strong>Elegant collar:</strong> a high turtleneck that shields neck and chest</li><li><strong>Soft seams:</strong> smooth, flat finish for sensitive skin</li></ul><p>A standout warm piece for the wardrobe. Measure against the chart, size up to layer, and machine-wash on a gentle cycle.</p>`,
  },
  // basic knit winter pullover
  "cmqcwan1n000026mo3s145qkt": {
    title: "Classic Knit Sweater for Hairless Cats",
    description: `<p>A classic knitted winter sweater — the essential first layer for any hairless cat. The soft, stretchy knit holds in the body heat coat-free breeds shed so quickly, making it a go-to for cool homes and cold days.</p><ul><li><strong>Cozy knit:</strong> classic warmth for autumn and winter</li><li><strong>Stretch pull-on:</strong> easy over a slim chest</li><li><strong>Skin-friendly:</strong> seamless feel that won't irritate</li></ul><p>An affordable staple worth stocking in multiples. Confirm the fit, size up between sizes, and wash gentle with mild detergent.</p>`,
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
  console.log(`Done. ${ok} updated, ${fail} failed. (Slugs changed — resubmit sitemap.)`);
})();
