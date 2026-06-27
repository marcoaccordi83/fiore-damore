import React, { useState, useEffect, useRef, useCallback } from 'react'

/* ═══════════════════════════════════════════════
   DATI — Fiori con significati romantici
   ═══════════════════════════════════════════════ */
const FIORI = [
  { id: 1,  nome: 'Rosa Rossa',      emoji: '🌹', significato: 'Amore ardente e passione', wikiName: 'Rosa_×_damascena', colore: '#d4a0a0' },
  { id: 2,  nome: 'Ranuncolo',       emoji: '🌸', significato: 'Sei raggiante di fascino', wikiName: 'Ranunculus_asiaticus', colore: '#f0e0b8' },
  { id: 3,  nome: 'Girasole',        emoji: '🌻', significato: 'Adorazione e fedeltà eterna', wikiName: 'Helianthus_annuus', colore: '#f0d060' },
  { id: 4,  nome: 'Gelsomino',       emoji: '🤍', significato: 'Dolcezza e grazia sublime', wikiName: 'Jasminum_officinale', colore: '#e8f0e0' },
  { id: 5,  nome: 'Lavanda',         emoji: '💜', significato: 'Devozione e affetto puro', wikiName: 'Lavandula_angustifolia', colore: '#c8b8d8' },
  { id: 6,  nome: 'Margherita',      emoji: '🌼', significato: 'Innocenza e amore sincero', wikiName: 'Leucanthemum_vulgare', colore: '#f8f0d0' },
  { id: 7,  nome: 'Peonia',          emoji: '🌺', significato: 'Prosperità e amore romantico', wikiName: 'Paeonia_lactiflora', colore: '#e8b0b8' },
  { id: 8,  nome: 'Orchidea',        emoji: '🪷', significato: 'Bellezza rara e lusso delicato', wikiName: 'Orchidaceae', colore: '#d0b8e0' },
  { id: 9,  nome: 'Tulipano Rosso',  emoji: '🌷', significato: 'Dichiarazione d\'amore perfetta', wikiName: 'Tulipa_gesneriana', colore: '#d08080' },
  { id: 10, nome: 'Viola del Pensiero', emoji: '🌸', significato: 'Pensieri amorevoli per te', wikiName: 'Viola_tricolor', colore: '#b8a0d0' },
  { id: 11, nome: 'Glicine',         emoji: '💜', significato: 'Tenerezza appassionata', wikiName: 'Wisteria_sinensis', colore: '#c0a8d8' },
  { id: 12, nome: 'Camelia',         emoji: '🌸', significato: 'Adorazione e perfezione', wikiName: 'Camellia_japonica', colore: '#e8b0c0' },
]

const FIORE_DEL_GIORNO = FIORI[new Date().getDate() % FIORI.length]

const imageCache = {}

async function callAnthropic(messages, system = '', tools = null) {
  const body = {
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    messages,
  }
  if (system) body.system = system
  if (tools) body.tools = tools

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

/* ═══════════════════════════════════════════════
   HOOK — Prompt installazione PWA
   ═══════════════════════════════════════════════ */
function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    if (isStandalone) { setIsInstalled(true); return }

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setIsInstallable(false)
    })
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setIsInstalled(true)
    setDeferredPrompt(null)
    setIsInstallable(false)
  }

  return { isInstallable, isInstalled, install }
}

/* ═══════════════════════════════════════════════
   COMPONENTE — Splash / Pagina di benvenuto
   ═══════════════════════════════════════════════ */
function SplashScreen({ onEntra, isInstallable, install }) {
  const [petali, setPetali] = useState([])

  useEffect(() => {
    const p = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 6,
      dur: 6 + Math.random() * 6,
      size: 10 + Math.random() * 16,
      emoji: ['🌸','🌺','🌼','🌷','🤍','💐'][Math.floor(Math.random() * 6)],
    }))
    setPetali(p)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #faf8f5 0%, #eef2eb 40%, #f5f0ea 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
      textAlign: 'center',
    }}>
      {/* Petali animati */}
      <style>{`
        @keyframes petaloFloat {
          0%   { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
          10%  { opacity: 0.7; }
          90%  { opacity: 0.4; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(180,150,120,0.3); }
          50%       { box-shadow: 0 0 40px rgba(180,150,120,0.6); }
        }
        .splash-btn {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .splash-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(140,110,80,0.4) !important;
        }
        .splash-btn:active { transform: translateY(0); }
      `}</style>

      {petali.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`,
          top: '-5%',
          fontSize: `${p.size}px`,
          animation: `petaloFloat ${p.dur}s ${p.delay}s infinite linear`,
          pointerEvents: 'none',
          zIndex: 0,
        }}>{p.emoji}</div>
      ))}

      {/* Contenuto */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 380 }}>

        {/* Icona */}
        <div style={{
          animation: 'fadeInUp 0.8s ease both',
          marginBottom: '1.5rem',
        }}>
          <img
            src="icons/icon-192x192.png"
            alt="Il Linguaggio dei Fiori"
            style={{
              width: 120,
              height: 120,
              borderRadius: 28,
              animation: 'pulseGlow 3s ease-in-out infinite',
              boxShadow: '0 8px 32px rgba(140,110,80,0.25)',
            }}
          />
        </div>

        {/* Titolo */}
        <div style={{ animation: 'fadeInUp 0.8s 0.2s ease both', opacity: 0 }}>
          <p style={{ color: '#a89888', fontSize: '0.8rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            un dono d'amore
          </p>
          <h1 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(1.8rem, 6vw, 2.4rem)',
            color: '#4a3f35',
            fontWeight: 400,
            lineHeight: 1.3,
            marginBottom: '0.5rem',
          }}>
            Il Linguaggio<br />dei Fiori
          </h1>
          <div style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>🌸🌿🌸</div>
        </div>

        {/* Citazione */}
        <div style={{ animation: 'fadeInUp 0.8s 0.4s ease both', opacity: 0, margin: '1.5rem 0' }}>
          <p style={{
            fontStyle: 'italic',
            color: '#7a6a5a',
            fontSize: '1rem',
            lineHeight: 1.7,
            padding: '1rem 1.2rem',
            background: 'rgba(255,255,255,0.6)',
            borderRadius: 16,
            borderLeft: '3px solid #c9a99a',
          }}>
            "Ogni fiore porta con sé un segreto,<br />
            una parola d'amore che attende<br />
            di essere sussurrata."
          </p>
        </div>

        {/* Pulsanti */}
        <div style={{ animation: 'fadeInUp 0.8s 0.6s ease both', opacity: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>

          {/* Bottone Entra */}
          <button
            className="splash-btn"
            onClick={onEntra}
            style={{
              background: 'linear-gradient(135deg, #c9a99a, #b8997a)',
              color: 'white',
              border: 'none',
              borderRadius: 50,
              padding: '1rem 2rem',
              fontSize: '1.05rem',
              fontFamily: 'Georgia, serif',
              cursor: 'pointer',
              letterSpacing: '0.05em',
              boxShadow: '0 4px 20px rgba(180,140,110,0.4)',
            }}
          >
            🌸 Entra nel Giardino
          </button>

          {/* Bottone Installa (Android/Chrome) */}
          {isInstallable && (
            <button
              className="splash-btn"
              onClick={install}
              style={{
                background: 'rgba(255,255,255,0.8)',
                color: '#7a6a5a',
                border: '1.5px solid #c9a99a',
                borderRadius: 50,
                padding: '0.9rem 2rem',
                fontSize: '0.95rem',
                fontFamily: 'Georgia, serif',
                cursor: 'pointer',
                letterSpacing: '0.03em',
              }}
            >
              📲 Installa sul telefono
            </button>
          )}

          {/* Suggerimento iOS */}
          {!isInstallable && (
            <p style={{ fontSize: '0.78rem', color: '#a89888', lineHeight: 1.6 }}>
              🍎 Su iPhone: tocca <strong>Condividi</strong> →<br />
              <strong>"Aggiungi a schermata Home"</strong>
            </p>
          )}
        </div>

      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   COMPONENTE — Musica Ambient
   ═══════════════════════════════════════════════ */
function MusicPlayer() {
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const toneRef = useRef(null)

  const startMusic = useCallback(async () => {
    setLoading(true)
    try {
      const Tone = await import('tone')
      await Tone.start()

      const reverb = new Tone.Reverb({ decay: 4, wet: 0.5 }).toDestination()
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.3, decay: 0.5, sustain: 0.4, release: 2 },
        volume: -16,
      }).connect(reverb)

      const notes = ['E4','G4','B4','D5','E5','G5','B5','D6']
      let i = 0
      const seq = new Tone.Sequence((time) => {
        const chord = [notes[i % notes.length], notes[(i+2) % notes.length]]
        synth.triggerAttackRelease(chord, '2n', time)
        i++
      }, [0], '2n')

      Tone.getTransport().bpm.value = 60
      seq.start(0)
      Tone.getTransport().start()
      toneRef.current = { synth, seq, reverb, Tone }
      setPlaying(true)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }, [])

  const stopMusic = useCallback(() => {
    if (toneRef.current) {
      const { synth, seq, reverb, Tone } = toneRef.current
      seq.stop()
      Tone.getTransport().stop()
      synth.dispose()
      reverb.dispose()
      seq.dispose()
      toneRef.current = null
    }
    setPlaying(false)
  }, [])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.6rem',
      background: 'rgba(255,255,255,0.5)',
      border: '1px solid #ddd0c0',
      borderRadius: 50,
      padding: '0.5rem 1rem',
      cursor: 'pointer',
      userSelect: 'none',
    }} onClick={playing ? stopMusic : startMusic}>
      {loading ? (
        <span style={{ fontSize: '0.8rem', color: '#a89888' }}>♩ carico…</span>
      ) : (
        <>
          <span style={{ fontSize: '1rem' }}>{playing ? '⏸' : '▶'}</span>
          <span style={{ fontSize: '0.78rem', color: '#7a6a5a', fontStyle: 'italic' }}>
            {playing ? 'Pausa musica' : 'Musica romantica'}
          </span>
          {playing && (
            <span style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 14 }}>
              {[1,2,3,4].map(b => (
                <div key={b} style={{
                  width: 3, background: '#c9a99a', borderRadius: 2,
                  height: `${6 + b * 2}px`,
                  animation: `eq${b} ${0.5 + b * 0.15}s ease-in-out infinite alternate`,
                }} />
              ))}
            </span>
          )}
        </>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   COMPONENTE — Fiore del Giorno
   ═══════════════════════════════════════════════ */
function FioreDelGiorno() {
  const [poesia, setPoesia] = useState('')
  const [loading, setLoading] = useState(false)
  const [imgUrl, setImgUrl] = useState(null)
  const [imgLoading, setImgLoading] = useState(false)
  const fiore = FIORE_DEL_GIORNO

  useEffect(() => { caricaImmagine() }, [])

  const caricaImmagine = async () => {
    if (imageCache[fiore.id]) { setImgUrl(imageCache[fiore.id]); return }
    setImgLoading(true)
    try {
      const data = await callAnthropic([{
        role: 'user',
        content: `Trova l'URL diretto di una fotografia botanica reale di "${fiore.nome}" (${fiore.wikiName}). 
Usa web_search per trovare un URL .jpg o .png da Wikimedia Commons o Unsplash CDN.
Rispondi SOLO con l'URL, senza altro testo.`
      }], '', [{ type: 'web_search_20250305', name: 'web_search' }])

      const url = data.content?.find(b => b.type === 'text')?.text?.trim()
      if (url && url.startsWith('http')) {
        imageCache[fiore.id] = url
        setImgUrl(url)
      }
    } catch (e) { console.error(e) }
    setImgLoading(false)
  }

  const generaPoesia = async () => {
    setLoading(true)
    setPoesia('')
    const data = await callAnthropic([{
      role: 'user',
      content: `Scrivi una breve poesia d'amore (4-6 versi, in italiano) ispirata al "${fiore.nome}" che simboleggia "${fiore.significato}". 
Tono dolce, romantico, poetico. Solo la poesia, senza titolo né spiegazioni.`
    }])
    const testo = data.content?.find(b => b.type === 'text')?.text || ''
    setPoesia(testo)
    setLoading(false)
  }

  return (
    <section style={{
      background: 'white',
      borderRadius: 24,
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(140,110,80,0.1)',
      marginBottom: '1.5rem',
    }}>
      {/* Immagine fiore */}
      <div style={{
        height: 200,
        background: `linear-gradient(135deg, ${fiore.colore}40, ${fiore.colore}80)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {imgLoading ? (
          <span style={{ fontSize: '3rem' }}>{fiore.emoji}</span>
        ) : imgUrl ? (
          <img src={imgUrl} alt={fiore.nome} onError={() => setImgUrl(null)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '4rem' }}>{fiore.emoji}</span>
        )}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
          padding: '1rem',
        }}>
          <h2 style={{ color: 'white', fontFamily: 'Georgia', fontSize: '1.4rem', fontWeight: 400 }}>
            {fiore.nome}
          </h2>
        </div>
      </div>

      <div style={{ padding: '1.2rem' }}>
        <p style={{ color: '#a89888', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
          Il fiore di oggi dice…
        </p>
        <p style={{ color: '#7a6a5a', fontStyle: 'italic', fontSize: '1rem', marginBottom: '1rem' }}>
          "{fiore.significato}"
        </p>

        {poesia ? (
          <div style={{
            background: '#faf8f5',
            borderRadius: 12,
            padding: '1rem',
            borderLeft: '3px solid #c9a99a',
            fontStyle: 'italic',
            color: '#4a3f35',
            lineHeight: 1.8,
            whiteSpace: 'pre-line',
            marginBottom: '0.8rem',
          }}>{poesia}</div>
        ) : (
          <button onClick={generaPoesia} disabled={loading} style={{
            background: loading ? '#e8d5c4' : 'linear-gradient(135deg, #c9a99a, #b8997a)',
            color: 'white', border: 'none', borderRadius: 50,
            padding: '0.7rem 1.5rem', fontSize: '0.9rem',
            fontFamily: 'Georgia', cursor: loading ? 'default' : 'pointer',
            width: '100%',
          }}>
            {loading ? '✨ Componendo…' : '✨ Genera poesia d\'amore'}
          </button>
        )}
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════
   COMPONENTE — Costruttore di Bouquet
   ═══════════════════════════════════════════════ */
function Bouquet() {
  const [selezionati, setSelezionati] = useState([])
  const [messaggio, setMessaggio] = useState('')
  const [loading, setLoading] = useState(false)

  const toggle = (fiore) => {
    setSelezionati(prev => {
      if (prev.find(f => f.id === fiore.id)) return prev.filter(f => f.id !== fiore.id)
      if (prev.length >= 5) return prev
      return [...prev, fiore]
    })
    setMessaggio('')
  }

  const generaMessaggio = async () => {
    if (selezionati.length === 0) return
    setLoading(true)
    setMessaggio('')
    const lista = selezionati.map(f => `${f.nome} (${f.significato})`).join(', ')
    const data = await callAnthropic([{
      role: 'user',
      content: `Scrivi un messaggio romantico (3-4 frasi poetiche, in italiano) ispirato a questo bouquet di fiori: ${lista}.
Combina i significati in modo poetico e tenero. Solo il messaggio, senza titolo.`
    }])
    setMessaggio(data.content?.find(b => b.type === 'text')?.text || '')
    setLoading(false)
  }

  return (
    <section style={{
      background: 'white',
      borderRadius: 24,
      padding: '1.2rem',
      boxShadow: '0 4px 24px rgba(140,110,80,0.1)',
      marginBottom: '1.5rem',
    }}>
      <h2 style={{ fontFamily: 'Georgia', color: '#4a3f35', fontWeight: 400, marginBottom: '0.3rem', fontSize: '1.2rem' }}>
        💐 Il Tuo Bouquet
      </h2>
      <p style={{ color: '#a89888', fontSize: '0.82rem', marginBottom: '1rem' }}>
        Scegli fino a 5 fiori per creare il tuo messaggio segreto
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
        {FIORI.map(f => {
          const sel = !!selezionati.find(s => s.id === f.id)
          return (
            <button key={f.id} onClick={() => toggle(f)} style={{
              background: sel ? `${f.colore}60` : '#faf8f5',
              border: sel ? `1.5px solid ${f.colore}` : '1.5px solid #e8e0d8',
              borderRadius: 50,
              padding: '0.4rem 0.8rem',
              fontSize: '0.82rem',
              color: sel ? '#4a3f35' : '#7a6a5a',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'Georgia',
            }}>
              {f.emoji} {f.nome}
            </button>
          )
        })}
      </div>

      {selezionati.length > 0 && (
        <>
          <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
            {selezionati.map(f => (
              <span key={f.id} style={{ fontSize: '1.5rem' }}>{f.emoji}</span>
            ))}
          </div>

          {messaggio ? (
            <div style={{
              background: '#faf8f5', borderRadius: 12, padding: '1rem',
              borderLeft: '3px solid #b8c4ae', fontStyle: 'italic',
              color: '#4a3f35', lineHeight: 1.8, marginBottom: '0.8rem',
            }}>{messaggio}</div>
          ) : null}

          <button onClick={generaMessaggio} disabled={loading} style={{
            background: loading ? '#e8d5c4' : 'linear-gradient(135deg, #b8c4ae, #9aae90)',
            color: 'white', border: 'none', borderRadius: 50,
            padding: '0.7rem 1.5rem', fontSize: '0.9rem',
            fontFamily: 'Georgia', cursor: loading ? 'default' : 'pointer',
            width: '100%',
          }}>
            {loading ? '🌸 Componendo il messaggio…' : '🌸 Crea il messaggio del bouquet'}
          </button>
        </>
      )}
    </section>
  )
}

/* ═══════════════════════════════════════════════
   COMPONENTE — Storia & Curiosità
   ═══════════════════════════════════════════════ */
function StoriaSection() {
  const [aperto, setAperto] = useState(false)
  const curiosita = [
    { titolo: '🏰 L\'era vittoriana', testo: 'Nel XIX secolo in Inghilterra nacque la floriografia: l\'arte di comunicare sentimenti attraverso i fiori. Le dame di corte scambiavano bouquet come messaggi cifrati d\'amore.' },
    { titolo: '🌹 La rosa e i suoi segreti', testo: 'Una rosa rossa significava amore ardente, ma il numero petali nascondeva messaggi nascosti. Dodici rose dichiaravano un amore eterno e completo.' },
    { titolo: '📚 Il Linguaggio dei Fiori (1884)', testo: 'Nel 1884 venne pubblicato il celebre dizionario dei fiori di Kate Greenaway, che codificò oltre 700 significati floreali diventando la bibbia della floriografia.' },
    { titolo: '🌸 Tradizioni nel mondo', testo: 'In Giappone il "Hanakotoba" attribuisce significati profondi ai fiori: il crisantemo è simbolo di longevità, la ciliegio di bellezza effimera e amore puro.' },
  ]

  return (
    <section style={{
      background: 'white',
      borderRadius: 24,
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(140,110,80,0.1)',
      marginBottom: '1.5rem',
    }}>
      <button onClick={() => setAperto(!aperto)} style={{
        width: '100%', background: 'none', border: 'none',
        padding: '1.2rem', textAlign: 'left', cursor: 'pointer',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontFamily: 'Georgia', color: '#4a3f35', fontSize: '1.1rem' }}>
          📖 Storia & Curiosità
        </span>
        <span style={{ color: '#c9a99a', fontSize: '1.2rem' }}>{aperto ? '▲' : '▼'}</span>
      </button>

      {aperto && (
        <div style={{ padding: '0 1.2rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {curiosita.map((c, i) => (
            <div key={i} style={{
              background: '#faf8f5', borderRadius: 12, padding: '0.8rem',
              borderLeft: '3px solid #ddd0c0',
            }}>
              <h3 style={{ color: '#7a6a5a', fontSize: '0.9rem', marginBottom: '0.3rem' }}>{c.titolo}</h3>
              <p style={{ color: '#4a3f35', fontSize: '0.85rem', lineHeight: 1.7 }}>{c.testo}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/* ═══════════════════════════════════════════════
   APP PRINCIPALE
   ═══════════════════════════════════════════════ */
export default function App() {
  const { isInstallable, isInstalled, install } = usePWAInstall()
  const [entrata, setEntrata] = useState(false)

  // Se già installata come PWA, entra direttamente
  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    if (standalone || isInstalled) setEntrata(true)
  }, [isInstalled])

  if (!entrata) {
    return (
      <SplashScreen
        onEntra={() => setEntrata(true)}
        isInstallable={isInstallable}
        install={install}
      />
    )
  }

  return (
    <>
      <style>{`
        @keyframes eq1 { from { height: 4px; } to { height: 12px; } }
        @keyframes eq2 { from { height: 8px; } to { height: 5px; } }
        @keyframes eq3 { from { height: 5px; } to { height: 14px; } }
        @keyframes eq4 { from { height: 12px; } to { height: 4px; } }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #faf8f5 0%, #eef2eb 50%, #f5f0ea 100%)',
        paddingBottom: '2rem',
      }}>
        {/* Header */}
        <header style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #ece5dc',
          padding: '1rem 1.2rem',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <img src="icons/icon-72x72.png" alt="" style={{ width: 36, height: 36, borderRadius: 10 }} />
            <div>
              <h1 style={{ fontFamily: 'Georgia', fontSize: '1.05rem', color: '#4a3f35', fontWeight: 400 }}>
                Il Linguaggio dei Fiori
              </h1>
              <p style={{ fontSize: '0.7rem', color: '#a89888', letterSpacing: '0.1em' }}>
                {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
          <MusicPlayer />
        </header>

        {/* Contenuto */}
        <main style={{ maxWidth: 480, margin: '0 auto', padding: '1.2rem' }}>
          <FioreDelGiorno />
          <Bouquet />
          <StoriaSection />

          {/* Footer */}
          <p style={{
            textAlign: 'center', color: '#c9a99a', fontSize: '0.78rem',
            fontStyle: 'italic', marginTop: '0.5rem',
          }}>
            Fatto con amore 🌸
          </p>
        </main>
      </div>
    </>
  )
}
