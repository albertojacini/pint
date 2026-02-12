import type { Meta, StoryObj } from '@storybook/react'
import { X } from 'lucide-react'

const meta: Meta = {
  title: 'Custom-UI/TagsExperiments',
  parameters: {
    layout: 'padded',
  },
}

export default meta

const sampleTags = ['Housing', 'Transport', 'Education', 'Healthcare', 'Environment']

const tagColors: Record<string, { bg: string; text: string; border: string; borderL: string; dot: string }> = {
  Housing: { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-700', borderL: 'border-l-blue-500', dot: 'bg-blue-500' },
  Transport: { bg: 'bg-amber-100 dark:bg-amber-950', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-700', borderL: 'border-l-amber-500', dot: 'bg-amber-500' },
  Education: { bg: 'bg-violet-100 dark:bg-violet-950', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-300 dark:border-violet-700', borderL: 'border-l-violet-500', dot: 'bg-violet-500' },
  Healthcare: { bg: 'bg-emerald-100 dark:bg-emerald-950', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-700', borderL: 'border-l-emerald-500', dot: 'bg-emerald-500' },
  Environment: { bg: 'bg-rose-100 dark:bg-rose-950', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-300 dark:border-rose-700', borderL: 'border-l-rose-500', dot: 'bg-rose-500' },
}

function TagsPlayground() {
  return (
    <div className="space-y-10 max-w-2xl">
      {/* ── Current Style ───────────────────────────────────── */}
      <section>
        <h3 className="text-lg font-semibold mb-1">Current</h3>
        <p className="text-xs text-muted-foreground mb-3">Muted pill (what we have now)</p>
        <div className="flex flex-wrap gap-1.5">
          {sampleTags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── 1: Soft Colored Pills ───────────────────────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">1. Soft colored pills</p>
        <div className="flex flex-wrap gap-1.5">
          {sampleTags.map((tag) => (
            <span key={tag} className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${tagColors[tag].bg} ${tagColors[tag].text}`}>
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── 2: Outlined Pills ───────────────────────────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">2. Outlined pills</p>
        <div className="flex flex-wrap gap-1.5">
          {sampleTags.map((tag) => (
            <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs font-medium border border-border text-foreground/70">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── 3: Outlined Colored Pills ──────────────────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">3. Outlined colored pills</p>
        <div className="flex flex-wrap gap-1.5">
          {sampleTags.map((tag) => (
            <span key={tag} className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${tagColors[tag].border} ${tagColors[tag].text}`}>
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── 4: Dot + Text (no background) ──────────────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">4. Dot + text (no background)</p>
        <div className="flex flex-wrap gap-3">
          {sampleTags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/70">
              <span className={`w-1.5 h-1.5 rounded-full ${tagColors[tag].dot}`} />
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── 5: Dot + Muted Pill ────────────────────────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">5. Dot + muted pill</p>
        <div className="flex flex-wrap gap-1.5">
          {sampleTags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              <span className={`w-1.5 h-1.5 rounded-full ${tagColors[tag].dot}`} />
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── 6: Dot + Soft Colored ──────────────────────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">6. Dot + soft colored</p>
        <div className="flex flex-wrap gap-1.5">
          {sampleTags.map((tag) => (
            <span key={tag} className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${tagColors[tag].bg} ${tagColors[tag].text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${tagColors[tag].dot}`} />
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── 7: Hashtag Style ───────────────────────────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">7. Hashtag style</p>
        <div className="flex flex-wrap gap-2">
          {sampleTags.map((tag) => (
            <span key={tag} className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
              <span className="text-foreground/30">#</span>{tag.toLowerCase()}
            </span>
          ))}
        </div>
      </section>

      {/* ── 8: Hashtag in Pill ─────────────────────────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">8. Hashtag in pill</p>
        <div className="flex flex-wrap gap-1.5">
          {sampleTags.map((tag) => (
            <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              <span className="opacity-50">#</span>{tag.toLowerCase()}
            </span>
          ))}
        </div>
      </section>

      {/* ── 9: Squared Tags ────────────────────────────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">9. Squared tags</p>
        <div className="flex flex-wrap gap-1.5">
          {sampleTags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── 10: Squared Soft Colored ──────────────────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">10. Squared soft colored</p>
        <div className="flex flex-wrap gap-1.5">
          {sampleTags.map((tag) => (
            <span key={tag} className={`px-2 py-0.5 rounded-md text-xs font-medium ${tagColors[tag].bg} ${tagColors[tag].text}`}>
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── 11: Squared Outlined Colored ──────────────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">11. Squared outlined colored</p>
        <div className="flex flex-wrap gap-1.5">
          {sampleTags.map((tag) => (
            <span key={tag} className={`px-2 py-0.5 rounded-md text-xs font-medium border ${tagColors[tag].border} ${tagColors[tag].bg} ${tagColors[tag].text}`}>
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── 12: Sharp / No Rounding ──────────────────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">12. Sharp (no rounding)</p>
        <div className="flex flex-wrap gap-1">
          {sampleTags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── 13: Sharp Colored ────────────────────────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">13. Sharp colored</p>
        <div className="flex flex-wrap gap-1">
          {sampleTags.map((tag) => (
            <span key={tag} className={`px-2 py-0.5 text-xs font-medium ${tagColors[tag].bg} ${tagColors[tag].text}`}>
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── 14: Left Border Accent Variants ────────────────── */}
      <section className="p-4 border border-border rounded-lg">
        <p className="text-sm font-semibold mb-4">14. Left border accent variants</p>

        <div className="space-y-4">
          {/* 14a: Muted bg + colored border */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">a. Muted bg + colored border</p>
            <div className="flex flex-wrap gap-1.5">
              {sampleTags.map((tag) => (
                <span key={tag} className={`px-2 py-0.5 text-xs font-medium border-l-2 bg-muted/50 text-foreground/70 ${tagColors[tag].borderL}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 14b: Colored bg + colored border */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">b. Soft colored bg + colored border</p>
            <div className="flex flex-wrap gap-1.5">
              {sampleTags.map((tag) => (
                <span key={tag} className={`px-2 py-0.5 text-xs font-medium border-l-2 ${tagColors[tag].borderL} ${tagColors[tag].bg} ${tagColors[tag].text}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 14c: No bg + colored border */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">c. No bg + colored border</p>
            <div className="flex flex-wrap gap-1.5">
              {sampleTags.map((tag) => (
                <span key={tag} className={`px-2 py-0.5 text-xs font-medium border-l-2 ${tagColors[tag].borderL} text-foreground/70`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 14d: No bg + colored border + colored text */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">d. No bg + colored border + colored text</p>
            <div className="flex flex-wrap gap-1.5">
              {sampleTags.map((tag) => (
                <span key={tag} className={`px-2 py-0.5 text-xs font-medium border-l-2 ${tagColors[tag].borderL} ${tagColors[tag].text}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 14e: Thick border (3px) + muted bg */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">e. Thick border (3px) + muted bg</p>
            <div className="flex flex-wrap gap-1.5">
              {sampleTags.map((tag) => (
                <span key={tag} className={`px-2 py-0.5 text-xs font-medium border-l-[3px] bg-muted/50 text-foreground/70 ${tagColors[tag].borderL}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 14f: Thick border + soft colored bg */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">f. Thick border + soft colored bg</p>
            <div className="flex flex-wrap gap-1.5">
              {sampleTags.map((tag) => (
                <span key={tag} className={`px-2 py-0.5 text-xs font-medium border-l-[3px] ${tagColors[tag].borderL} ${tagColors[tag].bg} ${tagColors[tag].text}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 14g: Rounded right + colored border + muted bg */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">g. Rounded right + muted bg</p>
            <div className="flex flex-wrap gap-1.5">
              {sampleTags.map((tag) => (
                <span key={tag} className={`px-2 py-0.5 text-xs font-medium border-l-2 rounded-r bg-muted/50 text-foreground/70 ${tagColors[tag].borderL}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 14h: Rounded right + soft colored bg */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">h. Rounded right + soft colored bg</p>
            <div className="flex flex-wrap gap-1.5">
              {sampleTags.map((tag) => (
                <span key={tag} className={`px-2 py-0.5 text-xs font-medium border-l-2 rounded-r ${tagColors[tag].borderL} ${tagColors[tag].bg} ${tagColors[tag].text}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 14i: Full outline + left accent */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">i. Full outline + left accent</p>
            <div className="flex flex-wrap gap-1.5">
              {sampleTags.map((tag) => (
                <span key={tag} className={`px-2 py-0.5 text-xs font-medium border border-border border-l-2 rounded-r ${tagColors[tag].borderL} text-foreground/70`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 14j: Full outline + left accent + colored bg */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">j. Full outline + left accent + colored bg</p>
            <div className="flex flex-wrap gap-1.5">
              {sampleTags.map((tag) => (
                <span key={tag} className={`px-2 py-0.5 text-xs font-medium border border-border border-l-2 rounded-r ${tagColors[tag].borderL} ${tagColors[tag].bg} ${tagColors[tag].text}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 14k: Uppercase + left accent */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">k. Uppercase + left accent</p>
            <div className="flex flex-wrap gap-1.5">
              {sampleTags.map((tag) => (
                <span key={tag} className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border-l-2 bg-muted/50 text-foreground/70 ${tagColors[tag].borderL}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 14l: Uppercase + left accent + colored */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">l. Uppercase + left accent + colored</p>
            <div className="flex flex-wrap gap-1.5">
              {sampleTags.map((tag) => (
                <span key={tag} className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border-l-2 ${tagColors[tag].borderL} ${tagColors[tag].bg} ${tagColors[tag].text}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 15: Uppercase Compact ────────────────────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">15. Uppercase compact</p>
        <div className="flex flex-wrap gap-1.5">
          {sampleTags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-muted text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── 16: Uppercase Colored ────────────────────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">16. Uppercase colored</p>
        <div className="flex flex-wrap gap-1.5">
          {sampleTags.map((tag) => (
            <span key={tag} className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${tagColors[tag].bg} ${tagColors[tag].text}`}>
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── 17: Solid Dark Pills ─────────────────────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">17. Solid dark pills</p>
        <div className="flex flex-wrap gap-1.5">
          {sampleTags.map((tag) => (
            <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-foreground text-background">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── 18: Solid Colored Pills ──────────────────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">18. Solid colored pills</p>
        <div className="flex flex-wrap gap-1.5">
          {sampleTags.map((tag) => (
            <span key={tag} className={`px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${tagColors[tag].dot}`}>
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── 19: With Close Button (Pill) ─────────────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">19. With close button (pill)</p>
        <div className="flex flex-wrap gap-1.5">
          {sampleTags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              {tag}
              <button className="p-0.5 rounded-full hover:bg-foreground/10 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </section>

      {/* ── 20: With Close Button (Soft Colored) ─────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">20. With close button (soft colored)</p>
        <div className="flex flex-wrap gap-1.5">
          {sampleTags.map((tag) => (
            <span key={tag} className={`inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full text-xs font-medium ${tagColors[tag].bg} ${tagColors[tag].text}`}>
              {tag}
              <button className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </section>

      {/* ── 21: Minimal — just text, separator ───────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">21. Minimal (text only, separator)</p>
        <div className="flex flex-wrap items-center gap-1">
          {sampleTags.map((tag, i) => (
            <span key={tag} className="inline-flex items-center gap-1">
              <span className="text-xs font-medium text-foreground/60">{tag}</span>
              {i < sampleTags.length - 1 && <span className="text-foreground/20 text-xs">/</span>}
            </span>
          ))}
        </div>
      </section>

      {/* ── 22: Minimal Comma Separated ──────────────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">22. Minimal (comma separated)</p>
        <p className="text-xs font-medium text-foreground/60">
          {sampleTags.join(', ')}
        </p>
      </section>

      {/* ── 23: Outlined Pill with Dot ───────────────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">23. Outlined pill with dot</p>
        <div className="flex flex-wrap gap-1.5">
          {sampleTags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border border-border text-foreground/70">
              <span className={`w-1.5 h-1.5 rounded-full ${tagColors[tag].dot}`} />
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── 24: Glassmorphic ─────────────────────────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">24. Glassmorphic</p>
        <div className="flex flex-wrap gap-1.5">
          {sampleTags.map((tag) => (
            <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-foreground/5 backdrop-blur-sm border border-foreground/10 text-foreground/70">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── 25: Bottom Border Only ───────────────────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">25. Bottom border only</p>
        <div className="flex flex-wrap gap-3">
          {sampleTags.map((tag) => (
            <span key={tag} className={`px-0.5 pb-0.5 text-xs font-medium border-b-2 text-foreground/70 ${tagColors[tag].border.replace('border-', 'border-b-')}`}>
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── 26: Tiny / Extra Compact ─────────────────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">26. Tiny / extra compact</p>
        <div className="flex flex-wrap gap-1">
          {sampleTags.map((tag) => (
            <span key={tag} className="px-1.5 py-px rounded text-[10px] font-medium bg-muted text-muted-foreground leading-tight">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── 27: Tiny Colored ─────────────────────────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">27. Tiny colored</p>
        <div className="flex flex-wrap gap-1">
          {sampleTags.map((tag) => (
            <span key={tag} className={`px-1.5 py-px rounded text-[10px] font-medium leading-tight ${tagColors[tag].bg} ${tagColors[tag].text}`}>
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── 28: Large Rounded ────────────────────────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">28. Large rounded</p>
        <div className="flex flex-wrap gap-2">
          {sampleTags.map((tag) => (
            <span key={tag} className="px-3.5 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── 29: Large Soft Colored ───────────────────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">29. Large soft colored</p>
        <div className="flex flex-wrap gap-2">
          {sampleTags.map((tag) => (
            <span key={tag} className={`px-3.5 py-1 rounded-full text-sm font-medium ${tagColors[tag].bg} ${tagColors[tag].text}`}>
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── 30: Monospace / Code Style ───────────────────── */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">30. Monospace / code style</p>
        <div className="flex flex-wrap gap-1.5">
          {sampleTags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded text-xs font-mono bg-muted/70 text-foreground/60 border border-border">
              {tag.toLowerCase()}
            </span>
          ))}
        </div>
      </section>

      {/* ── With Overflow (+N) Variants ──────────────────── */}
      <section className="p-4 border border-border rounded-lg">
        <p className="text-sm font-semibold mb-4">With overflow (+N)</p>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Muted pill</p>
            <div className="flex flex-wrap gap-1.5">
              {sampleTags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  {tag}
                </span>
              ))}
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground/60">
                +2
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Soft colored</p>
            <div className="flex flex-wrap gap-1.5">
              {sampleTags.slice(0, 3).map((tag) => (
                <span key={tag} className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${tagColors[tag].bg} ${tagColors[tag].text}`}>
                  {tag}
                </span>
              ))}
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground/60">
                +2
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Outlined with dot</p>
            <div className="flex flex-wrap gap-1.5">
              {sampleTags.slice(0, 3).map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border border-border text-foreground/70">
                  <span className={`w-1.5 h-1.5 rounded-full ${tagColors[tag].dot}`} />
                  {tag}
                </span>
              ))}
              <span className="px-2 py-0.5 rounded-full text-xs font-medium border border-border text-foreground/40">
                +2
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Dot + text only</p>
            <div className="flex flex-wrap items-center gap-3">
              {sampleTags.slice(0, 3).map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/70">
                  <span className={`w-1.5 h-1.5 rounded-full ${tagColors[tag].dot}`} />
                  {tag}
                </span>
              ))}
              <span className="text-xs font-medium text-foreground/40">+2</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export const Base: StoryObj = {
  render: () => <TagsPlayground />,
}
