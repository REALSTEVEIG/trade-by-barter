-- Performance Optimization Indexes for TradeByBarter Nigeria
-- Optimized for Nigerian marketplace usage patterns

-- Users table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_location ON users(location);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_verified_reputation ON users(is_verified, reputation_score DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Listings table indexes - Critical for Nigerian marketplace search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_status_created ON listings(status, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_owner_status ON listings(owner_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_category_status ON listings(category_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_location_status ON listings(location, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_price_range ON listings(estimated_value, status) WHERE status = 'active';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_condition_status ON listings(condition, status);

-- Full-text search index for Nigerian products
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_search ON listings USING gin((
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '), '')), 'C')
)) WHERE status = 'active';

-- Nigerian location-based search optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_location_text ON listings USING gin(to_tsvector('english', location)) WHERE status = 'active';

-- Barter offers table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_offers_listing_status ON barter_offers(listing_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_offers_offerer_status ON barter_offers(offerer_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_offers_created_at ON barter_offers(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_offers_expires_at ON barter_offers(expires_at) WHERE status = 'pending';

-- Transactions table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_offer_id ON transactions(offer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_status_created ON transactions(status, created_at DESC);

-- Performance views for Nigerian market analytics
CREATE OR REPLACE VIEW v_active_listings AS
SELECT 
  l.*,
  u.full_name as owner_name,
  u.location as owner_location,
  u.reputation_score,
  u.is_verified,
  (SELECT COUNT(*) FROM barter_offers bo WHERE bo.listing_id = l.id) as offer_count,
  (SELECT COUNT(*) FROM user_favorites uf WHERE uf.listing_id = l.id) as favorite_count
FROM listings l
JOIN users u ON l.owner_id = u.id
WHERE l.status = 'active' AND l.expires_at > NOW();

-- Nigerian state-based statistics view
CREATE OR REPLACE VIEW v_location_stats AS
SELECT 
  location,
  COUNT(*) as total_listings,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_listings,
  AVG(estimated_value) as avg_value,
  COUNT(DISTINCT owner_id) as unique_sellers
FROM listings
GROUP BY location
ORDER BY active_listings DESC;

-- Popular categories view for Nigerian market
CREATE OR REPLACE VIEW v_category_stats AS
SELECT 
  category_id,
  COUNT(*) as total_listings,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_listings,
  AVG(estimated_value) as avg_value,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as recent_listings
FROM listings
GROUP BY category_id
ORDER BY active_listings DESC;

-- User performance metrics view
CREATE OR REPLACE VIEW v_user_metrics AS
SELECT 
  u.id,
  u.full_name,
  u.location,
  u.reputation_score,
  COUNT(DISTINCT l.id) as total_listings,
  COUNT(DISTINCT CASE WHEN l.status = 'active' THEN l.id END) as active_listings,
  COUNT(DISTINCT bo.id) as offers_made,
  COUNT(DISTINCT bo2.id) as offers_received,
  COUNT(DISTINCT t.id) as completed_transactions,
  AVG(CASE WHEN l.status = 'traded' THEN l.estimated_value END) as avg_trade_value
FROM users u
LEFT JOIN listings l ON u.id = l.owner_id
LEFT JOIN barter_offers bo ON u.id = bo.offerer_id
LEFT JOIN barter_offers bo2 ON l.id = bo2.listing_id
LEFT JOIN transactions t ON (bo.id = t.offer_id OR bo2.id = t.offer_id) AND t.status = 'completed'
GROUP BY u.id, u.full_name, u.location, u.reputation_score;

-- Cleanup old data function for performance
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  -- Archive completed transactions older than 1 year
  UPDATE transactions 
  SET status = 'archived' 
  WHERE status = 'completed' 
    AND completed_at < NOW() - INTERVAL '1 year';
  
  -- Delete expired offers older than 30 days
  DELETE FROM barter_offers 
  WHERE status = 'expired' 
    AND expires_at < NOW() - INTERVAL '30 days';
  
  -- Archive old expired listings
  UPDATE listings 
  SET status = 'archived' 
  WHERE status = 'expired' 
    AND expires_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (run this manually or via cron)
-- SELECT cleanup_old_data();

-- Partitioning for large tables (optional for high scale)
-- CREATE TABLE listings_2024 PARTITION OF listings 
-- FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Nigerian-specific search function
CREATE OR REPLACE FUNCTION search_listings_nigeria(
  search_query text DEFAULT '',
  location_filter text DEFAULT '',
  category_filter text DEFAULT '',
  min_price integer DEFAULT 0,
  max_price integer DEFAULT 50000000,
  condition_filter text DEFAULT '',
  page_num integer DEFAULT 1,
  page_size integer DEFAULT 20
)
RETURNS TABLE (
  id text,
  title text,
  description text,
  estimated_value integer,
  location text,
  condition text,
  owner_name text,
  owner_reputation integer,
  created_at timestamp,
  similarity_score real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.title,
    l.description,
    l.estimated_value,
    l.location,
    l.condition,
    u.full_name as owner_name,
    u.reputation_score as owner_reputation,
    l.created_at,
    CASE 
      WHEN search_query = '' THEN 1.0
      ELSE ts_rank(
        setweight(to_tsvector('english', coalesce(l.title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(l.description, '')), 'B'),
        plainto_tsquery('english', search_query)
      )
    END as similarity_score
  FROM listings l
  JOIN users u ON l.owner_id = u.id
  WHERE l.status = 'active'
    AND l.expires_at > NOW()
    AND (search_query = '' OR (
      setweight(to_tsvector('english', coalesce(l.title, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(l.description, '')), 'B')
    ) @@ plainto_tsquery('english', search_query))
    AND (location_filter = '' OR l.location ILIKE '%' || location_filter || '%')
    AND (category_filter = '' OR l.category_id = category_filter)
    AND l.estimated_value >= min_price
    AND l.estimated_value <= max_price
    AND (condition_filter = '' OR l.condition = condition_filter)
  ORDER BY 
    similarity_score DESC,
    u.reputation_score DESC,
    l.created_at DESC
  LIMIT page_size
  OFFSET (page_num - 1) * page_size;
END;
$$ LANGUAGE plpgsql;

-- Nigerian location distance function (simplified)
CREATE OR REPLACE FUNCTION calculate_location_priority(
  user_location text,
  listing_location text
) RETURNS integer AS $$
BEGIN
  -- Same state = highest priority
  IF user_location = listing_location THEN
    RETURN 100;
  END IF;
  
  -- Major city bonus
  IF listing_location IN ('Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan') THEN
    RETURN 75;
  END IF;
  
  -- Regional proximity (simplified)
  IF (user_location IN ('Lagos', 'Ogun', 'Oyo', 'Osun') AND 
      listing_location IN ('Lagos', 'Ogun', 'Oyo', 'Osun')) OR
     (user_location IN ('Abuja', 'Niger', 'Kogi', 'Nasarawa') AND 
      listing_location IN ('Abuja', 'Niger', 'Kogi', 'Nasarawa')) THEN
    RETURN 50;
  END IF;
  
  -- Default priority
  RETURN 25;
END;
$$ LANGUAGE plpgsql;

-- Database statistics collection
CREATE OR REPLACE FUNCTION collect_nigeria_stats()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM users),
    'verified_users', (SELECT COUNT(*) FROM users WHERE is_verified = true),
    'active_listings', (SELECT COUNT(*) FROM listings WHERE status = 'active'),
    'total_trades', (SELECT COUNT(*) FROM transactions WHERE status = 'completed'),
    'top_locations', (
      SELECT json_agg(json_build_object('location', location, 'count', cnt))
      FROM (
        SELECT location, COUNT(*) as cnt 
        FROM listings 
        WHERE status = 'active' 
        GROUP BY location 
        ORDER BY cnt DESC 
        LIMIT 10
      ) top_locs
    ),
    'avg_trade_value', (
      SELECT AVG(estimated_value) 
      FROM listings l 
      JOIN transactions t ON l.id = (
        SELECT listing_id FROM barter_offers WHERE id = t.offer_id
      )
      WHERE t.status = 'completed'
    ),
    'collection_time', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Performance monitoring
CREATE TABLE IF NOT EXISTS performance_logs (
  id SERIAL PRIMARY KEY,
  operation_type VARCHAR(50) NOT NULL,
  execution_time_ms INTEGER NOT NULL,
  query_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_performance_logs_operation_time 
ON performance_logs(operation_type, created_at DESC);

-- Nigerian business hours check
CREATE OR REPLACE FUNCTION is_nigerian_business_hours()
RETURNS boolean AS $$
BEGIN
  -- Nigeria is UTC+1, business hours 9 AM - 6 PM WAT
  RETURN EXTRACT(hour FROM NOW() AT TIME ZONE 'WAT') BETWEEN 9 AND 18
    AND EXTRACT(dow FROM NOW() AT TIME ZONE 'WAT') BETWEEN 1 AND 5;
END;
$$ LANGUAGE plpgsql;