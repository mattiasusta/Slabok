import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CardForm } from "@/components/CardForm";

export default async function EditCardPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const card = await prisma.stolenCard.findUnique({ where: { id } });

  if (!card || (card.userId !== session.user.id && !session.user.isAdmin)) {
    notFound();
  }

  return (
    <CardForm
      mode="edit"
      cardId={card.id}
      initialData={{
        gradingCompany: card.gradingCompany,
        certNumber: card.certNumber,
        cardName: card.cardName,
        grade: card.grade,
        certUrl: card.certUrl ?? "",
        description: card.description ?? "",
        photoUrl: card.photoUrl ?? "",
        contactPhone: card.contactPhone ?? "",
        signed: card.signed,
        signatureGrade: card.signatureGrade ?? "",
      }}
    />
  );
}
