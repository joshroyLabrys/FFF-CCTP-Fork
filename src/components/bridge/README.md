# Bridge UI Components

## Component Hierarchy

```
Page (src/app/page.tsx)
├── AnimatedBackground
├── BridgeHeader
│   └── Dynamic Wallet Button
├── Main Content
│   ├── BridgeCard
│   │   ├── ChainSelector (From)
│   │   ├── AmountInput
│   │   ├── SwapButton
│   │   ├── ChainSelector (To)
│   │   └── Bridge Button
│   ├── StatsCard
│   └── Features
└── Footer
```

## Quick Start

```tsx
// Import all components
import {
  BridgeCard,
  AnimatedBackground,
  BridgeHeader,
  StatsCard,
  Features,
  Footer,
} from '~/components/bridge';

// Use in your page
export default function Page() {
  return (
    <main className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10 flex min-h-screen flex-col">
        <BridgeHeader />
        <div className="flex flex-1 flex-col items-center justify-center gap-12 px-4 py-12">
          <BridgeCard />
          <StatsCard />
          <Features />
        </div>
        <Footer />
      </div>
    </main>
  );
}
```

## Styling

All components use:
- Tailwind CSS for styling
- Framer Motion for animations
- Glassmorphism effects (backdrop-blur)
- Responsive design
- Dark mode support (via CSS variables)

## Animation Patterns

1. **Entry Animations**: Components fade in and slide up on mount
2. **Hover Effects**: Scale and translate on hover
3. **Click Effects**: Scale down on tap
4. **Staggered Reveals**: Sequential animations with delays
5. **Spring Physics**: Natural, bouncy transitions

## Color Scheme

- Primary: Purple/Blue gradient
- Accent: Pink/Purple gradient
- Background: Subtle animated gradients
- Text: High contrast foreground/muted-foreground
- Borders: Semi-transparent with blur

## Responsive Breakpoints

- Mobile: < 768px (single column)
- Tablet: 768px - 1024px (2 columns)
- Desktop: > 1024px (4 columns for features)



