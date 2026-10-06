// Names the rest of the app uses for the backend's schemas. The generated file
// (schema.gen.ts, from openapi/openapi.json) is imported only here.
import type { components } from './schema.gen';

type Schemas = components['schemas'];

/**
 * The PATCH schemas allow null in every field, but the backend rejects explicit
 * nulls: a field is either sent with a value or left out.
 */
type WithoutNulls<T> = { [K in keyof T]?: Exclude<T[K], null> };

export type Token = Schemas['TokenResponse'];
export type Me = Schemas['CurrentUserResponse'];
export type Permission = Schemas['Permission'];
export type RoleName = Schemas['RoleName'];
export type Role = Schemas['RoleDetails'];

export type User = Schemas['UserDetails'];
export type UserPage = Schemas['UserPage'];
export type UserCreate = Schemas['UserCreate'];
export type UserAdminUpdate = WithoutNulls<Schemas['UserAdminUpdate']>;
export type UserSelfUpdate = WithoutNulls<Schemas['UserSelfUpdate']>;
export type PasswordChange = Schemas['PasswordChange'];

export type ModelSettings = Schemas['ModelSettings'];
export type ModelChange = Schemas['ModelChange'];

export type PromptCreate = Schemas['PromptCreate'];
export type Job = Schemas['PromptJobDetails'];
export type JobStatus = Schemas['PromptJobStatus'];
export type JobErrorCode = Schemas['PromptJobErrorCode'];

export type ProblemDetails = Schemas['ProblemDetails'];
export type FieldError = Schemas['FieldError'];
export type ErrorCode = Schemas['ErrorCode'];
