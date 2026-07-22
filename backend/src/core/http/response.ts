// core/http/response — envelope padrão de resposta (skill backend-api).
// O contrato de sucesso NÃO é forçado a um envelope único (paridade com REST
// simples: recurso direto ou lista + paginação), mas o de ERRO é sempre
// { error: { code, message, details? } } (ver core/errors).

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export function paginate<T>(items: T[], page: number, pageSize: number, total: number): Paginated<T> {
  return { items, page, pageSize, total };
}
