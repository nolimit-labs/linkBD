import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import { organizationClient } from "better-auth/client/plugins";
import * as SecureStore from "expo-secure-store";

const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3005';


export const authClient = createAuthClient({
    baseURL: `${baseURL}/api/auth`,
    plugins: [
        expoClient({
            scheme: "linkbd",
            storagePrefix: "linkbd",
            storage: SecureStore,
        }),
        organizationClient(),
    ],
    disableCache: true,
    fetchOptions: {
        credentials: "include",
    },
});

export const {
    organization,
    useActiveOrganization,
    useListOrganizations,
    getSession,
} = authClient;