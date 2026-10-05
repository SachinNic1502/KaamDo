import { redirect } from "next/navigation";

export default async function BookSubcategoryPage({
  params,
}: {
  params: Promise<{ subcategoryId: string }>;
}) {
  const { subcategoryId } = await params;
  redirect(`/book?sub=${subcategoryId}`);
}
