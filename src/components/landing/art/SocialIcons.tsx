// Glifos propios y minimalistas (no los logotipos oficiales) para no
// reproducir marcas registradas de terceros en un mockup.
type IconProps = { className?: string }

export function IconFacebook({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M14,8 h-1.5 A2,2 0 0 0 10.5,10 v2 H9 v2.5 h1.5 V21 H13 v-6.5 h2 l0.5,-2.5 h-2.5 V10 c0,-0.4 0.2,-0.6 0.6,-0.6 H14 Z" />
    </svg>
  )
}

export function IconInstagram({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconLinkedIn({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <line x1="7.5" y1="10" x2="7.5" y2="17" />
      <circle cx="7.5" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
      <path d="M11,17 v-4.5 c0,-1.5 1,-2.5 2.3,-2.5 s2.2,1 2.2,2.5 V17" />
    </svg>
  )
}

export function IconGoogle({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 12h5.5a5.5 5.5 0 1 1-1.7-4" strokeLinecap="round" />
    </svg>
  )
}

export function IconApple({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
      <path d="M15.8 8.1c-.9-1-2.1-1.1-2.6-1.1-1 0-1.9.6-2.5.6-.6 0-1.4-.6-2.3-.6-1.2 0-2.6.7-3.3 1.9-1.4 2.4-.4 6 1 8 .7 1 1.5 2.1 2.6 2.1 1 0 1.4-.6 2.7-.6 1.2 0 1.6.6 2.7.6 1.1 0 1.9-1 2.6-2 .5-.7.8-1.4.9-1.7-.1 0-2-.8-2-3 0-1.9 1.5-2.8 1.6-2.9-.8-1.2-2-1.3-2.4-1.3Z" />
      <path d="M13.6 4.5c.5-.6.8-1.4.7-2.2-.7 0-1.6.5-2.1 1.1-.5.5-.9 1.3-.7 2.1.9.1 1.6-.4 2.1-1Z" />
    </svg>
  )
}

export function IconWhatsApp({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M12,3 a9,9 0 1 0 5.2,16.3 L21,20 l-0.9,-3.6 A9,9 0 0 0 12,3 Z" />
      <path
        d="M8.6,8.4 c0.4,-0.5 0.8,-0.5 1.1,-0.5 c0.3,0 0.5,0 0.7,0.5 c0.2,0.5 0.7,1.6 0.7,1.7 c0.1,0.1 0.1,0.3 0,0.4 c-0.4,0.7 -0.8,0.7 -0.5,1.2 c0.9,1.5 1.8,2 3.1,2.6 c0.2,0.1 0.4,0.1 0.5,-0.1 c0.2,-0.2 0.6,-0.7 0.8,-0.9 c0.2,-0.2 0.4,-0.2 0.6,-0.1 c0.2,0.1 1.5,0.7 1.7,0.8 c0.2,0.1 0.4,0.2 0.4,0.3 c0.1,0.4 -0.1,1.1 -0.5,1.5 c-0.5,0.5 -1.4,0.8 -2,0.6 c-1.5,-0.3 -3.4,-1.1 -4.7,-2.5 c-1.3,-1.3 -1.9,-2.5 -2.3,-3.3 c-0.3,-0.7 -0.1,-1.5 0.4,-2.2 Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  )
}
