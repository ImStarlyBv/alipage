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

  {
    slug: "cat-recovery-suits",
    name: "Cat Recovery Suits",
    h1: "Cat Recovery Suits for Sphynx and Hairless Cats",
    primaryKeyword: "cat recovery suit",
    title: "Cat Recovery Suits for Sphynx Cats",
    description:
      "Soft cotton cat recovery suits that keep a healing cat from licking stitches after spay or neuter surgery, sized for a sphynx or hairless build.",
    updatedAt: UPDATED,
    answer:
      "A cat recovery suit is a full-body cotton cover that keeps a cat from licking or scratching stitches after spay, neuter or other surgery, without the wide plastic cone that blocks eating, drinking and sleeping normally. It works by covering the wound site with breathable fabric rather than by physically stopping every reach.",
    fabricTable: {
      caption:
        "Recovery-suit fabrics in general — we carry the soft cotton style below",
      rows: [
        {
          fabric: "Soft cotton jersey",
          warmth: "Low to medium",
          breathability: "High",
          bestFor: "Everyday post-op wear against a fresh incision or shaved, bare skin",
          watchOut: "Needs washing often since it sits directly on the wound site; keep a second suit in rotation",
        },
        {
          fabric: "Cotton-spandex stretch blend",
          warmth: "Low to medium",
          breathability: "Medium to high",
          bestFor: "A snugger fit on a cat that wriggles out of a looser suit",
          watchOut: "Stretch fabric can ride up if the leg or belly measurement is off, so it needs a closer size check",
        },
        {
          fabric: "Cotton twill or canvas",
          warmth: "Medium",
          breathability: "Medium",
          bestFor: "Longer recovery windows where the fabric needs to hold shape after many washes",
          watchOut: "Stiffer against bare, healing skin than jersey — not the first choice right after surgery",
        },
      ],
    },
    body: [
      "After spay, neuter or another surgery, the standard advice is to stop a cat reaching the incision until it closes. The usual tool is the plastic cone, and the usual complaint about the cone is everything it also stops: eating comfortably, drinking from a normal bowl, sleeping in a curled-up position, and moving around the house without bumping into doorways. A recovery suit solves the same problem a different way — instead of blocking the cat's reach, it covers the wound with fabric, so there is nothing exposed to lick or scratch even when the cat can still reach the area.",
      "That trade-off is the whole decision. A suit lets a cat eat, drink, groom its face and sleep normally, which matters over the one to two weeks most incisions need to close. What it does not do is stop a determined cat from working at the fabric itself, or from reaching a wound that is not on the torso — a suit covers the belly and back, not a leg or an ear. For a sphynx or another hairless breed, there is a second reason it earns its place beyond the usual reasons: bare skin around a fresh incision is exposed to everything a coated cat's fur would otherwise buffer, including its own claws.",
      "Fit is what decides whether a recovery suit actually works. Too loose, and a cat can push a paw underneath it and reach the incision anyway, or wriggle out of it entirely, which happens most often around the back legs and the tail opening. Too tight, and closures press directly on a fresh surgical site or restrict normal movement enough that the cat fights the suit instead of settling down. Soft, flat seams over the incision area matter more here than on any other garment on this site, since this is the one piece worn directly against a wound.",
      "Because it sits against bare, healing skin for most of the day, a recovery suit needs washing more often than an everyday sweater — mild detergent, no softener, full dry before it goes back on.",
    ],
    sizingTips: [
      "Measure the chest just behind the front legs and the back length from the base of the neck to the base of the tail, the same as any other garment — surgical swelling can make a cat measure slightly larger than usual for a day or two.",
      "Size up if your cat is between sizes. A suit that is a touch loose still covers the wound; one that is tight against a fresh incision is the more serious problem.",
      "Check the leg and tail openings can pass two fingers, since these are the openings a cat pushes a paw or its head through to reach the wound underneath.",
      "Fit it once before surgery if you can, in a calm moment, so the first time your cat wears it is not also the first time it feels the incision.",
    ],
    careNotes: [
      "Wash after every wear on mild detergent with no fabric softener, and let it dry fully before putting it back on a healing wound.",
      "Check the incision site each time the suit comes off for washing — a suit is not a substitute for looking at the wound.",
      "Keep a second suit in rotation so your cat is never left uncovered while the first one is being washed and dried.",
      "Stop using the suit and follow your vet's original guidance if your cat is chewing at the fabric itself rather than tolerating it, since a suit only works while it is left alone.",
    ],
    faqs: [
      {
        question: "Is a recovery suit as effective as a cone after spay or neuter surgery?",
        answer:
          "It works differently rather than better or worse. A cone stops a cat physically reaching almost anywhere on its body; a suit covers the torso so there is nothing exposed to lick, but it does not block a leg, ear or a determined paw working underneath the fabric. Many owners use a suit for comfort during the day and keep a cone on hand for overnight or unsupervised time, especially in the first few days.",
      },
      {
        question: "What size recovery suit does a sphynx cat need after spay surgery?",
        answer:
          "The same chest and back measurements used for any other sphynx garment on this site, taken calm and standing. Surgical swelling can add slightly to the chest measurement for a day or two, so size up if your cat sits between two sizes rather than down.",
      },
      {
        question: "Can a cat wear a recovery suit after a neuter?",
        answer:
          "Yes — the fit and use are the same as after a spay; the suit covers the torso to keep the cat from licking or scratching the incision either way. Check the specific incision location against the suit's coverage before relying on it alone.",
      },
      {
        question: "How long does a cat need to wear a recovery suit?",
        answer:
          "For as long as your vet advises the incision needs protecting, which is commonly one to two weeks for a routine spay or neuter — follow your vet's timeline for your cat rather than a fixed number here. Wash the suit regularly across that window rather than leaving one on the whole time.",
      },
      {
        question: "Will a recovery suit stop my cat scratching at its stitches?",
        answer:
          "It removes the exposed skin a cat would otherwise lick or nibble directly, which covers most of what causes a reopened incision. It does not stop a cat's back claws reaching through or under a loose suit, which is why fit — snug but not tight over the wound — matters more here than warmth or style.",
      },
    ],
    productSlugs: ["sphynx-cat-recovery-suit-soft-cotton"],
    relatedGuides: [],
  },

  {
    slug: "sphynx-cat-shirts",
    name: "Sphynx Cat Shirts",
    h1: "Sphynx Cat Shirts and Tees for Warm Days",
    primaryKeyword: "sphynx cat shirt",
    title: "Sphynx Cat Shirts & Tees for Hairless Cats",
    description:
      "Lightweight cotton shirts, tees and vests for sphynx and hairless cats: everyday basics, print tees and a dress shirt for warm rooms and sun.",
    updatedAt: "2026-09-17",
    answer:
      "A sphynx cat shirt is a lightweight cotton layer for warm rooms and sun, not a substitute for a winter sweater. Cotton breathes, so it keeps a hairless cat comfortable in a heated home or air-conditioned room and adds a soft barrier between bare skin and direct sunlight, without the warmth a knit or fleece piece traps.",
    fabricTable: {
      caption: "Cotton shirt styles, and what each covers",
      rows: [
        {
          fabric: "Lightweight cotton jersey (short-sleeve tee)",
          warmth: "Low",
          breathability: "High",
          bestFor: "Warm rooms and everyday wear against bare skin",
          watchOut: "Offers little real warmth — pair with a knit layer once the room cools",
        },
        {
          fabric: "Sleeveless cotton vest",
          warmth: "Low",
          breathability: "High",
          bestFor: "A cat that dislikes anything crossing the shoulder, or the mildest days",
          watchOut: "Leaves the legs and shoulders bare, so it's a sun/chill layer, not a cold-weather one",
        },
        {
          fabric: "Printed cotton (graphic or floral)",
          warmth: "Low",
          breathability: "Medium to high",
          bestFor: "Everyday style without changing what the fabric does",
          watchOut: "Wash cold and inside out so the print doesn't crack or fade early",
        },
        {
          fabric: "Dress-shirt weight cotton",
          warmth: "Low to medium",
          breathability: "Medium",
          bestFor: "Photos and short occasions rather than all-day wear",
          watchOut: "Cut closer to the body for a tailored look — check chest fit before the event, not on the day",
        },
      ],
    },
    body: [
      "A shirt does a different job on a sphynx than a sweater does. Where a knit or fleece piece exists to replace missing insulation, a cotton shirt exists to solve two lighter problems: a bare-skinned cat sitting under an air-conditioning vent, and a bare-skinned cat sitting in a sunny window. Cotton breathes enough that a cat wearing one in a normal room does not overheat, and the layer of fabric between skin and direct sun is real coverage, even without a specific sun-protection rating attached to it.",
      "The four styles here split by occasion rather than by warmth, since none of them are meant to be warm. A short-sleeve tee is the everyday piece — quick to put on, comfortable for hours, and the one most owners reach for on a normal day. A sleeveless vest strips that down further for a cat that tolerates nothing crossing its shoulders; it covers less skin but is the easiest thing to dress a nervous or new cat in. The printed tees are the same cotton jersey with a graphic or a floral print, so choosing between them is about how the cat looks, not how it feels. The dress shirt is the outlier: cut closer to the body for photos, weddings and holidays, worn for an hour rather than a day.",
      "Fit works the same way it does on every other garment here: measure the chest just behind the front legs, and treat that number as the size. A shirt that is loose at the chest will rotate as the cat walks and end up bunched to one side by the end of the day, which is more noticeable on a thin cotton layer than on a bulkier knit. The dress shirt in particular is tailored closer to the body, so a size that fits comfortably in the tee can still pull at the shoulder in that style — check it before the day you actually need it.",
    ],
    sizingTips: [
      "Measure the chest just behind the front legs and the back length from neck to tail base, standing rather than curled up.",
      "Cotton has less give than a ribbed knit, so size up rather than down if your cat sits between two sizes.",
      "For the dress shirt specifically, try it on a few days before an event rather than the morning of, since the tailored cut runs closer to the body.",
      "Check the neck and armholes with two fingers, the same as any other garment — a shirt that is snug in the wrong place gets worked off just as fast as a heavier one.",
    ],
    careNotes: [
      "Machine wash cold, and wash printed tees inside out so the graphic or pattern doesn't crack or fade early.",
      "Cotton against bare skin picks up oil the same way any fabric does — two or three in rotation keeps one clean while another is worn.",
      "Air dry rather than tumble dry the printed and dress-shirt styles, so the print and the tailored seams hold their shape.",
      "A cotton shirt is not a cold-weather layer — swap to a knit or fleece piece from the sweater or winter-clothes collection once the room turns cold.",
    ],
    faqs: [
      {
        question: "Do sphynx cats need to wear a shirt indoors?",
        answer:
          "Not for warmth in a normal room — bare skin is fine there. A shirt earns its place under an air-conditioning vent, in direct sun through a window, or simply as a light layer some owners prefer over bare skin. It is not doing the job a sweater does in a cold room.",
      },
      {
        question: "Will a cotton shirt protect my sphynx cat from sunburn?",
        answer:
          "A layer of fabric between skin and direct sun helps, the same way covering up helps a person, but none of the shirts here carry a tested UPF rating, so treat it as reducing exposure rather than eliminating it. Keep a sunburn-prone cat out of direct midday sun regardless of what it's wearing.",
      },
      {
        question: "What's the difference between a sphynx cat tee and a vest?",
        answer:
          "Sleeves. A tee covers the shoulders and upper legs with short sleeves; a vest is sleeveless and covers only the torso. Vests suit a cat that dislikes anything crossing its shoulder joint, or a first-time wearer, at the cost of a bit less coverage.",
      },
      {
        question: "Can a sphynx cat wear a dress shirt for a whole day?",
        answer:
          "It's built for an occasion rather than all-day wear — a closer, tailored cut that looks sharp for a few hours but isn't the comfortable everyday fit the tees are. For a full day, choose the short-sleeve tee or vest and save the dress shirt for the photos.",
      },
    ],
    productSlugs: [
      "sphynx-cat-t-shirt-soft-cotton-short-sleeve",
      "sphynx-cat-t-shirt-graphic-print-cotton",
      "sphynx-cat-vest-tee-breton-stripe-cotton",
      "sphynx-cat-shirt-gentleman-dress-shirt-tie",
      "sphynx-cat-shirt-cherry-blossom-cotton-tee",
    ],
    relatedGuides: [],
  },

  {
    slug: "sphynx-cat-pajamas",
    name: "Sphynx Cat Pajamas",
    h1: "Sphynx Cat Pajamas and Onesies for Full-Body Coverage",
    primaryKeyword: "sphynx cat pajamas",
    title: "Sphynx Cat Pajamas & Onesies",
    description:
      "Full-body sphynx cat pajamas and onesies in cotton: a four-leg warmth piece, a lightweight everyday onesie, and a hooded style for cold nights.",
    updatedAt: "2026-09-17",
    answer:
      "Sphynx cat pajamas are full-body cotton onesies covering the legs and tail as well as the chest and back, which a pullover sweater does not reach. They suit bedtime, a cold night, or a cat needing coverage everywhere rather than just the torso — the trade-off is a four-leg piece takes longer to put on than a pullover.",
    fabricTable: {
      caption: "Three onesie builds, and what each one is for",
      rows: [
        {
          fabric: "Four-leg cotton onesie",
          warmth: "Medium",
          breathability: "Medium",
          bestFor: "Full-body warmth for a kitten or a cat that runs cold at night",
          watchOut: "Four legs means four openings to check for tightness before every wear",
        },
        {
          fabric: "Lightweight cotton onesie",
          warmth: "Low",
          breathability: "High",
          bestFor: "Mild days and full coverage without much added warmth",
          watchOut: "Not the piece for a genuinely cold room — it covers more skin than a tee, but doesn't add much heat",
        },
        {
          fabric: "Hooded cotton onesie",
          warmth: "Medium to high",
          breathability: "Low to medium",
          bestFor: "Cold nights, where the hood adds coverage over the head and neck",
          watchOut: "Check the hood sits loosely enough to shake off — nothing should hold it over the ears",
        },
      ],
    },
    body: [
      "A onesie covers ground a pullover sweater cannot: the legs, and often the tail base, as well as the chest and back. For a hairless cat that curls up tightly to sleep, that matters, because the parts a curled-up cat tucks against its own body — the legs and belly — are also the parts a two-piece garment leaves exposed. The trade-off is practical rather than physical: four leg openings take longer to fasten than one pullover, and a cat that dislikes being dressed has more surface area to object to.",
      "The three styles here answer different questions rather than different levels of the same thing. The four-leg cotton onesie is the warmth piece — the closest thing on this page to a sweater's job, extended down each leg, and the one worth reaching for on a cold night or for a kitten that loses heat faster than an adult. The lightweight onesie trades warmth for coverage on a mild day, useful for a cat you want dressed but not insulated. The hooded onesie adds one more piece of coverage than either: the head and neck, which matters on the coldest nights and matters not at all in a warm room.",
      "Fit follows the same rule as everywhere else on this site — chest first, then legs. A onesie that's loose at the chest will twist as the cat moves, which is more disruptive here than on a pullover because the twisting also drags at the leg openings. Check each leg opening will pass two fingers, and on the hooded style, check the hood lies flat and can be pushed back rather than sitting fixed over the ears. A cat trying to shake off a hood it can't remove is a cat that will fight the whole garment.",
    ],
    sizingTips: [
      "Measure the chest just behind the front legs, the back length from neck to tail base, and the leg length from chest to paw for a four-leg style.",
      "Kittens grow quickly — size for now rather than buying ahead, and expect to size up again within a few months.",
      "Two fingers under each leg opening. Four openings means four chances to get one too tight.",
      "On the hooded style, check the hood pushes back easily. If it doesn't move without effort, it will sit fixed in the one place a cat dislikes most.",
    ],
    careNotes: [
      "Wash cool and air dry flat — a four-leg piece takes longer to dry than a pullover, so plan for that if it's the only one your cat has.",
      "Check all leg openings and the hood edge for loose threads before every wear, the same as any other four-leg or hooded garment.",
      "Two onesies in rotation matters more here than for a simple tee, since a full-body piece worn overnight picks up more oil over a longer stretch of skin.",
      "Remove for unsupervised hours, particularly the four-leg style, which has more fabric for a determined cat to work into a tangle.",
    ],
    faqs: [
      {
        question: "What's the difference between sphynx cat pajamas and a onesie?",
        answer:
          "On this site, none — both describe the same full-body, four-leg garment, as opposed to a pullover sweater that only covers the torso. \"Pajamas\" tends to describe the everyday or bedtime piece; \"onesie\" is used more generally, including the hooded and lightweight styles.",
      },
      {
        question: "Do sphynx cats need to wear pajamas at night?",
        answer:
          "Not always, but a onesie is worth it for a cat that sleeps somewhere cold or is a kitten still building body fat. A full-body piece covers the legs and belly a curled-up cat can't otherwise keep warm on its own. In a warm bedroom, bare skin overnight is usually fine.",
      },
      {
        question: "Is a four-leg onesie harder to put on than a sweater?",
        answer:
          "Yes, and it's worth expecting that rather than being put off by it. Four leg openings take longer than one pullover, especially the first few times. Dress a calm, standing cat, one leg at a time, and it gets faster with practice on both sides.",
      },
      {
        question: "Will my sphynx cat overheat in a hooded onesie?",
        answer:
          "In a warm room, yes it can — a hooded, full-body piece is the warmest style here. Save it for a cold night and watch for panting or restlessness, the same signs of overheating that apply to any fleece or heavy knit on this site.",
      },
    ],
    productSlugs: [
      "sphynx-cat-pajamas-cotton-four-leg-onesie",
      "sphynx-cat-onesie-cartoon-cotton",
      "sphynx-cat-onesie-dreamtime-hooded",
    ],
    relatedGuides: [],
  },

  {
    slug: "devon-rex-clothes",
    name: "Devon Rex Clothes",
    h1: "Devon Rex Clothes: Sweaters, Shirts and Onesies for a Slender Build",
    primaryKeyword: "devon rex clothes",
    title: "Devon Rex Clothes for Cats",
    description:
      "Devon Rex clothes that also fit Cornish Rex and Peterbald cats: knit sweaters, cotton shirts and a hooded onesie sized for a slim, curly-coated build.",
    updatedAt: "2026-09-17",
    answer:
      "Devon Rex clothes fit a body shape close enough to a sphynx's — a slim frame, deep chest and often thin or partial fur — that the same garment works across both breeds, plus Cornish Rex and Peterbald. This page lists only the products whose own listings confirm that fit, not the whole catalogue relabelled for a different breed.",
    fabricTable: {
      caption: "What's in this collection, by fabric",
      rows: [
        FLEECE_ROW,
        {
          fabric: "Knit (acrylic or wool blend)",
          warmth: "Medium to high",
          breathability: "Medium",
          bestFor: "Indoor wear on a breed that, like the sphynx, has little body fat to spare",
          watchOut: "Loose yarn loops snag on claws; check the inside for long floats",
        },
        COTTON_ROW,
        {
          fabric: "Hooded cotton onesie",
          warmth: "Medium to high",
          breathability: "Low to medium",
          bestFor: "A cold night, with the hood adding coverage over the head and neck",
          watchOut: "Check the hood sits loosely enough to shake off",
        },
      ],
    },
    body: [
      "Devon Rex, Cornish Rex and Peterbald cats aren't sphynx cats, but they share enough of the same build that clothing sized for a hairless breed usually fits: a slim, long-bodied frame, a deep chest relative to the back, and — depending on the individual cat — anywhere from a thin curly coat to no coat at all. That's a fit question, not a marketing label, which is why this page doesn't relabel the whole catalogue for a second breed. It lists only the products whose own listings state they fit Devon Rex, Cornish Rex or Peterbald cats specifically, alongside sphynx.",
      "What that leaves is a real cross-section rather than a narrow one: a classic knit sweater and an everyday fleece turtleneck for indoor warmth, a four-leg fleece hoodie for a cold room, a graphic tee, a striped vest and a cherry-blossom tee for warm days, and a hooded cotton onesie for the coldest nights. Between them, the same warmth-versus-breathability trade-offs apply as everywhere else on this site — knit and cotton breathe better, fleece holds more heat, and a onesie covers the legs a pullover doesn't reach.",
      "A curly or partial coat changes one thing about fit that a bare sphynx doesn't have: some Devon Rex and Cornish Rex cats have enough coat texture that a snugger knit can catch or mat slightly at the shoulders where the fabric rubs. It's a minor consideration next to the chest measurement, which still decides whether a garment stays on, but it's worth a check on a curlier-coated cat the first time a knit is worn.",
    ],
    sizingTips: [
      "Measure the chest just behind the front legs and the back length from neck to tail base — the same two numbers used across every collection on this site.",
      "A Devon Rex or Cornish Rex with a fuller coat can measure slightly fuller through the chest than a sphynx of the same length; measure your own cat rather than assuming a size from breed alone.",
      "For a knit worn against a curlier coat, check the inside for snagging after the first wear, not just before it.",
      "Between two sizes, size up in fleece and down in a close-fitting knit, the same rule as the sweaters and winter-clothes collections.",
    ],
    careNotes: [
      "Wash knit and cotton pieces cool and air dry flat; fleece follows the same care as the winter-clothes and hoodies collections.",
      "Check for loose yarn loops and long floats before each wear, since a curlier coat can catch on a snag a bare sphynx wouldn't.",
      "Two pieces in rotation is worth it here too, so one is always clean while the other airs or dries.",
    ],
    faqs: [
      {
        question: "Do Devon Rex cats need clothes the same way sphynx cats do?",
        answer:
          "Often, yes. A Devon Rex has a fine, partial coat rather than a sphynx's bare skin, so it retains a little more warmth on its own, but the slim build and low body fat both breeds share means many Devon Rex cats still run cold indoors and benefit from the same layers.",
      },
      {
        question: "Will sphynx cat clothes fit a Cornish Rex or Peterbald?",
        answer:
          "The products on this page are the ones we can confirm fit those breeds, based on their own listings — not every item in the wider catalogue. Body shape is close enough across all four breeds that a garment sized right for one usually works for the others; measure your own cat rather than assuming from breed alone.",
      },
      {
        question: "Why is the Devon Rex collection smaller than the others?",
        answer:
          "Because it only lists products whose listings specifically confirm the fit, rather than every sphynx product relabelled for a second breed. That's a smaller, honest list rather than a padded one — the rest of the catalogue is still browsable from the shirts, sweaters, hoodies and pajamas collections.",
      },
      {
        question: "How do I size clothes for a Devon Rex kitten?",
        answer:
          "The same way as an adult: measure the chest just behind the front legs and the back length from neck to tail base, and size to those numbers rather than to age. Kittens grow quickly, so expect to re-measure and size up within a few months.",
      },
    ],
    productSlugs: [
      "sphynx-cat-turtleneck-everyday-fleece",
      "sphynx-cat-sweater-classic-knit",
      "sphynx-cat-sweatshirt-lounge-four-leg-hoodie",
      "sphynx-cat-t-shirt-graphic-print-cotton",
      "sphynx-cat-vest-tee-breton-stripe-cotton",
      "sphynx-cat-shirt-cherry-blossom-cotton-tee",
      "sphynx-cat-onesie-dreamtime-hooded",
    ],
    relatedGuides: [],
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
