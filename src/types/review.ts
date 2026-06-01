export interface ReviewUserSnippet {
  username: string;
  displayName: string;
  avatarUrl: string;
}

export interface ProfileReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  reviewer: ReviewUserSnippet;
  profile?: ReviewUserSnippet;
}

export interface ReviewSummary {
  averageRating: number;
  count: number;
}

export interface ProfileReviewsResponse {
  summary: ReviewSummary;
  reviews: ProfileReview[];
  nextCursor: string | null;
  myReview: ProfileReview | null;
}
