"use server";

export async function sendContactEmail(formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const subject = formData.get("subject") as string;
        const message = formData.get("message") as string;

        if (!name || !email || !message || !subject) {
            return { error:"Minden mező kitöltése kötelező!" };
        }

        // Use dynamic import for Resend to avoid Turbopack issues
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY!);

        const { data, error } = await resend.emails.send({
            from: "Bontóáruház Kapcsolat <info@bontoaruhaz.hu>",
            to: ["info@bontoaruhaz.hu"],
            subject:`Új üzenet a BONTÓÁRUHÁZ kapcsolat oldaláról: ${subject}`,
            html:` <h2>Új üzenet érkezett!</h2>
        <p><strong>Név:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Tárgy:</strong> ${subject}</p>
        <p><strong>Üzenet:</strong></p>
        <p>${message.replace(/\n/g,"<br>")}</p>`,
        });

        if (error) {
            console.error("Resend error:", error);
            return { error:"Hiba az üzenet küldésekor." };
        }

        return { success:"Üzenet sikeresen elküldve!" };
    } catch (error) {
        console.error("Server action error:", error);
        return { error:"Beágyazott hiba az üzenet küldésekor." };
    }
}
