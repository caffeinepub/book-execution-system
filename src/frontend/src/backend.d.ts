import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BookPlan {
    id: bigint;
    bookName: string;
    bookType: string;
    dailyReadingHours: bigint;
    timestamp: Time;
    generatedPlan: string;
}
export type Time = bigint;
export interface backendInterface {
    createBookPlan(bookName: string, bookType: string, dailyReadingHours: bigint, generatedPlan: string): Promise<bigint>;
    deletePlan(id: bigint): Promise<void>;
    fetchBookChapters(bookName: string): Promise<string>;
    getAllPlans(): Promise<Array<BookPlan>>;
    getPlan(id: bigint): Promise<BookPlan>;
}
