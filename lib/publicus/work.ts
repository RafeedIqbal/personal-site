// Media for the BaseNote entry on /publicus. Files live in public/publicus/work/: WebP copies of the
// products' own guide captures (Blend on seed data, Alchemy on synthetic data) and a web encode of the
// founder demo recorded on 1 November 2026.

export type GalleryItem = { src: string; width: number; height: number; product: "Blend" | "Alchemy"; title: string; alt: string };

export const GALLERY: GalleryItem[] = [
  { src: "/publicus/work/blend-storefront.webp", width: 1440, height: 900, product: "Blend", title: "The studio’s storefront", alt: "Blend storefront home page: “Your scent. Your identity.” beside a dropper over a glass dish, with buttons to take the assessment or explore the experience." },
  { src: "/publicus/work/blend-chat.webp", width: 1440, height: 900, product: "Blend", title: "A suggested blend, checked against stock", alt: "Blend’s customer chat with a suggested blend, Ember Silk: opening, heart and base notes, why it fits, and a note that its ingredients are currently available at the lab." },
  { src: "/publicus/work/blend-inventory.webp", width: 1440, height: 900, product: "Blend", title: "Stock the agent draws from", alt: "Blend staff inventory: 14 tracked items with on-hand, reserved and available quantities, reorder points and stock status for accord oils and atomizers." },
  { src: "/publicus/work/alchemy-brief.webp", width: 1440, height: 1000, product: "Alchemy", title: "A formula brief", alt: "Alchemy brief form for “Amber Oud, a warmer take”: scent description, fragrance family, top, heart and base notes, strength and longevity, with target markets EU/EEA and Great Britain." },
  { src: "/publicus/work/alchemy-assistant.webp", width: 1440, height: 1000, product: "Alchemy", title: "Research and a screened first draft", alt: "Alchemy assistant answering a request for an EDP like a reference perfume: a reference card with its notes, then a first draft screened but not approved, with some compositions needing a chemist’s review." },
  { src: "/publicus/work/alchemy-screening.webp", width: 1440, height: 1000, product: "Alchemy", title: "Compliance screening by market", alt: "Alchemy compliance screening: market checkboxes for EU/EEA, Northern Ireland, Great Britain, UAE and USA, a most-restrictive result of Needs review, and the screening history." },
];

export const DEMO_VIDEO = {
  src: "/publicus/work/blend-alchemy-demo.mp4",
  poster: "/publicus/work/blend-alchemy-demo-poster.webp",
  recorded: "1 November 2026",
};

// What is said in the video, under the film's own chapter labels. Fillers are removed; nothing is reworded.
export const DEMO_TRANSCRIPT: { chapter: string; text: string }[] = [
  { chapter: "Blend · Customer", text: "Hello, so this is gonna be a very quick demo of Blend and Alchemy from Base Note Solutions. So, this is an implementation of Blend for our client VEXERA Fragrances. This is the customer’s storefront. It’s just a website where they can learn more about how the whole process works. The first step is you take an assessment to see what your fragrance profile would be like. This is just to give our AI more context on what the user likes. Once you save your profile, you can reserve a spot in the lab, or you can have an online chat to create a fragrance of your own. Here you can give it a natural language prompt on what type of fragrances you like. “Something cool and airy.” I’ve been very vague; it’ll guide me through it, giving me further questions. Alternatively, I can give it a very specific brief, which will just give me a blend right away that I can continue in the store." },
  { chapter: "Blend · Store staff", text: "Once you’ve confirmed your reservation, it goes on to this ERP platform that we’ve built for VEXERA Fragrances, where they can see users that have booked times in the store. Once they walk in, you can check them in, and then open a consultation for them. The staff can see their preferences, as well as context on how they answered online. Here, in store, you can create an even more specific brief for the type of fragrance that the customer is trying to create. You should be able to explore fragrance directions, three ways that the customer can go moving forward. And then, it just gets sent over to production for them to create the perfumes based on the blends generated." },
  { chapter: "Alchemy · Research", text: "So, that’s Blend, and Alchemy is very similar, but it is more tuned towards manufacturers. It’s a manufacturing ERP instead of a retail one. Alchemy Assistant is more of a market research tool, alongside blend creation as well. You can ask it for three popular oud perfumes from the UK, and it will search our proprietary perfume database to see what perfumes match up with what I am looking for." },
  { chapter: "Alchemy · Formulation", text: "And then, the other way this tool can be used, it will give you a blend. It does deterministic checks on cost, and then what materials you have in stock, and then how much it can use for the regions you want to sell in, in terms of compliance and regulations." },
  { chapter: "Alchemy · Formula draft", text: "So here it’s given me a blend of chemicals, instead of here, it gives you a blend of oils, perfume oils that we provide to the store to use. It’ll give instructions on how to make it. And then it also shows you the compliance requirements that it checked it against. And then if you are missing materials, it will give you the materials that you need to purchase. And that’s our short demo, thank you!" },
];

export const ICON_STORES = [
  { store: "App Store", href: "https://apps.apple.com/app/icon-training/id6755780488" },
  { store: "Google Play", href: "https://play.google.com/store/apps/details?id=app.icontraining.icon" },
];
