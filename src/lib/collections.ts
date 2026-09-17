/**
 * The browse layer the site was missing.
 *
 * `/products` is a flat, paginated list, so nothing on the site targets a
 * keyword like "sphynx cat sweaters" — which is the query a shopper types. Each
 * entry here is one keyword-targeted hub page, rendered by
 * `src/app/[collection]/page.tsx`.
 *
 * Membership is hand-picked by product slug rather than derived from a
 * predicate. Ordering is editorial and the slugs are explicit for three
 * reasons: a predicate would silently re-shuffle the grid as the catalogue
 * changes, `Product.slug` is nullable so a derived rule has to guess at what a
 * "sweater" is from a title, and a rename then breaks membership loudly in the
 * test suite instead of quietly.
 *
 * A product may appear in more than one collection where that is genuinely
 * true — a four-leg fleece hoodie is a hoodie *and* winter clothing, and both
 * are real queries. That is why there is no "one product, one collection" rule.
 */

export interface FabricRow {
  fabric: string;
  warmth: string;
  breathability: string;
  bestFor: string;
  watchOut: string;
}

export interface CollectionFaq {
  question: string;
  answer: string;
}

export interface CollectionLink {
  label: string;
  href: string;
}

export interface Collection {
  /** Equals the URL segment: `/sphynx-cat-sweaters`. */
  slug: string;
  /** Short label for nav and breadcrumbs. */
  name: string;
  /** The on-page `<h1>`. The test asserts it contains `primaryKeyword`. */
  h1: string;
  primaryKeyword: string;
  /** Page `<title>`. The layout template appends " | Kitty Control". */
  title: string;
  description: string;
  /** ISO date. The sitemap reads this as the page's real `lastModified`. */
  updatedAt: string;
  /**
   * The 40–60 word summary directly above the grid: written to be lifted whole
   * by an answer engine, so it opens with the answer rather than with a pitch.
   */
  answer: string;
  fabricTable: {
    caption: string;
    rows: readonly FabricRow[];
  };
  /**
   * Long copy below the grid. Word budget is 300–600 across `body`,
   * `sizingTips` and `careNotes` together, and it is enforced by the test.
   */
  body: readonly string[];
  sizingTips: readonly string[];
  careNotes: readonly string[];
  faqs: readonly CollectionFaq[];
  /** Membership by `Product.slug`. Order is editorial — see the note above. */
  productSlugs: readonly string[];
  /** Renders nothing while empty, so guides can arrive later without a template edit. */
  relatedGuides: readonly CollectionLink[];
  /**
   * One cross-link rendered under the grid. Only set where a collection is thin
   * enough to need somewhere else to go.
   */
  crossLink?: CollectionLink;
}

const UPDATED = "2026-09-16";

const FLEECE_ROW: FabricRow = {
  fabric: "Fleece",
  warmth: "High",
  breathability: "Low — it traps the heat it makes",
  bestFor: "A cold room, or a short trip outside in winter",
  watchOut: "Pills where it rubs, and it holds heat well enough to overdo indoors",
};

const COTTON_ROW: FabricRow = {
  fabric: "Cotton jersey",
  warmth: "Low",
  breathability: "High",
  bestFor: "Warm rooms, or a light layer to keep skin oil off the furniture",
  watchOut: "Absorbs sebum, so it needs washing sooner than fleece, and can stain and pill",
};

export const COLLECTIONS: readonly Collection[] = [
  {
    slug: "sphynx-cat-winter-clothes",
    name: "Sphynx Cat Winter Clothes",
    h1: "Sphynx Cat Winter Clothes: Fleece, Knit and Hoodies for Cold Days",
    primaryKeyword: "sphynx cat winter clothes",
    title: "Sphynx Cat Winter Clothes: Fleece & Knit",
    description:
      "Winter clothes for sphynx and hairless cats: fleece hoodies, knit sweaters, turtlenecks and coats, plus how to pick warmth and fit without overheating.",
    updatedAt: UPDATED,
    answer:
      "A hairless cat has no coat to trap warm air and very little body fat, so it loses heat quickly. Winter wear works in layers rather than one heavy piece: a fleece or knit layer for a cold room, a hooded or four-leg piece outside, and nothing in a warm room, where overheating is the likelier problem.",
    fabricTable: {
      caption: "Winter fabrics, and what each one is actually for",
      rows: [
        FLEECE_ROW,
        {
          fabric: "Brushed fleece",
          warmth: "High",
          breathability: "Low to medium",
          bestFor: "Turtlenecks and four-leg pieces, where the soft face sits against skin",
          watchOut: "Mats down where a harness or collar rubs, and the pile traps loose hair",
        },
        {
          fabric: "Knit (acrylic or wool blend)",
          warmth: "Medium to high",
          breathability: "Medium — it passes some air",
          bestFor: "Indoor wear and outings where the cat is moving around",
          watchOut: "Loose yarn loops catch on claws; run a finger inside for long floats",
        },
        {
          fabric: "Ribbed stretch knit",
          warmth: "Medium",
          breathability: "Medium",
          bestFor: "A close-fitting layer under a coat",
          watchOut: "Ribbing keeps its tension, so measure the chest instead of trusting the label",
        },
        COTTON_ROW,
      ],
    },
    body: [
      "Sphynx cats are not simply small cats without fur. They run warmer than most breeds, burn more energy to stay that way, and carry little body fat — which is why a room a coated cat shrugs off can send a sphynx looking for a lap, a laptop or a sunbeam. The point of winter clothing is not to bundle them up. It is to replace the insulation they were never born with, for the specific place they are about to be.",
      "Indoors, a knit or fleece pullover is usually enough. It covers the chest and back, which is where a hairless cat loses heat fastest when it settles somewhere cold. Outdoors, coverage matters more than thickness: a piece with legs, or a hooded jacket over a pullover, keeps wind off the belly and the inside of the thighs, which a two-legged shirt never reaches. A turtleneck adds the neck, and the neck is worth covering on a cat that likes to sit in a draft.",
      "Fit decides whether any of this works. A garment that is too loose slides sideways, bunches under the front legs and gets worked at until it comes off; one that is too tight restricts the shoulder and stops the cat walking normally, which is the moment most cats decide they hate clothes. The chest measurement behind the front legs matters more than the back length, because that is where the garment either sits still or rides up. Between two sizes, take the larger for fleece and the closer fit for a thin ribbed knit.",
      "The risk that gets forgotten is heat, not cold. A sphynx in a fleece hoodie in a heated living room has no way to cool down except by panting or by lying stretched out and miserable. If your cat is restless, panting, or trying to wriggle out of a warm layer indoors, it is too warm and the layer should come off. Bare skin in a warm room is the correct state; clothing is for the cold parts of the day.",
    ],
    sizingTips: [
      "Measure the neck where a collar sits, the chest at its widest point just behind the front legs, and the back from the base of the neck to the base of the tail.",
      "Measure your cat standing, not curled up, and write the three numbers down — you will want them for the next order too.",
      "For a four-leg piece, add the leg length from the chest down to the paw, or the legs will pull the body out of position.",
      "Between sizes on a fleece, size up. Between sizes on a thin ribbed knit, take the smaller size, because it will stretch to fit.",
      "Check the leg openings with two fingers. If you cannot slide them in, the elastic is too tight for a cat that will wear this for hours.",
    ],
    careNotes: [
      "Wash cool by hand or in a mesh bag on a gentle cycle, and air dry flat. Heat is what shrinks fleece and sets pills into it.",
      "Turn garments inside out before washing so the outer face does not pick up lint from everything else in the load.",
      "Check the inside for loose threads and long yarn floats before every wear. A claw caught in a loop is how a cat gets a leg stuck.",
      "Remove the garment for unsupervised hours. A cat alone with a piece it has decided to remove can get a leg through a neck hole.",
      "Two or three pieces in rotation beats one: it gives each one time to be washed, and lets you size the layer to the room.",
    ],
    faqs: [
      {
        question: "How do I tell if my sphynx cat is too cold?",
        answer:
          "Watch behaviour rather than the thermometer. A cold sphynx curls tightly, seeks warm surfaces, tucks its paws under its body, and follows you from room to room looking for heat. Cold ears and paw pads are a late sign. If your cat is settled and relaxed on a normal chair with no clothing, it is warm enough.",
      },
      {
        question: "Should a sphynx cat wear clothes indoors?",
        answer:
          "In a cool room, a light layer helps. In a heated room it usually does not, and can make the cat uncomfortably hot. Judge it the same way you would judge a jumper on yourself: if you are warm sitting still without one, your cat almost certainly is too.",
      },
      {
        question: "Why does my cat's sweater rub under the front legs?",
        answer:
          "Almost always the chest measurement, not the fabric. A garment that is too loose slides back until the armholes sit in the armpit, and the edge then rubs with every step. Measure behind the front legs, size to that number, and look for flat seams and a covered label at the armhole.",
      },
      {
        question: "Can a hairless cat wear a coat outdoors in winter?",
        answer:
          "Yes, and for a sphynx kept indoors most of the year it is worth doing in genuinely cold weather. Keep walks short, cover the belly and upper legs rather than only the back, and check paw pads and ears for cold on the way in. A coat is not a substitute for a warm place to return to.",
      },
      {
        question: "How many winter pieces does a sphynx cat need?",
        answer:
          "Two or three in rotation covers it: a light knit or cotton layer for cool indoor days, a warm fleece or knit pullover for cold ones, and a hooded or four-leg piece for going outside. More than that is mostly about how often you want to do laundry.",
      },
    ],
    productSlugs: [
      "sphynx-cat-coat-heritage-fleece-turtleneck",
      "sphynx-cat-jacket-arctic-fleece-lined-hoodie",
      "sphynx-cat-hoodie-four-leg-fleece",
      "sphynx-cat-hoodie-snug-winter-four-leg",
      "sphynx-cat-turtleneck-brushed-fleece-pullover",
      "sphynx-cat-turtleneck-everyday-fleece",
      "sphynx-cat-sweater-classic-knit",
      "sphynx-cat-jumpsuit-pocket-fleece-turtleneck",
      "sphynx-cat-jumpsuit-hooded-fleece-pajama",
      "sphynx-cat-sweatshirt-lounge-four-leg-hoodie",
      "sphynx-cat-pajamas-nightfall-fleece-pullover",
    ],
    relatedGuides: [],
  },

  {
    slug: "sphynx-cat-sweaters",
    name: "Sphynx Cat Sweaters",
    h1: "Sphynx Cat Sweaters: Warm Knits and Fleece Pullovers",
    primaryKeyword: "sphynx cat sweaters",
    title: "Sphynx Cat Sweaters: Warm Knits & Fleece",
    description:
      "Sphynx cat sweaters in knit and fleece: how to choose warmth, get the chest fit right, and keep a pullover on a hairless cat that has opinions.",
    updatedAt: UPDATED,
    answer:
      "A sphynx cat sweater is a pullover that replaces the insulation the breed was not born with, covering the chest and back where a hairless cat loses heat fastest. Knit is lighter and passes some air, which suits indoor wear; fleece is warmer and holds heat, which suits a cold room. Chest fit decides whether it stays on.",
    fabricTable: {
      caption: "Knit and fleece pullovers, compared",
      rows: [
        {
          fabric: "Knit (acrylic or wool blend)",
          warmth: "Medium to high",
          breathability: "Medium",
          bestFor: "Indoor wear and cool evenings, where the cat is moving around",
          watchOut: "Loose yarn loops snag on claws; check the inside for long floats",
        },
        FLEECE_ROW,
        {
          fabric: "Brushed fleece",
          warmth: "High",
          breathability: "Low to medium",
          bestFor: "A pullover worn against bare skin on the coldest days",
          watchOut: "The soft face mats where it rubs, and it collects loose hair",
        },
        {
          fabric: "Ribbed stretch knit",
          warmth: "Medium",
          breathability: "Medium",
          bestFor: "A close fit that stays in place on a cat that keeps moving",
          watchOut: "Ribbing holds its tension, so the size that fits is the size that measures",
        },
        COTTON_ROW,
      ],
    },
    body: [
      "A sweater does a simpler job than a coat or a hoodie: it covers the chest and the back, and that is where a sphynx loses most of its heat when it stops moving. For a cat that lives indoors and gets cold on a bare floor or a windowsill, that is usually all the coverage it needs, and the reason a pullover is the piece most sphynx owners end up using most often.",
      "The choice between knit and fleece is really a choice about air. A knit has gaps in it, so a cat wearing one in a warm room does not cook; the trade is that it keeps less heat when the room is genuinely cold. Fleece is the opposite: the pile traps air and holds warmth well, which makes it excellent for a cold floor and easy to overdo in a heated room. If you want one sweater for a normal indoor winter, knit is the safer default. If the flat is cold, fleece.",
      "Sleeves are where sweaters divide. A pullover with no sleeves is the easiest thing to put on a cat that dislikes being dressed, and it is the shape a sphynx tolerates best because nothing crosses the shoulder joint. Sleeves and turtlenecks add coverage and a little more warmth at the neck, but they have to be cut so the leg can swing forward without the fabric pulling across the shoulder — if your cat walks with a stiff, shortened step, the armhole is in the wrong place for its build.",
      "Getting the chest right matters more on a sweater than on any other garment, because a pullover has to slide over the head and then sit still. Measure the chest at its widest, just behind the front legs, and treat that number as the size rather than the back length. A sweater that is loose at the chest will rotate on the cat, bunch under one armpit, and be worked off within the hour. One that fits the chest closely but not tightly will stay where you put it, which is the whole battle.",
    ],
    sizingTips: [
      "The chest measurement just behind the front legs is the number that decides the size. Check it against the chart first, then the back length.",
      "Measure the neck too, since a pullover has to pass over the head and then rest without pinching.",
      "On a sphynx, back length matters less than you would expect: the breed carries a deep chest on a relatively short back, so a size that fits the chest can look long.",
      "If your cat is between two sizes and the knit has stretch, take the smaller one. In fleece, take the larger.",
      "Try it on when the cat is calm and standing, and watch it walk across the room before you decide.",
    ],
    careNotes: [
      "Wash knit and fleece cool, by hand or in a mesh bag, and air dry flat. A tumble dryer is what turns a sweater into a doll's sweater.",
      "Before each wear, run a finger around the inside of the armholes and the neck for loose yarn or long floats that a claw could catch.",
      "Sweaters worn against bare skin pick up oil quickly. Two or three in rotation keeps one clean in the drawer while another is worn.",
      "Take it off for unsupervised hours, and never leave one on a cat that has already shown it will chew at the fabric.",
    ],
    faqs: [
      {
        question: "Is knit or fleece better for a sphynx cat sweater?",
        answer:
          "Knit for indoor wear, fleece for a cold room. Knit has gaps that let some air through, so a cat is less likely to overheat in a warm house. Fleece traps air and holds warmth, which is better on a cold floor but easy to overdo indoors. If you buy one, knit is the safer default.",
      },
      {
        question: "Does a sphynx cat sweater need sleeves?",
        answer:
          "Not to stay warm. A sleeveless pullover covers the chest and back, which is where a hairless cat loses most of its heat, and it is the shape cats tolerate best because nothing crosses the shoulder. Sleeves add coverage and warmth, but only if the armhole lets the leg swing freely.",
      },
      {
        question: "How do I stop my cat taking its sweater off?",
        answer:
          "Fit, not fastenings. A sweater that is loose at the chest rotates, bunches under an armpit, and gets worked off. Measure the chest at its widest point behind the front legs and size to that number. If it stays put when your cat walks and jumps, it will stay on.",
      },
      {
        question: "How warm is a sphynx cat without a sweater?",
        answer:
          "Warmer than the coat suggests but quick to lose heat. Sphynx cats run a higher body temperature than most breeds and burn more energy maintaining it, which is why they eat a lot and still seek warmth. They are comfortable bare in a warm room and get cold quickly on cold floors and in drafts.",
      },
      {
        question: "Can my sphynx cat wear a sweater all day?",
        answer:
          "A light knit in a cool room, yes, provided you check it has not become too warm and that no thread has worked loose. Take it off for a heated room and for unsupervised hours. If the cat is panting, stretched out and restless, or actively trying to wriggle free indoors, the sweater is the problem.",
      },
    ],
    productSlugs: [
      "sphynx-cat-sweater-classic-knit",
      "sphynx-cat-turtleneck-brushed-fleece-pullover",
      "sphynx-cat-turtleneck-everyday-fleece",
      "sphynx-cat-coat-heritage-fleece-turtleneck",
      "sphynx-cat-sweatshirt-lounge-four-leg-hoodie",
      "sphynx-cat-christmas-sweater-festive-knit",
    ],
    relatedGuides: [],
  },

  {
    slug: "sphynx-cat-hoodies",
    name: "Sphynx Cat Hoodies",
    h1: "Sphynx Cat Hoodies: Hooded and Four-Leg Fleece",
    primaryKeyword: "sphynx cat hoodies",
    title: "Sphynx Cat Hoodies: Fleece & Four-Leg Fits",
    description:
      "Sphynx cat hoodies and four-leg fleece: how a hood actually behaves on a hairless cat, when to choose two-leg or four-leg, and how to fit the legs.",
    updatedAt: UPDATED,
    answer:
      "A sphynx cat hoodie adds a hood and often full leg coverage to a fleece layer, making it the piece for cold floors and short trips outside rather than a warm room. The hood is decorative on a sitting cat; the legs are what keep the belly and thighs covered. Fit the chest first.",
    fabricTable: {
      caption: "Hooded and four-leg styles, compared",
      rows: [
        FLEECE_ROW,
        {
          fabric: "Fleece-lined shell",
          warmth: "High",
          breathability: "Low",
          bestFor: "Wind and genuinely cold outdoor trips, where a hood needs to hold shape",
          watchOut: "The heaviest option here, so it is the easiest one to overdo indoors",
        },
        {
          fabric: "Sweatshirt fleece",
          warmth: "Medium to high",
          breathability: "Medium",
          bestFor: "Everyday indoor wear with a hood that does not add much weight",
          watchOut: "Softer than jacket fleece, so it pills sooner at the leg openings",
        },
        {
          fabric: "Brushed fleece",
          warmth: "High",
          breathability: "Low to medium",
          bestFor: "Four-leg suits worn against bare skin for long stretches",
          watchOut: "Mats where it rubs, and the leg cuffs collect litter and grit",
        },
      ],
    },
    body: [
      "A hoodie is the piece people buy first, usually for the photographs, and the one that earns its place for a different reason: coverage. A hooded fleece with legs reaches the belly and the inside of the thighs, and those are the places a hairless cat loses heat fastest when it sits on a cold surface. A two-legged shirt, however warm the fabric, never gets there.",
      "The hood itself is worth being realistic about. On a sphynx sitting in a warm room it is decoration. It becomes useful in wind and on a moving cat outdoors, where it keeps the back of the neck covered, and it can be pulled back when your cat has had enough of it. What it should never do is sit over the ears in a way the cat cannot shake off, or be heavy enough to pull the neckline down at the front.",
      "Two legs or four is a question about where your cat is going. Four-leg pieces cover more skin, stay in place better on a cat that moves, and are the right answer for a cold floor or a winter walk. Two-leg pieces are quicker to put on, easier for a cat to accept, and enough for a warm room where the only problem is a cold belly on a bare floor. If your cat has never worn anything, start with two legs and see how it takes to the shoulders before buying legs.",
      "Fitting a hooded piece is mostly about the legs. Measure from the chest down to the paw and check that number, because legs that are too long pull the body backwards and legs that are too short drag the garment forward, and both make the cat walk awkwardly. Then check the leg openings for tightness with two fingers, and look at the inside of the cuffs for elastic that has not been covered — that is what rubs a bald leg raw on a long walk.",
    ],
    sizingTips: [
      "Fit the chest first, at its widest just behind the front legs, then check the leg length from the chest to the paw.",
      "Measure the neck as well: a hood pulls on the neckline, so a garment that fits the chest can still be tight at the throat.",
      "For a four-leg piece, measure the front and back legs separately. A surprising number of cats need one size up on the back.",
      "Two fingers under each leg opening. That is the difference between keeping the legs warm and cutting off circulation.",
      "Put it on before a walk rather than in the doorway, so your cat can walk around indoors and you can watch for a shortened step.",
    ],
    careNotes: [
      "Fleece and fleece-lined shells wash cool, by hand or on a gentle cycle in a mesh bag, and dry flat. Heat flattens the pile.",
      "Shake grit out of the leg cuffs before washing. Litter and road grit work into the fabric and then abrade the leg.",
      "Check the inside of the leg openings and the armholes for loose elastic and threads before each wear.",
      "Air a hooded piece after a walk rather than washing it every time. Outer layers pick up far less oil than a pullover worn next to the skin.",
      "Remove it for unsupervised hours, especially a four-leg piece, which a determined cat can work into a tangle.",
    ],
    faqs: [
      {
        question: "Do sphynx cats tolerate a hood?",
        answer:
          "Mostly, if it is light and can be pushed back. Cats dislike weight on the back of the neck and anything over the ears more than they dislike the garment itself. Choose a hood that lies flat when down, and let your cat shake it off indoors. A hood that stays up on its own is for wind, not for the living room.",
      },
      {
        question: "Should I choose a two-leg or four-leg sphynx cat hoodie?",
        answer:
          "Four legs for cold floors and outdoor trips, because the belly and thighs are where a hairless cat loses heat fastest and a two-leg piece never reaches them. Two legs for a warm room, or for a cat wearing clothes for the first time — fewer legs means less to get wrong and easier to put on.",
      },
      {
        question: "Is a hoodie too warm for a sphynx cat indoors?",
        answer:
          "A fleece hoodie usually is, in a heated room. Fleece traps the heat the cat makes. If the room is warm, use a light knit or nothing at all, and keep the fleece for cold floors and going outside. A restless, panting, stretched-out cat indoors is a cat that is too warm.",
      },
      {
        question: "How do I stop the leg openings rubbing my cat's legs?",
        answer:
          "Check two things. First that the elastic at each opening is enclosed rather than bare against the skin, and second that you can slide two fingers under it. A leg opening that leaves a red line after an hour is too tight, and continued rubbing on bare skin will make your cat refuse the garment.",
      },
      {
        question: "How often should a hoodie be washed?",
        answer:
          "An outer layer worn over a pullover needs washing far less often than something worn against the skin. Air it after each walk and wash it when it looks soiled or smells. A pullover worn next to bare skin should be washed after roughly two or three wears, because sphynx skin is oily.",
      },
    ],
    productSlugs: [
      "sphynx-cat-hoodie-four-leg-fleece",
      "sphynx-cat-jacket-arctic-fleece-lined-hoodie",
      "sphynx-cat-hoodie-snug-winter-four-leg",
      "sphynx-cat-sweatshirt-lounge-four-leg-hoodie",
    ],
    relatedGuides: [],
  },

  {
    slug: "sphynx-cat-christmas-sweaters",
    name: "Sphynx Cat Christmas Sweaters",
    h1: "Sphynx Cat Christmas Sweaters: Festive Knit Outfits",
    primaryKeyword: "sphynx cat christmas sweaters",
    title: "Sphynx Cat Christmas Sweaters & Outfits",
    description:
      "Festive sphynx cat Christmas sweaters and outfits for hairless cats: how to pick a knit your cat will actually keep on for the photos and the family visit.",
    updatedAt: UPDATED,
    answer:
      "A sphynx cat Christmas sweater is a knit layer worn for a short occasion rather than for warmth all season, so comfort matters more than insulation. Choose a knit that fits the chest closely, keep the wearing time short, and take it off once the photographs are done. Festive patterns are printed and knitted, not embroidered.",
    fabricTable: {
      caption: "Festive styles, and how each one behaves on a cat",
      rows: [
        {
          fabric: "Festive knit",
          warmth: "Medium",
          breathability: "Medium",
          bestFor: "Photographs and a warm house on the day itself",
          watchOut: "Pattern work often means long floats inside, which claws catch on",
        },
        {
          fabric: "Costume fabric",
          warmth: "Varies — often low",
          breathability: "Low",
          bestFor: "A short set-piece, not a full day of wear",
          watchOut: "Trims, ties and small pieces are what a cat chews on; inspect them first",
        },
        {
          fabric: "Ribbed stretch knit",
          warmth: "Medium",
          breathability: "Medium",
          bestFor: "A snug fit that survives a cat walking across a room",
          watchOut: "Holds its tension, so measure rather than sizing up out of caution",
        },
        COTTON_ROW,
      ],
    },
    body: [
      "Christmas cat clothing is a two-part problem. The garment has to look like the occasion, and the cat has to be willing to wear it long enough for someone to take a photograph. Those two goals pull against each other, which is why so many festive outfits end up stuffed in a drawer by Boxing Day: the sweaters that photograph best are often the ones with the most pattern, trim and weight.",
      "The practical approach is to treat it as a short-wearing piece. Pick a knit that fits the chest closely so it stays put while your cat walks, keep the wearing time to the length of the photographs and the family arriving, and take it off when the room gets busy. A cat that is warm, comfortable and briefly festive will sit still for a picture. A cat in a heavy costume in a heated front room will be under the sofa.",
      "Look at the inside of a festive knit before you put it on. Patterned knits carry the pattern behind the surface as loose floats, and a strand of yarn long enough to slip over a claw is a real hazard on a cat that scratches. Run a finger around the inside of the neck, the armholes and the hem. If a float spans more than a fingertip, either trim it and secure the end, or choose a plainer knit with the pattern confined to the outside.",
      "If your cat is new to clothes, start well before the day itself. Put a light knit on for a few minutes in a calm room, in the weeks beforehand, and let the cat walk around and forget about it. Then when the camera comes out, being dressed is already unremarkable. It is a lot easier to teach the cat in November than to negotiate with it on the afternoon of the twenty-fifth.",
    ],
    sizingTips: [
      "Measure the chest just behind the front legs and match that number, rather than ordering a size up because the outfit looks thick.",
      "Check the neckline against the neck circumference. Festive knits often have a firm rib at the neck, and that is the bit a cat notices most.",
      "If your cat has never worn clothes, measure it while it is calm and standing and buy once, rather than ordering several sizes and trying each.",
      "Confirm the leg openings on any four-leg costume with two fingers, since costume fabrics do not stretch the way knit does.",
      "Weigh the outfit in your hand. If it feels heavy to you, it will feel heavier to a cat carrying it on its shoulders.",
    ],
    careNotes: [
      "Wash a festive knit cool by hand and dry it flat, so the pattern does not distort and any applied decoration stays attached.",
      "Inspect trims, ties, bells and small sewn-on pieces before every wear, and remove anything your cat can reach with its teeth.",
      "Turn it inside out and check for long floats and loose yarn ends, then secure or trim them.",
      "Store it folded rather than hung, so the shoulders do not stretch out of shape between one December and the next.",
      "Have a plan to take it off quickly. A cat that has had enough will let you know, and the occasion is not worth a wrestling match.",
    ],
    faqs: [
      {
        question: "Will my sphynx cat keep a Christmas sweater on?",
        answer:
          "For a short while and in a calm room, usually yes — especially if it has worn clothes before. Keep the session brief, take the photographs early, and take the sweater off before the house fills up. A cat that is comfortable and not overheated will stay put long enough, which is all the occasion needs.",
      },
      {
        question: "Are Christmas cat outfits safe for a hairless cat?",
        answer:
          "Most are, with two checks. Look inside for long yarn floats that a claw could catch on, and remove or secure them; then check every trim, tie and small decoration for anything a cat could chew loose and swallow. A plain festive knit with the pattern on the outside is the lower-risk choice.",
      },
      {
        question: "How do I introduce a Christmas sweater to a cat that hates clothes?",
        answer:
          "In short sessions, weeks before, in a quiet room with a light knit rather than the festive one. Put it on, let your cat walk around and get bored of it, then take it off. Repeat until being dressed is unremarkable. Doing this in November is far easier than negotiating on the day.",
      },
      {
        question: "Does my sphynx need a Christmas sweater for warmth?",
        answer:
          "Not for warmth specifically — any fleece or knit pullover does that job, and you will get more use out of a plain one through the winter. A festive sweater is an occasion piece. If you want something that keeps your cat warm between December and March, buy the everyday layer and treat the festive knit as the extra.",
      },
    ],
    productSlugs: [
      "sphynx-cat-christmas-sweater-festive-knit",
      "sphynx-cat-costume-cosplay-outfit",
    ],
    relatedGuides: [],
    crossLink: {
      label: "See all sphynx cat winter clothes",
      href: "/sphynx-cat-winter-clothes",
    },
  },
];

export const COLLECTION_SLUGS: readonly string[] = COLLECTIONS.map((c) => c.slug);

export function getCollection(slug: string): Collection | undefined {
  return COLLECTIONS.find((collection) => collection.slug === slug);
}

/**
 * Lives here rather than in the route file so tests can import the config
 * without pulling in `prisma` — the route needs a database, the roster does not.
 */
export function collectionStaticParams(): { collection: string }[] {
  return COLLECTIONS.map((collection) => ({ collection: collection.slug }));
}

/** Every slug that appears in at least one collection. */
export function collectionProductSlugs(): string[] {
  return [...new Set(COLLECTIONS.flatMap((c) => [...c.productSlugs]))];
}
