/**
 * Tiny repository layer over the dual store.
 * Each call uses MongoDB when connected (and a model exists for the collection),
 * otherwise the in-memory `db`. This keeps route handlers free of repeated
 * `isMongoConfigured()` branching and guarantees both paths stay in sync.
 */
import { db } from "./db";
import { isMongoConfigured } from "./mongo";
import {
  AttendanceModel,
  LeaveRequestModel,
  ShiftScheduleModel,
  PayrollModel,
  PerformanceReviewModel,
  StaffModel,
  OrderModel,
  UserAccountModel,
  InventoryModel,
  FinanceModel,
  CustomerModel,
  StaffNoticeModel,
  StaffRequestModel,
  ActivityLogModel,
} from "./models";

type Doc = Record<string, any>;

type AnyModel = {
  find: (query: Doc) => { lean: () => Promise<Doc[]> };
  create: (doc: Doc) => Promise<unknown>;
  updateOne: (query: Doc, update: Doc) => Promise<unknown>;
  updateMany: (query: Doc, update: Doc) => Promise<unknown>;
  deleteOne: (query: Doc) => Promise<{ deletedCount?: number }>;
};

const MODELS: Record<string, AnyModel> = {
  attendance: AttendanceModel as never,
  leaveRequests: LeaveRequestModel as never,
  shiftSchedules: ShiftScheduleModel as never,
  payroll: PayrollModel as never,
  performanceReviews: PerformanceReviewModel as never,
  staff: StaffModel as never,
  orders: OrderModel as never,
  userAccounts: UserAccountModel as never,
  inventory: InventoryModel as never,
  finance: FinanceModel as never,
  customers: CustomerModel as never,
  staffNotices: StaffNoticeModel as never,
  staffRequests: StaffRequestModel as never,
  activityLogs: ActivityLogModel as never,
};

const useMongo = (name: string): boolean => isMongoConfigured() && Boolean(MODELS[name]);

const memList = (name: string): Doc[] => {
  const store = db as unknown as Record<string, Doc[]>;
  if (!Array.isArray(store[name])) store[name] = [];
  return store[name];
};

const matches = (item: Doc, match: Doc): boolean =>
  Object.keys(match).every((key) => String(item[key]) === String(match[key]));

/** Return every document in a collection (Mongo lean docs or the in-memory array). */
export const loadAll = async (name: string): Promise<Doc[]> => {
  if (useMongo(name)) return (await MODELS[name].find({}).lean()) as Doc[];
  return memList(name);
};

/** Find the first document matching all key/value pairs in `match`. */
export const findOne = async (name: string, match: Doc): Promise<Doc | null> => {
  const all = await loadAll(name);
  return all.find((item) => matches(item, match)) ?? null;
};

/** Insert a document (prepended in memory to preserve the old unshift ordering). */
export const insertDoc = async (name: string, doc: Doc): Promise<Doc> => {
  if (useMongo(name)) await MODELS[name].create(doc);
  else memList(name).unshift(doc);
  return doc;
};

/** Patch the first document matching `match`. */
export const updateDoc = async (name: string, match: Doc, patch: Doc): Promise<void> => {
  if (useMongo(name)) {
    await MODELS[name].updateOne(match, { $set: patch });
    return;
  }
  const record = memList(name).find((item) => matches(item, match));
  if (record) Object.assign(record, patch);
};

/** Patch every document matching `match`. */
export const updateManyDocs = async (name: string, match: Doc, patch: Doc): Promise<void> => {
  if (useMongo(name)) {
    await MODELS[name].updateMany(match, { $set: patch });
    return;
  }
  memList(name).forEach((item) => {
    if (matches(item, match)) Object.assign(item, patch);
  });
};

/** Remove the first document matching `match`. Returns true if one was removed. */
export const removeDoc = async (name: string, match: Doc): Promise<boolean> => {
  if (useMongo(name)) {
    const result = await MODELS[name].deleteOne(match);
    return Number(result?.deletedCount ?? 0) > 0;
  }
  const list = memList(name);
  const index = list.findIndex((item) => matches(item, match));
  if (index === -1) return false;
  list.splice(index, 1);
  return true;
};
