export default async function handler(req, res) {
    // Permite chamadas apenas via método POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { to, subject, html, attachments } = req.body;

        // IMPORTANTE: Coloque sua chave real do Resend aqui (re_...)
        const RESEND_API_KEY = "SUA_CHAVE_RESEND_AQUI";

        const respostaResend = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: "M&IC Corretores <onboarding@resend.dev>",
                to: to || ["chalfouncel@gmail.com"],
                subject: subject,
                html: html,
                attachments: attachments || []
            })
        });

        const data = await respostaResend.json();

        if (!respostaResend.ok) {
            return res.status(respostaResend.status).json(data);
        }

        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

