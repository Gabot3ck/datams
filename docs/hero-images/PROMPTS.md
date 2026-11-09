# Prompts de imágenes del Hero

Bitácora de cómo se generaron los banners del slider del home, para repetir el
proceso en slides nuevos. Tamaños y zonas de texto: `README.md` → "Hero slider — imágenes".

## Slide 1 — asesor atendiendo a una clienta (2026-10-18)

**Herramientas:** Higgsfield con **Nano Banana Pro** (edición con imágenes de
referencia) + Canva (encuadre final, relleno y exportación por tamaño).
Alternativa probada como opción: Seedream 4.5. Evitar Soul o modelos solo
texto: inventan la oficina y cambian la cara.

**Insumos (fotos reales):**
- Foto del asesor sentado en su escritorio (base).
- Foto de la oficina (ambiente y referencia de luz).
- Foto del equipo (solo referencia de vestimenta; no se usó como base).

**Resultado:** `src/assets/images/banners/datamultiservices-taxes-nevada-1{d,t,m}.webp`.
El asesor es real; la clienta es generada por IA. No usar esta imagen junto a
reseñas o testimonios (parecería una clienta real).

### 1. Prompt base (generación inicial)

Imagen base: foto del asesor en su escritorio.

```
Using the reference photo as the base image, keep the office interior and the
tax advisor EXACTLY as they are: same face, hairstyle, clothing, posture, desk,
furniture, lighting and camera angle. Do not alter his facial features.

Add one client sitting across the desk from the advisor, being attended:
a Hispanic woman in her 30s, casual-smart clothing, relaxed and smiling,
looking at the advisor while he explains a document. The advisor is engaged,
friendly, mid-conversation, gesturing toward papers on the desk.

Natural, warm, professional atmosphere. Soft daylight consistent with the
original photo, realistic shadows and contact between people, chairs and desk.
Correct scale and perspective for the new person.

Composition: place both people on the RIGHT two-thirds of the frame; keep the
LEFT third calm and uncluttered (wall/background, soft depth of field) for
website text overlay.

Photorealistic editorial photography, 35mm lens, shallow depth of field,
true-to-life skin tones, no retouched plastic look.
No readable text on papers or screens, no logos, no watermarks, no extra
people, no distorted hands.
Aspect ratio 16:9, high resolution.
```

Salió bien: buena interacción, cara del asesor fiel y luz creíble.
Problemas: franja gris borrosa a la izquierda con un corte vertical duro,
clienta con blazer (parecía empleada), logo inventado en los papeles, pin de
solapa deformado y un rectángulo negro en el bolsillo.

### 2. Prompt de corrección (5 cambios a la vez)

Imagen base: el resultado del paso 1. Referencia 2: foto original del asesor.

```
Edit the base image. Keep the composition, lighting, wall logo, background desk
and the advisor's pose and expression. The advisor must remain identical to the
man in reference 2: same face, gray suit, white shirt, dark tie, small gold
lapel pin, tie clip and gold watch. Remove the black rectangle on his chest
pocket.

Changes:
1. Replace the blurred gray panel on the left with a natural continuation of
   the same office (light gray wall, soft out-of-focus background), no hard
   edges, no vertical seams. Keep the left third calm and low-detail for text.
2. Dress the woman as a client, not staff: casual soft-colored sweater or
   cardigan over a t-shirt, jeans; a manila envelope with her own papers held
   on her lap. Keep her face, hair and warm smile.
3. Seat her on the opposite side of the desk, facing the advisor in a
   three-quarter view, with the desk clearly between them.
4. Papers on the desk: plain white sheets with blurred gray lines only, no
   logos, no colored headers, no readable text.
5. Natural skin texture, no smoothing.

Photorealistic, same camera and lens, 16:9, high resolution.
```

Mejoró la ropa y los papeles, pero **empeoró la escena**: los dos miraban a
cámara (foto posada), el asesor quedó serio, la franja gris siguió y no movió a
la clienta. **Lección: pedir pocos cambios por pasada.** Este resultado se
descartó; la versión final sale del paso 1.

### 3. Prompts propuestos para pasadas separadas

Se propusieron después del paso 2. **No está confirmado cuáles se usaron**: la
versión final mantiene el blazer, así que el paso 3a probablemente no se aplicó.

3a. Solo ropa y papeles (base: resultado del paso 1):

```
Edit the base image. Change ONLY the following and keep everything else
pixel-identical: both people's poses, gaze direction, expressions, the
advisor's hand gesture, lighting and camera angle.

1. The woman's outfit: replace the navy blazer and blouse with a beige knit
   cardigan over a plain white t-shirt; keep her jeans. Add a manila envelope
   resting on her lap under her hands.
2. Papers on the desk: plain white sheets with faint blurred gray lines, no
   logos, no colored headers, no readable text.

The man must stay identical to reference 2. Keep his lapel pin small and
simple as in reference 2.
```

3b. Rehacer el lado izquierdo (recortar la franja gris y expandir el lienzo):

```
Extend the same office to the left: light gray wall, dark wood bookshelf
slightly out of focus, same lighting. Calm, low-detail area. No people, no
text, no panels.
```

3c. Ganar espacio sobre las cabezas para el recorte del hero:

```
Extend the canvas: add headroom above the people and the wall logo (full logo
visible with margin), and extend the office slightly to the left and right.
Same wall, lighting and perspective. No new people, no text.
```

### 4. Canva (encuadre por versión)

El encuadre final de cada tamaño se hizo en Canva sobre la imagen generada:

- **Desktop 2560×1152:** personas desde x ≈ 41%, foco entre las caras en la
  línea áurea (61.8%, 38.2%), lado izquierdo liso para el texto.
- **Tablet 2048×1152:** personas desde x ≈ 52%. La versión `-1t` todavía
  roza el texto a 768px (pendiente en `CLAUDE.md`).
- **Mobile 1200×1600:** escena en la mitad inferior; arriba, relleno con un
  degradado de colores parecidos para que el degradado oscuro del CSS lo
  oculte y el texto vaya encima.

## Slide 4 — dueño de un negocio junto a su camioneta (2026-11-09)

**Idea:** en vez de otra escena de atención en la oficina, mostrar al
**cliente en su negocio** (el texto habla de "los taxes de tu LLC o negocio").
Rubro elegido: reparaciones y mantenimiento de casas, en un barrio de Las
Vegas (grava, agaves, palmeras, casas estuco). Persona 100% generada, sin foto
base: no usarla en Nosotros ni junto a reseñas.

**Resultado:** `src/assets/images/banners/datamultiservices-ayuda-itin-ein-las-vegas-4{d,t,m}.webp`.

### 1. Primer intento (descartado)

El prompt pedía "RIGHT 45%… strongly out of focus… for website text overlay".
El modelo armó **un panel aparte** a la derecha, muy desenfocado y con un corte
vertical duro. **Lección:** no describir la zona del texto como un bloque con
función; describirla como parte de la escena.

### 2. Prompt final

```
A single continuous wide photograph, one camera, one moment, no split, no
panels, no collage, no vertical seams.

Photorealistic editorial photo. A Hispanic man in his early 40s, owner of a
small home repair and maintenance business, standing at the open tailgate of
his white work pickup truck parked in a residential driveway in Las Vegas.
He is reviewing paperwork for his business: a simple folder of forms and a
tablet resting on the tailgate, a pen in his hand. He looks at the camera
with a calm, confident, friendly half-smile. Work clothes: plain navy work
shirt, a leather tool belt around his waist, no logos.

Framing: the man stands in the left third of the frame, the tailgate and
truck bed extend toward the center. In the truck bed: an aluminum ladder, a
red toolbox and two paint buckets. To the right, the same sunny street
continues naturally into the distance: the front of the truck, the driveway
and sidewalk, and neighboring beige stucco houses with tile roofs and desert
landscaping (decorative gravel, agave, a palm tree), getting smaller with
perspective. The right side of the photo is naturally simple and low-contrast:
plain stucco walls, garage doors, soft sky. Headroom above his head (about 15%
of the height).

Depth of field: the man in sharp focus, the background gently and evenly
soft across the whole frame (f/4), the same softness on the left and the
right. No heavy blur anywhere.

35mm lens, eye level, warm late-afternoon sunlight from the left, long soft
shadows, true-to-life skin texture, no smoothing, no plastic look.
Papers show only faint blurred gray lines, tablet screen dark and
unreadable. No readable text anywhere: no house numbers, no labels on the
paint buckets or toolbox, no lettering on the truck, no license plates, no
street signs. No logos, no flags, no government seals, no watermarks, no
other people, no distorted hands.
Aspect ratio 21:9, high resolution.
```

### 3. Canva

- **Desktop 2560×1152:** la primera versión dejaba el pelo dentro de la franja
  que se recorta desde 1440px (el hero es 2.75:1 y muestra solo el 81% central
  de la altura). Se **alejó la imagen** y se rellenó cielo arriba y calle a la
  derecha: el pelo quedó en y ≈ 34% y no hace falta `desktopPosition`.
- **Tablet 2048×1152:** recorte de la desktop. La primera versión dejaba el
  hombro en x ≈ 52% y a 960px chocaba con el texto (ahí el hero recorta arriba
  y abajo, así que `object-position` no lo arregla). Se movió la foto ~250px a
  la izquierda: hombro en x ≈ 46%, ~40px de aire con el texto a 768 y 960px.
- **Mobile 1200×1600:** desktop al 125%, escena abajo (pelo en y ≈ 700) y
  relleno de cielo arriba; la unión queda bajo el degradado oscuro.

## Plantilla para slides nuevos

1. Si aparece alguien del equipo, partir de una **foto real** como base (nunca generar su cara). Si la escena es de clientes, puede generarse solo con texto.
2. Prompt base como el del slide 1 o el 4, cambiando la escena y el lado libre: los slides 2 y 4 llevan el texto a la **derecha** → personas a la **izquierda**. Describir el lado del texto como parte de la escena, no como "zona para texto".
3. Corregir con **una o dos cosas por pasada**, siempre con la foto original como referencia de identidad.
4. Encuadrar en Canva los tres tamaños según la tabla del `README.md`.
5. Revisar en el navegador (320 → 2560px) y ajustar `mobilePosition` / `tabletPosition` / `desktopPosition` si hace falta.
