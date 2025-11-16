import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handleError } from "../utils";
import type { Collections, Create, Update } from "../pocketbase-types";
import { createBookmark, createCategory, createGroup, createTag, deleteAccount, deleteBookmark, deleteCategory, deleteGroup, deleteTag, generateDescription, updateBookmark, updateCategory, updateGroup, updateTag } from "./api";

export function useCreateBookmark() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Create<Collections.Bookmarks>) => createBookmark(data),
        onError: handleError,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
        },
    })
}

export function useUpdateBookmark() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Update<Collections.Bookmarks> }) =>
            updateBookmark(id, data),
        onError: handleError,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
        },
    })
}

export function useDeleteBookmark() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteBookmark(id),
        onError: handleError,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
        },
    })
}

export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Create<Collections.Categories>) => createCategory(data),
        onError: handleError,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    })
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Update<Collections.Categories> }) =>
            updateCategory(id, data),
        onError: handleError,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    })
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteCategory(id),
        onError: handleError,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    })
}

export function useCreateTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Create<Collections.Tags>) => createTag(data),
        onError: handleError,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['tags'] });
        },
    })
}

export function useUpdateTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Update<Collections.Tags> }) =>
            updateTag(id, data),
        onError: handleError,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['tags'] });
        },
    })
}

export function useDeleteTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteTag(id),
        onError: handleError,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['tags'] });
        },
    })
}

export function useCreateGroup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Create<Collections.Groups>) => createGroup(data),
        onError: handleError,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['groups'] });
        },
    })
}

export function useUpdateGroup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Update<Collections.Groups> }) =>
            updateGroup(id, data),
        onError: handleError,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['groups'] });
        },
    })
}

export function useDeleteGroup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteGroup(id),
        onError: handleError,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['groups'] });
        },
    })
}

export function useGenerateDescription() {
    return useMutation({
        mutationFn: (url: string) => generateDescription(url),
        onError: handleError,
    })
}

export function useDeleteAccount() {
    return useMutation({
        mutationFn: () => deleteAccount(),
        onError: handleError,
    })
}