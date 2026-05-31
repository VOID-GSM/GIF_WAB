---
name: gif-component
description: "Creates Next.js pages, layouts, and React components for the GIF project following App Router patterns: Server Components by default, 'use client' only when needed, design tokens from packages/ui, and role-based route structure for admin. Use when adding a page, layout, or component without a full API integration. Triggers on: '컴포넌트 만들어줘', '페이지 만들어줘', '레이아웃 추가', 'Server Component', 'Client Component', '화면 만들어줘', 'UI 구현', 'page.tsx 만들어줘', 'layout.tsx 추가', 'route 추가'. Does NOT trigger when also building an API layer — use gif-feature for that."
---

# GIF Component Skill

## The Core Decision: Server vs Client

Default to **Server Component**. Add `"use client"` only when the component needs:
- `useState`, `useReducer`, or other React state hooks
- `useEffect` or browser-only APIs
- Event handlers (`onClick`, `onChange`, `onSubmit`, etc.)
- TanStack Query hooks (`useQuery`, `useMutation`)
- `useRouter`, `usePathname`, `useSearchParams`

If a page needs both server data and client interactivity: keep the page as a Server Component and extract only the interactive part into a separate Client Component child.

## File Locations (FSD)
| What | FSD Layer | Path |
|------|-----------|------|
| Route entry | `app` | `apps/{app}/src/app/{route}/page.tsx` |
| Route layout / guard | `app` | `apps/{app}/src/app/{route}/layout.tsx` |
| Loading / Error UI | `app` | `apps/{app}/src/app/{route}/loading.tsx` / `error.tsx` |
| Page composition | `views` | `apps/{app}/src/views/{page}/ui/{Page}View.tsx` |
| Reusable page section | `widgets` | `apps/{app}/src/widgets/{name}/ui/{Name}.tsx` |
| User action UI | `features` | `apps/{app}/src/features/{action}/ui/{Name}.tsx` |
| Entity display UI | `entities` | `apps/{app}/src/entities/{domain}/ui/{Name}.tsx` |
| Shared primitive | `shared` | `apps/{app}/src/shared/ui/{Name}.tsx` |
| Cross-app shared | packages | `packages/ui/src/{Name}.tsx` + export in `packages/ui/src/index.ts` |

**Which layer?**
- Domain display (ProjectCard, TeamRow) → `entities`
- User action (SubmitForm, EvaluateButton) → `features`
- Composite section (table + pagination) → `widgets`
- Full assembled page → `views`
- Generic primitive (Spinner, Badge) → `shared/ui` or `packages/ui`

## Server Component
```tsx
// No directive at top
import { SomeSharedComponent } from "@repo/ui";

export default async function ResourcePage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold text-[var(--color-gray-900)]">
        Page Title
      </h1>
      <SomeSharedComponent />
    </main>
  );
}
```

## Client Component
```tsx
"use client";

import { useState } from "react";
import { useResourceList } from "@/entities/{domain}/api/use{Domain}";
import { toast } from "sonner";

export function ResourceList() {
  const { data, isPending, isError } = useResourceList();
  const [selected, setSelected] = useState<number | null>(null);

  if (isPending) return <p>Loading...</p>;
  if (isError) return <p>Failed to load.</p>;

  return (
    <ul>
      {data.map((item) => (
        <li
          key={item.id}
          className="cursor-pointer hover:bg-[var(--color-gray-100)] p-2"
          onClick={() => setSelected(item.id)}
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

## Layout with Role Guard (Admin App)
```tsx
// apps/admin/src/app/(coordinator)/layout.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth"; // adjust to actual auth implementation

export default async function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "COORDINATOR") {
    redirect("/unauthorized");
  }
  return <>{children}</>;
}
```

## Admin Route Group Structure
```
apps/admin/src/app/
├── (coordinator)/    ← Idea Festival Coordinator
│   ├── layout.tsx    ← Role guard
│   └── dashboard/
│       └── page.tsx
├── (major)/          ← Major Subject Teacher
├── (general)/        ← General Subject Teacher
└── (head-of-grade)/  ← Head of Grade
```

## Design Token Reference
Available CSS variables from `packages/ui/src/tokens.css`:
```
Colors: --color-black, --color-white
Gray: --color-gray-{900|800|700|600|500|400|300|200|100}
Yellow: --color-yellow-{900|800|...|50}
Orange: --color-orange-{900|800|...|50}
Shadows: --shadow-sm, --shadow-standard, --shadow-high, --shadow-new
Font: --font-pretendard
```

Use in Tailwind: `bg-[var(--color-yellow-500)]`, `text-[var(--color-gray-900)]`

## Error and Loading UI
```tsx
// error.tsx — must be Client Component
"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div>
      <p>Something went wrong.</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// loading.tsx — Server Component, shown during page data fetch
export default function Loading() {
  return <p>Loading...</p>;
}
```
