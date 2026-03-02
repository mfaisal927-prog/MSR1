import UploadClient from "./UploadClient";

export const metadata = {
    title: "CSV کی فائل اپلوڈ کریں - Malik Sajawal Refreshment",
    description: "CSV کے ذریعے ایک ساتھ کئی ریکارڈز شامل کریں"
};

export default function UploadPage({ params }) {
    const { year, month } = params;
    return <UploadClient year={year} month={month} />;
}
