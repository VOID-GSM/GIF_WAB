---
name: gif-api
description: "Creates API service functions and TanStack Query hooks for the GIF project following project conventions (apiClient from @repo/lib, array queryKey, useQuery/useMutation v5 patterns, Sonner feedback). Use when adding or updating API integrations without building the UI. Triggers on: 'API 연동', 'axios 서비스 만들어줘', 'useQuery 만들어줘', 'useMutation 추가', 'API hook 만들어줘', 'service 함수', 'TanStack Query', '훅 만들어줘', 'API 함수 추가'. Does NOT trigger when also building a page or component — use gif-feature for that."
---

# GIF API Skill

## File Locations (FSD)
```
apps/{admin|client}/src/entities/{domain}/
├── model/
│   └── types.ts                ← TypeScript interfaces
└── api/
    ├── {domain}Api.ts          ← Axios service functions
    └── use{Domain}.ts          ← TanStack Query hooks
```
User-action-specific API → `src/features/{action}/api/` instead.  
Types shared across apps → `packages/lib/src/types/`, export from `packages/lib/src/index.ts`.

## Types
```typescript
// apps/{app}/src/entities/{domain}/model/types.ts
export interface {Resource} {
  id: number;
  // ... domain fields
  createdAt: string;
  updatedAt: string;
}

export interface Create{Resource}Dto {
  // required fields for POST
}

export interface Update{Resource}Dto extends Partial<Create{Resource}Dto> {}
```

## Service Functions
Always use `apiClient` from `@repo/lib`. Destructure `data` from the response.

```typescript
// apps/{app}/src/entities/{domain}/api/{domain}Api.ts
import { apiClient } from "@repo/lib";
import type { Resource, CreateResourceDto, UpdateResourceDto } from "../model/types";

export const get{Resource}s = async (): Promise<{Resource}[]> => {
  const { data } = await apiClient.get<{Resource}[]>("/{resources}");
  return data;
};

export const get{Resource} = async (id: number): Promise<{Resource}> => {
  const { data } = await apiClient.get<{Resource}>(`/{resources}/${id}`);
  return data;
};

export const create{Resource} = async (dto: Create{Resource}Dto): Promise<{Resource}> => {
  const { data } = await apiClient.post<{Resource}>("/{resources}", dto);
  return data;
};

export const update{Resource} = async (id: number, dto: Update{Resource}Dto): Promise<{Resource}> => {
  const { data } = await apiClient.patch<{Resource}>(`/{resources}/${id}`, dto);
  return data;
};

export const delete{Resource} = async (id: number): Promise<void> => {
  await apiClient.delete(`/{resources}/${id}`);
};
```

## TanStack Query Hooks (v5)
```typescript
// apps/{app}/src/entities/{domain}/api/use{Domain}.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  get{Resource}s,
  get{Resource},
  create{Resource},
  update{Resource},
  delete{Resource},
} from "./{domain}Api";

// --- Queries ---

export const use{Resource}List = () =>
  useQuery({
    queryKey: ["{resources}"],
    queryFn: get{Resource}s,
  });

export const use{Resource} = (id: number) =>
  useQuery({
    queryKey: ["{resources}", id],
    queryFn: () => get{Resource}(id),
    enabled: !!id,
  });

// --- Mutations ---

export const useCreate{Resource} = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: create{Resource},
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["{resources}"] });
      toast.success("{Resource}가 생성되었습니다.");
    },
    onError: () => toast.error("{Resource} 생성에 실패했습니다."),
  });
};

export const useUpdate{Resource} = (id: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Update{Resource}Dto) => update{Resource}(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["{resources}", id] });
      qc.invalidateQueries({ queryKey: ["{resources}"] });
      toast.success("{Resource}가 수정되었습니다.");
    },
    onError: () => toast.error("{Resource} 수정에 실패했습니다."),
  });
};

export const useDelete{Resource} = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: delete{Resource},
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["{resources}"] });
      toast.success("{Resource}가 삭제되었습니다.");
    },
    onError: () => toast.error("{Resource} 삭제에 실패했습니다."),
  });
};
```

## queryKey Convention
| Scope | Shape | Example |
|-------|-------|---------|
| List | `["{resources}"]` | `["projects"]` |
| Single | `["{resources}", id]` | `["projects", 3]` |
| Filtered | `["{resources}", "list", filters]` | `["projects", "list", { status: "submitted" }]` |
| Nested | `["{parent}", parentId, "{child}"]` | `["teams", 1, "members"]` |

## Important Rules
- **Never** import bare `axios` — always use `apiClient` from `@repo/lib`
- **Always** use array queryKey
- **Always** type the generic on the apiClient call: `apiClient.get<Type>(...)`
- Hook files need `"use client"` at the top because they use TanStack Query hooks
- Service files do NOT need `"use client"` — they are plain async functions
