/**
 * OS12 v5 — Subject-Specific Study Profiles
 *
 * This is the SINGLE SOURCE OF TRUTH for per-subject workflow stages,
 * resources, and chapter categorisation logic.
 *
 * Adding a new subject (Biology, Economics, Japanese…) requires ONLY
 * adding a new entry to SUBJECT_PROFILES below.  No UI code changes needed.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SubjectConfig {
  slug: string
  name: string
  /** Default ordered workflow stages for this subject */
  workflow: string[]
  /** Resource names shown for chapters of this subject */
  resources: string[]
  /** Optional: derive a category string from a chapter name */
  chapterCategoryFn?: (chapterName: string) => string
  /** Category-specific workflow overrides (key = category string) */
  categoryWorkflows?: Record<string, string[]>
  /** Category-specific resource overrides (key = category string) */
  categoryResources?: Record<string, string[]>
}

// ---------------------------------------------------------------------------
// Chemistry helpers
// ---------------------------------------------------------------------------

const ORGANIC_KEYWORDS = [
  'haloalkanes', 'haloarenes', 'alcohols', 'phenols', 'ethers',
  'aldehydes', 'ketones', 'carboxylic', 'amines',
]
const INORGANIC_KEYWORDS = [
  'd and f block', 'coordination compounds', 'biomolecules',
]

function classifyChemistry(chapterName: string): string {
  const lower = chapterName.toLowerCase()
  if (ORGANIC_KEYWORDS.some(kw => lower.includes(kw))) return 'organic'
  if (INORGANIC_KEYWORDS.some(kw => lower.includes(kw))) return 'inorganic'
  return 'physical' // Solutions, Electrochemistry, Chemical Kinetics, etc.
}

// ---------------------------------------------------------------------------
// Computer Science helpers
// ---------------------------------------------------------------------------

function classifyCS(chapterName: string): string {
  const lower = chapterName.toLowerCase()
  if (lower.includes('sql') || lower.includes('database')) return 'sql'
  if (lower.includes('network')) return 'networking'
  return 'python'
}

// ---------------------------------------------------------------------------
// English helpers
// ---------------------------------------------------------------------------

const POETRY_CHAPTERS = [
  'my mother at sixty-six',
  'keeping quiet',
  'a thing of beauty',
  'a roadside stand',
  "aunt jennifer's tigers",
  'aunt jennifer\'s tigers',
]

function classifyEnglish(chapterName: string): string {
  const lower = chapterName.toLowerCase()
  if (POETRY_CHAPTERS.some(p => lower.includes(p))) return 'poetry'
  return 'prose'
}

// ---------------------------------------------------------------------------
// Subject Profiles
// ---------------------------------------------------------------------------

export const SUBJECT_PROFILES: SubjectConfig[] = [
  // ── PHYSICS ──────────────────────────────────────────────────────────
  {
    slug: 'physics',
    name: 'Physics',
    workflow: [
      'Lecture Pending',
      'NCERT Complete',
      'WINR Complete',
      'HC Verma / Module Complete',
      'PYQ Complete',
      'Formula Sheet',
      'Revision 1 Done',
      'Mock Test Complete',
      'Mistake Analysis',
      'Done',
    ],
    resources: [
      'School Notes', 'Science & Fun', 'WINR', 'H.C. Verma',
      'NCERT', 'Board PYQs', 'JEE PYQs', 'Formula Sheet', 'Sample Papers',
    ],
  },

  // ── CHEMISTRY ────────────────────────────────────────────────────────
  {
    slug: 'chemistry',
    name: 'Chemistry',
    // Default (physical chemistry) workflow
    workflow: [
      'Lecture Pending',
      'NCERT Complete',
      'WINR Complete',
      'Numericals',
      'PYQ Complete',
      'Formula Sheet',
      'Revision 1 Done',
      'Mock Test Complete',
      'Done',
    ],
    resources: [
      'School Notes', 'Science & Fun', 'NCERT', 'WINR',
      'Board PYQs', 'JEE PYQs', 'Formula Sheet', 'Sample Papers',
    ],
    chapterCategoryFn: classifyChemistry,
    categoryWorkflows: {
      organic: [
        'Lecture Pending',
        'NCERT Complete',
        'MS Chauhan',
        'Reaction Sheet',
        'Named Reactions',
        'PYQ Complete',
        'Revision 1 Done',
        'Mock Test Complete',
        'Done',
      ],
      inorganic: [
        'Lecture Pending',
        'NCERT Complete',
        'Highlight NCERT',
        'Memorisation',
        'PYQ Complete',
        'Revision 1 Done',
        'Done',
      ],
      // physical uses the default workflow above
    },
    categoryResources: {
      organic: [
        'School Notes', 'NCERT', 'MS Chauhan',
        'Board PYQs', 'JEE PYQs', 'Sample Papers',
      ],
      inorganic: [
        'School Notes', 'NCERT', 'Board PYQs', 'JEE PYQs',
      ],
    },
  },

  // ── MATHEMATICS ──────────────────────────────────────────────────────
  {
    slug: 'mathematics',
    name: 'Mathematics',
    workflow: [
      'Lecture Pending',
      'Illustrations',
      'Examples',
      'WINR Complete',
      'Black Book',
      'PYQ Complete',
      'Revision 1 Done',
      'Mistakes',
      'Mock Test Complete',
      'Done',
    ],
    resources: [
      'School Notes', 'WINR', 'Black Book',
      'Board PYQs', 'JEE PYQs', 'Formula Sheet', 'Sample Papers',
    ],
  },

  // ── COMPUTER SCIENCE ─────────────────────────────────────────────────
  {
    slug: 'computer-science',
    name: 'Computer Science',
    workflow: [
      'Lecture Pending',
      'Read Notes',
      'Code Along',
      'Practice Programs',
      'Solve School Questions',
      'Coding Practice',
      'Revision 1 Done',
      'Done',
    ],
    resources: [
      'School Notes', 'Python Docs', 'Practice Programs',
      'School Questions', 'Previous Practicals', 'Projects', 'Reference PDFs',
    ],
    chapterCategoryFn: classifyCS,
    categoryWorkflows: {
      sql: [
        'Lecture Pending',
        'Read Notes',
        'Code Along',
        'Database Exercises',
        'Solve School Questions',
        'Revision 1 Done',
        'Done',
      ],
      networking: [
        'Lecture Pending',
        'Read Notes',
        'Diagrams & Notes',
        'Packet Tracer Labs',
        'Solve School Questions',
        'Revision 1 Done',
        'Done',
      ],
      // python uses the default workflow above
    },
    categoryResources: {
      sql: [
        'School Notes', 'SQL Reference', 'Practice Programs',
        'School Questions', 'Previous Practicals',
      ],
      networking: [
        'School Notes', 'Reference PDFs', 'School Questions',
      ],
    },
  },

  // ── ENGLISH ──────────────────────────────────────────────────────────
  {
    slug: 'english',
    name: 'English',
    workflow: [
      'Read Chapter',
      'Summary',
      'Character Analysis',
      'Important Questions',
      'Grammar',
      'Writing Practice',
      'Revision 1 Done',
      'Done',
    ],
    resources: [
      'NCERT Book', 'Workbook', 'Grammar Notes',
      'Previous Papers', 'Vocabulary', 'Reference Book',
    ],
    chapterCategoryFn: classifyEnglish,
    categoryWorkflows: {
      poetry: [
        'Read Poem',
        'Summary',
        'Theme',
        'Poetic Devices',
        'Line-by-line Meaning',
        'Important Questions',
        'Writing Practice',
        'Revision 1 Done',
        'Done',
      ],
    },
    categoryResources: {
      poetry: [
        'NCERT Book', 'Poetry Notes', 'Previous Papers',
        'Vocabulary', 'Reference Book',
      ],
    },
  },
]

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

const profileMap = new Map<string, SubjectConfig>(
  SUBJECT_PROFILES.map(p => [p.slug, p])
)

/** Fallback config used for unknown subjects */
const FALLBACK_CONFIG: SubjectConfig = SUBJECT_PROFILES[0] // Physics

/**
 * Get the SubjectConfig for a given subject slug.
 * Returns the Physics profile as a safe fallback for unknown slugs.
 */
export function getSubjectConfig(slug: string | undefined | null): SubjectConfig {
  if (!slug) return FALLBACK_CONFIG
  return profileMap.get(slug) ?? FALLBACK_CONFIG
}

/**
 * Resolve the exact workflow stages for a specific chapter,
 * taking into account the subject's category overrides.
 */
export function getWorkflowForChapter(
  config: SubjectConfig,
  chapterName: string
): string[] {
  if (!config.chapterCategoryFn || !config.categoryWorkflows) {
    return config.workflow
  }
  const category = config.chapterCategoryFn(chapterName)
  return config.categoryWorkflows[category] ?? config.workflow
}

/**
 * Resolve the exact resource list for a specific chapter,
 * taking into account the subject's category overrides.
 */
export function getResourcesForChapter(
  config: SubjectConfig,
  chapterName: string
): string[] {
  if (!config.chapterCategoryFn || !config.categoryResources) {
    return config.resources
  }
  const category = config.chapterCategoryFn(chapterName)
  return config.categoryResources[category] ?? config.resources
}
