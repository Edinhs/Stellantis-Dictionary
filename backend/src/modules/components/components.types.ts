export interface Component {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  categoryId: string;
  supplierId: string | null;
  termSlug: string | null;
  status: "draft" | "published";
  active: boolean;
}

export interface ComponentInput {
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  categoryId: string;
  supplierId?: string;
  termSlug?: string;
  status?: "draft" | "published";
}
