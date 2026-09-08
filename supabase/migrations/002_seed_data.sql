-- ============================================================
-- LIA Website — Seed Data from Existing Static Files
-- Migration: 002_seed_data.sql
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- ============================================================
-- SITE SETTINGS (from src/data/club.ts)
-- ============================================================
INSERT INTO public.site_settings (key, value, label) VALUES
  ('club_name',         'Rotaract Club of Lead India Ahead', 'Club Name'),
  ('short_name',        'LIA',                               'Short Name'),
  ('established',       '2012',                              'Year Established'),
  ('district',          'Rotaract District 3206',            'District'),
  ('club_id',           '90062',                             'Club ID'),
  ('rotary_year',       '2026–27',                           'Current Rotary Year'),
  ('current_theme',     'MAAYON',                            'Presidential Theme'),
  ('president_name',    'Rtr. Hariharan B',                  'President Name'),
  ('president_title',   'President',                         'President Title'),
  ('president_term',    '2026–27',                           'President Term'),
  ('location',          'Coimbatore, Tamil Nadu, India',     'Location'),
  ('sponsor_club',      'Rotary Club of Coimbatore Texcity', 'Sponsor Club'),
  ('email',             'racleadindiaahead2021@gmail.com',   'Email Address'),
  ('phone_primary',     '+91 63697 98451',                   'Primary Phone'),
  ('phone_secondary',   '+91 75027 97780',                   'Secondary Phone'),
  ('instagram_handle',  '@rotaract.clubof.lia',              'Instagram Handle'),
  ('instagram_url',     'https://www.instagram.com/rotaract.clubof.lia/', 'Instagram URL'),
  ('linkedin_url',      'https://www.linkedin.com/company/rotaract-club-of-lead-india-ahead/', 'LinkedIn URL'),
  ('address',           'Coimbatore, Tamil Nadu, India',     'Address'),
  ('seo_title',         'Rotaract Club of Lead India Ahead | MAAYON 2026–27', 'SEO Title'),
  ('seo_description',   'Official website of the Rotaract Club of Lead India Ahead (LIA), Rotaract District 3206, Coimbatore. Presidential theme: MAAYON 2026–27.', 'SEO Description')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- EVENTS (from src/data/events.ts)
-- ============================================================
INSERT INTO public.events (
  id, title, subtitle, slug, description, short_description,
  event_date, display_date, year, category, status, venue, city,
  organizer, organizer_type, lia_role, collaborators, tags,
  featured, cover_image_url, source_platform, source_url, source_verified
) VALUES
(
  uuid_generate_v4(), 'THE ONE',
  '13th Installation Ceremony — Rotary Year 2026–27',
  'the-one-13th-installation',
  'The Rotaract Club of Lead India Ahead conducted its prestigious 13th Installation Ceremony, titled "THE ONE", marking the official commencement of the Rotary Year 2026–27 under the presidential theme MAAYON. The event welcomed 100+ Rotaractors along with distinguished Rotarians, alumni, family members, and well-wishers. Rtr. Hariharan B officially assumed office as the 13th President of the Rotaract Club of LIA. The ceremony received prominent media coverage in the Afternoon Newspaper.',
  'The 13th Installation Ceremony of LIA marking the commencement of Rotary Year 2026–27 and installation of President Rtr. Hariharan B.',
  '2026-07-18', '18 July 2026', 2026, 'Leadership', 'published',
  'Texcity Hall, Coimbatore', 'Coimbatore',
  'Rotaract Club of Lead India Ahead', 'LIA', 'Organizer',
  ARRAY['Rotary Club of Coimbatore Texcity'],
  ARRAY['Installation', 'Leadership', 'MAAYON 2026–27', 'Press Featured'],
  true, '/assets/events/the-one.jpg', 'LinkedIn',
  'https://www.linkedin.com/posts/rotaract-club-of-lead-india-ahead_we-are-delighted-to-share-that-the-13th-installation-activity-7485011862175223810-5td-',
  true
),
(
  uuid_generate_v4(), 'TAKEOFF',
  'District Rotaract Representative Installation 2026–27',
  'takeoff-drr-installation',
  'LIA members represented the club at the landmark TAKEOFF Installation Ceremony of the District Rotaract Representative (DRR) for Rotary Year 2026–27, affirming our dedication to district alignment, fellowship, and collective youth leadership.',
  'LIA club representation at the 2026–27 District Rotaract Representative (DRR) installation ceremony.',
  '2026-07-12', '12 July 2026', 2026, 'District Event', 'published',
  'District 3206, Coimbatore', 'Coimbatore',
  'Rotaract District 3206', 'DISTRICT', 'Participant',
  ARRAY['Clubs of District 3206'],
  ARRAY['District Event', 'Fellowship', 'DRR Installation'],
  false, '/assets/events/takeoff.jpg', 'Instagram',
  'https://www.instagram.com/rotaract.clubof.lia/', true
),
(
  uuid_generate_v4(), 'FLIGHT PATH',
  'Incoming Presidents & Secretaries Learning Seminar',
  'flight-path-presidents-secretaries-seminar',
  'A comprehensive district-level training seminar for incoming Presidents and Secretaries for Rotary Year 2026–27. The programme encompassed icebreaker modules, Rotary International updates, Rotaract governance fundamentals, 100% efficiency metrics, and executive strategy meetings.',
  'District leadership development seminar attended by incoming LIA presidential and secretarial officers.',
  '2026-06-07', '07 June 2026', 2026, 'Leadership', 'published',
  'NISE ICSE/ISC School, Coimbatore', 'Coimbatore',
  'Rotaract District 3206', 'DISTRICT', 'Participant',
  ARRAY[]::TEXT[],
  ARRAY['Leadership', 'Governance', 'District Seminar'],
  false, '/assets/events/flight-path.jpg', 'Instagram',
  'https://www.instagram.com/rotaract.clubof.lia/', true
),
(
  uuid_generate_v4(), '5-A-Side Kids Football Tournament',
  'Grassroots Youth Sports & Anti-Drug Awareness',
  'kids-5-a-side-football-tournament',
  'Coimbatore Eagles – New Life Sports Football Academy, in association with Rotary Club of Coimbatore Texcity and Rotaract Club of Lead India Ahead, conducted an energetic 5-A-Side Kids Football Tournament. Featuring 12 teams, 120+ young footballers, 30 coaches, and 300+ enthusiastic spectators, the event combined grassroots sports with impactful social campaigns: "Say No to Drugs" and "Say No to Gender-Based Violence".',
  'Collaborative youth tournament featuring 120+ players promoting social awareness against drugs and violence.',
  '2026-06-21', '21 June 2026', 2026, 'Sports', 'published',
  'Coimbatore', 'Coimbatore',
  'Coimbatore Eagles & Rotary Texcity & Rotaract LIA', 'LIA_COLLABORATION', 'Co-Organizer',
  ARRAY['Coimbatore Eagles – New Life Sports Academy', 'Rotary Club of Coimbatore Texcity'],
  ARRAY['Community Service', 'Sports', 'Youth Welfare', 'Anti-Drug Campaign'],
  true, '/assets/events/football.jpg', 'Instagram',
  'https://www.instagram.com/rotaract.clubof.lia/', true
),
(
  uuid_generate_v4(), 'DHEEMA',
  'Defeat Hepatitis, Empower Every Mind — World Hepatitis Day',
  'dheema-hepatitis-awareness',
  'A vital public health initiative conducted on World Hepatitis Day 2026 in collaboration with Rotaract Club of SNS College of Technology and Rotaract Club of Coimbatore Unity, with active participation from Rotaract Club of LIA.',
  'Collaborative public health awareness drive on World Hepatitis Day focusing on prevention and early screening.',
  '2026-07-28', '28 July 2026', 2026, 'Health', 'published',
  'Coimbatore', 'Coimbatore',
  'Rotaract Clubs of SNS Tech, Coimbatore Unity & LIA', 'LIA_COLLABORATION', 'Co-Organizer',
  ARRAY['Rotaract Club of SNS College of Technology', 'Rotaract Club of Coimbatore Unity'],
  ARRAY['Health Awareness', 'World Hepatitis Day', 'Community Impact'],
  false, '/assets/events/dheema.jpg', 'Instagram',
  'https://www.instagram.com/rotaract.clubof.lia/', true
),
(
  uuid_generate_v4(), 'MIND MATTERS',
  'Breaking the Pressure to Fit In — District Priority Project',
  'mind-matters-mental-health',
  'Organized on International Youth Day under the District Priority Project "Mann Shakthi", Rotaract Club of LIA joined forces with Rotaract Club of Coimbatore Gaalaxy, Rotaract Club of HICAS, Madras Cosmos, and SBSEC. The interactive session addressed youth mental health, academic stress, social media expectations, and psychological well-being with 45+ attendees.',
  'Multi-club youth mental wellness forum hosted on International Youth Day under project Mann Shakthi.',
  '2025-08-12', '12 August 2025', 2025, 'Health', 'published',
  'Online / Coimbatore', 'Coimbatore',
  'Rotaract LIA with Gaalaxy, HICAS, Cosmos & SBSEC', 'LIA_COLLABORATION', 'Co-Organizer',
  ARRAY['Rotaract Club of Coimbatore Gaalaxy', 'Rotaract Club of HICAS', 'Rotaract Club of Madras Cosmos', 'Rotaract Club of SBSEC'],
  ARRAY['Youth Mental Health', 'Mann Shakthi', 'International Youth Day'],
  false, '/assets/events/mind-matters.jpg', 'Instagram',
  'https://www.instagram.com/rotaract.clubof.lia/', true
),
(
  uuid_generate_v4(), 'NALAYA VIDIYAL 2.0',
  'Youth Football Development & Coaching Clinic',
  'nalaya-vidiyal-youth-sports',
  'A dedicated youth sports empowerment initiative held on Independence Day from 7:00 AM to 10:00 AM. A specialized football training clinic was conducted by Mr. Elavazhagan, AFC B-License holder and Tamil Nadu Sub-Junior National Team Coach, coaching 35 promising players across Under-10, Under-15, and Under-19 Girls categories.',
  'Youth football coaching clinic led by AFC B-licensed coach for 35 aspiring young athletes.',
  '2025-08-15', '15 August 2025', 2025, 'Sports', 'published',
  'Coimbatore', 'Coimbatore',
  'Rotaract Club of Lead India Ahead', 'LIA', 'Organizer',
  ARRAY[]::TEXT[],
  ARRAY['Youth Sports', 'Grassroots Football', 'Empowerment'],
  false, '/assets/events/nalaya-vidiyal.jpg', 'Instagram',
  'https://www.instagram.com/rotaract.clubof.lia/', true
),
(
  uuid_generate_v4(), 'LAYOUT',
  'District Editorial, Graphic Design & Filmora Seminar',
  'layout-editorial-workshop',
  'LIA members actively participated in LAYOUT, an intensive District Editorial Workshop and Seminar hosted by Rotaract Club of Coimbatore Texcity and Rotaract Club of HICAS.',
  'District skill development workshop on editorial craftsmanship, Photoshop, and video production.',
  '2025-09-20', 'September 2025', 2025, 'Professional Development', 'published',
  'Coimbatore', 'Coimbatore',
  'Rotaract Clubs of Coimbatore Texcity & HICAS', 'DISTRICT', 'Participant',
  ARRAY['Rotaract District 3206'],
  ARRAY['Editorial', 'Graphic Design', 'Content Creation', 'Skill Development'],
  false, '/assets/events/layout.jpg', 'Instagram',
  'https://www.instagram.com/rotaract.clubof.lia/', true
),
(
  uuid_generate_v4(), 'FUSION',
  'Where Chaos Meets Coordination — Team Dynamics Masterclass',
  'fusion-where-chaos-meets-coordination',
  'The Rotaract Club of LIA collaborated with the Rotaract Club of Karpagam Academy of Higher Education (KAHE) for an interactive joint leadership and professional seminar titled "Fusion: Where Chaos Meets Coordination".',
  'Joint professional masterclass with KAHE exploring high-performance team coordination.',
  '2025-10-15', 'October 2025', 2025, 'Professional Development', 'published',
  'Virtual Conference', 'Coimbatore',
  'Rotaract Club of LIA & Rotaract Club of KAHE', 'LIA_COLLABORATION', 'Co-Organizer',
  ARRAY['Rotaract Club of Karpagam Academy of Higher Education'],
  ARRAY['Leadership', 'Professional Growth', 'Teamwork', 'Fellowship'],
  false, '/assets/events/fusion.jpg', 'LinkedIn',
  'https://www.linkedin.com/company/rotaract-club-of-lead-india-ahead/', true
);

-- ============================================================
-- PROJECTS (from src/data/projects.ts)
-- ============================================================
INSERT INTO public.projects (
  title, slug, description, short_description, category, project_date, year,
  status, featured, cover_image_url, collaborators, impact_metrics, source_platform, source_url, source_verified
) VALUES
(
  '5-A-Side Kids Football Tournament & Awareness',
  'kids-football-anti-drug-campaign',
  'Organized in association with Coimbatore Eagles – New Life Sports Football Academy and Rotary Club of Coimbatore Texcity. The tournament brought together 120+ young footballers across 12 teams.',
  'Grassroots youth sports championship combining athletic competition with anti-drug and anti-violence awareness.',
  'Community Service & Sports', 'June 2026', 2026, 'published', true,
  '/assets/events/football.jpg',
  ARRAY['Coimbatore Eagles – New Life Sports Academy', 'Rotary Club of Coimbatore Texcity'],
  '[{"label":"Young Athletes","value":"120+"},{"label":"Participating Teams","value":"12"},{"label":"Mentors & Coaches","value":"30+"},{"label":"Community Spectators","value":"300+"}]'::jsonb,
  'Instagram', 'https://www.instagram.com/rotaract.clubof.lia/', true
),
(
  'Project DHEEMA — Viral Hepatitis Awareness',
  'project-dheema-hepatitis-prevention',
  'A flagship public health initiative conducted on World Hepatitis Day 2026 in collaboration with Rotaract Club of SNS College of Technology and Rotaract Club of Coimbatore Unity.',
  'Public health education drive on World Hepatitis Day focusing on liver wellness and prevention.',
  'Health & Wellness', 'July 2026', 2026, 'published', false,
  '/assets/events/dheema.jpg',
  ARRAY['Rotaract Club of SNS College of Technology', 'Rotaract Club of Coimbatore Unity'],
  '[{"label":"Health Focus","value":"Hepatitis Prevention"},{"label":"Reach","value":"Community Wide"},{"label":"Partner Clubs","value":"3 Clubs"}]'::jsonb,
  'Instagram', 'https://www.instagram.com/rotaract.clubof.lia/', true
),
(
  'Project Mind Matters — Breaking the Pressure to Fit In',
  'mind-matters-youth-mental-health',
  'Conducted under the District Priority Project "Mann Shakthi" on International Youth Day in partnership with Coimbatore Gaalaxy, HICAS, Madras Cosmos, and SBSEC.',
  'Youth mental wellness forum addressing academic stress and social pressure under project Mann Shakthi.',
  'Health & Wellbeing', 'August 2025', 2025, 'published', false,
  '/assets/events/mind-matters.jpg',
  ARRAY['Rotaract Club of Coimbatore Gaalaxy', 'Rotaract Club of HICAS', 'Rotaract Club of Madras Cosmos', 'Rotaract Club of SBSEC'],
  '[{"label":"Attendees","value":"45+"},{"label":"Participating Clubs","value":"5 Clubs"},{"label":"Initiative","value":"Mann Shakthi"}]'::jsonb,
  'Instagram', 'https://www.instagram.com/rotaract.clubof.lia/', true
),
(
  'Nalaya Vidiyal 2.0 — Football Coaching Clinic',
  'nalaya-vidiyal-youth-football-clinic',
  'A high-impact youth coaching workshop conducted on Independence Day featuring AFC B-License holder and Tamil Nadu Sub-Junior National Team Coach Mr. Elavazhagan.',
  'Professional coaching workshop led by national coach Mr. Elavazhagan for 35 promising players.',
  'Sports & Youth Development', 'August 2025', 2025, 'published', true,
  '/assets/events/nalaya-vidiyal.jpg',
  ARRAY[]::TEXT[],
  '[{"label":"Students Trained","value":"35"},{"label":"Categories","value":"U10, U15, U19"},{"label":"Certified Coach","value":"AFC B-License"}]'::jsonb,
  'Instagram', 'https://www.instagram.com/rotaract.clubof.lia/', true
);

-- ============================================================
-- TEAM MEMBERS (from src/data/team.ts)
-- ============================================================
INSERT INTO public.team_members (
  name, designation, bio, college_company, blood_group, is_executive,
  display_order, published, term, letter_image_url
) VALUES
  ('Rtr. Hariharan B', 'Club President', '13th President of the Rotaract Club of Lead India Ahead. Leading Team MAAYON with a clear vision for purposeful youth leadership, high-impact community service, and fellowship.', 'SNS College of Technology, Coimbatore', 'O+ve', true, 1, true, '2026–27', NULL),
  ('Rtr. IPP. Harsith S', 'Immediate Past President (IPP)', 'Guiding the club''s ongoing strategic vision, mentorship, and institutional continuity following a successful presidential tenure.', 'CNTXT AI', 'O+ve', true, 2, true, '2026–27', NULL),
  ('Rtr. JJ Sanjey', 'DPP Chair (District Priority Project)', 'Appointed as District Priority Project Chair for 2026–27. Driving flagship initiatives that create sustainable value and empower local communities.', 'Karpagam Academy of Higher Education', NULL, true, 3, true, '2026–27', '/assets/letters/sanjey.jpg'),
  ('Rtr. Manishasree', 'Executive Board Member', 'Spearheading club administration, member engagement, and community outreach programmes for the 2026–27 Rotary Year.', 'Karpagam Academy of Higher Education', 'O+ve', true, 4, true, '2026–27', '/assets/letters/Rtr.Manisha Shree.jpg'),
  ('Rtr. Prasanna G', 'Executive Board Member', 'Focused on human relations, youth networking, and professional development alignments across District 3206.', 'Rnd Soft Tech Pvt Ltd', 'B+ve', true, 5, true, '2026–27', '/assets/letters/Rtr. Prasanna.jpg'),
  ('Rtr. Sujay Krishna RP', 'Executive Board Member', 'Driving member fellowship, community service operations, and logistics execution for Team MAAYON.', 'SNS College of Technology', 'B+ve', true, 6, true, '2026–27', '/assets/letters/Rtr. Sujay Krishna.jpg'),
  ('Rtr. Santhosh Kumar A', 'Technology & Digital Director', 'Leading digital media infrastructure, technical architecture, and web systems for the Rotaract Club of Lead India Ahead.', 'Karpagam Academy of Higher Education', 'O-ve', true, 7, true, '2026–27', '/assets/letters/santhosh.jpg'),
  ('Rtr. PP. Antony Revanth', 'Past President & Sports Advisor', 'Soccer coach and sports educator guiding grassroots youth athletic tournaments and sports-led community initiatives.', 'Soccer Coach – SSVM & TNEB', 'B+ve', false, 8, true, '2026–27', NULL),
  ('Rtr. PP. Gokul', 'Past President & Technical Trainer', 'Providing technical mentorship, leadership development, and operational guidance across major club avenues.', 'Freelance Technical Trainer', 'O+ve', false, 9, true, '2026–27', '/assets/letters/Gokul.jpg'),
  ('Rtr. Tamilselvan', 'Board Member', 'Coordinating youth engagement and volunteer mobilizations across educational institutions in Coimbatore.', 'Karpagam Academy of Higher Education', 'B+ve', false, 10, true, '2026–27', '/assets/letters/Tamil.jpg'),
  ('Rtr. Vigneshwaran', 'Board Member', 'Active in community project planning and cross-club partnerships throughout District 3206.', 'Dr. N.G.P. Institute of Technology', 'O+ve', false, 11, true, '2026–27', '/assets/letters/Rtr. Vigneshwaran.jpg'),
  ('Rtr. Palak M', 'Board Member', 'Supporting student initiatives, fellowship assemblies, and community outreach drives.', 'SNS College of Technology', 'A1+ve', false, 12, true, '2026–27', NULL),
  ('Rtr. Prajwel', 'Board Member', 'Assisting project operations and volunteer engagement across campus networks.', 'SNS College of Technology', 'O+ve', false, 13, true, '2026–27', '/assets/letters/Prajwel.jpg'),
  ('Rtr. Yamuna', 'Board Member', 'Promoting youth participation and health awareness activities within local communities.', 'SNS College of Technology', 'B+ve', false, 14, true, '2026–27', '/assets/letters/Yamuna.jpg'),
  ('Rtr. Nagaraj', 'Board Member', 'Assisting executive club logistics, professional seminars, and district representations.', 'Kathir College of Engineering', NULL, false, 15, true, '2026–27', '/assets/letters/Rtr. Nagaraj.jpg'),
  ('Rtr. Guruprasath S', 'Faculty Advisor', 'Assistant Professor providing academic counsel, strategic guidance, and student development insights.', 'Karpagam Academy of Higher Education', NULL, false, 16, true, '2026–27', '/assets/letters/Guru Prasath.jpg');

-- ============================================================
-- GALLERY ALBUMS & IMAGES (from src/data/gallery.ts)
-- ============================================================
WITH album_insert AS (
  INSERT INTO public.gallery_albums (name, description, published, sort_order)
  VALUES ('Club Activities 2025–27', 'Official club events, projects, and activities from Rotary Year 2025–27', TRUE, 1)
  RETURNING id
)
INSERT INTO public.gallery_images (album_id, image_url, title, caption, category, date, featured, sort_order)
SELECT
  album_insert.id,
  img.image_url, img.title, img.caption, img.category, img.date, img.featured, img.sort_order
FROM album_insert,
(VALUES
  ('/assets/events/the-one.jpg', '13th Installation Ceremony — The ONE', 'Team MAAYON installation ceremony at Texcity Hall, Coimbatore.', 'EVENTS', '18 July 2026', true, 1),
  ('/assets/events/football.jpg', '5-A-Side Grassroots Football Championship', '120+ young footballers advocating Say No to Drugs in Coimbatore.', 'EVENTS', '21 June 2026', true, 2),
  ('/assets/events/dheema.jpg', 'Project DHEEMA — World Hepatitis Day', 'Collaborative public health awareness drive on viral hepatitis prevention.', 'COMMUNITY', '28 July 2026', false, 3),
  ('/assets/events/takeoff.jpg', 'TAKEOFF — DRR Installation 2026–27', 'LIA representatives participating in the District 3206 DRR installation.', 'EVENTS', '12 July 2026', false, 4),
  ('/assets/events/flight-path.jpg', 'FLIGHT PATH — Leadership Training Seminar', 'Executive learning and governance seminar for incoming leaders.', 'EVENTS', '07 June 2026', false, 5),
  ('/assets/events/nalaya-vidiyal.jpg', 'Nalaya Vidiyal 2.0 Football Development', 'Independence day football clinic coached by AFC B-license coach Mr. Elavazhagan.', 'EVENTS', '15 August 2025', false, 6),
  ('/assets/events/mind-matters.jpg', 'Mind Matters — Youth Wellness Forum', 'Mental wellness dialogue under District Priority Project Mann Shakthi.', 'COMMUNITY', '12 August 2025', false, 7),
  ('/assets/events/layout.jpg', 'LAYOUT — District Editorial Masterclass', 'Skill enhancement workshop focusing on editorial design and media.', 'EVENTS', 'September 2025', false, 8),
  ('/assets/events/fusion.jpg', 'Fusion — Team Dynamics & Coordination', 'Collaborative session with KAHE exploring high-efficiency teamwork.', 'EVENTS', 'October 2025', false, 9)
) AS img(image_url, title, caption, category, date, featured, sort_order);
