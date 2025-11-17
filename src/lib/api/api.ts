import { pb } from "../pocketbase";
import { Collections, type BookmarksResponse, type Create, type Update } from "../pocketbase-types";
import { getUserRecord } from "../utils";

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

export async function getBookmarks(categories?: string[], tags?: string[], starred = false, openSource = false) {
    let filter = "";

    if (categories && categories.length > 0) {
        filter += ` && (${categories.map((id) => `category.id ?= '${id}'`).join("||")})`;
    }

    if (tags && tags.length > 0) {
        filter += ` && (${tags.map((id) => `tags.id ?= '${id}'`).join("||")})`;
    }

    if (starred) {
        filter += ` && starred = true`;
    }

    if (openSource) {
        filter += ` && open_source = true`;
    }

    if (filter.startsWith(" && ")) {
        filter = filter.slice(4); // Remove leading ' && '
    }

    return await pb.collection(Collections.Bookmarks).getFullList({
        batch: 1000,
        filter,
        expand: "category,tags"
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

export async function getGroup(id?: string) {
    if (!id) throw new Error("Group ID is required");
    return await pb.collection(Collections.Groups).getOne(id, { expand: "bookmarks" });
}

export async function getGroups() {
    return await pb.collection(Collections.Groups).getFullList({
        batch: 1000
    });
}

export async function generateDescription(url: string) {
    return await pb.send("/api/generate-description", { method: "POST", body: { url } });
}

export async function deleteAccount() {
    const user = getUserRecord();
    if (!user.id) throw new Error("User not authenticated");
    return await pb.collection(Collections.Users).delete(user.id);
}

export const searchBookmarks = async (query: string) => {
    return await pb.send<BookmarksResponse[]>(`/api/collections/bookmarks/records/full-text-search?search=${query}`, { method: "GET",  });
};