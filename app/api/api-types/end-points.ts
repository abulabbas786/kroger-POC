export const apiPathNames = [
    "customers",
] as const;

export type ApiPath = typeof apiPathNames[number];

// response typing
export interface apiEndpoints {
    customers: { id: number; name: string }[];
}