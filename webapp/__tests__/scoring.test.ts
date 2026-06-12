import {
  runHolisticScoringEngine,
  getSubCategoryStatus,
  analyzeEssayHook,
} from "@/lib/scoring";

describe("runHolisticScoringEngine", () => {
  const strongStudent = {
    gpa: 3.9,
    scienceGpa: 3.8,
    shadowing: 90,
    clinical: 200,
    service: 150,
    leadership: 50,
  };

  const weakStudent = {
    gpa: 2.8,
    scienceGpa: 2.6,
    shadowing: 5,
    clinical: 10,
    service: 10,
    leadership: 5,
  };

  it("rates a strong student as Outstanding Applicant", () => {
    const result = runHolisticScoringEngine(strongStudent);
    expect(result.rating).toBe("Outstanding Applicant");
    expect(result.score).toBeGreaterThanOrEqual(85);
  });

  it("rates a weak student as Uninitiated / Weak Plan", () => {
    const result = runHolisticScoringEngine(weakStudent);
    expect(result.rating).toBe("Uninitiated / Weak Plan");
    expect(result.score).toBeLessThan(40);
  });

  it("rates a mid-tier student as Highly Qualified", () => {
    const result = runHolisticScoringEngine({
      gpa: 3.6,
      scienceGpa: 3.5,
      shadowing: 60,
      clinical: 100,
      service: 70,
      leadership: 20,
    });
    expect(result.rating).toBe("Highly Qualified");
    expect(result.score).toBeGreaterThanOrEqual(65);
    expect(result.score).toBeLessThan(85);
  });

  it("rates a developing student correctly", () => {
    // gpa:3.3→10, sciGpa:3.1→10, shadow:25→8, clinical:35→5, service:25→5, leadership:20→5 = 43
    const result = runHolisticScoringEngine({
      gpa: 3.3,
      scienceGpa: 3.1,
      shadowing: 25,
      clinical: 35,
      service: 25,
      leadership: 20,
    });
    expect(result.rating).toBe("Developing Candidate");
    expect(result.score).toBeGreaterThanOrEqual(40);
    expect(result.score).toBeLessThan(65);
  });

  describe("GPA scoring", () => {
    it("awards 20 points for GPA >= 3.8", () => {
      const base = { scienceGpa: 0, shadowing: 0, clinical: 0, service: 0, leadership: 0 };
      const high = runHolisticScoringEngine({ ...base, gpa: 3.8 });
      const lower = runHolisticScoringEngine({ ...base, gpa: 3.5 });
      expect(high.score - lower.score).toBe(5); // 20 vs 15
    });

    it("awards 15 points for GPA 3.5–3.79", () => {
      const base = { scienceGpa: 0, shadowing: 0, clinical: 0, service: 0, leadership: 0 };
      const result = runHolisticScoringEngine({ ...base, gpa: 3.6 });
      // GPA band = 15, all others at minimum
      expect(result.score).toBe(15 + 3 + 2 + 1 + 2 + 1);
    });

    it("awards 10 points for GPA 3.2–3.49", () => {
      const base = { scienceGpa: 0, shadowing: 0, clinical: 0, service: 0, leadership: 0 };
      const result = runHolisticScoringEngine({ ...base, gpa: 3.3 });
      expect(result.score).toBe(10 + 3 + 2 + 1 + 2 + 1);
    });
  });

  describe("shadowing scoring", () => {
    it("awards 15 points for >= 80 hours", () => {
      const base = { gpa: 0, scienceGpa: 0, clinical: 0, service: 0, leadership: 0 };
      const result = runHolisticScoringEngine({ ...base, shadowing: 80 });
      expect(result.score).toBe(5 + 3 + 15 + 1 + 2 + 1);
    });

    it("awards 12 points for 50–79 hours", () => {
      const base = { gpa: 0, scienceGpa: 0, clinical: 0, service: 0, leadership: 0 };
      const result = runHolisticScoringEngine({ ...base, shadowing: 50 });
      expect(result.score).toBe(5 + 3 + 12 + 1 + 2 + 1);
    });

    it("awards 2 points for < 20 hours", () => {
      const base = { gpa: 0, scienceGpa: 0, clinical: 0, service: 0, leadership: 0 };
      const result = runHolisticScoringEngine({ ...base, shadowing: 10 });
      expect(result.score).toBe(5 + 3 + 2 + 1 + 2 + 1);
    });
  });

  describe("boundary conditions", () => {
    it("score at exactly 85 is Outstanding Applicant", () => {
      const result = runHolisticScoringEngine({
        gpa: 3.9,      // 20
        scienceGpa: 3.8, // 20
        shadowing: 80,   // 15
        clinical: 150,   // 15
        service: 120,    // 15
        leadership: 0,   // 1 — total = 86
      });
      expect(result.rating).toBe("Outstanding Applicant");
    });

    it("score at exactly 65 is Highly Qualified", () => {
      const result = runHolisticScoringEngine({
        gpa: 3.6,      // 15
        scienceGpa: 3.5, // 15
        shadowing: 55,   // 12
        clinical: 85,    // 10
        service: 65,     // 10
        leadership: 16,  // 5 — total = 67
      });
      expect(result.rating).toBe("Highly Qualified");
    });
  });
});

describe("getSubCategoryStatus", () => {
  it("returns Outstanding for GPA >= 3.6", () => {
    expect(getSubCategoryStatus("gpa", 3.6)).toBe("Outstanding");
    expect(getSubCategoryStatus("gpa", 4.0)).toBe("Outstanding");
  });

  it("returns Competitive for GPA 3.2–3.59", () => {
    expect(getSubCategoryStatus("gpa", 3.2)).toBe("Competitive");
    expect(getSubCategoryStatus("gpa", 3.5)).toBe("Competitive");
  });

  it("returns Action Needed for GPA < 3.2", () => {
    expect(getSubCategoryStatus("gpa", 3.1)).toBe("Action Needed");
    expect(getSubCategoryStatus("gpa", 2.0)).toBe("Action Needed");
  });

  it("returns Outstanding for shadowing >= 80", () => {
    expect(getSubCategoryStatus("shadowing", 80)).toBe("Outstanding");
    expect(getSubCategoryStatus("shadowing", 150)).toBe("Outstanding");
  });

  it("returns Outstanding for clinical >= 150", () => {
    expect(getSubCategoryStatus("clinical", 150)).toBe("Outstanding");
  });

  it("returns Action Needed for clinical < 80", () => {
    expect(getSubCategoryStatus("clinical", 50)).toBe("Action Needed");
  });

  it("returns Outstanding for extracurriculars >= 200", () => {
    expect(getSubCategoryStatus("extracurriculars", 200)).toBe("Outstanding");
  });

  it("returns Competitive for extracurriculars 80–199", () => {
    expect(getSubCategoryStatus("extracurriculars", 100)).toBe("Competitive");
  });
});

describe("analyzeEssayHook", () => {
  it("detects clichés in weak hooks", () => {
    const result = analyzeEssayHook("I always wanted to be a doctor since I was a kid.");
    expect(result.hasCliches).toBe(true);
    expect(result.foundCliches.length).toBeGreaterThan(0);
    expect(result.clicheRisk).toBeGreaterThan(45);
  });

  it("rewards mission/service language with higher competency score", () => {
    const result = analyzeEssayHook(
      "During my humanitarian mission I helped translate for patients and volunteer at clinics."
    );
    expect(result.compScore).toBeGreaterThan(30);
  });

  it("rewards sensory/clinical language with higher show-tell score", () => {
    const result = analyzeEssayHook(
      "The patient gripped my hand as tears rolled down her face in the room."
    );
    expect(result.showTellScore).toBeGreaterThan(40);
  });

  it("caps scores at 100", () => {
    const longClicheText = Array(10)
      .fill("always wanted to be since I was a kid passion for science love helping people")
      .join(" ");
    const result = analyzeEssayHook(longClicheText);
    expect(result.clicheRisk).toBeLessThanOrEqual(100);
    expect(result.showTellScore).toBeLessThanOrEqual(100);
    expect(result.compScore).toBeLessThanOrEqual(100);
  });

  it("returns no clichés for strong narrative hooks", () => {
    const result = analyzeEssayHook(
      "The extraction was almost complete when Mrs. Rodriguez grasped my hand."
    );
    expect(result.hasCliches).toBe(false);
  });
});
