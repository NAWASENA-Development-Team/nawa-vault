/**
 * lib/category-config.ts
 *
 * Static reference for the 3-level category hierarchy.
 * Used in forms/dropdowns to avoid API round-trips when the
 * structure is known at build time.
 *
 * Category Code format:
 *   Level 1 (TYPE)       : 1 char  — E, F, L
 *   Level 2 (KATEGORI)   : 2 chars — EA, EP, FF, LL, LE
 *   Level 3 (SUBKATEGORI): 3 chars — EAS, EAD, EAK, EPS, EPL, EPD, EPA, FFA, FFP, LLT, LLP, LED
 *
 * Asset ID format: [SUBCAT_CODE][NNNN]/[OWNER_CODE]
 *   e.g. EAS0001/TU,  EPD0034/TU
 */

export interface SubCategory {
  code: string;
  name: string;
}

export interface Category {
  code: string;
  name: string;
  subcategories: SubCategory[];
}

export interface CategoryType {
  code: string;
  name: string;
  description: string;
  categories: Category[];
}

export const CATEGORY_TREE: CategoryType[] = [
  {
    code: "E",
    name: "Elektronik",
    description: "Semua perangkat elektronik dan perkabelan",
    categories: [
      {
        code: "EA",
        name: "Alat Elektronik",
        subcategories: [
          { code: "EAS", name: "Soundsystem / Audio" },
          { code: "EAD", name: "Display / Visual" },
          { code: "EAK", name: "Komputer" },
        ],
      },
      {
        code: "EP",
        name: "Perkabelan",
        subcategories: [
          { code: "EPS", name: "Kabel Soundsystem" },
          { code: "EPL", name: "Kabel Listrik / Power" },
          { code: "EPD", name: "Kabel Display / Data" },
          { code: "EPA", name: "Adapter / Converter" },
        ],
      },
    ],
  },
  {
    code: "F",
    name: "Furniture & Rak",
    description: "Furniture panggung dan pendukung stage",
    categories: [
      {
        code: "FF",
        name: "Furniture Stage",
        subcategories: [
          { code: "FFA", name: "Audio / Stage Stand" },
          { code: "FFP", name: "Panggung / Logistik" },
        ],
      },
    ],
  },
  {
    code: "L",
    name: "Lapangan / Outdoor & Events",
    description: "Perlengkapan outdoor dan dekorasi events",
    categories: [
      {
        code: "LL",
        name: "Lapangan",
        subcategories: [
          { code: "LLT", name: "Tenda" },
          { code: "LLP", name: "Perkakas" },
        ],
      },
      {
        code: "LE",
        name: "Events",
        subcategories: [
          { code: "LED", name: "Dekorasi" },
        ],
      },
    ],
  },
];

/** All leaf subcategories flat — for simple lookup/autocomplete */
export const ALL_SUBCATEGORIES: SubCategory[] = CATEGORY_TREE.flatMap((t) =>
  t.categories.flatMap((c) => c.subcategories)
);

/** Get subcategory by code */
export function getSubcategory(code: string): SubCategory | undefined {
  return ALL_SUBCATEGORIES.find((s) => s.code === code.toUpperCase());
}

/** Get breadcrumb path for a subcategory code */
export function getCategoryBreadcrumb(subcatCode: string): string {
  const code = subcatCode.toUpperCase();
  for (const type of CATEGORY_TREE) {
    for (const cat of type.categories) {
      const sub = cat.subcategories.find((s) => s.code === code);
      if (sub) return `${type.name} › ${cat.name} › ${sub.name}`;
    }
  }
  return subcatCode;
}
