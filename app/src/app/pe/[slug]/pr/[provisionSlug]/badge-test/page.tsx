import { Badge } from '@/components/ui/badge'

const PROVISION_TYPES = ['ownership', 'contract', 'regulation', 'taxation', 'allocation', 'designation', 'infrastructure'] as const

const SAMPLE_TAGS = [
  { id: '1', name: 'mobility' },
  { id: '2', name: 'environment' },
  { id: '3', name: 'urban-planning' },
  { id: '4', name: 'public-health' },
]

const PROVISION_TYPE_COLORS: Record<string, string> = {
  ownership: 'hsl(var(--tag-purple))',
  contract: 'hsl(var(--tag-blue))',
  regulation: 'hsl(var(--tag-orange))',
  taxation: 'hsl(var(--tag-green))',
  allocation: 'hsl(var(--tag-pink))',
  designation: 'hsl(var(--tag-slate))',
  infrastructure: 'hsl(var(--tag-cyan))',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 text-muted-foreground">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  )
}

export default function BadgeTestPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">Provision Type Badge Variations</h1>

      {/* Current Style - Outline with colored border and text */}
      <Section title="1. Current Style (Outline)">
        {PROVISION_TYPES.map((type) => (
          <Badge
            key={type}
            variant="outline"
            style={{ color: PROVISION_TYPE_COLORS[type], borderColor: PROVISION_TYPE_COLORS[type] }}
          >
            {type}
          </Badge>
        ))}
      </Section>

      {/* No Border - Just background tint */}
      <Section title="2. No Border - Subtle Background">
        {PROVISION_TYPES.map((type) => (
          <span
            key={type}
            className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
            style={{
              color: PROVISION_TYPE_COLORS[type],
              backgroundColor: `${PROVISION_TYPE_COLORS[type]}15`
            }}
          >
            {type}
          </span>
        ))}
      </Section>

      {/* Solid Background */}
      <Section title="3. Solid Background">
        {PROVISION_TYPES.map((type) => (
          <span
            key={type}
            className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-white"
            style={{ backgroundColor: PROVISION_TYPE_COLORS[type] }}
          >
            {type}
          </span>
        ))}
      </Section>

      {/* Text Only - No background, no border */}
      <Section title="4. Text Only - No Styling">
        {PROVISION_TYPES.map((type) => (
          <span
            key={type}
            className="text-xs"
            style={{ color: PROVISION_TYPE_COLORS[type] }}
          >
            {type}
          </span>
        ))}
      </Section>

      {/* Text Only - Bold */}
      <Section title="5. Text Only - Bold">
        {PROVISION_TYPES.map((type) => (
          <span
            key={type}
            className="text-xs font-bold"
            style={{ color: PROVISION_TYPE_COLORS[type] }}
          >
            {type}
          </span>
        ))}
      </Section>

      {/* Text Only - Semibold */}
      <Section title="6. Text Only - Semibold">
        {PROVISION_TYPES.map((type) => (
          <span
            key={type}
            className="text-xs font-semibold"
            style={{ color: PROVISION_TYPE_COLORS[type] }}
          >
            {type}
          </span>
        ))}
      </Section>

      {/* UPPERCASE */}
      <Section title="7. UPPERCASE - Text Only">
        {PROVISION_TYPES.map((type) => (
          <span
            key={type}
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: PROVISION_TYPE_COLORS[type] }}
          >
            {type}
          </span>
        ))}
      </Section>

      {/* UPPERCASE with background */}
      <Section title="8. UPPERCASE - Subtle Background">
        {PROVISION_TYPES.map((type) => (
          <span
            key={type}
            className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium uppercase tracking-wider"
            style={{
              color: PROVISION_TYPE_COLORS[type],
              backgroundColor: `${PROVISION_TYPE_COLORS[type]}15`
            }}
          >
            {type}
          </span>
        ))}
      </Section>

      {/* Capitalize */}
      <Section title="9. Capitalize - Outline">
        {PROVISION_TYPES.map((type) => (
          <Badge
            key={type}
            variant="outline"
            className="capitalize"
            style={{ color: PROVISION_TYPE_COLORS[type], borderColor: PROVISION_TYPE_COLORS[type] }}
          >
            {type}
          </Badge>
        ))}
      </Section>

      {/* Pill style - more rounded */}
      <Section title="10. Pill Style - More Rounded">
        {PROVISION_TYPES.map((type) => (
          <span
            key={type}
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
            style={{
              color: PROVISION_TYPE_COLORS[type],
              backgroundColor: `${PROVISION_TYPE_COLORS[type]}15`
            }}
          >
            {type}
          </span>
        ))}
      </Section>

      {/* Pill outline */}
      <Section title="11. Pill Outline">
        {PROVISION_TYPES.map((type) => (
          <span
            key={type}
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border"
            style={{
              color: PROVISION_TYPE_COLORS[type],
              borderColor: PROVISION_TYPE_COLORS[type]
            }}
          >
            {type}
          </span>
        ))}
      </Section>

      {/* Dot prefix */}
      <Section title="12. With Color Dot Prefix">
        {PROVISION_TYPES.map((type) => (
          <span
            key={type}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: PROVISION_TYPE_COLORS[type] }}
            />
            {type}
          </span>
        ))}
      </Section>

      {/* Dot prefix - bold text */}
      <Section title="13. Dot Prefix - Bold Text">
        {PROVISION_TYPES.map((type) => (
          <span
            key={type}
            className="inline-flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: PROVISION_TYPE_COLORS[type] }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: PROVISION_TYPE_COLORS[type] }}
            />
            {type}
          </span>
        ))}
      </Section>

      {/* Left bar style */}
      <Section title="14. Left Bar Accent">
        {PROVISION_TYPES.map((type) => (
          <span
            key={type}
            className="inline-flex items-center pl-2 pr-2 py-1 text-xs font-medium border-l-2"
            style={{
              color: PROVISION_TYPE_COLORS[type],
              borderLeftColor: PROVISION_TYPE_COLORS[type],
              backgroundColor: `${PROVISION_TYPE_COLORS[type]}08`
            }}
          >
            {type}
          </span>
        ))}
      </Section>

      {/* Underline style */}
      <Section title="15. Underline Style">
        {PROVISION_TYPES.map((type) => (
          <span
            key={type}
            className="inline-flex items-center text-xs font-medium border-b-2 pb-0.5"
            style={{
              color: PROVISION_TYPE_COLORS[type],
              borderBottomColor: PROVISION_TYPE_COLORS[type]
            }}
          >
            {type}
          </span>
        ))}
      </Section>

      {/* Minimal - just different font weights */}
      <Section title="16. Weight Comparison (Same Color)">
        {(['font-normal', 'font-medium', 'font-semibold', 'font-bold'] as const).map((weight) => (
          <span
            key={weight}
            className={`text-xs ${weight}`}
            style={{ color: PROVISION_TYPE_COLORS.contract }}
          >
            contract ({weight.replace('font-', '')})
          </span>
        ))}
      </Section>

      {/* Size Comparison */}
      <Section title="17. Size Comparison">
        {(['text-[10px]', 'text-xs', 'text-sm'] as const).map((size) => (
          <span
            key={size}
            className={`${size} font-medium`}
            style={{ color: PROVISION_TYPE_COLORS.regulation }}
          >
            regulation ({size.replace('text-', '')})
          </span>
        ))}
      </Section>

      {/* Ghost button style */}
      <Section title="18. Ghost Button Style">
        {PROVISION_TYPES.map((type) => (
          <span
            key={type}
            className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium hover:bg-accent transition-colors cursor-default"
            style={{ color: PROVISION_TYPE_COLORS[type] }}
          >
            {type}
          </span>
        ))}
      </Section>

      {/* Tag with icon prefix */}
      <Section title="19. With Hashtag Prefix">
        {PROVISION_TYPES.map((type) => (
          <span
            key={type}
            className="inline-flex items-center text-xs font-medium"
            style={{ color: PROVISION_TYPE_COLORS[type] }}
          >
            <span className="opacity-50">#</span>{type}
          </span>
        ))}
      </Section>

      {/* Slash prefix */}
      <Section title="20. With Slash Prefix">
        {PROVISION_TYPES.map((type) => (
          <span
            key={type}
            className="inline-flex items-center text-xs font-medium"
            style={{ color: PROVISION_TYPE_COLORS[type] }}
          >
            <span className="opacity-40 mr-0.5">/</span>{type}
          </span>
        ))}
      </Section>

      {/* TAGS SECTION */}
      <div className="border-t border-border mt-12 pt-12">
        <h1 className="text-2xl font-bold mb-8">Tag Style Variations</h1>

        {/* Current Style - Pill with muted background */}
        <Section title="T1. Current Style (Pill + Muted)">
          {SAMPLE_TAGS.map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground"
            >
              {tag.name}
            </span>
          ))}
        </Section>

        {/* Text only */}
        <Section title="T2. Text Only">
          {SAMPLE_TAGS.map((tag) => (
            <span
              key={tag.id}
              className="text-xs text-muted-foreground"
            >
              {tag.name}
            </span>
          ))}
        </Section>

        {/* Text only with hashtag */}
        <Section title="T3. Hashtag Prefix">
          {SAMPLE_TAGS.map((tag) => (
            <span
              key={tag.id}
              className="text-xs text-muted-foreground"
            >
              #{tag.name}
            </span>
          ))}
        </Section>

        {/* Hashtag with color */}
        <Section title="T4. Colored Hashtag">
          {SAMPLE_TAGS.map((tag) => (
            <span
              key={tag.id}
              className="text-xs text-muted-foreground"
            >
              <span className="text-primary/50">#</span>{tag.name}
            </span>
          ))}
        </Section>

        {/* Pill outline */}
        <Section title="T5. Pill Outline">
          {SAMPLE_TAGS.map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-0.5 rounded-full text-xs font-medium border border-border text-muted-foreground"
            >
              {tag.name}
            </span>
          ))}
        </Section>

        {/* Square/rounded */}
        <Section title="T6. Rounded Rectangle">
          {SAMPLE_TAGS.map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground"
            >
              {tag.name}
            </span>
          ))}
        </Section>

        {/* Square outline */}
        <Section title="T7. Rounded Rectangle Outline">
          {SAMPLE_TAGS.map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-0.5 rounded-md text-xs font-medium border border-border text-muted-foreground"
            >
              {tag.name}
            </span>
          ))}
        </Section>

        {/* Underline style */}
        <Section title="T8. Underline">
          {SAMPLE_TAGS.map((tag) => (
            <span
              key={tag.id}
              className="text-xs font-medium text-muted-foreground border-b border-muted-foreground/30 pb-0.5"
            >
              {tag.name}
            </span>
          ))}
        </Section>

        {/* Dot prefix */}
        <Section title="T9. Dot Prefix">
          {SAMPLE_TAGS.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
              {tag.name}
            </span>
          ))}
        </Section>

        {/* Slash prefix */}
        <Section title="T10. Slash Prefix">
          {SAMPLE_TAGS.map((tag) => (
            <span
              key={tag.id}
              className="text-xs text-muted-foreground"
            >
              <span className="opacity-40">/</span>{tag.name}
            </span>
          ))}
        </Section>

        {/* Uppercase */}
        <Section title="T11. Uppercase">
          {SAMPLE_TAGS.map((tag) => (
            <span
              key={tag.id}
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              {tag.name}
            </span>
          ))}
        </Section>

        {/* Uppercase with background */}
        <Section title="T12. Uppercase + Background">
          {SAMPLE_TAGS.map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground uppercase tracking-wide"
            >
              {tag.name}
            </span>
          ))}
        </Section>

        {/* Smaller text */}
        <Section title="T13. Smaller (10px)">
          {SAMPLE_TAGS.map((tag) => (
            <span
              key={tag.id}
              className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground"
            >
              {tag.name}
            </span>
          ))}
        </Section>

        {/* Ghost style */}
        <Section title="T14. Ghost (No Background)">
          {SAMPLE_TAGS.map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {tag.name}
            </span>
          ))}
        </Section>

        {/* Italic */}
        <Section title="T15. Italic">
          {SAMPLE_TAGS.map((tag) => (
            <span
              key={tag.id}
              className="text-xs italic text-muted-foreground"
            >
              {tag.name}
            </span>
          ))}
        </Section>

        {/* Bold */}
        <Section title="T16. Bold">
          {SAMPLE_TAGS.map((tag) => (
            <span
              key={tag.id}
              className="text-xs font-semibold text-muted-foreground"
            >
              {tag.name}
            </span>
          ))}
        </Section>

        {/* Brackets */}
        <Section title="T17. With Brackets">
          {SAMPLE_TAGS.map((tag) => (
            <span
              key={tag.id}
              className="text-xs text-muted-foreground"
            >
              [{tag.name}]
            </span>
          ))}
        </Section>

        {/* Angle brackets */}
        <Section title="T18. Angle Brackets">
          {SAMPLE_TAGS.map((tag) => (
            <span
              key={tag.id}
              className="text-xs text-muted-foreground"
            >
              &lt;{tag.name}&gt;
            </span>
          ))}
        </Section>

        {/* Left bar */}
        <Section title="T19. Left Bar">
          {SAMPLE_TAGS.map((tag) => (
            <span
              key={tag.id}
              className="pl-2 border-l-2 border-muted-foreground/30 text-xs text-muted-foreground"
            >
              {tag.name}
            </span>
          ))}
        </Section>

        {/* Comma separated inline */}
        <Section title="T20. Comma Separated (Inline)">
          <span className="text-xs text-muted-foreground">
            {SAMPLE_TAGS.map((tag, i) => (
              <span key={tag.id}>
                {tag.name}{i < SAMPLE_TAGS.length - 1 && ', '}
              </span>
            ))}
          </span>
        </Section>
      </div>
    </div>
  )
}
