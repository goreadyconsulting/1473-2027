-- Photoreal grocery location. Deploy only once the seven bundled WebP files
-- are available from GitHub Pages. All other LARP locations and game data are unchanged.
update larp_portal.places
set background='./assets/cinematics/grocery-1.webp',
    stills='["./assets/cinematics/grocery-1.webp","./assets/cinematics/grocery-2.webp","./assets/cinematics/grocery-3.webp"]'::jsonb
where id='glasswind';
