import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

// Every tab in the app is its own bordered pill: white when idle, soft green
// with a green border when selected. `tabChipClass` gives hand-rolled tab
// buttons (and nav strips) the same look as <TabsTrigger>.
const TAB_CHIP_BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50"
const TAB_CHIP_IDLE = "border-border bg-card text-muted-foreground hover:border-ink-300 hover:text-foreground"
const TAB_CHIP_ACTIVE = "border-primary/50 bg-primary-soft font-semibold text-primary-strong"

const tabChipClass = (active, className) =>
  cn(TAB_CHIP_BASE, active ? TAB_CHIP_ACTIVE : TAB_CHIP_IDLE, className)

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-auto items-center gap-2 text-muted-foreground",
      className
    )}
    {...props} />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      TAB_CHIP_BASE,
      TAB_CHIP_IDLE,
      "data-[state=active]:border-primary/50 data-[state=active]:bg-primary-soft data-[state=active]:font-semibold data-[state=active]:text-primary-strong",
      className
    )}
    {...props} />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props} />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent, tabChipClass }
