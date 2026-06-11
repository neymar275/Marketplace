-- Create the generated tsvector column for English text
ALTER TABLE "Listing" ADD COLUMN "search_vector" tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B')
) STORED;

-- Create the GIN index for lightning fast lookups
CREATE INDEX "listing_search_idx" ON "Listing" USING GIN ("search_vector");