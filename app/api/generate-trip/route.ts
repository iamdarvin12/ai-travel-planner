import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

// ==========================================
// TYPES
// ==========================================

type Activity = {
  time: string;
  place: string;
  activity: string;
  cost: number;
};

type GeneratedDay = {
  day: number;
  title: string;
  morning: Activity;
  lunch: Activity;
  afternoon: Activity;
  dinner: Activity;
  evening: Activity;
  estimatedTotal: number;
};

type GeneratedResponse = {
  itinerary: GeneratedDay[];
};

// ==========================================
// ACTIVITY SCHEMA
// ==========================================

function activitySchema() {
  return {
    type: Type.OBJECT,

    properties: {
      time: {
        type: Type.STRING,
      },

      place: {
        type: Type.STRING,
      },

      activity: {
        type: Type.STRING,
      },

      cost: {
        type: Type.NUMBER,
      },
    },

    required: [
      "time",
      "place",
      "activity",
      "cost",
    ],
  };
}

// ==========================================
// NORMALIZE ACTIVITY
// ==========================================

function normalizeActivity(
  activity: Activity | undefined
): Activity {
  return {
    time: activity?.time || "Flexible",

    place:
      activity?.place ||
      "Local attraction",

    activity:
      activity?.activity ||
      "Explore the area.",

    cost:
      Number(activity?.cost) || 0,
  };
}

// ==========================================
// WAIT FUNCTION
// ==========================================

function wait(ms: number) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

// ==========================================
// CHECK TEMPORARY GEMINI ERROR
// ==========================================

function isTemporaryError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : String(error);

  return (
    message.includes("503") ||
    message.includes("UNAVAILABLE") ||
    message.includes("high demand") ||
    message.includes(
      "temporarily unavailable"
    )
  );
}

// ==========================================
// POST API
// ==========================================

export async function POST(
  request: Request
) {
  try {
    // ======================================
    // CHECK API KEY
    // ======================================

    const apiKey =
      process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Gemini API key is missing. Check your .env.local file.",
        },
        {
          status: 500,
        }
      );
    }

    // ======================================
    // CREATE GEMINI CLIENT
    // ======================================

    const ai = new GoogleGenAI({
      apiKey,
    });

    // ======================================
    // READ FORM DATA
    // ======================================

    const body =
      await request.json();

    const {
      destination,
      budget,
      days,
      travelers,
      interests,
    } = body;

    // ======================================
    // VALIDATION
    // ======================================

    if (
      !destination ||
      !budget ||
      !days
    ) {
      return NextResponse.json(
        {
          error:
            "Please enter destination, budget and number of days.",
        },
        {
          status: 400,
        }
      );
    }

    const requestedDays =
      Number(days);

    const totalBudget =
      Number(budget);

    // Validate days

    if (
      !Number.isFinite(
        requestedDays
      ) ||
      requestedDays < 1
    ) {
      return NextResponse.json(
        {
          error:
            "Number of days must be at least 1.",
        },
        {
          status: 400,
        }
      );
    }

    // Validate budget

    if (
      !Number.isFinite(
        totalBudget
      ) ||
      totalBudget <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Budget must be greater than RM 0.",
        },
        {
          status: 400,
        }
      );
    }

    // Maximum 14 days

    const safeDays =
      Math.min(
        Math.floor(requestedDays),
        14
      );

    // ======================================
    // TRAVELERS
    // ======================================

    const travelerCount =
      travelers || "1";

    // ======================================
    // INTERESTS
    // ======================================

    const safeInterests: string[] =
      Array.isArray(interests)
        ? interests
        : [];

    const interestText =
      safeInterests.length > 0
        ? safeInterests.join(", ")
        : "general sightseeing";

    // ======================================
    // PROMPT
    // ======================================

    const prompt = `
You are a professional AI travel planner.

Create a realistic, personalized and useful travel itinerary.

TRIP INFORMATION

Destination:
${destination}

Total Budget:
RM ${totalBudget}

Number of Days:
${safeDays}

Number of Travelers:
${travelerCount}

Traveler Interests:
${interestText}


IMPORTANT REQUIREMENTS

1. Create EXACTLY ${safeDays} day(s).

2. Every day must contain:

- Morning
- Lunch
- Afternoon
- Dinner
- Evening

3. Recommend real and recognizable attractions when reasonably confident.

4. Recommend real restaurants, food markets, food streets or popular dining areas when reasonably confident.

5. Keep locations within each day geographically sensible.

Avoid unnecessary travel across the city.

6. Personalize the itinerary according to these interests:

${interestText}

7. Every activity MUST contain a useful place name.

The website creates a Google Maps search link from the place name.

GOOD EXAMPLE:

"place": "Senso-ji Temple"

BAD EXAMPLE:

"place": "Beautiful temple"

8. All estimated costs must be represented in Malaysian Ringgit.

The cost property must contain ONLY a number.

CORRECT:

"cost": 50

WRONG:

"cost": "RM 50"

9. The total travel budget is:

RM ${totalBudget}

Try to keep the itinerary reasonably within this budget.

10. The budget is for:

${travelerCount} traveler(s).

11. Do NOT include flight costs.

12. Do NOT include accommodation costs unless absolutely necessary.

13. Do not invent exact opening hours or exact ticket prices when uncertain.

14. Keep activity descriptions short, clear and useful.

15. Give every day a meaningful title.

Example:

"Historic Tokyo & Asakusa"

16. Use sensible travel times.

Suggested times:

Morning:
9:00 AM

Lunch:
12:30 PM

Afternoon:
2:00 PM

Dinner:
6:30 PM

Evening:
8:00 PM

17. estimatedTotal must contain the estimated total activity cost for that day.

18. Make the itinerary useful for an actual traveler.

Return only the requested structured itinerary.
`;

    // ======================================
    // GEMINI REQUEST
    // WITH AUTOMATIC RETRY
    // ======================================

    let response = null;

    const maxAttempts = 3;

    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt++
    ) {
      try {
        console.log("");
        console.log(
          "================================"
        );

        console.log(
          `Gemini attempt ${attempt}/${maxAttempts}`
        );

        console.log(
          `Destination: ${destination}`
        );

        console.log(
          `Days: ${safeDays}`
        );

        console.log(
          `Budget: RM ${totalBudget}`
        );

        console.log(
          "Model: gemini-3.5-flash-lite"
        );

        console.log(
          "================================"
        );

        // ==================================
        // CALL GEMINI
        // ==================================

        response =
          await ai.models.generateContent({
            model:
              "gemini-3.5-flash-lite",

            contents: prompt,

            config: {
              responseMimeType:
                "application/json",

              responseSchema: {
                type:
                  Type.OBJECT,

                properties: {
                  itinerary: {
                    type:
                      Type.ARRAY,

                    items: {
                      type:
                        Type.OBJECT,

                      properties: {
                        day: {
                          type:
                            Type.INTEGER,
                        },

                        title: {
                          type:
                            Type.STRING,
                        },

                        morning:
                          activitySchema(),

                        lunch:
                          activitySchema(),

                        afternoon:
                          activitySchema(),

                        dinner:
                          activitySchema(),

                        evening:
                          activitySchema(),

                        estimatedTotal: {
                          type:
                            Type.NUMBER,
                        },
                      },

                      required: [
                        "day",
                        "title",
                        "morning",
                        "lunch",
                        "afternoon",
                        "dinner",
                        "evening",
                        "estimatedTotal",
                      ],
                    },
                  },
                },

                required: [
                  "itinerary",
                ],
              },
            },
          });

        // ==================================
        // SUCCESS
        // ==================================

        console.log(
          `Gemini attempt ${attempt} successful!`
        );

        break;
      } catch (error) {
        console.error(
          `Gemini attempt ${attempt} failed.`
        );

        console.error(error);

        // If this is not a temporary
        // 503 error, don't retry.

        if (
          !isTemporaryError(error)
        ) {
          throw error;
        }

        // ==================================
        // LAST ATTEMPT
        // ==================================

        if (
          attempt === maxAttempts
        ) {
          throw new Error(
            "Gemini is currently experiencing high demand. Please wait a moment and try again."
          );
        }

        // ==================================
        // WAIT BEFORE RETRY
        // ==================================

        const delay =
          attempt * 2000;

        console.log(
          `Gemini is busy. Retrying in ${
            delay / 1000
          } seconds...`
        );

        await wait(delay);
      }
    }

    // ======================================
    // CHECK RESPONSE
    // ======================================

    if (!response) {
      throw new Error(
        "Gemini did not return a response."
      );
    }

    // ======================================
    // GET GEMINI TEXT
    // ======================================

    const responseText =
      response.text;

    if (!responseText) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    console.log(
      "Gemini response received."
    );

    // ======================================
    // PARSE JSON
    // ======================================

    let generatedTrip:
      GeneratedResponse;

    try {
      generatedTrip =
        JSON.parse(
          responseText
        ) as GeneratedResponse;
    } catch {
      console.error(
        "Gemini response could not be parsed:"
      );

      console.error(
        responseText
      );

      throw new Error(
        "Gemini returned invalid JSON."
      );
    }

    // ======================================
    // VALIDATE ITINERARY
    // ======================================

    if (
      !generatedTrip ||
      !Array.isArray(
        generatedTrip.itinerary
      )
    ) {
      throw new Error(
        "Gemini did not return a valid itinerary."
      );
    }

    if (
      generatedTrip.itinerary
        .length === 0
    ) {
      throw new Error(
        "Gemini returned an empty itinerary."
      );
    }

    // ======================================
    // NORMALIZE ITINERARY
    // ======================================

    const itinerary =
      generatedTrip.itinerary.map(
        (day, index) => ({
          day:
            Number(day.day) ||
            index + 1,

          title:
            day.title ||
            `Explore ${destination}`,

          morning:
            normalizeActivity(
              day.morning
            ),

          lunch:
            normalizeActivity(
              day.lunch
            ),

          afternoon:
            normalizeActivity(
              day.afternoon
            ),

          dinner:
            normalizeActivity(
              day.dinner
            ),

          evening:
            normalizeActivity(
              day.evening
            ),

          estimatedTotal:
            Number(
              day.estimatedTotal
            ) || 0,
        })
      );

    // ======================================
    // SUCCESS LOG
    // ======================================

    console.log("");
    console.log(
      "================================"
    );

    console.log(
      "AI TRIP GENERATED SUCCESSFULLY"
    );

    console.log(
      `Destination: ${destination}`
    );

    console.log(
      `${itinerary.length} day(s) generated`
    );

    console.log(
      "Powered by Google Gemini"
    );

    console.log(
      "================================"
    );

    console.log("");

    // ======================================
    // RETURN TRIP TO FRONTEND
    // ======================================

    return NextResponse.json({
      success: true,

      ai: true,

      provider:
        "Google Gemini",

      trip: {
        destination,

        budget:
          totalBudget,

        days:
          safeDays,

        travelers:
          travelerCount,

        interests:
          safeInterests,

        itinerary,
      },
    });
  } catch (error) {
    // ======================================
    // ERROR LOG
    // ======================================

    console.error("");
    console.error(
      "================================"
    );

    console.error(
      "TRIP GENERATION FAILED"
    );

    console.error(
      "================================"
    );

    console.error(error);

    console.error(
      "================================"
    );

    console.error("");

    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error);

    // ======================================
    // MODEL NOT AVAILABLE
    // ======================================

    if (
      errorMessage.includes("404") ||
      errorMessage.includes(
        "NOT_FOUND"
      )
    ) {
      return NextResponse.json(
        {
          error:
            `Gemini model error: ${errorMessage}`,
        },
        {
          status: 500,
        }
      );
    }

    // ======================================
    // HIGH DEMAND / 503
    // ======================================

    if (
      errorMessage.includes("503") ||
      errorMessage.includes(
        "UNAVAILABLE"
      ) ||
      errorMessage.includes(
        "high demand"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Gemini is currently busy due to high demand. Please wait a moment and try again.",
        },
        {
          status: 503,
        }
      );
    }

    // ======================================
    // FREE QUOTA / 429
    // ======================================

    if (
      errorMessage.includes("429") ||
      errorMessage.includes(
        "RESOURCE_EXHAUSTED"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Gemini's free usage limit has been reached. Please wait and try again later.",
        },
        {
          status: 429,
        }
      );
    }

    // ======================================
    // API KEY
    // ======================================

    if (
      errorMessage.includes(
        "API_KEY"
      ) ||
      errorMessage.includes(
        "API key"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "There is a problem with your Gemini API key. Check GEMINI_API_KEY in .env.local.",
        },
        {
          status: 401,
        }
      );
    }

    // ======================================
    // PERMISSION
    // ======================================

    if (
      errorMessage.includes("403") ||
      errorMessage.includes(
        "PERMISSION_DENIED"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Gemini denied access. Check your Google AI Studio API key permissions.",
        },
        {
          status: 403,
        }
      );
    }

    // ======================================
    // UNKNOWN ERROR
    // ======================================

    return NextResponse.json(
      {
        error:
          `Unable to generate your trip: ${errorMessage}`,
      },
      {
        status: 500,
      }
    );
  }
}