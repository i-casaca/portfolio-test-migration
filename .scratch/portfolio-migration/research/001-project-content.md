# Portfolio Works — Case Study Content Extraction

Source: https://isma-casaca.framer.website/ (Framer SPA)
Extracted: 2026-07-30
Method: live browser navigation (click-through from `./Works` listing page; direct deep-links to `/works/<slug>` 404 when loaded fresh, but the in-page href attributes do resolve once you're inside the SPA — see Notes at bottom).

Listing page confirms these href slugs for all 5 project cards (in on-page order, numbered descending 05→01):

| Card order | Title | Slug (relative to `/works/`) |
|---|---|---|
| 05 | Manu Cardiel | `manu-cardiel-website-portfolio` (already captured elsewhere) |
| 04 | Adrenaline | `adrenaline-sports` |
| 03 | Arabvision | `arabvision-ott` |
| 02 | Nexahub | `nexahub-cms` |
| 01 | El Paraguas | `el-paraguas` |

Full URLs: `https://isma-casaca.framer.website/works/adrenaline-sports`, `.../works/arabvision-ott`, `.../works/nexahub-cms`, `.../works/el-paraguas`.

None of these 4 projects display a "Link" field (no live-site URL is shown on their detail pages) — unlike Manu Cardiel, which links to a real deployed site. This is presumably because these are confidential/NDA client projects. Each page does carry a disclaimer: "This project has been revised to safeguard confidential information following the terms of fair use."

Page `<title>` pattern: `"<Project Name> | UX Design Project <Year>"`.

Every project detail page also repeats 2 site-chrome SVG icons (logo mark and a "↳" scroll/arrow icon), not case-study content:
- `https://framerusercontent.com/images/rWoFRJn4KDfzTeyEPY5noWH0jM.svg`
- `https://framerusercontent.com/images/Heq4KrX5M2tklcDy2l6RsZ2GReo.svg`

These are excluded from the per-project image lists below (listed once here since identical across all pages).

Image URL note: Framer serves responsive images via `?scale-down-to=...&width=...&height=...` query params on `framerusercontent.com`. The base URL (no query string) resolves to the original/full-resolution asset and is what's recorded below. Confirmed working directly (no auth needed).

---

## 1. Adrenaline

- **Slug:** `adrenaline-sports`
- **Full URL:** https://isma-casaca.framer.website/works/adrenaline-sports
- **Page title:** Adrenaline | UX Design Project 2023
- **Card teaser (from Works listing):** Whitelabel multidevice sports app, offering premium users access to statistics, live TV, matches, and VOD content. The ultimate destination for enthusiasts seeking in-depth information on their favorite teams.

### Meta fields
- **Organización (Organization):** Top Global IT Company
- **Año (Year):** 2023
- **Posición (Position):** UX Designer
- **Link:** — not present on this page (no live link shown)

### ↳ Contexto (Context)
Adrenaline emerged from the necessity to align our flagship product with the dynamic landscape of sports events. The client sought to adapt their flexible backend, varying for each third-party provider, into a UI that resonates with a demanding audience eager for comprehensive sports content. The project's focus on MVP development aimed to address challenges in adapting diverse statistics and results for various sports, driven by the variations in scoring systems and competition formats.

### ↳ Ejecución (Execution)
Our approach involved the creation of an MVP through two prevalent schemas—individual competitions and match-based competitions. This strategic decision allowed us to address evolving needs and solve challenges through deviating from the conventional 'happy path.' The final product seamlessly adapts the streaming service schema, incorporating industry-leading features from sports services like DAZN into a compelling and competent UI.

### ↳ Resultado (Result)
The flexibility, scalability, and ease of product componentization make Adrenaline a cornerstone for future clients in the sports streaming sector. Its possibility to adapt to different sports and iterate seamlessly positions it as a pivotal solution, offering a competitive and attractive UI that sets the standard for upcoming ventures in the industry.

DISCLAIMER: This project has been revised to safeguard confidential information following the terms of fair use.

**Next project link:** El Paraguas (`./el-paraguas`)

### Images (in page order)
1. Hero — "A laptop displaying the Roland Garros competition, showcasing the latest updates and information."
   `https://framerusercontent.com/images/ywhKOKqx5r6T5gG4ap1LDMAOnmY.webp`
2. "The color palette for the font Exo: a range of vibrant and harmonious colors to enhance your design."
   `https://framerusercontent.com/images/sqqT3JO4I0MCQ1GSiTm6wM8k.webp`
3. "A set of sports app mockups showcasing various screens and features." (mockup set, image 1 of 5)
   `https://framerusercontent.com/images/RqFfQMe4b3l29v9IT5xug8lMuMA.webp`
4. "A set of sports app mockups showcasing various screens and features." (2 of 5)
   `https://framerusercontent.com/images/FSDdDeu6Zj2bssqwrgWch8XMcPo.webp`
5. "A set of sports app mockups showcasing various screens and features." (3 of 5)
   `https://framerusercontent.com/images/mJspHANfBQZYdkEg0Ci54nAsg8.webp`
6. "A set of sports app mockups showcasing various screens and features." (4 of 5)
   `https://framerusercontent.com/images/hEtQ61T6qe3aB5wNKf2iN5IFKE.webp`
7. "A set of sports app mockups showcasing various screens and features." (5 of 5)
   `https://framerusercontent.com/images/lKXNzlrU1SWkns9qwpPl6wZE.webp`

---

## 2. Arabvision

- **Slug:** `arabvision-ott`
- **Full URL:** https://isma-casaca.framer.website/works/arabvision-ott
- **Page title:** Arabvision | UX Design Project 2023
- **Card teaser (from Works listing):** Arabvision mobile and Android TV streaming platform grants customers access to Live TV and Video On Demand (VOD) content anytime, anywhere, offering a seamless viewing experience across devices.

### Meta fields
- **Organización (Organization):** Top Global IT Company
- **Año (Year):** 2023
- **Posición (Position):** UX Designer
- **Link:** — not present on this page (no live link shown)

### ↳ Contexto (Context)
This project arises from the necessity to adapt to the present times, refining Arabvision's product offering in a market where on-demand streaming has become almost mandatory for television networks and producers. The objective was to design an application that not only met UI expectations but also addressed the complexities of the Arabic RTL reading structure. Our goal was to create a platform with the ability to showcase the product attractively while providing a completely accessible experience.

### ↳ Ejecución (Execution)
I meticulously analyzed user preferences and cultural nuances, attuning the application's design to meet the specific needs of the Arabic audience. The UI development seamlessly integrated with Arabvision's content, ensuring an engaging, accessible viewing experience across devices. Continuous oversight from Arabvision's branding team, including insights from interviews and cultural context checks, shaped the design. Regular UI reviews and collaborative refinement processes, involving both teams, led to continuous improvements based on dynamic feedback loops.

### ↳ Resultado (Result)
While the project was unfortunately halted due to the Israel conflict, the proposed UI design demonstrated notable success in its adaptability and alignment with Arabvision's branding. The finely tuned application, though not fully developed, showcased a commitment to an engaging and accessible viewing experience tailored to contemporary streaming preferences. Continuous collaboration, iterative UI enhancements, and thorough feedback mechanisms played a crucial role in achieving a design that resonates with Arabvision's vision and audience.

DISCLAIMER: This project has been revised to safeguard confidential information following the terms of fair use.

**Next project link:** El Paraguas (`./el-paraguas`) — (note: same "Next Project" target as Adrenaline; site's ordering seems to just point to El Paraguas from several pages)

### Images (in page order)
1. Hero — "A table with a TV displaying movies."
   `https://framerusercontent.com/images/l4sZsDfngbxeFrhoN60HfQ9uxw.webp`
2. "Color chart for the brand : A visual representation of the color aa, displaying its shade and intensity." (alt text appears truncated/garbled in source — "color aa" is verbatim from the site)
   `https://framerusercontent.com/images/cccM11hr9rGuGR5RMaQVvbiKk08.webp`
3. "A set of movie app mockups showcasing various screens and features." (1 of 4)
   `https://framerusercontent.com/images/hkMBk5w1UwxAJF1SrdSpI6VIwUc.webp`
4. "A set of movie app mockups showcasing various screens and features." (2 of 4)
   `https://framerusercontent.com/images/MhRBVv3KOpsr7NAdcNjBKkKkg.webp`
5. "A set of movie app mockups showcasing various screens and features." (3 of 4)
   `https://framerusercontent.com/images/89fH3sN8lby75lLMUm97aiRgTQ.webp`
6. "A set of movie app mockups showcasing various screens and features." (4 of 4)
   `https://framerusercontent.com/images/J5THWctR9adMUamIncB6ptvk1M.webp`
7. (unlabeled extra image found in DOM, alt empty, appears to be a 5th mockup screenshot in same series)
   `https://framerusercontent.com/images/BhKUTTrZXmlGgS4EtKDCdgmmj8.webp`

---

## 3. Nexahub

- **Slug:** `nexahub-cms`
- **Full URL:** https://isma-casaca.framer.website/works/nexahub-cms
- **Page title:** Nexahub | UX Design Project 2022
- **Card teaser (from Works listing):** A CMS designed to facilitate QA Engineers to effortlessly manage JIRA tickets. A comprehensive solution for efficient incident management within the Nexahub ecosystem.

### Meta fields
- **Organización (Organization):** Top Global IT Company
- **Año (Year):** 2022
- **Posición (Position):** UI Designer
- **Link:** — not present on this page (no live link shown)

### ↳ Contexto (Context)
Nexahub identified the need to enhance efficiency in managing JIRA incidents in its Nexahub FUT users. Although initially deprioritized, the long-term goal was to make this CMS an essential tool globally. This initiative responded to the strategy of investing in technical and design improvements.

### ↳ Ejecución (Execution)
In collaboration with my team, our strategy was centered on meticulously understanding the needs and workflow of QA Engineers at each step. Through shadowing techniques, we sought to gain a profound comprehension of these aspects and translate them into an effective and intuitive UI. To achieve this, we proposed a series of user flows, incorporating the necessary interactions for each step, while capturing the key elements of Nexahub's branding. All of this was accomplished through the development of iterable components and icons, contributing to the creation of a design system.

### ↳ Resultado (Result)
The outcome was the successful launch of the new CMS on Nexahub's intranet. The project not only met its proposed objectives but also enhanced communication efficiency and traceability of JIRA incidents. The new UI delivered a more seamless, user-friendly, and intuitive experience, solidifying its place within Nexahub's branding.

DISCLAIMER: This project has been revised to safeguard confidential information following the terms of fair use.

**Next project link:** El Paraguas (`./el-paraguas`)

### Images (in page order)
1. Hero — "A laptop displaying a CMS app on a table."
   `https://framerusercontent.com/images/VzBz8XydO0kKafn6uyNpIlSUs.webp`
2. "The color palette for the font Nunito: a range of vibrant and harmonious colors to enhance your design."
   `https://framerusercontent.com/images/YJ3GI9ulM7aWPREFroDBTKCp2tc.webp`
3. "A collection of blue and black screens displaying various types of information, representing mockups of a CMS app." (1 of 4)
   `https://framerusercontent.com/images/7gLIKJcDxAlX4kawcQEAKFXFgE.webp`
4. "...mockups of a CMS app." (2 of 4)
   `https://framerusercontent.com/images/eqzTRKRzA2uUaquQ1BwUb2mvwQ.webp`
5. "...mockups of a CMS app." (3 of 4)
   `https://framerusercontent.com/images/Mekw3CzDccwwn9kxj03MG8Wy1o.webp`
6. "...mockups of a CMS app." (4 of 4)
   `https://framerusercontent.com/images/9xU4hEC62zvk28pSPEC0nMRcl0.webp`
7. (unlabeled extra image found in DOM, alt empty, additional mockup in same series)
   `https://framerusercontent.com/images/usUC3hKaTGFbbh4XzsN7sEAuu3w.webp`

---

## 4. El Paraguas

- **Slug:** `el-paraguas`
- **Full URL:** https://isma-casaca.framer.website/works/el-paraguas
- **Page title:** El Paraguas | UX Design Project 2021
- **Card teaser (from Works listing):** A travel app suited to the changing landscape influenced by the COVID-19 pandemic. An alternative to traditional guided tours, everywhere, anywhere on your phone.

### Meta fields
- **Organización (Organization):** Upgrade Hub - Bootcamp (Final Project)
- **Año (Year):** 2021
- **Posición (Position):** UX Designer
- **Link:** — not present on this page (no live link shown)

### ↳ Contexto (Context)
The travel landscape has been transformed due to the COVID-19 pandemic, emphasizing the importance of avoiding crowds and peak seasons at destinations. This shift has highlighted the significance of flexible tourist activities like 'free tours.' However, the economic vulnerability of 'free tours' has become apparent, relying on tourist contributions at the end of tours. Booking platforms impose costs and fees affecting guides, leading to financial challenges when contributions fall short. The challenge: developing an application adaptable to various circumstances, addressing the complexity of striking a balance amid these changing realities.

### ↳ Ejecución (Execution)
I dove into the project, tackling a complex challenge that demanded meticulous research and a deep understanding of various situations. By applying Design Thinking with precision, I crafted flows, such as N&N canvas, user personas, JTBD; that effectively addressed diverse challenges. The outcome: an app that seamlessly blends geolocation and Voice User Interface (VUI), powered by pre-paid guides who receive compensation in advance. The interaction design is all about ensuring a visit with no distractions.

### ↳ Resultado (Result)
An app that effortlessly tackles the twists and turns of the travel scene, striking a sweet spot between safety, flexibility, and economic sustainability for guides. Thanks to a blend of geolocation tech and a carefully crafted Voice User Interface (VUI), users enjoy a smooth and enhanced experience. This solution is a game-changer, responding innovatively to the ever-changing world of travel and setting the stage for future travel apps.

(No confidentiality disclaimer appeared on this page — unlike the other 3, this was a bootcamp final project, not a client engagement.)

**Next project link:** Nexahub (`./nexahub-cms`)

### Images (in page order)
1. Hero — "A smartphone connected to a cable for charging or data transfer."
   `https://framerusercontent.com/images/6jVGoln39LLuTY93HMYfUdy8wY.webp`
2. "The color palette for the font Raleway: a range of vibrant and harmonious colors to enhance your design."
   `https://framerusercontent.com/images/qp5r6HF1TKlvTsNLWj2YcCp3c.webp`
3. "A collection of low fidelity wireframes showing four mobile devices with different screens."
   `https://framerusercontent.com/images/AOUhShmuV4xlxf4CDTxlLSZRI.webp`
4. "A variety of mobile devices on a yellow background, showcasing mockups of a travel app." (1 of 4)
   `https://framerusercontent.com/images/g4R0XqzmKiWvQ8rwgTH0zTjtao.webp`
5. "...mockups of a travel app." (2 of 4)
   `https://framerusercontent.com/images/qerMl3jKxV4DDeobmSVwcDacfpM.webp`
6. "...mockups of a travel app." (3 of 4)
   `https://framerusercontent.com/images/p6GXirFDUThGktp8nN2ahOZ2j0.webp`
7. "...mockups of a travel app." (4 of 4)
   `https://framerusercontent.com/images/RjqcxZILJIseVTHvzPDxsSb19A.webp`

---

## Notes / gaps

- **Language:** All 4 pages were captured in English (the site's default language toggle). A Spanish variant exists (language switcher shows "English / Spanish", value `DZfmep7IV`) but was not captured — the task's field labels (Organización/Año/Posición/etc.) are the Spanish translations of what's shown in English here as Organization/Year/Position/Context/Execution/Result. If Spanish copy is needed verbatim, someone should flip the language switcher on each page and re-extract; I did not do this since the task said labels "may be in English."
- **Navigation caveat confirmed:** loading `/works/<slug>` as a fresh top-level URL does 404 (Framer SPA client-side routing). The reliable path is: load the site root, click through to `Works`, then click each project card — which is what was done here for all 4 projects.
- **Video/text nuance:** No embedded videos, no additional CTA buttons, and no "Link" section were found on any of the 4 pages — all four are confidential/NDA-safe case studies without a live demo link (this differs from Manu Cardiel, which does link out to a live site).
- **Extra images beyond visible alt-labeled series:** For Arabvision and Nexahub, the DOM contained one extra image (`BhKUTTrZXmlGgS4EtKDCdgmmj8.webp` and `usUC3hKaTGFbbh4XzsN7sEAuu3w.webp` respectively) with the same alt text pattern as the preceding mockup set but not distinctly described — likely a 5th frame in a horizontal scroll/carousel of mockups that didn't get a unique alt string. Recorded as-is; worth spot-checking visually before final use.
- Image URLs are direct `framerusercontent.com` CDN links and loaded successfully in-browser (no auth/cookies required), so they should be directly downloadable.
