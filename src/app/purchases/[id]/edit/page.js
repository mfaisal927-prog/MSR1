import { notFound } from "next/navigation";
import { getPurchaseEntry } from "../../../purchaseActions";
import PurchaseForm from "../../PurchaseForm";

export default async function EditPurchasePage({ params }) {
    const resolvedParams = await params;
    const entry = await getPurchaseEntry(resolvedParams.id);

    if (!entry) {
        notFound();
    }

    return <PurchaseForm mode="edit" initialEntry={entry} />;
}
