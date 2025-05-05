// --- nhanesLogic.js ---

// ============= NHANES Checker Functions (Internal Helpers) =============

function checkForNHANES(text) {
    // Look for mentions of NHANES or National Health and Nutrition Examination Survey
    const nhanesRegex = /\bNHANES\b|\bNational Health and Nutrition Examination Survey\b/i;
    return nhanesRegex.test(text);
  }
  
  function checkNHANESCitation(text) {
    // Look for proper citation mentions
    const citationPatterns = [
      /Centers for Disease Control and Prevention \(CDC\)/i,
      /National Center for Health Statistics \(NCHS\)/i,
      /https?:\/\/www\.cdc\.gov\/nchs\/nhanes/i,
      /NHANES protocol was approved by the NCHS Research Ethics Review Board/i,
      /NHANES data are publicly available/i
    ];
  
    let foundPatterns = [];
  
    citationPatterns.forEach(pattern => {
      if (pattern.test(text)) {
        foundPatterns.push(pattern.toString().replace(/\/i$|^\//g, ''));
      }
    });
  
    // Check for methods/methodology section
    const hasMethodsSection = /\b(?:methods?|methodology)\b/i.test(text);
  
    if (foundPatterns.length >= 2 && hasMethodsSection) {
      return {
        passed: true,
        details: `NHANES properly cited. Found ${foundPatterns.length} citation elements and methods section.`
      };
    } else {
      const issues = [];
      if (foundPatterns.length < 2) {
        issues.push(`Missing proper NHANES citation elements (found only ${foundPatterns.length}, need at least 2)`);
      }
      if (!hasMethodsSection) {
        issues.push("No apparent methods section found");
      }
  
      return {
        passed: false,
        details: `NHANES citation issues: ${issues.join('; ')}`
      };
    }
  }
  
  function checkSurveyDesignAcknowledgment(text) {
    /* ---- Temporarily diabling - come back to this when we know what want to be checked (if this should be included)

    // Look for terms related to complex survey design
    const surveyDesignTerms = [
      /\bcomplex\s+(?:survey|sampling)\s+design\b/i,
      /\bmultistage\s+(?:sampling|design)\b/i,
      /\bstratified\s+(?:sampling|design)\b/i,
      /\bcluster\s+(?:sampling|design)\b/i,
      /\bsampling\s+weights?\b/i,
      /\bweighted\s+analysis\b/i,
      /\bsurvey\s+procedures?\b/i
    ];
  
    let foundTerms = [];
  
    surveyDesignTerms.forEach(term => {
      if (term.test(text)) {
        foundTerms.push(term.toString().replace(/\/i$|^\//g, ''));
      }
    });
  
    if (foundTerms.length >= 2) {
      return {
        passed: true,
        details: `Complex survey design properly acknowledged. Found terms: ${foundTerms.length}.`
      };
    } else {
      return {
        passed: false,
        details: `Missing adequate acknowledgment of complex survey design (found only ${foundTerms.length} terms, need at least 2)`
      };
    }
  */}
  
  function checkWeightingMethodology(text) {
    /* -------- Temporarily diabling - should these be seperate checks? If to be included -----------

    // Look for weighting methodology mentions
    const weightingTerms = [
      /\bsampling\s+weights?\b/i,
      /\bsurvey\s+weights?\b/i,
      /\bweighted\s+(?:analysis|results|data)\b/i,
      /\bweights\s+were\s+applied\b/i,
      /\baccounting\s+for\s+(?:the\s+)?complex\s+(?:survey|sampling)\s+design\b/i,
      /\bSURVEYMEANS?\b/i,
      /\bSURVEYREG\b/i,
      /\bSURVEYLOGISTIC\b/i,
      /\bsvyset\b/i,
      /\bsvy\b/i,
      /\bsurveymeans\b/i
    ];
  
    let foundTerms = [];
  
    weightingTerms.forEach(term => {
      if (term.test(text)) {
        foundTerms.push(term.toString().replace(/\/i$|^\//g, ''));
      }
    );
  
    // Check for statistical software mentions
    const softwareTerms = [
      /\bR\s+(?:software|package|version)?\b/i,
      /\bSAS\b/i,
      /\bSTATA\b/i,
      /\bSPSS\b/i,
      /\bSUDAAN\b/i
    ];
  
    let foundSoftware = [];
  
    softwareTerms.forEach(term => {
      if (term.test(text)) {
        foundSoftware.push(term.toString().replace(/\/i$|^\//g, ''));
      }
    });
  
    const hasSoftware = foundSoftware.length > 0;
  
    if (foundTerms.length >= 2 && hasSoftware) {
      return {
        passed: true,
        details: `Proper weighting methodology mentioned. Found ${foundTerms.length} weighting terms and statistical software (${foundSoftware.join(', ')}).`
      };
    } else {
      const issues = [];
      if (foundTerms.length < 2) {
        issues.push(`Insufficient mention of weighting methodology (found only ${foundTerms.length}, need at least 2)`);
      }
      if (!hasSoftware) {
        issues.push("No statistical software mentioned");
      }
  
      return {
        passed: false,
        details: `Weighting methodology issues: ${issues.join('; ')}`
      };
    }
  */}
  
  function checkNHANESDateRange(text) {
      // Regex to find potential year ranges, possibly associated with NHANES
      const cycleRegex = /(?:NHANES|National Health and Nutrition Examination Survey)?\s*(?:data)?\s*(?:from)?\s*(?:the)?\s*(?:years?)?\s*(?:(?:19|20)\d{2})(?:\s*[-–—]\s*(?:(?:19|20)\d{2}))?|(?:(?:19|20)\d{2})(?:\s*[-–—]\s*(?:(?:19|20)\d{2}))?\s*(?:NHANES|National Health and Nutrition Examination Survey)/gi;
  
      let matches = text.match(cycleRegex) || [];
      let foundValidRange = false;
      let foundInvalidRange = false;
      let validRangeDetails = [];
      let invalidRangeDetails = [];
  
      if (matches.length === 0) {
          // Broader search for any YYYY-YYYY pattern if specific NHANES context is missed
          const genericRangeRegex = /(?:19|20)\d{2}\s*[-–—]\s*(?:19|20)\d{2}/g;
          matches = text.match(genericRangeRegex) || [];
      }
  
      // If still no matches, we can't perform the check effectively
      if (matches.length === 0) {
          return {
              passed: true, // Pass leniently if no range is mentioned
              details: "No specific NHANES cycle year ranges found to validate."
          };
      }
  
      const yearRegex = /(?:19|20)\d{2}/g;
  
      for (const matchText of matches) {
          const years = (matchText.match(yearRegex) || []).map(Number);
          if (years.length === 2) {
              const [startYear, endYear] = years;
              // Check: Odd start year, Even end year, End year is Start year + 1
              if (startYear % 2 === 1 && endYear % 2 === 0 && endYear === startYear + 1) {
                  foundValidRange = true;
                  validRangeDetails.push(`${startYear}-${endYear}`);
              } else {
                   foundInvalidRange = true;
                   invalidRangeDetails.push(`${startYear}-${endYear} (in "${matchText}")`);
              }
          }
          // Note: This doesn't explicitly handle single years mentioned (e.g., "NHANES 2017")
          // or combined ranges (e.g., "NHANES 2011-2018"). Focus is on 2-year cycles.
      }
  
      // Determine final result based on findings
      if (foundValidRange) {
          return {
              passed: true,
              details: `Valid NHANES cycle date range(s) found: ${[...new Set(validRangeDetails)].join(', ')}.` +
                       (foundInvalidRange ? ` (Also found potentially invalid ranges: ${[...new Set(invalidRangeDetails)].join(', ')})` : '')
          };
      } else if (foundInvalidRange) {
           return {
              passed: false,
              details: `No valid NHANES cycle ranges (OddStart-EvenEnd, End=Start+1) confirmed. Found ranges with issues: ${[...new Set(invalidRangeDetails)].join(', ')}`
          };
      } else {
           // No valid or invalid ranges identified from the patterns searched
           return {
              passed: true, // Pass leniently if no standard format found
              details: "Could not definitively identify standard NHANES cycle year ranges for validation."
          };
      }
  }
  
  
  function checkNHANESCycleRecency(text) {
      // Regex to find potential year ranges or single years, associated with NHANES if possible
      const cycleRegex = /(?:NHANES|National Health and Nutrition Examination Survey)?\s*(?:(?:(?:19|20)\d{2})\s*[-–—]\s*((?:19|20)\d{2})|((?:19|20)\d{2}))/gi;
  
      let latestYear = 0;
      let match;
  
      while ((match = cycleRegex.exec(text)) !== null) {
          // match[1] is the end year of a range, match[2] is a single year
          const endYearInRange = match[1] ? parseInt(match[1], 10) : 0;
          const singleYear = match[2] ? parseInt(match[2], 10) : 0;
  
          const currentMatchYear = Math.max(endYearInRange, singleYear);
          if (currentMatchYear > latestYear) {
              latestYear = currentMatchYear;
          }
      }
  
       // If the specific regex didn't find anything, try a broader search for any 4-digit year
       if (latestYear === 0) {
          const genericYearRegex = /(?:19|20)\d{2}/g;
          const allYears = (text.match(genericYearRegex) || []).map(Number);
          if (allYears.length > 0) {
             latestYear = Math.max(...allYears);
             // console.log("Recency check: Found latest year using generic regex:", latestYear);
          }
       }
  
  
      if (latestYear === 0) {
          return {
              passed: true, // Don't fail solely on not finding a year
              details: "Could not determine the most recent NHANES cycle year used."
          };
      }
  
      const currentYear = new Date().getFullYear();
      // The end year of an NHANES cycle is the second year (even).
      // If we found an odd year, assume it's the start of a cycle ending the next year.
      const cycleEndYear = latestYear % 2 === 0 ? latestYear : latestYear + 1;
  
      const yearDifference = currentYear - cycleEndYear;
  
      if (yearDifference < 10) {
          return {
              passed: true,
              details: `Most recent NHANES data likely ends around ${cycleEndYear}, which is ${yearDifference} years ago (within 10 years).`
          };
      } else {
          return {
              passed: false,
              details: `Most recent NHANES data likely ends around ${cycleEndYear}, which is ${yearDifference} years ago (10 years or more). Data might be outdated.`
          };
      }
  }
  
  function checkTitleTemplate(text) {
    // Extract the title (assuming it's near the beginning, possibly after "Title:")
    const titleRegex = /^(?:Title\s*[:\s]*)?([^\n]+)/i;
    const titleMatch = text.match(titleRegex);
  
    if (!titleMatch || !titleMatch[1]) {
      return {
        passed: true, // Pass if title can't be found reliably
        details: "Could not reliably extract a title to check for templating."
      };
    }
  
    const title = titleMatch[1].trim();
  
    // Patterns indicative of common templates
    // Added more variations and made keywords more specific
    const associationPattern = /\b(association|relationship|correlation|link|association|impact|effect|influence|predictor)\b.*?\b(between|among|of|on|with)\b/i;
    const populationPattern = /\b(among|in|across|within)\b.*?\b(U\.S\.|US|American|population|adults|children|adolescents|participants|individuals|subjects|men|women|patient)\b/i;
    const studyDesignPattern = /\b(cross-sectional|longitudinal|cohort|survey|analysis|study)\b/i;
    const nhanesPattern = /\b(NHANES|National Health and Nutrition Examination Survey)/i;
  
    // Score based on presence of these elements
    let score = 0;
    if (associationPattern.test(title)) score++;
    if (populationPattern.test(title)) score++;
    // Combine study design and NHANES mention as one potential template element
    if (studyDesignPattern.test(title) || nhanesPattern.test(title)) score++;
  
    // Check for generic phrases often found in templates
    const commonPhrases = /\b(data from the|using data from|analysis of|based on the)\b/i.test(title);
    const keywordStuffing = title.toLowerCase().split(/[\s,:-]+/).filter(w => w.length > 2).length > 15; // Arbitrary threshold for too many keywords
  
    // Define failure conditions (Adjust thresholds as needed)
    // Fails if it hits multiple patterns AND uses a common template phrase
    if (score >= 2 && commonPhrases) {
       return {
         passed: false,
         details: `Title "${title}" appears potentially templated (Score: ${score}, Common Phrase: Yes). Contains common association/population/study elements.`
       };
    }
    // Fails if it has a very high score (hits most patterns)
    if (score >= 3) {
       return {
         passed: false,
         details: `Title "${title}" appears strongly templated (Score: ${score}). Matches multiple common patterns.`
       };
    }
    // Fails if it seems stuffed with keywords (suggests less focus)
    if (keywordStuffing) {
         return {
         passed: false,
         details: `Title "${title}" might be overly long or keyword-stuffed.`
       };
    }
  
    return {
      passed: true,
      details: `Title does not appear excessively templated (Score: ${score}, Common Phrase: ${commonPhrases ? 'Yes' : 'No'}).`
    };
  }
  
  function extractManuscriptTopics(text) {
    // Extract title and abstract (more robust extraction looking for keywords)
    const titleMatch = text.match(/^(?:Title\s*[:\s]*)?([^\n]+)/i);
    // Look for abstract possibly followed by keywords or intro/background
    const abstractRegex = /\bAbstract\b([\s\S]*?)(?=\n\s*\b(Keywords|Introduction|Background|Methods)\b|\n{2,})/i;
    const abstractMatch = text.match(abstractRegex);
  
    const title = titleMatch ? titleMatch[1].trim() : "";
    const abstract = abstractMatch ? abstractMatch[1].trim() : "";
  
    // Focus analysis on title and abstract; fallback to first ~500 words
    const analysisText = (title + " " + abstract).trim() || text.substring(0, 3000);
  
    if (!analysisText) return ["General Health/Unknown"]; // Default if no text
  
    // Domain keywords (Expanded and refined)
     const healthDomains = {
      "Cardiovascular": ["heart", "cardiac", "cardiovascular", "blood pressure", "hypertension", "cholesterol", "stroke", "atherosclerosis", "vascular", "lipids", "arrhythmia"],
      "Nutrition/Diet": ["diet", "dietary", "food", "nutrition", "nutrient", "intake", "consumption", "supplement", "eating pattern", "malnutrition", "vitamin", "mineral", "fiber", "calories"],
      "Metabolic/Endocrine": ["diabetes", "insulin", "glucose", "metabolic syndrome", "obesity", "BMI", "body mass index", "thyroid", "endocrine", "adiposity", "waist circumference", "hormone"],
      "Epidemiology/Public Health": ["prevalence", "incidence", "risk factor", "population", "demographic", "public health", "mortality", "morbidity", "surveillance", "trends", "disparities", "socioeconomic"],
      "Mental Health/Neurology": ["depression", "anxiety", "psychiatric", "mental", "psychological", "cognitive", "cognition", "neurologic", "stress", "mood", "suicide"],
      "Respiratory": ["lung", "pulmonary", "respiratory", "asthma", "COPD", "breathing", "sleep apnea", "spirometry"],
      "Oncology": ["cancer", "tumor", "oncology", "malignancy", "carcinoma", "neoplasm"],
      "Pediatrics": ["child", "children", "adolescent", "pediatric", "youth", "infant", "growth", "development"],
      "Geriatrics": ["elderly", "older adults", "aging", "geriatric", "seniors", "frailty"],
      "Renal/Urology": ["kidney", "renal", "nephrology", "chronic kidney disease", "CKD", "urinary", "urology"],
      "Musculoskeletal/Physical Activity": ["bone", "muscle", "physical activity", "exercise", "sedentary", "osteoporosis", "arthritis", "sarcopenia", "fitness"],
      "Environmental Health": ["exposure", "pollutant", "environment", "toxin", "heavy metal", "pesticide", "air quality", "lead", "mercury", "cadmium"],
      "Infectious Disease": ["infection", "virus", "bacteria", "antibody", "vaccine", "hepatitis", "HIV"],
      "Gastroenterology": ["gut", "gastrointestinal", "liver", "hepatic", "digestive"],
      "Allergy/Immunology": ["allergy", "asthma", "immune", "inflammation", "antibody"] // Overlaps possible, refine scoring
    };
  
    const domainScores = {};
    let totalMatches = 0;
  
    for (const [domain, keywords] of Object.entries(healthDomains)) {
      domainScores[domain] = 0;
      keywords.forEach(keyword => {
        // Case-insensitive, whole word match
        const regex = new RegExp(`\\b${keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi'); // Escape special regex chars in keyword
        const matches = (analysisText.match(regex) || []).length;
        if (matches > 0) {
            // Simple count scoring
            domainScores[domain] += matches;
            totalMatches += matches;
        }
      });
    }
  
    // Filter out domains with zero score and sort
    const sortedDomains = Object.entries(domainScores)
      .filter(([, score]) => score > 0)
      .sort((a, b) => b[1] - a[1]);
  
    // Determine top domains - require a minimum score and take top N
    const minScoreThreshold = 2; // Require at least 2 mentions to be considered significant
    const topN = 3;
    const topDomains = sortedDomains
       .filter(([, score]) => score >= minScoreThreshold)
       .slice(0, topN)
       .map(([domain]) => domain);
  
  
    return topDomains.length > 0 ? topDomains : ["General Health/Mixed"]; // Default if no strong domain emerges
  }
  
  
  function checkAuthorRedFlags(text) {
    const topics = extractManuscriptTopics(text); // Use the improved topic extraction
  
    // Robustly find author/affiliation section (look between abstract/intro and references/acks)
    // Adjusted regex to be more flexible with section order
    const authorSectionRegex = /(?:\bAbstract\b[\s\S]*?)(?:\n\s*(?:Authors?|Affiliations?)\b\s*[:\n]?)([\s\S]*?)(?=\n\s*\b(Introduction|Background|Methods|Results|Discussion|Conclusion|References|Acknowledgments)\b|\n{3,})/i;
    let authorSectionMatch = text.match(authorSectionRegex);
    let authorSection = authorSectionMatch ? authorSectionMatch[1].trim() : "";
  
    // Fallback: If no clear section, look broadly for emails and affiliations near the start
    if (!authorSection) {
        const firstPartOfText = text.substring(0, 3000); // Look in first few K chars
        const emailRegexGlobal = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
        const affiliationRegexGlobal = /\b(?:Department|Dept|Division|School|Faculty|Center|Institute|Hospital|University|College)\b/gi;
         if (emailRegexGlobal.test(firstPartOfText) || affiliationRegexGlobal.test(firstPartOfText)) {
              // Consider the first ~1000 characters as potential author info section
              authorSection = firstPartOfText.substring(0, 1000);
              // console.log("Author Red Flags: Using fallback author section detection.");
         } else {
              return {
                  passed: true, // Cannot perform check if no author info found
                  details: "Could not reliably extract author/affiliation information."
              };
          }
    }
  
  
    // --- Flag 1: Non-Institutional Emails ---
    const emailRegex = /\b[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/g;
    const emails = [...authorSection.matchAll(emailRegex)];
    const nonInstitutionalDomains = ['gmail\.com', 'yahoo\.com', 'hotmail\.com', 'outlook\.com', 'aol\.com', 'icloud\.com', 'protonmail\.com', 'qq\.com', '163\.com', 'mail\.com', 'yandex\.com']; // Expanded list
    const nonInstRegex = new RegExp(`@(${nonInstitutionalDomains.join('|')})$`, 'i');
    const nonInstitutionalEmails = emails.filter(match => nonInstRegex.test(match[0]));
  
    // Flag if > 50% are non-institutional AND there's at least one such email.
    let hasNonInstitutionalEmails = false;
    let emailFlagDetails = '';
    if (emails.length > 0) {
        hasNonInstitutionalEmails = (nonInstitutionalEmails.length / emails.length > 0.5);
        if (hasNonInstitutionalEmails) {
           emailFlagDetails = `Majority (${nonInstitutionalEmails.length}/${emails.length}) non-institutional emails; `;
        }
    }
  
  
    // --- Flag 2: Mismatched Departments/Affiliations ---
    // Extract potential department/institution names (broader search)
    // Includes common terms found in affiliations
    const affiliationRegex = /\b(?:Department|Dept|Division|School|Faculty|Center|Institute|Hospital|University|College|Laboratory|Program|Unit|Clinic)\s+(?:of\s+)?([A-Za-z\s,&'-]+)/gi;
    const affiliations = [...authorSection.matchAll(affiliationRegex)].map(match => match[1].replace(/[\d,.;]+$/, '').trim().toLowerCase()); // Clean trailing chars
  
    // Relevance mapping (Simplified, focused on keywords)
    const relevanceMappings = {
      "Cardiovascular": ["cardiology", "cardiovascular", "vascular", "heart", "preventive medicine", "internal medicine"],
      "Nutrition/Diet": ["nutrition", "dietetics", "food science", "public health", "preventive medicine", "metabolism"],
      "Metabolic/Endocrine": ["endocrinology", "metabolic", "diabetes", "obesity", "medicine", "internal medicine"],
      "Epidemiology/Public Health": ["epidemiology", "public health", "biostatistics", "community health", "preventive medicine", "statistics", "population health", "global health"],
      "Mental Health/Neurology": ["psychiatry", "psychology", "neurology", "behavioral", "neuroscience", "mental health"],
      "Respiratory": ["pulmonary", "respiratory", "medicine", "internal medicine", "sleep"],
      "Oncology": ["oncology", "cancer", "medicine"],
      "Pediatrics": ["pediatrics", "child health", "adolescent medicine"],
      "Geriatrics": ["geriatrics", "gerontology", "aging"],
      "Renal/Urology": ["nephrology", "renal", "kidney", "urology"],
      "Musculoskeletal/Physical Activity": ["kinesiology", "exercise science", "sports medicine", "orthopedics", "physical therapy", "rehabilitation", "bone"],
      "Environmental Health": ["environmental health", "toxicology", "public health", "occupational health", "exposure science"],
      "Infectious Disease": ["infectious disease", "virology", "microbiology", "immunology"],
      "Gastroenterology": ["gastroenterology", "hepatology", "digestive disease"],
      "Allergy/Immunology": ["allergy", "immunology", "inflammation"],
      "General Health/Mixed": ["medicine", "health science", "public health", "biology", "biostatistics", "statistics", "internal medicine", "family medicine", "preventive medicine", "nursing", "pharmacy"] // Broadly relevant
    };
  
    let relevantAffiliationsCount = 0;
    const uniqueAffiliations = [...new Set(affiliations)].filter(affil => affil.length > 2); // Check unique, non-trivial affiliations
  
    uniqueAffiliations.forEach(affil => {
      let isRelevant = false;
      // Check against identified topics
      for (const topic of topics) {
        const relevantTerms = relevanceMappings[topic] || relevanceMappings["General Health/Mixed"];
        if (relevantTerms.some(term => affil.includes(term))) {
          isRelevant = true;
          break;
        }
      }
      // Check against general health terms if not already relevant
      if (!isRelevant) {
          const generalTerms = relevanceMappings["General Health/Mixed"];
           if (generalTerms.some(term => affil.includes(term))) {
              isRelevant = true;
           }
      }
  
      if (isRelevant) {
        relevantAffiliationsCount++;
      } else {
        // console.log(`Affiliation considered non-relevant to topics [${topics.join(', ')}]: ${affil}`);
      }
    });
  
    // Flag if < 50% affiliations seem relevant AND there are affiliations listed.
    let hasMismatchedAffiliations = false;
    let mismatchFlagDetails = '';
    if (uniqueAffiliations.length > 0) {
         hasMismatchedAffiliations = (relevantAffiliationsCount / uniqueAffiliations.length) < 0.5;
         if (hasMismatchedAffiliations) {
              mismatchFlagDetails = `Affiliations (${relevantAffiliationsCount}/${uniqueAffiliations.length} relevant) may not align well with topics (${topics.join(', ')}); `;
         }
    }
  
  
    // --- Flag 3: Claims of Data Collection ---
    // Look for verbs suggesting *they* collected the data, applied specifically to NHANES context if possible
    const collectionContextRegex = /\b(?:we|authors?)\s+(?:collected|gathered|obtained|acquired|assembled|recruited)\s+(?:(?:the|these|our)\s+)?(?:participants|subjects|(?:NHANES\s+)?data)\b/i;
    const claimsDataCollection = collectionContextRegex.test(text); // Check entire text
    const collectionFlagDetails = claimsDataCollection ? 'Potentially claims to have collected the NHANES data/participants; ' : '';
  
  
    // --- Combine Flags ---
    // Increase sensitivity: flag if *any* of these specific issues are present.
    const redFlagsFound = [hasNonInstitutionalEmails, hasMismatchedAffiliations, claimsDataCollection].filter(Boolean);
    const redFlagCount = redFlagsFound.length;
  
    if (redFlagCount >= 1) { // Fail on 1 or more strong flags
      let details = `Found ${redFlagCount} potential author/affiliation red flag(s): ${emailFlagDetails}${mismatchFlagDetails}${collectionFlagDetails}`;
      return {
        passed: false,
        details: details.trim()
      };
    }
  
    return {
      passed: true,
      details: `Author information appears plausible (${redFlagCount} red flags detected). Topics: ${topics.join(', ')}.`
    };
  }
  
  
  
  // ============= Main Orchestration Function =============
  

  export function checkNHANESManuscript(text, title = 'Untitled Manuscript') {
    console.log(`Checking manuscript: ${title}`);
  
    // Check 1: Does it mention NHANES?
    const hasNHANES = checkForNHANES(text);
  
    if (!hasNHANES) {
      return {
        isNHANES: false,
        finalResult: "Not NHANES",
        details: ["The manuscript does not appear to use NHANES data."],
        checkResults: [] // Ensure checkResults is always present
      };
    }
  
  
    const results = {
      isNHANES: true,
      checkResults: [],
      details: ["✓ STEP 1: Manuscript mentions NHANES."], // Simplified step 1 message
      finalResult: "",
      failStep: 0 // Track which step caused failure
    };
  
    // Define checks in order
     const checks = [
      { name: "2a. NHANES Citation", func: checkNHANESCitation, step: 2, critical: true },
      { name: "2b. Survey Design Acknowledgment", func: checkSurveyDesignAcknowledgment, step: 2, critical: true },
      { name: "2c. Weighting Methodology", func: checkWeightingMethodology, step: 2, critical: true },
      { name: "3. NHANES Date Range", func: checkNHANESDateRange, step: 3, critical: false }, // Often problematic, make non-critical fail?
      { name: "4. NHANES Cycle Recency", func: checkNHANESCycleRecency, step: 4, critical: false }, // Make non-critical?
      { name: "5. Title Template Check", func: checkTitleTemplate, step: 5, critical: false }, // Subjective, non-critical fail
      { name: "6. Author Red Flags", func: checkAuthorRedFlags, step: 6, critical: false } // Subjective, non-critical fail
    ];
  
    let currentStep = 1;
    let methodologyPassed = true; // Specifically track step 2 passes
  
    for (const check of checks) {
       // Update step summary if moving to a new step number
       if (check.step > currentStep) {
            // Check if Step 2 (Methodology) failed overall before moving on
            if (currentStep === 2 && !methodologyPassed) {
                 results.finalResult = "Fail";
                 results.failStep = 2;
                 results.details.push(`✗ STEP 2: Failed one or more critical methodology checks.`);
                 break; // Stop processing critical methodology failure
            }
            // Log success of the previous step block (if not already failed)
            if (results.finalResult !== "Fail") {
               results.details.push(`✓ STEP ${currentStep}: Check(s) passed.`);
            }
            currentStep = check.step; // Move to the new step number
       }
  
       // Execute the check function
       const checkResult = check.func(text);
       results.checkResults.push({
         checkName: check.name,
         passed: checkResult.passed,
         details: checkResult.details
       });
  
       // Handle failed check
       if (!checkResult.passed) {
            if (check.step === 2) { // Track methodology failures specifically
                 methodologyPassed = false;
            }
            // Decide whether to fail outright based on 'critical' flag
            if (check.critical) {
                 results.finalResult = "Fail";
                 results.failStep = check.step; // Record the step of the critical failure
                 // Add specific failure detail only if it's the *first* critical failure detected
                 if (!results.details.some(d => d.startsWith('✗ STEP'))) {
                     results.details.push(`✗ STEP ${check.step}: Failed critical check "${check.name}".`);
                 }
                 // Don't break immediately for step 2, let all step 2 checks run.
                 // Break for critical failures in later steps.
                 if (check.step > 2) {
                      break;
                 }
            } else {
                 // Log non-critical failure detail, but don't change finalResult yet
                  results.details.push(`⚠️ STEP ${check.step}: Non-critical issue found in check "${check.name}".`);
            }
       }
    } // End of checks loop
  
     // --- Final Evaluation After Loop ---
  
     // Check Step 2 status again after loop finishes (in case a step 2 critical failure was the last thing)
     if (currentStep === 2 && !methodologyPassed && results.finalResult !== "Fail") {
          results.finalResult = "Fail";
          results.failStep = 2;
          results.details.push(`✗ STEP 2: Failed one or more critical methodology checks.`);
     }
  
     // If loop completed and no critical failure occurred, log success for the last step
     if (results.finalResult !== "Fail") {
          results.details.push(`✓ STEP ${currentStep}: Check(s) passed.`);
          // Final result is Pass only if no critical errors occurred
          results.finalResult = "Pass";
          results.details.push("✓ ALL CRITICAL CHECKS PASSED.");
     } else {
          // If it failed, ensure a final message indicates failure cause if possible
          if (results.failStep === 0) results.failStep = currentStep; // Assign last step if failStep wasn't set
           results.details.push(`✗ Manuscript check failed at Step ${results.failStep}.`);
     }
  
    return results;
  }
  