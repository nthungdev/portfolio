interface OgFrameProps {
  eyebrow: string
  title: string
  subtitle: string
}

/** Blueprint-style 1200x630 card for `next/og`; system fonts only. */
export function OgFrame({ eyebrow, title, subtitle }: OgFrameProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        color: '#e8f1ff',
        backgroundColor: '#0d2440',
        backgroundImage:
          // Satori needs explicit color stops; a bare "1px, transparent 1px" pair fails to parse.
          'linear-gradient(0deg, rgba(147,180,220,0.12) 0px, rgba(147,180,220,0.12) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 48px), linear-gradient(90deg, rgba(147,180,220,0.12) 0px, rgba(147,180,220,0.12) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 48px)',
        backgroundSize: '48px 48px',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: 28,
          letterSpacing: 4,
          textTransform: 'uppercase',
          color: '#5ad1ff',
        }}
      >
        {eyebrow}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            fontSize: 108,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 28,
            fontSize: 34,
            lineHeight: 1.3,
            color: '#93b4dc',
            maxWidth: 960,
          }}
        >
          {subtitle}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          height: 6,
          width: 200,
          backgroundColor: '#5ad1ff',
        }}
      />
    </div>
  )
}
