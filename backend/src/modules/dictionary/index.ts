import type { Db } from "../../core/db";
import type { Authz } from "../../core/authz";
import { createDictionaryRepository } from "./dictionary.repository";
import { createDictionaryService, type DictionaryService } from "./dictionary.service";
import { dictionaryRoutes } from "./dictionary.routes";

export interface DictionaryModule {
  service: DictionaryService;
  router: ReturnType<typeof dictionaryRoutes>;
}

export function createDictionaryModule(db: Db, authz: Authz): DictionaryModule {
  const repository = createDictionaryRepository(db);
  const service = createDictionaryService(repository, authz, db);
  const router = dictionaryRoutes(service);
  return { service, router };
}

export type { DictionaryService } from "./dictionary.service";
export type { Term, TermInput, TermCategory } from "./dictionary.types";
