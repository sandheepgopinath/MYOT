export type Tshirt = {
  id: string;
  name: string;
  gsm: number;
  fit: "normal" | "oversized";
  price: number;
  imageFront: string;
  imageBack: string;
};

export type Design = {
  id: string;
  name: string;
  category: "Zodiac" | "Thrissur" | "Abstract";
  price: number;
  image: string;
};

export type Placement = {
  id: string;
  name: string;
};

export const TSHIRTS: Tshirt[] = [
  {
    id: "t-norm-100",
    name: "100 GSM Normal",
    gsm: 100,
    fit: "normal",
    price: 10,
    imageFront: "tshirt_front",
    imageBack: "tshirt_back",
  },
  {
    id: "t-norm-200",
    name: "200 GSM Normal",
    gsm: 200,
    fit: "normal",
    price: 15,
    imageFront: "tshirt_front",
    imageBack: "tshirt_back",
  },
  {
    id: "t-norm-220",
    name: "220 GSM Normal",
    gsm: 220,
    fit: "normal",
    price: 18,
    imageFront: "tshirt_front",
    imageBack: "tshirt_back",
  },
  {
    id: "t-over-100",
    name: "100 GSM Oversized",
    gsm: 100,
    fit: "oversized",
    price: 12,
    imageFront: "tshirt_front_oversized",
    imageBack: "tshirt_back_oversized",
  },
  {
    id: "t-over-200",
    name: "200 GSM Oversized",
    gsm: 200,
    fit: "oversized",
    price: 18,
    imageFront: "tshirt_front_oversized",
    imageBack: "tshirt_back_oversized",
  },
  {
    id: "t-over-220",
    name: "220 GSM Oversized",
    gsm: 220,
    fit: "oversized",
    price: 22,
    imageFront: "tshirt_front_oversized",
    imageBack: "tshirt_back_oversized",
  },
];

export const DESIGNS: Design[] = [
  {
    id: "design-zodiac-1",
    name: "Aries",
    category: "Zodiac",
    price: 5,
    image: "zodiac_aries",
  },
  {
    id: "design-zodiac-2",
    name: "Taurus",
    category: "Zodiac",
    price: 5,
    image: "zodiac_taurus",
  },
  {
    id: "design-zodiac-3",
    name: "Gemini",
    category: "Zodiac",
    price: 5,
    image: "zodiac_gemini",
  },
  {
    id: "design-zodiac-4",
    name: "Cancer",
    category: "Zodiac",
    price: 5,
    image: "zodiac_cancer",
  },
  {
    id: "design-thrissur-1",
    name: "Pooram",
    category: "Thrissur",
    price: 7,
    image: "thrissur_pooram",
  },
  {
    id: "design-thrissur-2",
    name: "Vadakkumnathan",
    category: "Thrissur",
    price: 7,
    image: "thrissur_vadakkumnathan",
  },
  {
    id: "design-abstract-1",
    name: "Geometric",
    category: "Abstract",
    price: 6,
    image: "abstract_geometric",
  },
  {
    id: "design-abstract-2",
    name: "Lines",
    category: "Abstract",
    price: 6,
    image: "abstract_lines",
  },
];

export const PLACEMENTS: Placement[] = [
  { id: "front-center", name: "Front Center" },
  { id: "front-top", name: "Front Top" },
  { id: "front-bottom", name: "Front Bottom" },
  { id: "back-center", name: "Back Center" },
  { id: "back-top", name: "Back Top" },
  { id: "back-bottom", name: "Back Bottom" },
];
