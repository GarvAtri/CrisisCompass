-- CrisisCompass Database Schema
-- Optimized for humanitarian crisis storytelling

-- Countries table
CREATE TABLE countries (
    iso3 VARCHAR(3) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    region VARCHAR(50),
    income_level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crisis needs data (HNO - Humanitarian Needs Overview)
CREATE TABLE crisis_needs (
    id SERIAL PRIMARY KEY,
    country_iso3 VARCHAR(3) REFERENCES countries(iso3),
    year INTEGER NOT NULL,
    cluster VARCHAR(10) NOT NULL, -- 'HEA', 'FSC', 'NUT', etc.
    population FLOAT,
    in_need FLOAT,
    targeted FLOAT,
    affected FLOAT,
    reached FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(country_iso3, year, cluster)
);

-- Funding data
CREATE TABLE funding (
    id SERIAL PRIMARY KEY,
    country_iso3 VARCHAR(3) REFERENCES countries(iso3),
    year INTEGER NOT NULL,
    cluster VARCHAR(50) NOT NULL,
    requirements FLOAT,
    funding FLOAT,
    percent_funded FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(country_iso3, year, cluster)
);

-- Donor flows (incoming funding)
CREATE TABLE donor_flows (
    id SERIAL PRIMARY KEY,
    country_iso3 VARCHAR(3) REFERENCES countries(iso3),
    source_organization VARCHAR(200),
    destination_cluster VARCHAR(100),
    amount_usd FLOAT,
    year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pooled fund allocations
CREATE TABLE pooled_fund_allocations (
    id SERIAL PRIMARY KEY,
    country_iso3 VARCHAR(3) REFERENCES countries(iso3),
    pooled_fund VARCHAR(100),
    budget FLOAT,
    allocation_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pre-calculated crisis scores (materialized view for performance)
CREATE MATERIALIZED VIEW crisis_scores AS
SELECT 
    cn.country_iso3,
    c.name as country_name,
    
    -- Health needs 2024/2025
    COALESCE(h24.in_need, 0) as health_in_need_24,
    COALESCE(h25.in_need, 0) as health_in_need_25,
    CASE 
        WHEN h24.in_need > 0 THEN 
            ROUND(((COALESCE(h25.in_need, 0) - h24.in_need) / h24.in_need) * 100, 2)
        ELSE NULL 
    END as health_need_change_pct,
    
    -- Food needs
    COALESCE(f24.in_need, 0) as food_in_need_24,
    
    -- Health funding
    COALESCE(fh.requirements, 0) as health_required,
    COALESCE(fh.funding, 0) as health_funded,
    COALESCE(fh.requirements, 0) - COALESCE(fh.funding, 0) as health_gap,
    CASE 
        WHEN fh.requirements > 0 THEN 
            ROUND(COALESCE(fh.funding, 0) / fh.requirements, 4)
        ELSE NULL 
    END as health_coverage,
    
    -- Food funding
    COALESCE(ff.requirements, 0) as food_required,
    COALESCE(ff.funding, 0) as food_funded,
    CASE 
        WHEN ff.requirements > 0 THEN 
            ROUND(COALESCE(ff.funding, 0) / ff.requirements, 4)
        ELSE NULL 
    END as food_coverage,
    
    -- Per-capita metrics
    CASE 
        WHEN h24.in_need > 0 THEN 
            ROUND(COALESCE(fh.funding, 0) / h24.in_need, 2)
        ELSE 0 
    END as health_funding_per_person_in_need,
    
    -- Health vs Food comparison
    CASE 
        WHEN fh.requirements > 0 AND ff.requirements > 0 THEN
            ROUND((COALESCE(ff.funding, 0) / ff.requirements) - 
                  (COALESCE(fh.funding, 0) / fh.requirements), 4)
        ELSE NULL 
    END as health_vs_food_coverage_gap,
    
    -- Total population
    COALESCE(pop.population, 0) as total_pop,
    
    -- Total funding per capita
    CASE 
        WHEN pop.population > 0 THEN 
            ROUND(COALESCE(ft.funding, 0) / pop.population, 2)
        ELSE 0 
    END as total_funding_per_capita,
    
    -- Food-to-Health lag signal
    (COALESCE(f24.in_need, 0) > COALESCE(f25.in_need, 0) AND 
     COALESCE(h25.in_need, 0) > COALESCE(h24.in_need, 0)) as food_to_health_lag,
    
    -- Invisible Crisis Score calculation
    ROUND(
        (COALESCE(h24.in_need, 0) / NULLIF((SELECT MAX(in_need) FROM crisis_needs WHERE year = 2024 AND cluster = 'HEA'), 0)) * 0.35 +
        (1 - COALESCE(fh.funding, 0) / NULLIF(fh.requirements, 0)) * 0.35 +
        (1 - (COALESCE(fh.funding, 0) / NULLIF(h24.in_need, 0)) / NULLIF((SELECT MAX(funding / in_need) FROM crisis_needs cn JOIN funding f ON cn.country_iso3 = f.country_iso3 WHERE cn.year = 2024 AND cn.cluster = 'HEA' AND f.cluster = 'Health'), 0)) * 0.30
    , 4) as invisible_crisis_score,
    
    -- Rank based on invisible crisis score
    RANK() OVER (ORDER BY 
        (COALESCE(h24.in_need, 0) / NULLIF((SELECT MAX(in_need) FROM crisis_needs WHERE year = 2024 AND cluster = 'HEA'), 0)) * 0.35 +
        (1 - COALESCE(fh.funding, 0) / NULLIF(fh.requirements, 0)) * 0.35 +
        (1 - (COALESCE(fh.funding, 0) / NULLIF(h24.in_need, 0)) / NULLIF((SELECT MAX(funding / in_need) FROM crisis_needs cn JOIN funding f ON cn.country_iso3 = f.country_iso3 WHERE cn.year = 2024 AND cn.cluster = 'HEA' AND f.cluster = 'Health'), 0)) * 0.30
        DESC
    ) as crisis_rank

FROM countries c
LEFT JOIN crisis_needs h24 ON c.iso3 = h24.country_iso3 AND h24.year = 2024 AND h24.cluster = 'HEA'
LEFT JOIN crisis_needs h25 ON c.iso3 = h25.country_iso3 AND h25.year = 2025 AND h25.cluster = 'HEA'
LEFT JOIN crisis_needs f24 ON c.iso3 = f24.country_iso3 AND f24.year = 2024 AND f24.cluster = 'FSC'
LEFT JOIN funding fh ON c.iso3 = fh.country_iso3 AND fh.cluster = 'Health'
LEFT JOIN funding ff ON c.iso3 = ff.country_iso3 AND ff.cluster = 'Food Security'
LEFT JOIN funding ft ON c.iso3 = ft.country_iso3 AND ft.cluster = 'All'
LEFT JOIN crisis_needs pop ON c.iso3 = pop.country_iso3 AND pop.year = 2024 AND pop.cluster = 'ALL'
WHERE c.iso3 IS NOT NULL;

-- Funding flows for Sankey diagrams
CREATE MATERIALIZED VIEW funding_flows AS
SELECT 
    df.source_organization as source,
    df.destination_cluster as destination,
    SUM(df.amount_usd) as amount,
    'Health' as sector
FROM donor_flows df
WHERE df.destination_cluster LIKE '%Health%'
GROUP BY df.source_organization, df.destination_cluster

UNION ALL

SELECT 
    df.source_organization as source,
    df.destination_cluster as destination,
    SUM(df.amount_usd) as amount,
    'Food' as sector
FROM donor_flows df
WHERE df.destination_cluster LIKE '%Food%' OR df.destination_cluster LIKE '%Nutrition%'
GROUP BY df.source_organization, df.destination_cluster;

-- Indexes for performance
CREATE INDEX idx_crisis_needs_country_year ON crisis_needs(country_iso3, year);
CREATE INDEX idx_funding_country_year ON funding(country_iso3, year);
CREATE INDEX idx_donor_flows_country ON donor_flows(country_iso3);
CREATE INDEX idx_crisis_scores_rank ON crisis_scores(crisis_rank);

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_crisis_data()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY crisis_scores;
    REFRESH MATERIALIZED VIEW CONCURRENTLY funding_flows;
END;
$$ LANGUAGE plpgsql;

-- Sample data insertion (you would replace this with your actual data)
-- This is just to show the structure
INSERT INTO countries (iso3, name, region, income_level) VALUES
('AFG', 'Afghanistan', 'Asia', 'Low Income'),
('SYR', 'Syria', 'Middle East', 'Lower Middle Income'),
('ETH', 'Ethiopia', 'Africa', 'Low Income'),
('YEM', 'Yemen', 'Middle East', 'Low Income'),
('SSD', 'South Sudan', 'Africa', 'Low Income');

-- Create indexes for faster queries
CREATE INDEX idx_crisis_needs_lookup ON crisis_needs(country_iso3, year, cluster);
CREATE INDEX idx_funding_lookup ON funding(country_iso3, year, cluster);
CREATE INDEX idx_crisis_scores_lookup ON crisis_scores(country_iso3);

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO crisiscompass_user;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO crisiscompass_readonly;
