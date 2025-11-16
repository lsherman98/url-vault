import { pb } from "../pocketbase";
import { Collections, type Create, type Update } from "../pocketbase-types";

export async function createBookmark(data: Create<Collections.Bookmarks>) {
    return await pb.collection(Collections.Bookmarks).create(data);
}

export async function updateBookmark(id: string, data: Update<Collections.Bookmarks>) {
    return await pb.collection(Collections.Bookmarks).update(id, data);
}

export async function deleteBookmark(id: string) {
    return await pb.collection(Collections.Bookmarks).delete(id);
}

export async function getBookmark(id: string) {
    return await pb.collection(Collections.Bookmarks).getOne(id);
}

export async function getBookmarks(categories?: string[], tags?: string[], starred = false) {
    return await pb.collection(Collections.Bookmarks).getFullList({
        batch: 1000,
        filter: `category ?= ${categories} && tag ?= ${tags} && starred = ${starred}`
    });
}

export async function createCategory(data: Create<Collections.Categories>) {
    return await pb.collection(Collections.Categories).create(data);
}

export async function updateCategory(id: string, data: Update<Collections.Categories>) {
    return await pb.collection(Collections.Categories).update(id, data);
}

export async function deleteCategory(id: string) {
    return await pb.collection(Collections.Categories).delete(id);
}

export async function getCategories() {
    return await pb.collection(Collections.Categories).getFullList({
        batch: 1000
    });
}

export async function createTag(data: Create<Collections.Tags>) {
    return await pb.collection(Collections.Tags).create(data);
}

export async function updateTag(id: string, data: Update<Collections.Tags>) {
    return await pb.collection(Collections.Tags).update(id, data);
}

export async function deleteTag(id: string) {
    return await pb.collection(Collections.Tags).delete(id);
}

export async function getTags() {
    return await pb.collection(Collections.Tags).getFullList({
        batch: 1000
    });
}

export async function createGroup(data: Create<Collections.Groups>) {
    return await pb.collection(Collections.Groups).create(data);
}

export async function updateGroup(id: string, data: Update<Collections.Groups>) {
    return await pb.collection(Collections.Groups).update(id, data);
}

export async function deleteGroup(id: string) {
    return await pb.collection(Collections.Groups).delete(id);
}

export async function getGroup(id: string) {
    return await pb.collection(Collections.Groups).getOne(id);
}

export async function getGroups() {
    return await pb.collection(Collections.Groups).getFullList({
        batch: 1000
    });
}



