-- Replace unrelated synthetic-looking location stills with genuine
-- licensed photography packaged at /assets/photography/ (credited separately).
-- Apply only AFTER those files have passed CI and been published to Pages.
update larp_portal.places
set background='./assets/photography/emberfall-3.webp',
    stills='["./assets/photography/emberfall-1.webp","./assets/photography/emberfall-2.webp","./assets/photography/emberfall-3.webp"]'::jsonb
where id='emberfall';

update larp_portal.places
set background='./assets/photography/glasswind-3.webp',
    stills='["./assets/photography/glasswind-1.webp","./assets/photography/glasswind-2.webp","./assets/photography/glasswind-3.webp"]'::jsonb
where id='glasswind';

update larp_portal.places
set background='./assets/photography/verdant-3.webp',
    stills='["./assets/photography/verdant-1.webp","./assets/photography/verdant-2.webp","./assets/photography/verdant-3.webp"]'::jsonb
where id='verdant';

update larp_portal.places
set background='./assets/photography/stormglass-3.webp',
    stills='["./assets/photography/stormglass-1.webp","./assets/photography/stormglass-2.webp","./assets/photography/stormglass-3.webp"]'::jsonb
where id='stormglass';

update larp_portal.places
set background='./assets/photography/bleakwater-3.webp',
    stills='["./assets/photography/bleakwater-1.webp","./assets/photography/bleakwater-2.webp","./assets/photography/bleakwater-3.webp"]'::jsonb
where id='bleakwater';

update larp_portal.places
set background='./assets/photography/sanctum-3.webp',
    stills='["./assets/photography/sanctum-1.webp","./assets/photography/sanctum-2.webp","./assets/photography/sanctum-3.webp"]'::jsonb
where id='sanctum';

update larp_portal.places
set background='./assets/photography/iron-3.webp',
    stills='["./assets/photography/iron-1.webp","./assets/photography/iron-2.webp","./assets/photography/iron-3.webp"]'::jsonb
where id='iron';

-- Important: no changes to session, active relics, clock, or admin credentials.
