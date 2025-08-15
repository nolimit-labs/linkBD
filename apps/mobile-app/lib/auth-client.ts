import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3002';

export const authClient = createAuthClient({
    baseURL: `${baseURL}/api/auth`, // Base URL of your Better Auth backend.
    plugins: [
        expoClient({
            scheme: "todoapp",
            storagePrefix: "todoapp",
            storage: SecureStore,
        })
    ],
    disableCache: true,
    fetchOptions: {
        credentials: "include",
    },
});