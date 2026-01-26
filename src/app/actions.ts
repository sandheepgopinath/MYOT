"use server";

import {
  reviewDesignForOffensiveContent,
  type ReviewDesignInput,
} from "@/ai/flows/review-design-for-offensive-content";

export async function submitForReview(data: ReviewDesignInput) {
  try {
    const result = await reviewDesignForOffensiveContent(data);
    return { success: true, isSafe: result.isSafe, reason: result.reason };
  } catch (error) {
    console.error("Error in submitForReview:", error);
    const reason =
      error instanceof Error ? error.message : "An unexpected error occurred during review.";
    return { success: false, isSafe: false, reason };
  }
}
