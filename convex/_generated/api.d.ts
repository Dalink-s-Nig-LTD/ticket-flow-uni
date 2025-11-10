/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as auth_queries from "../auth_queries.js";
import type * as departments from "../departments.js";
import type * as emails from "../emails.js";
import type * as files from "../files.js";
import type * as migrations from "../migrations.js";
import type * as roles from "../roles.js";
import type * as roles_management from "../roles_management.js";
import type * as sessions from "../sessions.js";
import type * as tickets from "../tickets.js";
import type * as utils from "../utils.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  auth_queries: typeof auth_queries;
  departments: typeof departments;
  emails: typeof emails;
  files: typeof files;
  migrations: typeof migrations;
  roles: typeof roles;
  roles_management: typeof roles_management;
  sessions: typeof sessions;
  tickets: typeof tickets;
  utils: typeof utils;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
