// verseService.ts - Obtención de versículos en español con fallback local

export interface Verse {
  text: string;
  reference: string;
}

const LOCAL_SPANISH_VERSES: Verse[] = [
  { text: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.', reference: 'Juan 3:16' },
  { text: 'Jehová es mi pastor; nada me faltará.', reference: 'Salmos 23:1' },
  { text: 'Todo lo puedo en Cristo que me fortalece.', reference: 'Filipenses 4:13' },
  { text: 'Clama a mí, y yo te responderé, y te enseñaré cosas grandes y ocultas que tú no conoces.', reference: 'Jeremías 33:3' },
  { text: 'El Señor es mi luz y mi salvación; ¿de quién temeré?', reference: 'Salmos 27:1' },
  { text: 'Encomienda a Jehová tu camino, y confía en él; y él hará.', reference: 'Salmos 37:5' },
  { text: 'Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.', reference: 'Mateo 6:33' },
  { text: 'Echando toda vuestra ansiedad sobre él, porque él tiene cuidado de vosotros.', reference: '1 Pedro 5:7' },
  { text: 'No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo.', reference: 'Isaías 41:10' },
  { text: 'El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente.', reference: 'Salmos 91:1' },
];

function getRandomLocalVerse(): Verse {
  const i = Math.floor(Math.random() * LOCAL_SPANISH_VERSES.length);
  return LOCAL_SPANISH_VERSES[i];
}

export async function fetchSpanishVerse(): Promise<Verse> {
  try {
    const res = await fetch('https://beta.ourmanna.com/api/v1/get/?format=json&lang=es');
    if (res.ok) {
      const data = await res.json();
      const details = data?.verse?.details;
      const text: string | undefined = details?.text;
      const reference: string | undefined = details?.reference;
      if (text && reference) {
        return { text, reference };
      }
    }
  } catch {}
  return getRandomLocalVerse();
} 