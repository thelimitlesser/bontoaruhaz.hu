const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend('re_2pCko9DU_GBHevRwS1WJTkbY5PSbm1rTf');

async function testEmail() {
    console.log('--- Resend API Teszt Indítása ---');
    
    try {
        const data = await resend.emails.send({
            from: 'Bontoaruhaz <info@bontoaruhaz.hu>',
            to: ['jtomi.auto@gmail.com'],
            subject: 'Sikeres Resend beállítás! 🚀',
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 500px;">
                    <h2 style="color: #f97316;">Gratulálunk!</h2>
                    <p>Ez egy teszt üzenet a <strong>Bontoaruhaz</strong> rendszeréből.</p>
                    <p>A domain hitelesítése sikeres volt, az API kulcs működik!</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="font-size: 12px; color: #64748b;">Ez az üzenet automatikusan generálva lett a beállítások ellenőrzéséhez.</p>
                </div>
            `
        });
        console.log('✅ A teszt e-mail sikeresen elküldve!', data);
    } catch (error) {
        console.error('❌ Hiba a küldés során:', error);
    }
}

testEmail();
