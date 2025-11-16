// export function useGetBooks(page: number = 1, limit: number = 25) {
//     return useQuery({
//         queryKey: ['books'],
//         queryFn: () => getBooks(page, limit),
//         placeholderData: keepPreviousData
//     });
// }

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getBookmark, getBookmarks, getCategories, getGroup, getGroups, getTags } from "./api";

export function useGetBookmark(id: string) {
    return useQuery({
        queryKey: ['bookmark', id],
        queryFn: () => getBookmark(id),
        placeholderData: keepPreviousData
    });
}

export function useGetBookmarks(categories?: string[], tags?: string[], starred = false, openSource = false) {
    return useQuery({
        queryKey: ['bookmarks', { categories, tags, starred, openSource }],
        queryFn: () => getBookmarks(categories, tags, starred, openSource),
        placeholderData: keepPreviousData
    });
}

export function useGetCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: () => getCategories(),
        placeholderData: keepPreviousData
    });
}

export function useGetTags() {
    return useQuery({
        queryKey: ['tags'],
        queryFn: () => getTags(),
        placeholderData: keepPreviousData
    });
}

export function useGetGroup(id: string) {
    return useQuery({
        queryKey: ['group', id],
        queryFn: () => getGroup(id),
        placeholderData: keepPreviousData
    });
}

export function useGetGroups() {
    return useQuery({
        queryKey: ['groups'],
        queryFn: () => getGroups(),
        placeholderData: keepPreviousData
    });
}