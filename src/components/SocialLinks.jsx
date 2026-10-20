import React from 'react';
import { MessageCircle, ExternalLink, Send } from 'lucide-react';

export const SOCIAL_LINKS = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    handle: '+91-9253330335',
    url: 'https://wa.me/+919253330335',
    category: 'Instant Chat',
    brandColor: '#25D366',
    brandHoverBg: 'hover:bg-[#25D366] hover:text-white',
    badge: 'Fastest Support',
    svg: (props = {}) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" {...props}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    )
  },
  {
    id: 'telegram',
    name: 'Telegram',
    handle: '@itpracticetests',
    url: 'https://t.me/itpracticetests',
    category: 'Community Channel',
    brandColor: '#229ED9',
    brandHoverBg: 'hover:bg-[#229ED9] hover:text-white',
    badge: 'Exam Alerts',
    svg: (props = {}) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" {...props}>
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.941z" />
      </svg>
    )
  },
  {
    id: 'youtube',
    name: 'YouTube',
    handle: '@ITPracticeTests',
    url: 'https://www.youtube.com/@ITPracticeTests',
    category: 'Video Tutorials',
    brandColor: '#FF0000',
    brandHoverBg: 'hover:bg-[#FF0000] hover:text-white',
    badge: 'Video Explanations',
    svg: (props = {}) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" {...props}>
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    )
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    handle: 'itpracticetests',
    url: 'https://www.linkedin.com/in/itpracticetests/',
    category: 'Professional Network',
    brandColor: '#0A66C2',
    brandHoverBg: 'hover:bg-[#0A66C2] hover:text-white',
    badge: 'Career Tips',
    svg: (props = {}) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" {...props}>
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    )
  },
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@itpracticetests',
    url: 'https://www.instagram.com/itpracticetests/',
    category: 'Daily Quizzes & Reels',
    brandColor: '#E1306C',
    brandHoverBg: 'hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 hover:text-white',
    badge: 'Exam Quizzes',
    svg: (props = {}) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" {...props}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    )
  },
  {
    id: 'facebook',
    name: 'Facebook',
    handle: 'ITPracticeTestsdotcomm',
    url: 'https://www.facebook.com/ITPracticeTestsdotcomm',
    category: 'Official Page',
    brandColor: '#1877F2',
    brandHoverBg: 'hover:bg-[#1877F2] hover:text-white',
    badge: 'Study Group',
    svg: (props = {}) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" {...props}>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    )
  },
  {
    id: 'x',
    name: 'X.com',
    handle: '@TeacherSoniya',
    url: 'https://x.com/TeacherSoniya',
    category: 'Latest Updates',
    brandColor: '#000000',
    brandHoverBg: 'hover:bg-black hover:text-white',
    badge: 'Official X',
    svg: (props = {}) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" {...props}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )
  },
  {
    id: 'twitter',
    name: 'Twitter',
    handle: '@TeacherSoniya',
    url: 'https://twitter.com/TeacherSoniya',
    category: 'Tech Tweets',
    brandColor: '#1DA1F2',
    brandHoverBg: 'hover:bg-[#1DA1F2] hover:text-white',
    badge: 'Exam News',
    svg: (props = {}) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" {...props}>
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z" />
      </svg>
    )
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    handle: 'ITPracticeTests',
    url: 'https://in.pinterest.com/ITPracticeTests/',
    category: 'Infographics & Notes',
    brandColor: '#BD081C',
    brandHoverBg: 'hover:bg-[#BD081C] hover:text-white',
    badge: 'Cheat Sheets',
    svg: (props = {}) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" {...props}>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
      </svg>
    )
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    handle: 'itpracticetests',
    url: 'https://www.snapchat.com/add/itpracticetests',
    category: 'Exam Stories & Flashcards',
    brandColor: '#FFFC00',
    brandHoverBg: 'hover:bg-[#FFFC00] hover:text-black',
    badge: 'Daily Snaps',
    svg: (props = {}) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" {...props}>
        <path d="M12.001 0C5.373 0 .001 5.373.001 12c0 5.302 3.438 9.8 8.207 11.387-.047-.323-.075-.658-.075-1.003 0-1.07.387-2.072 1.04-2.855-1.012-.663-1.685-1.79-1.685-3.085 0-.495.1-1.04.28-1.554-1.118-.891-1.84-2.278-1.84-3.834 0-2.738 2.219-4.957 4.957-4.957s4.957 2.219 4.957 4.957c0 1.556-.722 2.943-1.84 3.834.18.514.28 1.059.28 1.554 0 1.295-.673 2.422-1.685 3.085.653.783 1.04 1.785 1.04 2.855 0 .345-.028.68-.075 1.003 4.769-1.587 8.207-6.085 8.207-11.387 0-6.627-5.373-12-12-12z" />
      </svg>
    )
  }
];

/**
 * Modern, responsive Social Icon Grid / Ribbon for Footer & Pages
 */
export default function SocialLinksBar({
  variant = 'footer',
  className = '',
  title = 'Connect with ITPracticeTests on Social Media'
}) {
  if (variant === 'cards') {
    return (
      <div className={`space-y-4 ${className}`}>
        {title && (
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-udemy-dark flex items-center space-x-2">
              <span>{title}</span>
            </h3>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
              Official Channels (10 Platforms)
            </span>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {SOCIAL_LINKS.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-3.5 bg-white border border-slate-200 hover:border-purple-500 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center space-x-3 text-left"
              title={`${item.name}: ${item.handle}`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-xs"
                style={{ backgroundColor: `${item.brandColor}15`, color: item.brandColor }}
              >
                {item.svg({ className: 'w-5 h-5' })}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-udemy-dark group-hover:text-purple-700 truncate">
                    {item.name}
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-purple-600 shrink-0 ml-1 opacity-0 group-hover:opacity-100 transition" />
                </div>
                <div className="text-[11px] text-slate-500 truncate">{item.handle}</div>
                <span className="inline-block mt-0.5 text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                  {item.badge}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'header') {
    return (
      <div className={`flex items-center space-x-1.5 ${className}`}>
        {SOCIAL_LINKS.slice(0, 6).map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-6 h-6 rounded-md flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition"
            title={`${item.name} (${item.handle})`}
            aria-label={item.name}
          >
            {item.svg({ className: 'w-3.5 h-3.5' })}
          </a>
        ))}
      </div>
    );
  }

  // Default: Footer Ribbon with rich tooltips, vibrant interactive badges
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block">
            Stay Connected &amp; Follow Official Updates
          </span>
          <span className="text-sm font-semibold text-white">
            Official Social Media &amp; Support Channels
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Active Daily: Daily Quizzes, Study Notes &amp; Exam Updates</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {SOCIAL_LINKS.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center space-x-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 hover:border-slate-500 px-3 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm hover:scale-[1.03] active:scale-95"
            title={`${item.name} (${item.handle}) - ${item.category}`}
            aria-label={`${item.name} channel`}
          >
            <span
              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors shadow-xs"
              style={{ backgroundColor: `${item.brandColor}25`, color: item.brandColor }}
            >
              {item.svg({ className: 'w-3.5 h-3.5' })}
            </span>
            <span className="group-hover:text-white transition">{item.name}</span>
            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-purple-300 opacity-60 group-hover:opacity-100 transition" />
          </a>
        ))}
      </div>
    </div>
  );
}

/**
 * Floating Quick Contact Badge (WhatsApp + Telegram + YouTube)
 */
export function FloatingQuickConnect() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-2 font-sans select-none print:hidden">
      {/* Expanded quick links tray */}
      {isOpen && (
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl p-3 w-64 space-y-2 mb-1 animate-fadeIn border-t-4 border-t-emerald-500">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-extrabold text-udemy-dark flex items-center space-x-1">
              <span>Quick Connect</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">Online Support</span>
          </div>

          <a
            href="https://wa.me/+919253330335"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2.5 p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 transition text-xs font-bold"
          >
            <div className="w-7 h-7 rounded-lg bg-[#25D366] text-white flex items-center justify-center shrink-0">
              {SOCIAL_LINKS[0].svg({ className: 'w-4 h-4' })}
            </div>
            <div className="min-w-0 flex-1">
              <div>WhatsApp Chat</div>
              <div className="text-[10px] text-emerald-700 font-normal">Instant Help &amp; Exam Guidance</div>
            </div>
          </a>

          <a
            href="https://t.me/itpracticetests"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2.5 p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 transition text-xs font-bold"
          >
            <div className="w-7 h-7 rounded-lg bg-[#229ED9] text-white flex items-center justify-center shrink-0">
              {SOCIAL_LINKS[1].svg({ className: 'w-4 h-4' })}
            </div>
            <div className="min-w-0 flex-1">
              <div>Telegram Channel</div>
              <div className="text-[10px] text-sky-700 font-normal">Free Exam Qs &amp; Updates</div>
            </div>
          </a>

          <a
            href="https://www.youtube.com/@ITPracticeTests"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2.5 p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 transition text-xs font-bold"
          >
            <div className="w-7 h-7 rounded-lg bg-[#FF0000] text-white flex items-center justify-center shrink-0">
              {SOCIAL_LINKS[2].svg({ className: 'w-4 h-4' })}
            </div>
            <div className="min-w-0 flex-1">
              <div>YouTube Masterclasses</div>
              <div className="text-[10px] text-rose-700 font-normal">Video Question Walkthroughs</div>
            </div>
          </a>
        </div>
      )}

      {/* Main trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Instant Chat Support on WhatsApp & Telegram"
        className="group relative flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs px-4 py-3 rounded-full shadow-2xl hover:shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 border-2 border-white/20 cursor-pointer"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <div className="w-5 h-5 flex items-center justify-center">
          {SOCIAL_LINKS[0].svg({ className: 'w-5 h-5' })}
        </div>
        <span className="hidden sm:inline">Chat on WhatsApp</span>
      </button>
    </div>
  );
}
