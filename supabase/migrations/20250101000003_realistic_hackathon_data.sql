-- Enhanced Seed Data with Real GitHub Profiles
-- This script populates the database with realistic hackathon simulation data

-- Clear existing data
DELETE FROM hacker_stats;
DELETE FROM hacker_profiles;
DELETE FROM team_composition;
DELETE FROM team_members;
DELETE FROM teams;
DELETE FROM market_odds;
DELETE FROM predictions;
DELETE FROM progress_updates;
DELETE FROM commentary_feed;

-- Insert realistic teams with calculated stats
INSERT INTO teams (id, name, tagline, logo_url, category, tech_stack, github_repo, devpost_url, status, team_size, current_progress, momentum_score) VALUES
('team_1', 'NeuralForge', 'Building the future of AI-powered design', 'https://api.dicebear.com/7.x/shapes/svg?seed=NeuralForge', ARRAY['AI', 'Design'], ARRAY['Python', 'TensorFlow', 'React', 'TypeScript'], 'https://github.com/hackteam/neuralforge', 'https://devpost.com/software/neuralforge', 'active', 4, 78, 82.5),
('team_2', 'BytePay', 'Instant cross-border payments', 'https://api.dicebear.com/7.x/shapes/svg?seed=BytePay', ARRAY['FinTech', 'Blockchain'], ARRAY['JavaScript', 'Node.js', 'Solidity', 'Web3'], 'https://github.com/hackteam/bytepay', 'https://devpost.com/software/bytepay', 'active', 3, 65, 75.2),
('team_3', 'ChainForge', 'Decentralized supply chain tracking', 'https://api.dicebear.com/7.x/shapes/svg?seed=ChainForge', ARRAY['Blockchain', 'Enterprise'], ARRAY['Rust', 'Sui', 'React', 'TypeScript'], 'https://github.com/hackteam/chainforge', 'https://devpost.com/software/chainforge', 'active', 5, 72, 68.1),
('team_4', 'VisionAI', 'Real-time accessibility assistant', 'https://api.dicebear.com/7.x/shapes/svg?seed=VisionAI', ARRAY['AI', 'Accessibility'], ARRAY['Python', 'OpenCV', 'Flutter', 'Dart'], 'https://github.com/hackteam/visionai', 'https://devpost.com/software/visionai', 'active', 3, 85, 88.9),
('team_5', 'StreamSync', 'Live collaboration for remote teams', 'https://api.dicebear.com/7.x/shapes/svg?seed=StreamSync', ARRAY['DevTools', 'RealTime'], ARRAY['React', 'LiveKit', 'Supabase', 'TypeScript'], 'https://github.com/hackteam/streamsync', 'https://devpost.com/software/streamsync', 'active', 4, 69, 71.3),
('team_6', 'DataVault', 'Privacy-first data analytics', 'https://api.dicebear.com/7.x/shapes/svg?seed=DataVault', ARRAY['Data', 'Privacy'], ARRAY['Python', 'PostgreSQL', 'React', 'Docker'], 'https://github.com/hackteam/datavault', 'https://devpost.com/software/datavault', 'active', 3, 58, 62.7),
('team_7', 'CodeMentor AI', 'AI pair programmer for beginners', 'https://api.dicebear.com/7.x/shapes/svg?seed=CodeMentorAI', ARRAY['AI', 'Education'], ARRAY['Python', 'OpenAI', 'Vue.js', 'FastAPI'], 'https://github.com/hackteam/codementor', 'https://devpost.com/software/codementor', 'active', 4, 76, 74.8),
('team_8', 'FinFlow', 'Personal finance automation', 'https://api.dicebear.com/7.x/shapes/svg?seed=FinFlow', ARRAY['FinTech', 'Consumer'], ARRAY['React Native', 'Node.js', 'MongoDB', 'Stripe'], 'https://github.com/hackteam/finflow', 'https://devpost.com/software/finflow', 'active', 3, 63, 66.4),
('team_9', 'TechTitans', 'Next-gen development tools', 'https://api.dicebear.com/7.x/shapes/svg?seed=TechTitans', ARRAY['DevTools', 'Productivity'], ARRAY['TypeScript', 'Vite', 'Rust', 'WebAssembly'], 'https://github.com/hackteam/techtitans', 'https://devpost.com/software/techtitans', 'active', 4, 71, 73.2),
('team_10', 'DataDriven', 'Data-driven decision making', 'https://api.dicebear.com/7.x/shapes/svg?seed=DataDriven', ARRAY['Data', 'Analytics'], ARRAY['Python', 'Pandas', 'React', 'D3.js'], 'https://github.com/hackteam/datadriven', 'https://devpost.com/software/datadriven', 'active', 3, 67, 69.8);

-- Insert team members with realistic GitHub profiles
INSERT INTO team_members (id, team_id, name, role, github_username) VALUES
-- NeuralForge Team
('member_1', 'team_1', 'Sarah Chen', 'Lead Developer', 'v2pir'),
('member_2', 'team_1', 'Alex Rodriguez', 'ML Engineer', 'animvsh'),
('member_3', 'team_1', 'Jordan Kim', 'Frontend Developer', 'abhisheknaiidu'),
('member_4', 'team_1', 'Taylor Swift', 'UI/UX Designer', 'coderjojo'),

-- BytePay Team
('member_5', 'team_2', 'Chris Johnson', 'Blockchain Developer', 'ALX-13'),
('member_6', 'team_2', 'Maria Garcia', 'Backend Developer', 'daria-stanilevici'),
('member_7', 'team_2', 'David Lee', 'Smart Contract Engineer', 'rzashakeri'),

-- ChainForge Team
('member_8', 'team_3', 'Emma Wilson', 'Rust Developer', 'torvalds'),
('member_9', 'team_3', 'Michael Brown', 'Blockchain Architect', 'mojombo'),
('member_10', 'team_3', 'Lisa Zhang', 'Frontend Developer', 'defunkt'),
('member_11', 'team_3', 'James Miller', 'DevOps Engineer', 'pjhyett'),
('member_12', 'team_3', 'Anna Davis', 'Product Manager', 'wycats'),

-- VisionAI Team
('member_13', 'team_4', 'Robert Taylor', 'AI Researcher', 'ezmobius'),
('member_14', 'team_4', 'Jennifer White', 'Mobile Developer', 'ivey'),
('member_15', 'team_4', 'Kevin Anderson', 'Computer Vision Engineer', 'evanphx'),

-- StreamSync Team
('member_16', 'team_5', 'Amanda Thomas', 'Full-Stack Developer', 'vanpelt'),
('member_17', 'team_5', 'Daniel Jackson', 'Real-time Systems Engineer', 'wayneeseguin'),
('member_18', 'team_5', 'Rachel Green', 'Frontend Developer', 'brynary'),
('member_19', 'team_5', 'Steven Clark', 'Backend Developer', 'kevinclark'),

-- DataVault Team
('member_20', 'team_6', 'Michelle Lewis', 'Data Engineer', 'technoweenie'),
('member_21', 'team_6', 'Brian Walker', 'Security Specialist', 'macournoyer'),
('member_22', 'team_6', 'Nicole Hall', 'Analytics Developer', 'takeo'),

-- CodeMentor AI Team
('member_23', 'team_7', 'Andrew Allen', 'AI Engineer', 'caged'),
('member_24', 'team_7', 'Jessica Young', 'Frontend Developer', 'topfunky'),
('member_25', 'team_7', 'Matthew King', 'Backend Developer', 'anotherjesse'),
('member_26', 'team_7', 'Samantha Wright', 'UX Designer', 'roland'),

-- FinFlow Team
('member_27', 'team_8', 'Christopher Lopez', 'Mobile Developer', 'lukas'),
('member_28', 'team_8', 'Ashley Hill', 'FinTech Specialist', 'fanquake'),
('member_29', 'team_8', 'Ryan Scott', 'Backend Developer', 'schacon'),

-- TechTitans Team
('member_30', 'team_9', 'Lauren Green', 'DevTools Engineer', 'rtomayko'),
('member_31', 'team_9', 'Brandon Adams', 'Rust Developer', 'matz'),
('member_32', 'team_9', 'Stephanie Baker', 'Frontend Developer', 'rkh'),
('member_33', 'team_9', 'Tyler Nelson', 'Performance Engineer', 'josh'),

-- DataDriven Team
('member_34', 'team_10', 'Megan Carter', 'Data Scientist', 'svenfuchs'),
('member_35', 'team_10', 'Justin Mitchell', 'Visualization Engineer', 'ry'),
('member_36', 'team_10', 'Kayla Perez', 'Analytics Developer', 'jashkenas');

-- Insert hacker profiles with realistic data
INSERT INTO hacker_profiles (id, team_member_id, linkedin_url, linkedin_headline, current_company, company_size, years_experience, seniority_level, linkedin_data) VALUES
-- NeuralForge profiles
('profile_1', 'member_1', 'https://linkedin.com/in/sarahchen', 'Senior ML Engineer at Google | AI Research', 'Google', 'faang', 6, 'senior', '{"github_profile": {"username": "v2pir", "followers": 1250, "public_repos": 45, "total_stars": 234}}'),
('profile_2', 'member_2', 'https://linkedin.com/in/alexrodriguez', 'Full-Stack Developer | FinTech Specialist', 'Stripe', 'unicorn', 4, 'mid', '{"github_profile": {"username": "animvsh", "followers": 890, "public_repos": 32, "total_stars": 156}}'),
('profile_3', 'member_3', 'https://linkedin.com/in/jordankim', 'Mobile Developer | React Native Expert', 'Meta', 'faang', 3, 'mid', '{"github_profile": {"username": "abhisheknaiidu", "followers": 650, "public_repos": 28, "total_stars": 98}}'),
('profile_4', 'member_4', 'https://linkedin.com/in/taylorswift', 'Blockchain Developer | Web3 Enthusiast', 'Coinbase', 'unicorn', 5, 'senior', '{"github_profile": {"username": "coderjojo", "followers": 1100, "public_repos": 38, "total_stars": 189}}'),

-- BytePay profiles
('profile_5', 'member_5', 'https://linkedin.com/in/chrisjohnson', 'Blockchain Engineer | DeFi Specialist', 'Ethereum Foundation', 'nonprofit', 7, 'senior', '{"github_profile": {"username": "ALX-13", "followers": 2100, "public_repos": 52, "total_stars": 445}}'),
('profile_6', 'member_6', 'https://linkedin.com/in/mariagarcia', 'Backend Developer | Node.js Expert', 'Netflix', 'faang', 5, 'senior', '{"github_profile": {"username": "daria-stanilevici", "followers": 780, "public_repos": 29, "total_stars": 134}}'),
('profile_7', 'member_7', 'https://linkedin.com/in/davidlee', 'Smart Contract Developer | Solidity Expert', 'ConsenSys', 'unicorn', 4, 'mid', '{"github_profile": {"username": "rzashakeri", "followers": 920, "public_repos": 35, "total_stars": 167}}'),

-- ChainForge profiles
('profile_8', 'member_8', 'https://linkedin.com/in/emmawilson', 'Rust Developer | Systems Programming', 'Mozilla', 'enterprise', 8, 'staff', '{"github_profile": {"username": "torvalds", "followers": 150000, "public_repos": 1, "total_stars": 50000}}'),
('profile_9', 'member_9', 'https://linkedin.com/in/michaelbrown', 'Blockchain Architect | Distributed Systems', 'Chainlink', 'unicorn', 6, 'senior', '{"github_profile": {"username": "mojombo", "followers": 12000, "public_repos": 15, "total_stars": 2500}}'),
('profile_10', 'member_10', 'https://linkedin.com/in/lisazhang', 'Frontend Developer | React Specialist', 'Shopify', 'unicorn', 4, 'mid', '{"github_profile": {"username": "defunkt", "followers": 8500, "public_repos": 25, "total_stars": 1200}}'),
('profile_11', 'member_11', 'https://linkedin.com/in/jamesmiller', 'DevOps Engineer | Cloud Infrastructure', 'AWS', 'faang', 5, 'senior', '{"github_profile": {"username": "pjhyett", "followers": 3200, "public_repos": 18, "total_stars": 456}}'),
('profile_12', 'member_12', 'https://linkedin.com/in/annadavis', 'Product Manager | Blockchain Products', 'Polygon', 'unicorn', 6, 'senior', '{"github_profile": {"username": "wycats", "followers": 8900, "public_repos": 22, "total_stars": 1800}}'),

-- Continue with remaining profiles...
('profile_13', 'member_13', 'https://linkedin.com/in/roberttaylor', 'AI Researcher | Computer Vision', 'OpenAI', 'unicorn', 7, 'staff', '{"github_profile": {"username": "ezmobius", "followers": 4500, "public_repos": 31, "total_stars": 789}}'),
('profile_14', 'member_14', 'https://linkedin.com/in/jenniferwhite', 'Mobile Developer | Flutter Expert', 'Google', 'faang', 4, 'mid', '{"github_profile": {"username": "ivey", "followers": 2100, "public_repos": 26, "total_stars": 345}}'),
('profile_15', 'member_15', 'https://linkedin.com/in/kevinanderson', 'Computer Vision Engineer | OpenCV', 'Tesla', 'faang', 5, 'senior', '{"github_profile": {"username": "evanphx", "followers": 3200, "public_repos": 33, "total_stars": 567}}');

-- Insert calculated hacker stats
INSERT INTO hacker_stats (id, hacker_profile_id, hackathon_experience, technical_skill, leadership_score, innovation_score, communication_score, ai_ml_expertise, fintech_experience, blockchain_knowledge, mobile_dev_skill, fullstack_proficiency, consistency_score, growth_trajectory, network_strength, company_prestige, overall_rating, market_value, last_calculated) VALUES
-- NeuralForge stats
('stats_1', 'profile_1', 85, 92, 78, 88, 82, 95, 45, 30, 60, 85, 90, 85, 75, 95, 87, 8700, NOW()),
('stats_2', 'profile_2', 70, 88, 65, 75, 70, 40, 90, 85, 70, 95, 80, 90, 60, 85, 78, 7800, NOW()),
('stats_3', 'profile_3', 60, 85, 55, 70, 75, 35, 50, 40, 95, 80, 75, 85, 70, 90, 72, 7200, NOW()),
('stats_4', 'profile_4', 80, 90, 70, 85, 80, 50, 85, 95, 45, 85, 85, 80, 80, 80, 82, 8200, NOW()),

-- BytePay stats
('stats_5', 'profile_5', 90, 95, 85, 90, 75, 60, 70, 95, 40, 80, 95, 90, 85, 70, 89, 8900, NOW()),
('stats_6', 'profile_6', 75, 82, 70, 78, 85, 30, 85, 20, 60, 90, 85, 80, 65, 90, 79, 7900, NOW()),
('stats_7', 'profile_7', 70, 88, 65, 80, 70, 25, 80, 90, 35, 85, 80, 85, 70, 80, 78, 7800, NOW()),

-- ChainForge stats
('stats_8', 'profile_8', 95, 98, 90, 95, 70, 40, 60, 80, 30, 85, 98, 95, 90, 85, 92, 9200, NOW()),
('stats_9', 'profile_9', 85, 90, 80, 88, 75, 35, 70, 85, 25, 80, 90, 85, 80, 80, 84, 8400, NOW()),
('stats_10', 'profile_10', 70, 85, 65, 75, 80, 20, 60, 30, 70, 90, 80, 80, 70, 85, 76, 7600, NOW()),
('stats_11', 'profile_11', 80, 88, 75, 82, 70, 25, 65, 40, 50, 85, 85, 80, 75, 95, 81, 8100, NOW()),
('stats_12', 'profile_12', 75, 70, 85, 80, 90, 30, 75, 60, 40, 70, 80, 75, 85, 80, 78, 7800, NOW()),

-- VisionAI stats
('stats_13', 'profile_13', 90, 95, 80, 92, 75, 98, 40, 25, 30, 80, 95, 90, 85, 90, 88, 8800, NOW()),
('stats_14', 'profile_14', 65, 80, 60, 70, 80, 20, 50, 15, 90, 75, 75, 80, 65, 95, 73, 7300, NOW()),
('stats_15', 'profile_15', 80, 90, 70, 85, 75, 85, 30, 20, 60, 80, 85, 85, 75, 90, 81, 8100, NOW());

-- Insert team compositions
INSERT INTO team_composition (id, team_id, skill_diversity, experience_gap, leadership_clarity, domain_expertise, hackathon_readiness, innovation_potential, execution_ability, market_fit_understanding, overall_team_rating, predicted_performance, last_calculated) VALUES
('comp_1', 'team_1', 85, 75, 78, 82, 80, 88, 87, 78, 82, 82, NOW()),
('comp_2', 'team_2', 80, 80, 70, 75, 77, 85, 82, 70, 78, 78, NOW()),
('comp_3', 'team_3', 90, 70, 80, 85, 82, 88, 85, 80, 84, 84, NOW()),
('comp_4', 'team_4', 75, 85, 75, 90, 82, 92, 88, 75, 85, 85, NOW()),
('comp_5', 'team_5', 85, 75, 70, 70, 75, 80, 82, 70, 76, 76, NOW()),
('comp_6', 'team_6', 80, 80, 75, 75, 77, 78, 80, 75, 77, 77, NOW()),
('comp_7', 'team_7', 85, 75, 75, 80, 78, 85, 82, 75, 80, 80, NOW()),
('comp_8', 'team_8', 75, 85, 70, 70, 75, 75, 78, 70, 74, 74, NOW()),
('comp_9', 'team_9', 90, 80, 80, 75, 82, 85, 85, 80, 83, 83, NOW()),
('comp_10', 'team_10', 80, 75, 75, 80, 77, 80, 80, 75, 78, 78, NOW());

-- Update market odds with realistic data
INSERT INTO market_odds (id, market_id, team_id, current_odds, volume, last_updated) VALUES
-- Best AI Application market
('odds_1', (SELECT id FROM prediction_markets WHERE category = 'Best AI Application' LIMIT 1), 'team_1', 35.5, 1250, NOW()),
('odds_2', (SELECT id FROM prediction_markets WHERE category = 'Best AI Application' LIMIT 1), 'team_4', 28.2, 980, NOW()),
('odds_3', (SELECT id FROM prediction_markets WHERE category = 'Best AI Application' LIMIT 1), 'team_7', 22.1, 750, NOW()),
('odds_4', (SELECT id FROM prediction_markets WHERE category = 'Best AI Application' LIMIT 1), 'team_3', 14.2, 480, NOW()),

-- Best FinTech Innovation market
('odds_5', (SELECT id FROM prediction_markets WHERE category = 'Best FinTech Innovation' LIMIT 1), 'team_2', 32.8, 1100, NOW()),
('odds_6', (SELECT id FROM prediction_markets WHERE category = 'Best FinTech Innovation' LIMIT 1), 'team_8', 25.4, 850, NOW()),
('odds_7', (SELECT id FROM prediction_markets WHERE category = 'Best FinTech Innovation' LIMIT 1), 'team_3', 20.3, 680, NOW()),
('odds_8', (SELECT id FROM prediction_markets WHERE category = 'Best FinTech Innovation' LIMIT 1), 'team_1', 21.5, 720, NOW()),

-- Best Overall Hack market
('odds_9', (SELECT id FROM prediction_markets WHERE category = 'Best Overall Hack' LIMIT 1), 'team_1', 18.5, 1500, NOW()),
('odds_10', (SELECT id FROM prediction_markets WHERE category = 'Best Overall Hack' LIMIT 1), 'team_4', 16.2, 1300, NOW()),
('odds_11', (SELECT id FROM prediction_markets WHERE category = 'Best Overall Hack' LIMIT 1), 'team_3', 14.8, 1200, NOW()),
('odds_12', (SELECT id FROM prediction_markets WHERE category = 'Best Overall Hack' LIMIT 1), 'team_2', 12.5, 1000, NOW()),
('odds_13', (SELECT id FROM prediction_markets WHERE category = 'Best Overall Hack' LIMIT 1), 'team_5', 10.8, 880, NOW()),
('odds_14', (SELECT id FROM prediction_markets WHERE category = 'Best Overall Hack' LIMIT 1), 'team_7', 9.5, 780, NOW()),
('odds_15', (SELECT id FROM prediction_markets WHERE category = 'Best Overall Hack' LIMIT 1), 'team_9', 8.7, 700, NOW()),
('odds_16', (SELECT id FROM prediction_markets WHERE category = 'Best Overall Hack' LIMIT 1), 'team_6', 7.8, 640, NOW()),
('odds_17', (SELECT id FROM prediction_markets WHERE category = 'Best Overall Hack' LIMIT 1), 'team_8', 6.9, 560, NOW()),
('odds_18', (SELECT id FROM prediction_markets WHERE category = 'Best Overall Hack' LIMIT 1), 'team_10', 6.1, 500, NOW());

-- Insert realistic progress updates
INSERT INTO progress_updates (id, team_id, type, title, content, impact_score, created_at) VALUES
('update_1', 'team_1', 'milestone', 'Completed AI model training', 'Successfully trained the neural network with 95% accuracy', 8, NOW() - INTERVAL '2 hours'),
('update_2', 'team_1', 'commit', 'Pushed 15 commits to main', 'Major refactoring of the AI pipeline', 6, NOW() - INTERVAL '1 hour'),
('update_3', 'team_2', 'milestone', 'Smart contract deployed', 'Deployed payment smart contract to testnet', 9, NOW() - INTERVAL '3 hours'),
('update_4', 'team_2', 'screenshot', 'Updated UI design', 'New payment flow interface looks amazing', 5, NOW() - INTERVAL '30 minutes'),
('update_5', 'team_3', 'milestone', 'Blockchain integration complete', 'Successfully integrated with Sui blockchain', 8, NOW() - INTERVAL '4 hours'),
('update_6', 'team_4', 'milestone', 'Computer vision model ready', 'OpenCV integration working perfectly', 7, NOW() - INTERVAL '2 hours'),
('update_7', 'team_5', 'commit', 'Real-time sync working', 'LiveKit integration is smooth', 6, NOW() - INTERVAL '1 hour'),
('update_8', 'team_6', 'milestone', 'Data pipeline complete', 'Privacy-first analytics engine ready', 7, NOW() - INTERVAL '3 hours'),
('update_9', 'team_7', 'milestone', 'AI mentor deployed', 'OpenAI integration working great', 8, NOW() - INTERVAL '2 hours'),
('update_10', 'team_8', 'commit', 'Mobile app beta ready', 'React Native app looking good', 6, NOW() - INTERVAL '1 hour');

-- Insert AI commentary feed
INSERT INTO commentary_feed (id, text, voice_persona, event_type, related_team_id, created_at) VALUES
('commentary_1', 'Welcome to HackCast LIVE! We have 10 incredible teams competing across multiple categories. Let''s dive into the action!', 'Analyst Ava', 'general', NULL, NOW() - INTERVAL '2 hours'),
('commentary_2', 'Breaking: Team NeuralForge just completed their AI model training with 95% accuracy! Their momentum is building fast.', 'Coach K', 'milestone', 'team_1', NOW() - INTERVAL '90 minutes'),
('commentary_3', 'Market alert: BytePay''s odds just jumped from 28% to 35% after their smart contract deployment!', 'StatBot Reka', 'market_shift', 'team_2', NOW() - INTERVAL '75 minutes'),
('commentary_4', 'VisionAI is absolutely crushing it - 85% progress and climbing! Their accessibility features are next-level.', 'Analyst Ava', 'general', 'team_4', NOW() - INTERVAL '60 minutes'),
('commentary_5', 'ChainForge hitting the blockchain integration checkpoint. Sui integration looking solid!', 'Coach K', 'milestone', 'team_3', NOW() - INTERVAL '45 minutes'),
('commentary_6', 'StreamSync just deployed their real-time collaboration feature using LiveKit. This is what we like to see!', 'StatBot Reka', 'milestone', 'team_5', NOW() - INTERVAL '30 minutes'),
('commentary_7', 'DataVault hitting privacy compliance checkpoints. Their analytics engine is looking impressive!', 'Analyst Ava', 'general', 'team_6', NOW() - INTERVAL '20 minutes'),
('commentary_8', 'CodeMentor AI shipped their OpenAI integration in under 2 hours. That''s clutch!', 'Coach K', 'milestone', 'team_7', NOW() - INTERVAL '10 minutes'),
('commentary_9', 'Prediction markets heating up - we''ve seen 2,847 bets placed across all categories. The crowd is calling NeuralForge for Best AI!', 'StatBot Reka', 'market_shift', NULL, NOW() - INTERVAL '5 minutes'),
('commentary_10', 'All teams entering final stretch. This is where legends are made. Stay tuned!', 'Analyst Ava', 'general', NULL, NOW() - INTERVAL '1 minute');

-- Insert sample predictions (user bets)
INSERT INTO predictions (id, user_id, market_id, team_id, amount, odds_at_bet, status, payout, created_at) VALUES
('pred_1', (SELECT id FROM users LIMIT 1), (SELECT id FROM prediction_markets WHERE category = 'Best AI Application' LIMIT 1), 'team_1', 250, 35.5, 'pending', 0, NOW() - INTERVAL '2 hours'),
('pred_2', (SELECT id FROM users LIMIT 1), (SELECT id FROM prediction_markets WHERE category = 'Best FinTech Innovation' LIMIT 1), 'team_2', 300, 32.8, 'pending', 0, NOW() - INTERVAL '1 hour'),
('pred_3', (SELECT id FROM users LIMIT 1), (SELECT id FROM prediction_markets WHERE category = 'Best Overall Hack' LIMIT 1), 'team_4', 500, 16.2, 'pending', 0, NOW() - INTERVAL '30 minutes'),
('pred_4', (SELECT id FROM users LIMIT 1), (SELECT id FROM prediction_markets WHERE category = 'Best AI Application' LIMIT 1), 'team_7', 200, 22.1, 'pending', 0, NOW() - INTERVAL '15 minutes'),
('pred_5', (SELECT id FROM users LIMIT 1), (SELECT id FROM prediction_markets WHERE category = 'Best FinTech Innovation' LIMIT 1), 'team_8', 150, 25.4, 'pending', 0, NOW() - INTERVAL '10 minutes');


