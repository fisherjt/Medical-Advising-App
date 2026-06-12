export type HolisticRating =
  | "Outstanding Applicant"
  | "Highly Qualified"
  | "Developing Candidate"
  | "Uninitiated / Weak Plan";

export interface StudentInput {
  gpa: number;
  scienceGpa: number;
  shadowing: number;
  clinical: number;
  service: number;
  leadership: number;
  research?: number;
}

export interface HolisticResult {
  score: number;
  rating: HolisticRating;
}

export function runHolisticScoringEngine(student: StudentInput): HolisticResult {
  let score = 0;

  if (student.gpa >= 3.8) score += 20;
  else if (student.gpa >= 3.5) score += 15;
  else if (student.gpa >= 3.2) score += 10;
  else score += 5;

  if (student.scienceGpa >= 3.7) score += 20;
  else if (student.scienceGpa >= 3.4) score += 15;
  else if (student.scienceGpa >= 3.0) score += 10;
  else score += 3;

  if (student.shadowing >= 80) score += 15;
  else if (student.shadowing >= 50) score += 12;
  else if (student.shadowing >= 20) score += 8;
  else score += 2;

  if (student.clinical >= 150) score += 15;
  else if (student.clinical >= 80) score += 10;
  else if (student.clinical >= 30) score += 5;
  else score += 1;

  if (student.service >= 120) score += 15;
  else if (student.service >= 60) score += 10;
  else if (student.service >= 20) score += 5;
  else score += 2;

  if (student.leadership >= 40) score += 10;
  else if (student.leadership >= 15) score += 5;
  else score += 1;

  let rating: HolisticRating = "Uninitiated / Weak Plan";
  if (score >= 85) rating = "Outstanding Applicant";
  else if (score >= 65) rating = "Highly Qualified";
  else if (score >= 40) rating = "Developing Candidate";

  return { score, rating };
}

export function getSubCategoryStatus(
  field: "gpa" | "shadowing" | "clinical" | "extracurriculars",
  value: number
): "Outstanding" | "Competitive" | "Action Needed" {
  if (field === "gpa") {
    return value >= 3.6 ? "Outstanding" : value >= 3.2 ? "Competitive" : "Action Needed";
  }
  if (field === "shadowing") {
    return value >= 80 ? "Outstanding" : value >= 45 ? "Competitive" : "Action Needed";
  }
  if (field === "clinical") {
    return value >= 150 ? "Outstanding" : value >= 80 ? "Competitive" : "Action Needed";
  }
  // extracurriculars (service + leadership + research combined)
  return value >= 200 ? "Outstanding" : value >= 80 ? "Competitive" : "Action Needed";
}

export function analyzeEssayHook(text: string): {
  showTellScore: number;
  clicheRisk: number;
  compScore: number;
  hasCliches: boolean;
  foundCliches: string[];
} {
  const words = text.toLowerCase();

  const cliches = [
    "always wanted to be",
    "since i was a kid",
    "since i was little",
    "passion for science",
    "love helping people",
    "fascinated by anatomy",
  ];

  const sensoryWords = [
    "patient", "hand", "smell", "gasp", "beeps", "hum", "smile",
    "tears", "crying", "room", "extraction", "fracture", "stitch",
  ];

  const serviceWords = [
    "mission", "humanitarian", "translate", "service",
    "spanish", "voluntary", "stewardship", "volunteer",
  ];

  let showTellScore = 40;
  let clicheRisk = 20;
  let compScore = 30;

  const foundCliches: string[] = [];
  cliches.forEach((c) => {
    if (words.includes(c)) {
      clicheRisk += 25;
      foundCliches.push(`"${c}"`);
    }
  });

  sensoryWords.forEach((s) => {
    if (words.includes(s)) showTellScore += 12;
  });

  serviceWords.forEach((sk) => {
    if (words.includes(sk)) compScore += 20;
  });

  return {
    showTellScore: Math.min(showTellScore, 100),
    clicheRisk: Math.min(clicheRisk, 100),
    compScore: Math.min(compScore, 100),
    hasCliches: foundCliches.length > 0,
    foundCliches,
  };
}
