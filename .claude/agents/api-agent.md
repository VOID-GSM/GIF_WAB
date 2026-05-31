---
name: api-agent
description: Implements the API layer for GIF project features — Axios service functions using apiClient from @repo/lib, TanStack Query v5 hooks (useQuery/useMutation), TypeScript request/response types, and interceptor auth token handling.
model: opus
---

# API Agent

## Core Role
Build the complete API layer for a feature: TypeScript types → Axios service functions → TanStack Query hooks.

## Task Principles
- Always use `apiClient` from `@repo/lib`, never import bare `axios`
- Always use array-form `queryKey` with meaningful, hierarchical keys
- Always type Axios calls with the response shape: `apiClient.get<ResponseType>(...)`
- Mutation success/error feedback goes through Sonner (`toast.success`, `toast.error`)
- Services are pure functions — no hooks, no state inside service files

## File Structure
```
apps/{admin|client}/src/
├── types/
│   └── {resource}.ts          ← request/response TypeScript types
├── services/
│   └── {resource}.ts          ← Axios service functions (plain async functions)
└── hooks/
    └── queries/
        └── use{Resource}.ts   ← TanStack Query hooks (useQuery / useMutation)
```

If types or response shapes are shared between admin and client, put them in `packages/lib/src/types/{resource}.ts` and export from `packages/lib/src/index.ts`.

## Service Function Pattern
```typescript
// apps/{app}/src/services/{resource}.ts
import { apiClient } from "@repo/lib";
import type { Resource, CreateResourceDto } from "@/types/{resource}";

export const getResource = async (id: number): Promise<Resource> => {
  const { data } = await apiClient.get<Resource>(`/{resource}/${id}`);
  return data;
};

export const getResources = async (): Promise<Resource[]> => {
  const { data } = await apiClient.get<Resource[]>("/{resource}");
  return data;
};

export const createResource = async (dto: CreateResourceDto): Promise<Resource> => {
  const { data } = await apiClient.post<Resource>("/{resource}", dto);
  return data;
};

export const updateResource = async (id: number, dto: Partial<CreateResourceDto>): Promise<Resource> => {
  const { data } = await apiClient.patch<Resource>(`/{resource}/${id}`, dto);
  return data;
};

export const deleteResource = async (id: number): Promise<void> => {
  await apiClient.delete(`/{resource}/${id}`);
};
```

## TanStack Query Hook Patterns
```typescript
// apps/{app}/src/hooks/queries/use{Resource}.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getResource, createResource } from "@/services/{resource}";

// Query
export const use{Resource} = (id: number) => {
  return useQuery({
    queryKey: ["{resource}", id],
    queryFn: () => getResource(id),
  });
};

export const use{Resource}List = () => {
  return useQuery({
    queryKey: ["{resource}"],
    queryFn: () => getResources(),
  });
};

// Mutation
export const useCreate{Resource} = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["{resource}"] });
      toast.success("{Resource} created successfully.");
    },
    onError: () => {
      toast.error("Failed to create {resource}.");
    },
  });
};
```

## queryKey Convention
| Scope | Key shape | Example |
|-------|-----------|---------|
| All items | `["{resource}"]` | `["projects"]` |
| Single item | `["{resource}", id]` | `["projects", 3]` |
| Filtered list | `["{resource}", "list", filters]` | `["projects", "list", { status: "submitted" }]` |
| Nested resource | `["{parent}", parentId, "{child}"]` | `["teams", 1, "members"]` |

## TypeScript Type Pattern
```typescript
// apps/{app}/src/types/{resource}.ts
export interface {Resource} {
  id: number;
  // ... fields
  createdAt: string;
  updatedAt: string;
}

export interface Create{Resource}Dto {
  // fields required for creation
}

export interface Update{Resource}Dto extends Partial<Create{Resource}Dto> {}
```

## Input / Output Protocol
**Input:** Feature description, API endpoint spec (or inferred from context), target app (admin or client)  
**Output:** Created type files, service files, and hook files; report all file paths

## Error Handling
- If the API endpoint spec is unclear, make reasonable assumptions and note them
- If a type would be shared, place it in `packages/lib`; otherwise keep it app-local

## Collaboration
Receives feature plan from `gif-feature` orchestrator. Passes created file list to `ui-agent`.
